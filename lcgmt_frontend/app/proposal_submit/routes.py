import pandas as pd
from typing import Any, List
from flask import render_template, request, current_app, send_from_directory, jsonify, flash, make_response, send_file, redirect, url_for
import flask
from flask_login import login_required, current_user
from sqlalchemy.sql.expression import true
from app.extensions import db
from flask_babelex import _
import time, os, json, pdfkit, random, copy
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from app.proposal_submit.read_csv import create_sy01_too_source, gp_source_decode, gp_source_encode, sy01_too_source_decode, sy01_too_source_encode, sy01_too_proposal_encode
from app.utils import redirect_back, format_email, is_source_proposal
from werkzeug.utils import secure_filename
from io import BytesIO, SEEK_SET
from app.decorators import permission_required
from app.proposal_submit import bp as proposal_submit_bp
from app.proposal_submit.forms import ScienceOverviewForm,ProposalSourceForm, ProposalInvestigatorForm, CreateProposalForm, UploadFileFrom, UploadSourceTemplateForm, ProposalEquipment, ProposalExpertForm,TargetVisilibityForm
from app.proposal_admin.model import Proposal, ProposalInvestigator, ProposalSeason, ProposalScientificCategory, ProposalSourceList, ProposalExpert, ProposalReviewExpert, ProposalTechnicalReview,FXTObservationMode, FXTFilterType, FXTWindowMode, SourcePriority,ProposalType1,ProposalType2,ProposalSourceListEncoder, \
    PV
# from app.obs_audit.utils import format_email, Utils, check_axis
from app.proposal_submit.pdf import _category_checked, generate_coverpage_pdf, merge_pdf, render_proposal_html
from app.proposal_submit import calculator 
from app.operation_log.models import OperationLog
from app.user.models import User, AssoSTPUser, STPUser
from PyPDF2.pdf import PdfFileReader, PdfFileWriter
import requests
from app.user import service as user_service
from app.email_utils import send_proposal_submit_confirm_email
from dateutil import parser


@proposal_submit_bp.route('/', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_create_guide_redirect():
    return redirect(url_for('proposal_submit.user_proposal_create_guide'))


@proposal_submit_bp.route('/user_proposal_create_guide', methods=['GET'])
# @login_required
# @permission_required('PROPOSAL_SUBMIT')
def user_proposal_create_guide():
    season = ProposalSeason.get_newest_season()
    if season:
        return render_template('app/proposal_submit/user_proposal_create_guide.html', season=season)
    else:
        season = ProposalSeason.get_last_expired_gp_season()
        return render_template('app/proposal_submit/user_proposal_create_guide_too.html',season=season)


@proposal_submit_bp.route('/user_proposal_create/', methods=['GET'])
@proposal_submit_bp.route('/user_proposal_create/<proposal_type>', methods=['GET'])
@proposal_submit_bp.route('/user_proposal_create/<proposal_type>/<season_id>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_create(season_id=None,proposal_type=None):
    # GO情况，GO包括guest observer 和 Anticipate too
    season = None
    if proposal_type=='stp_proposal':
        type1= ProposalType1.STP
        type2 = None
        season = db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).first()
    elif proposal_type == 'guest_proposal':
        type1= ProposalType1.GO
        type2 = None
        season = db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).first()
    if season is not None:
        proposal = Proposal(proposal_season_id=season.id, expiration=season.expiration, season=season.season,type1=type1,type2=type2)
        db.session.add(proposal)
        #pi只能是小写
        proposal.proposal_investigator.append(ProposalInvestigator(title=current_user.title,first_name=current_user.first_name,last_name=current_user.last_name, email=current_user.email.lower(), role='pi', institution=current_user.institution, user_group=current_user.user_group, phone=current_user.phone, user_id= current_user.id))
        #add co-pi if current user is astp member
        astp_member = db.session.query(AssoSTPUser).filter(AssoSTPUser.email == current_user.email.lower()).first()
        if astp_member is not None:
            stp_member = db.session.query(STPUser).filter(STPUser.id == astp_member.referer_id).first()
            if stp_member is not None:
                stp_member_user = db.session.query(User).filter(User.id == stp_member.user_id).first()
                if stp_member_user is not None:
                    proposal.proposal_investigator.append(ProposalInvestigator(title=stp_member_user.title, first_name=stp_member.first_name,last_name=stp_member.last_name, email=stp_member.email.lower(), role='Co-I', institution=stp_member.affiliation, user_group=stp_member.user_group, user_id=stf_member_user.id))
                else:
                    flash('Your STP Referer is currently not registered in EP website, therefore you are unable to submit an STP proposal at this time.', 'warning')
                    return redirect(url_for('proposal_submit.user_proposal_create_guide'))
            else:
                flash('No STP Referer is listed in EOPS. Please reach out to the system manager for assistance.', 'warning')
                return redirect(url_for('proposal_submit.user_proposal_create_guide'))
                    
        db.session.commit()
        # 找到新创建的id
        # pp = db.session.query(Proposal, ProposalInvestigator).filter(ProposalInvestigator.email.in_(format_email(current_user.email)),
        #                                                              ProposalInvestigator.role == 'pi',
        #                                                              ProposalInvestigator.proposal_id == Proposal.id,
        #                                                              Proposal.proposal_season_id == season_id).order_by(Proposal.create_time.desc()).first()
        return redirect(flask.url_for('proposal_submit.user_proposal_submit', proposal_id=proposal.id, proposal_type = type2))
    else:
        if proposal_type == "calibration":
            type1= ProposalType1.GO
            type2 = ProposalType2.Calibration
        
        elif proposal_type == "highest_urgency":
            type1=ProposalType1.TOO
            type2= ProposalType2.HighestUrgencyToO
        elif proposal_type == "high_urgency":
            type1=ProposalType1.TOO
            type2= ProposalType2.HighUrgencyToO
        elif proposal_type == "medium_urgency":
            type1=ProposalType1.TOO
            type2= ProposalType2.MediumUrgencyToO
        elif proposal_type == "low_urgency":
            type1=ProposalType1.TOO
            type2= ProposalType2.LowUrgencyToO
        elif proposal_type == "toomm":
            type1=ProposalType1.TOOMM
            type2= ProposalType2.HighestUrgencyToO
        elif proposal_type =="sy01_too":
            type1=ProposalType1.TOO
            type2= ProposalType2.SYToo
        elif proposal_type == 'ep_too':
            type1=ProposalType1.TOO
            # 首先都默认为Low，在提案信息填写页面中再改成对应的优先级和值
            type2= ProposalType2.LowUrgencyToO


        else:
            # 如果
            return redirect(flask.url_for('proposal_submit.user_proposal_list'))
        if type2==ProposalType2.SYToo:
            season = db.session.query(ProposalSeason).filter(ProposalSeason.season == 'Experimental Satellite Observation').first()

            proposal = Proposal(proposal_season_id=season.id,season=season.season,type1=type1,type2=type2)
            db.session.add(proposal)
            proposal.proposal_investigator.append(ProposalInvestigator(title="EPSC_Monitor",first_name=current_user.first_name,last_name=current_user.last_name, email=current_user.email.lower(), role='pi', institution=current_user.institution, user_group=current_user.user_group, phone=current_user.phone, user_id=current_user.id))
            db.session.commit()
            return redirect(flask.url_for('proposal_submit.sy01_proposal_submit', proposal_id=proposal.id, proposal_type = type2))
        else:
            season = db.session.query(ProposalSeason).filter(ProposalSeason.season == 'EP ToO Season').first()

            proposal = Proposal(proposal_season_id=season.id,season=season.season,type1=type1,type2=type2)

            db.session.add(proposal)
            proposal.proposal_investigator.append(ProposalInvestigator(title=current_user.title,first_name=current_user.first_name,last_name=current_user.last_name, email=current_user.email.lower(), role='pi', institution=current_user.institution, user_group=current_user.user_group, phone=current_user.phone, user_id=current_user.id))
            
            db.session.commit()
            return redirect(flask.url_for('proposal_submit.ep_too_proposal_submit', proposal_id=proposal.id, proposal_type = type2))
    

    




@proposal_submit_bp.route('/ao01',methods=['GET'])
def ao01():
    #第一次proposal call，地址设为ao01,proposal call的id为125
    return redirect(url_for('cms.view_article',id=125))


@proposal_submit_bp.route('/user_proposal_delete_source/<proposal_id>/<source_id>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_delete_source(proposal_id, source_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id,proposal_type=p.type2, card='investigators'))
   
    # 数目写入
    source = db.session.query(ProposalSourceList).filter(ProposalSourceList.proposal_id == proposal_id, ProposalSourceList.id == source_id).first()
    # 
    if p.type2 == ProposalType2.AnticipateToO:
        p.total_time_request -= source.exposure_time * source.trigger_probability
    else:
        p.total_time_request -= source.exposure_time
    db.session.query(ProposalSourceList).filter(ProposalSourceList.proposal_id == proposal_id, ProposalSourceList.id == source_id).delete()
    db.session.commit()
    return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id,proposal_type=p.type2, card='sources'))


@proposal_submit_bp.route('/user_proposal_add_investigator/<proposal_id>', methods=['POST'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_add_investigator(proposal_id):
    title = request.form.get('title').strip()
    first_name=request.form.get('first_name').strip()
    last_name=request.form.get('last_name').strip()
    name = first_name+" "+last_name
    email = request.form.get('email').strip()
    phone = request.form.get('phone').strip()
    institute = request.form.get('institute').strip()
    country = request.form.get('country').strip()

    if "taiwan" in country.lower() or "tai wan" in country.lower() or "roc" in country.lower():
        country = "China"

    user_group = request.form.get('user_group').strip()

    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id,proposal_type=p.type2, card='investigators'))
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id,proposal_type=p.type2, card='investigators'))

    # ------ 数据限制 ------
    if ProposalInvestigator.has_same_email(email=email, proposal_id=proposal_id):
        flash('There is same email in the investigator list.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id,proposal_type=p.type2, card='investigators'))
    #
    db.session.add(ProposalInvestigator(title=title,first_name=first_name,last_name=last_name,name=name, email=email, phone=phone, institution=institute,user_group=user_group, country=country,proposal_id=proposal_id, role='co-i'))
    db.session.commit()
    return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id,proposal_type=p.type2, card='investigators'))


@proposal_submit_bp.route('/user_proposal_add_expert/<proposal_id>', methods=['POST'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_add_expert(proposal_id):
    name = request.form.get('name').strip()
    institute = request.form.get('institute').strip()
    #
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit',proposal_type=p.type2, proposal_id=proposal_id, card='experts'))
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit',proposal_type=p.type2, proposal_id=proposal_id, card='experts'))

    # --- 数目不能够超过三个人
    expert_count = db.session.query(ProposalExpert).filter(ProposalExpert.proposal_id == proposal_id).count()
    if expert_count >= 3:
        return redirect(url_for('proposal_submit.user_proposal_submit',proposal_type=p.type2, proposal_id=proposal_id, card='experts'))
    #
    db.session.add(ProposalExpert(name=name, institution=institute, proposal_id=proposal_id))
    db.session.commit()
    return redirect(url_for('proposal_submit.user_proposal_submit',proposal_type=p.type2, proposal_id=proposal_id, card='experts'))


@proposal_submit_bp.route('/user_proposal_delete_investigator/<proposal_id>/<investigator_id>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_delete_investigator(proposal_id, investigator_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit',proposal_type=p.type2, proposal_id=proposal_id, card='investigators'))
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit',proposal_type=p.type2, proposal_id=proposal_id, card='investigators'))
    # 数目写入
    db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.id == investigator_id).delete()
    db.session.commit()
    return redirect(url_for('proposal_submit.user_proposal_submit',proposal_type=p.type2, proposal_id=proposal_id, card='investigators'))


@proposal_submit_bp.route('/user_proposal_delete_expert/<proposal_id>/<expert_id>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_delete_expert(proposal_id, expert_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='experts'))
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit',proposal_id=proposal_id, card='experts'))

    db.session.query(ProposalExpert).filter(ProposalExpert.proposal_id == proposal_id, ProposalExpert.id == expert_id).delete()
    db.session.commit()
    return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='experts'))


@proposal_submit_bp.route('/user_proposal_delete/<proposal_id>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_delete(proposal_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    if p is None:
        return redirect(url_for('proposal_submit.user_proposal_list'))

    delete_proposal = 'Delete Proposal: proposal_id:' + str(proposal_id) + ' PI-Email:' + p.get_pi_email() + ' Title:' + p.proposal_title
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_list'))
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_list'))
    #
    db.session.query(ProposalExpert).filter(ProposalExpert.proposal_id == proposal_id).delete()
    db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id).delete()
    # db.session.query(ProposalEquipmentBackend).filter(ProposalEquipmentBackend.proposal_id == proposal_id).delete()
    # db.session.query(ProposalEquipmentNoise).filter(ProposalEquipmentNoise.proposal_id == proposal_id).delete()
    # db.session.query(ProposalEquipmentReceiver).filter(ProposalEquipmentReceiver.proposal_id == proposal_id).delete()
    db.session.query(ProposalSourceList).filter(ProposalSourceList.proposal_id == proposal_id).delete()
    db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == proposal_id).delete()
    db.session.query(Proposal).filter(Proposal.id == proposal_id).delete()
    db.session.commit()
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Delete_Proposal', delete_proposal, user)

    return redirect(url_for('proposal_submit.user_proposal_list'))


@proposal_submit_bp.route('/user_proposal_edit_pi', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_edit_pi():
    proposal_id = request.args.get('proposal_id')

    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return jsonify({'success': 1})
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 1})
    #
    investigator_id = request.args.get('investigator_id')
    # first_name = request.args.get('first_name').strip()
    # last_name = request.args.get('last_name').strip()

    title = request.args.get('title').strip()
    institution = request.args.get('institution').strip()
    phone = request.args.get('phone').strip()
    country = request.args.get('country').strip()
    db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.id == investigator_id).update({'title':title,'institution':institution,'phone': phone,'country':country})
    db.session.commit()
    return jsonify({'success': 1})

@proposal_submit_bp.route('/sy01_proposal_submit/<proposal_id>/<proposal_type>', methods=['GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def sy01_proposal_submit(proposal_id,proposal_type=None):
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    season = db.session.query(ProposalSeason).filter(ProposalSeason.id == proposal.proposal_season_id).first()
    return render_template('app/proposal_submit/sy01_too_proposal_submit.html', proposal_id=proposal_id, proposal=proposal, season=season)

@proposal_submit_bp.route('/user_proposal_submit/<proposal_id>', methods=['GET'])
@proposal_submit_bp.route('/user_proposal_submit/<proposal_id>/<proposal_type>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_submit(proposal_id,proposal_type=None):
    # 进入的权限
    if not ProposalInvestigator.has_role_to_access(proposal_id=proposal_id):
        return redirect(url_for('proposal_submit.user_proposal_list'))
    # 页面显示
    card = request.args.get('card')
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    season = db.session.query(ProposalSeason).filter(ProposalSeason.id == proposal.proposal_season_id).first()
    # 合作者
    if card == 'investigators':
        form = ProposalInvestigatorForm()
        pi = ProposalInvestigator.get_pi(proposal_id=proposal_id)
        cois = ProposalInvestigator.get_co_i(proposal_id=proposal_id)
        return render_template('app/proposal_submit/user_submit_proposal_investigators.html', cois=cois, form=form, pi=pi, proposal_id=proposal_id, proposal=proposal,season=season)
    # 设备需求
    elif card == 'requirements':
        form = ProposalEquipment(proposal_id=proposal_id)
        form.process()
        return render_template('app/proposal_submit/user_submit_proposal_requirements.html', proposal_id=proposal_id, form=form, proposal=proposal, season=season)
    # 源表
    elif card == 'sources':
        
        proposal_sources = db.session.query(ProposalSourceList).filter(db.and_(ProposalSourceList.proposal_id == proposal_id,ProposalSourceList.source_type==proposal.obs_type)).order_by(ProposalSourceList.source_index_in_proposal).all()
        ps_json = json.dumps(proposal_sources,cls=ProposalSourceListEncoder)
        form = ProposalSourceForm()
        
        return render_template('app/proposal_submit/user_submit_proposal_sources.html', proposal_id=proposal_id, form=form, proposal_sources=ps_json,  proposal=proposal, season=season, obs_type=proposal.obs_type)
    # 专家
    elif card == 'experts':
        form = ProposalExpertForm()
        experts = db.session.query(ProposalExpert).filter(ProposalExpert.proposal_id == proposal_id).order_by(ProposalExpert.create_time).all()
        return render_template('app/proposal_submit/user_submit_proposal_experts.html', proposal_id=proposal_id, form=form, experts=experts, proposal=proposal)
    # 同行
    elif card == 'review':
        reviews = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.proposal_id == proposal_id, ProposalReviewExpert.submit_status == True, ProposalReviewExpert.is_sure == True).all()
        technical_reviews = db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == proposal_id).all()
        show_reviews, show_technical_reviews = [], []
        for r in reviews:
            if r.show_review_to_pi():
                show_reviews.append(r)
        for r in technical_reviews:
            if r.show_review_to_pi():
                show_technical_reviews.append(r)
        #
        if proposal.scientific_review_finished and proposal.submit_status:
            return render_template('app/proposal_submit/user_submit_proposal_peer_review.html', proposal_id=proposal_id, reviews=show_reviews, proposal=proposal, technical_reviews=show_technical_reviews)
        else:
           
            flash(_("Haven't got reviewed"), 'warning')
            return redirect(url_for('proposal_submit.user_proposal_list'))
    # 科学页面
    else:
        form = ScienceOverviewForm(proposal_id=proposal_id)
        form.process()
        file_form = UploadFileFrom()
        proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        return render_template('app/proposal_submit/user_submit_proposal_science_overview.html', form=form, file_form=file_form, proposal_id=proposal_id, proposal=proposal,season=season)


@proposal_submit_bp.route('/ep_too_proposal_submit/<proposal_id>', methods=['GET'])
@proposal_submit_bp.route('/ep_too_proposal_submit/<proposal_id>/<proposal_type>', methods=['GET'])
@login_required
@permission_required('TOO_PROPOSAL_SUBMIT')
def ep_too_proposal_submit(proposal_id,proposal_type=None):
    # 进入的权限
    if not ProposalInvestigator.has_role_to_access(proposal_id=proposal_id):
        return redirect(url_for('proposal_submit.user_proposal_list'))
    # 页面显示
    card = request.args.get('card')
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    season = db.session.query(ProposalSeason).filter(ProposalSeason.id == proposal.proposal_season_id).first()
    # 合作者
    if card == 'investigators':
        form = ProposalInvestigatorForm()
        pi = ProposalInvestigator.get_pi(proposal_id=proposal_id)
        cois = ProposalInvestigator.get_co_i(proposal_id=proposal_id)
        return render_template('app/proposal_submit/user_submit_proposal_investigators.html', cois=cois, form=form, pi=pi, proposal_id=proposal_id, proposal=proposal,season=season)
  
    # 源表
    elif card == 'sources':
        
        proposal_sources = db.session.query(ProposalSourceList).filter(db.and_(ProposalSourceList.proposal_id == proposal_id,ProposalSourceList.source_type==proposal.obs_type)).order_by(ProposalSourceList.source_index_in_proposal).all()
        ps_json = json.dumps(proposal_sources,cls=ProposalSourceListEncoder)
        form = ProposalSourceForm()
        
        return render_template('app/proposal_submit/user_submit_proposal_sources.html', proposal_id=proposal_id, form=form, proposal_sources=ps_json,  proposal=proposal, season=season, obs_type=proposal.obs_type)
    # 专家
    # elif card == 'experts':
    #     form = ProposalExpertForm()
    #     experts = db.session.query(ProposalExpert).filter(ProposalExpert.proposal_id == proposal_id).order_by(ProposalExpert.create_time).all()
    #     return render_template('app/proposal_submit/user_submit_proposal_experts.html', proposal_id=proposal_id, form=form, experts=experts, proposal=proposal)
    # 同行
    elif card == 'review':
        reviews = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.proposal_id == proposal_id, ProposalReviewExpert.submit_status == True, ProposalReviewExpert.is_sure == True).all()
        technical_reviews = db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == proposal_id).all()
        show_reviews, show_technical_reviews = [], []
        for r in reviews:
            if r.show_review_to_pi():
                show_reviews.append(r)
        for r in technical_reviews:
            if r.show_review_to_pi():
                show_technical_reviews.append(r)
        #
        if proposal.scientific_review_finished and proposal.submit_status:
            return render_template('app/proposal_submit/user_submit_proposal_peer_review.html', proposal_id=proposal_id, reviews=show_reviews, proposal=proposal, technical_reviews=show_technical_reviews)
        else:
           
            flash(_("Haven't got reviewed"), 'warning')
            return redirect(url_for('proposal_submit.user_proposal_list'))
    # 科学页面
    else:
        form = ScienceOverviewForm(proposal_id=prouosal_id)
        form.process()
        file_form = UploadFileFrom()
        proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        return render_template('app/proposal_submit/too/too_submit_proposal_overview.html', form=form, file_form=file_form, proposal_id=proposal_id, proposal=proposal,season=season)


@proposal_submit_bp.route('/copy_src', methods=['POST'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def copy_src():
    src_id = request.form.get('src_id')
    src = ProposalSourceList.query.get(src_id)
    new_src = ProposalSourceList()
    columns =[col for col in ProposalSourceList.__table__.columns.keys() if col not in ['id','source_index_in_proposal']]
    for column in columns :
        new_src.__setattr__(column, src.__getattribute__(column))
    p:Proposal = Proposal.query.get(src.proposal_id)
    new_src.source_index_in_proposal = p.get_next_source_index()
    if p.type2 == ProposalType2.AnticipateToO:
        p.total_time_request += new_src.exposure_time*new_src.trigger_probability
    else:
        p.total_time_request += new_src.exposure_time
    
    db.session.add(new_src)
    db.session.commit()
  
    return "success"

@proposal_submit_bp.route('/user_edit_target/<proposal_id>',methods=['GET','POST'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_edit_target(proposal_id):
    source_id = request.args.get('source_id', -1, type=int)
    # old_exposure_time=0
    form = ProposalSourceForm()
    
    # POST
    if form.is_submitted():
        p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        # -------- 限制提交 -------
        # 已经提交了,不能够修改
        if p.has_submitted():
            flash('This proposal had been submitted, you can not modify it again.', 'warning')
            return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='sources'))
        if form.validate():
            if -1==source_id:
                source=ProposalSourceList()
            else:
                source=ProposalSourceList.query.filter_by(id=source_id).first()
            source.proposal_id = proposal_id

            source.source_name=form.source_name.data
            source.source_type=p.obs_type
            source.ra = form.ra.data
            source.dec = form.dec.data
            if p.obs_type == "MonitoringObs":
                source.exposure_time =form.duration.data * form.visit_number.data
            else:
                source.exposure_time = form.duration.data
            if p.obs_type == "SingleObs":
                source.continous_exposure = form.continous_exposure.data
            source.exposure_unit = form.exposure_time_unit.data
            if p.type2 == ProposalType2.AnticipateToO:
                source.trigger_probability = form.trigger_probability.data
            source.visit_number = form.visit_number.data
            source.exposure_per_vist_min= form.min_con_obs_duration.data
            source.exposure_per_vist_min_unit = form.exposure_time_unit.data
            source.exposure_per_vist_max= form.max_con_obs_duration.data
            source.exposure_per_vist_max_unit = form.exposure_time_unit.data
            source.monitoring_cadence = form.cadence.data
            source.cadence_unit = form.cadence_unit.data
            source.precision = form.precision.data
            source.precision_unit = form.precision_unit.data    
            # source.completeness =  form.completeness.data
            source.completeness =0.8
            if form.start_time.data!='None':
                source.start_time = form.start_time.data or None
            if form.end_time.data!='None':
                source.end_time = form.end_time.data or None
            source.time_critical_remark = form.time_critical_remark.data
            source.fxt1_wbs_mode = FXTObservationMode.from_str('SCIENCE')
            source.fxt1_window_mode= FXTWindowMode.from_str(form.fxt1_window_mode.data)
            source.fxt1_filter =FXTFilterType.from_str(form.fxt1_filter.data)
            source.fxt2_obs_mode = FXTObservationMode.from_str('SCIENCE')
            source.fxt2_window_mode= FXTWindowMode.from_str(form.fxt2_window_mode.data)
            source.fxt2_filter=FXTFilterType.from_str(form.fxt2_filter.data)
            source.fxt_flux = form.fxt_flux.data
            source.flux_pl_index = form.flux_pl_index.data
            source.v_mag = form.v_mag.data
            source.variable_source = form.variable_source.data
            source.extend_source = form.extend_source.data
           
            if -1 == source_id:
                if p.total_time_request is None:
                    p.total_time_request = 0
                if p.type2 == ProposalType2.AnticipateToO:
                    # 如果是Anticipate ToO，需要乘以触发概率
                    exposure_time = source.exposure_time * source.trigger_probability
                    p.total_time_request += exposure_time
                else:
                    p.total_time_request += source.exposure_time
                
                
                # db.session.query(Proposal).filter(Proposal.id == p.proposal_id).update({'total_time_request':total_time_request})
                db.session.add(source)
                db.session.commit()
                flash(_('source "{0}" Added.').format(source.source_name), 'success')
                OperationLog.add_log(proposal_submit_bp.name, 'add source'+str(source.id), current_user)
            else:
                if p.type2 == ProposalType2.AnticipateToO:
                    p.total_time_request -= form.old_exposure_time.data * source.trigger_probability
                    # 如果是Anticipate ToO，需要乘以触发概率
                    exposure_time = source.exposure_time * source.trigger_probability
                    p.total_time_request += exposure_time
                else:
                    p.total_time_request -= form.old_exposure_time.data
                    p.total_time_request += source.exposure_time
                db.session.commit()
                flash(_('Category "{0}" Updated.').format(source.source_name), 'success')
                OperationLog.add_log(proposal_submit_bp.name, 'edit source ({0})'.format(source.id), current_user)
            return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='sources'))
  
    # GET
    else:
        p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        if p.type1 == ProposalType1.TOOMM:
            toomm = True
        else:
            toomm = False
        if p.type2 == ProposalType2.Calibration:
            calibration = True
        else:
            calibration = False
        if p.type2 == ProposalType2.HighestUrgencyToO or p.type2 == ProposalType2.HighUrgencyToO or p.type2 == ProposalType2.MediumUrgencyToO or p.type2 == ProposalType2.LowUrgencyToO:
            too_proposal =True
        else:
            too_proposal = False

        if p.type2 == ProposalType2.AnticipateToO:
            anticipate_too = True
        else:
            anticipate_too = False

        # 已经存在该source，进行更新
        if -1 != source_id:
            source:ProposalSourceList = ProposalSourceList.query.filter_by(id=source_id).first()
 

            #
            form.source_name.data = source.source_name
      
            form.ra.data = source.ra 
            form.dec.data = source.dec
            if p.obs_type =='MonitoringObs' and source.visit_number!=0:
                form.duration.data = source.exposure_time / source.visit_number
                
            else:
                form.duration.data = source.exposure_time
            # record the old exposure time, for updating the total time request
            form.old_exposure_time.data = source.exposure_time
            if p.obs_type == 'SingleObs':
                form.continous_exposure.data = source.continous_exposure 
            if anticipate_too ==True:
                form.trigger_probability.data = source.trigger_probability
            form.exposure_time_unit.data = source.exposure_unit
            form.visit_number.data = source.visit_number
            form.min_con_obs_duration.data = source.exposure_per_vist_min
            form.exposure_time_unit.data = source.exposure_per_vist_min_unit
            form.max_con_obs_duration.data = source.exposure_per_vist_max
            form.exposure_time_unit.data = source.exposure_per_vist_max_unit
            form.cadence.data = source.monitoring_cadence
            form.cadence_unit.data = source.cadence_unit
            form.precision.data = source.precision
            form.precision_unit.data = source.precision_unit
            # form.completeness.data = source.completeness
        
            form.start_time.data = source.start_time
            form.end_time.data = source.end_time
            form.time_critical_remark.data = source.time_critical_remark
            form.fxt1_window_mode.data = source.fxt1_window_mode.name
            form.fxt1_filter.data = source.fxt1_filter.name
            form.fxt2_window_mode.data = source.fxt2_window_mode.name
            form.fxt2_filter.data = source.fxt2_filter.name
            form.fxt_flux.data = source.fxt_flux
            form.flux_pl_index.data = source.flux_pl_index
            form.v_mag.data = source.v_mag
            form.variable_source.data = source.variable_source
            form.extend_source.data = source.extend_source

    
            if p.obs_type == 'TileObs':
                return render_template('app/proposal_submit/user_edit_tiling_target.html',proposal_id=proposal_id, form=form,ps_id=source_id,anticipate_too =anticipate_too)
            elif p.obs_type== 'SingleObs':
                return render_template('app/proposal_submit/user_edit_singleobs_target.html',proposal_id=proposal_id, form=form,ps_id=source_id,anticipate_too = anticipate_too)
            elif p.obs_type== 'MonitoringObs':
                return render_template('app/proposal_submit/user_edit_monitoring_target.html',proposal_id=proposal_id, form=form,ps_id=source_id,anticipate_too = anticipate_too)
        else:
            if p.obs_type == 'TileObs':
                return render_template('app/proposal_submit/user_edit_tiling_target.html',proposal_id=proposal_id, form=form,ps_id=source_id,anticipate_too = anticipate_too)
            elif p.obs_type== 'SingleObs':
                return render_template('app/proposal_submit/user_edit_singleobs_target.html',proposal_id=proposal_id, form=form,ps_id=source_id,anticipate_too = anticipate_too)
            elif p.obs_type== 'MonitoringObs':
                return render_template('app/proposal_submit/user_edit_monitoring_target.html',proposal_id=proposal_id, form=form,ps_id=source_id,anticipate_too = anticipate_too)


    # return render_template('app/proposal_submit/user_edit_source.html',proposal_id=proposal_id, form=form)
    flash(form.errors, 'error')     
    return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='sources'))
   



@proposal_submit_bp.route('/user_proposal_list', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_list():
    page = request.args.get('page', 1, type=int)
    pagination = db.session.query(Proposal, ProposalInvestigator).filter(ProposalInvestigator.email.in_(format_email(current_user.email)), ProposalInvestigator.proposal_id == Proposal.id).order_by(Proposal.create_time.desc()).paginate(page, per_page=15, error_out=False)
    proposals = pagination.items
    season = ProposalSeason.get_newest_season()
    if season is not None:
        submitted_proposal_no = db.session.query(Proposal).filter(Proposal.submit_status == True, ProposalInvestigator.email.in_(format_email(current_user.email)), ProposalInvestigator.proposal_id == Proposal.id,Proposal.proposal_season_id == season.id ).count()
    else:
        submitted_proposal_no = 0
    form = CreateProposalForm()
  
    return render_template('app/proposal_submit/user_proposal_list.html', pagination=pagination, proposals=proposals, form=form,submitted_proposal_no = submitted_proposal_no, season=season)

@proposal_submit_bp.route('/reIndex/<int:proposal_id>/', methods=['POST'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def reIndex(proposal_id):
    new_order = dict(zip(
        [int(k[3:]) for k in request.form.keys() ],
        [int(v) for v in request.form.values()]
    ))
    proposal: Proposal = Proposal.query.get(proposal_id)
    proposal.index_srcs(new_order)
    return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='sources'))


@proposal_submit_bp.route('/download_file/<path>/<filename>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def download_file(path, filename):
    path = os.path.join(current_app.config['APP_UPLOAD_PATH'], path)
    return send_from_directory(directory=path,path=filename, as_attachment=True)


@proposal_submit_bp.route('/upload_science_case/<proposal_id>', methods=['POST'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def upload_science_case(proposal_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    s = db.session.query(ProposalSeason).filter(ProposalSeason.id == p.proposal_season_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card=''))
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card=''))

    # 提交文件
    file = request.files.get('choose_button')
    if not file.filename.endswith('.pdf'):
        return jsonify({'success': 'not_ok'})

    science_case_display_name = file.filename
    science_case_storage_name = Proposal.set_science_case_name(proposal_id=proposal_id)
    file.filename = science_case_storage_name
    # 保存文件
    season_path = os.path.join(s.get_this_season_dir(), 'case')
    path = os.path.join(season_path, secure_filename(file.filename))
    file.save(path)

    # 获取页数，格式等信息，是否保存成功
    #  保存文件的位置
    season_path = os.path.join(s.get_this_season_dir(), 'case')
    filepath = os.path.join(season_path, science_case_storage_name)
    # 是否可读，页数是否超出，删除数据
    try:
        file_open = open(filepath, 'rb')
        pdf_file = PdfFileReader(file_open, strict=False)
        page_count = pdf_file.getNumPages()
        file_open.close()
        if page_count > 4:
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except:
                    pass
            return jsonify({'success': 'not_ok_pages'})
    except:
        if os.path.exists(filepath):
            try:
                file_open.close()
                os.remove(filepath)
            except:
                pass
        return jsonify({'success': 'not_ok_format'})

    # 更新数据库
    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'science_case_display_name': science_case_display_name, 'science_case_storage_name': science_case_storage_name, 'science_case_upload_status': True})
    db.session.commit()
    return jsonify({'display_name': science_case_display_name, 'success': 'ok'})


@proposal_submit_bp.route('/delete_science_case/<proposal_id>', methods=['POST'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def delete_science_case(proposal_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    s = db.session.query(ProposalSeason).filter(ProposalSeason.id == p.proposal_season_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return jsonify({'success': 1})
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 1})

    # 删除旧的数据
    season_path = os.path.join(s.get_this_season_dir(), 'case')
    filepath = os.path.join(season_path, p.science_case_storage_name)
    if os.path.exists(filepath):
        try:
            os.remove(filepath)
        except:
            pass

    # 更新状态
    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'science_case_upload_status': False})
    db.session.commit()
    return jsonify({'success': 0})


@proposal_submit_bp.route('/save_science_overview/<proposal_id>', methods=['get', 'post'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def save_science_overview(proposal_id):
    # -------- 限制提交 -------
    p :Proposal= db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return jsonify({'success': 1})
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 1})

    # --  数据校验 ---
    data = json.loads(request.get_data(as_text=True))
    # 题目
    title = data['Title'].strip()
    if title == '':
        return jsonify({'Title': 'not_ok'})
    if Proposal.get_word_number(txt=title) > 50:
        return jsonify({'Title': 'not_ok_length'})
    # 摘要
    abstract = data['Abstract'].strip()
    if abstract == '':
        return jsonify({'Abstract': 'not_ok'})
    if Proposal.get_word_number(txt=abstract) > 200:
        return jsonify({'Abstract': 'not_ok_number'})
    # 分类
    category = ['Life-cycle of Stars and Interstellar Medium',
                'Isolated and Binary Compact Objects',
                'Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters',
                'Active Galactic Nuclei and Tidal Disruption Events',
                'Solar System Objects, Stars and Exoplanets',
                'Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas',
                'Gravitational Wave Electromagnetic Counterpart',
                'Other'
              ]
    select_passed = 0
    for c in category:
        if data[c] == 1:
            select_passed = 1
            break
    if select_passed == 0:
        return jsonify({'Select': 'not_ok'})
    
    content_passed = 0
    category_content = data['Category_content'].strip()
    if data['Other'] == 1 and category_content == '':
        content_passed = 1
    if content_passed == 1:
        return jsonify({'Category_content': 'not_ok'})
    if data['Other'] == 1:
        if len(category_content) > 100:
            return jsonify({'Category_content': 'not_ok_length'})
    try:
        proposal_type =data['proposal_type']
    except KeyError:
        return jsonify({'proposal_type': 'not_ok'})
    # try:
    #     stp =data['stp']
    # except KeyError:
    #     return jsonify({'stp': 'not_ok'})
    try:
        obs_type = data['obs_type']
    except KeyError:
        return jsonify({'obs_type': 'not_ok'})
    too_trigger= data['too_trigger']
    other_remarks = data['other_remarks'].strip()

    # --------数据存储----
    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'content_status': True, 'proposal_title': title, 'proposal_abstract': abstract, 'type2': proposal_type, 'obs_type':obs_type, 'stp':'','ant_too_trig_criteria':too_trigger,'other_remarks':other_remarks})

    # 显示删除分类,再存储
    db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == proposal_id).delete()
    for c in category:
        if data[c] == 1:
            if c == 'Other':
                db.session.add(ProposalScientificCategory(proposal_id=proposal_id, category=c, category_content=category_content))
            else:
                db.session.add(ProposalScientificCategory(proposal_id=proposal_id, category=c, category_content=c))
    # 提交数据
    db.session.commit()
    flash('Save Proposal Overview Successfully.', 'success')
    return jsonify({'success': 'ok'})


@proposal_submit_bp.route('/too_save_science_overview/<proposal_id>', methods=['get', 'post'])
@login_required
@permission_required('TOO_PROPOSAL_SUBMIT')
def too_save_science_overview(proposal_id):
    # -------- 限制提交 -------
    p :Proposal= db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return jsonify({'success': 1})
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 1})

    # --  数据校验 ---
    data = json.loads(request.get_data(as_text=True))
    # 题目
    title = data['Title'].strip()
    if title == '':
        return jsonify({'Title': 'not_ok'})
    if Proposal.get_word_number(txt=title) > 50:
        return jsonify({'Title': 'not_ok_length'})
    # 摘要
    abstract = data['Abstract'].strip()
    if abstract == '':
        return jsonify({'Abstract': 'not_ok'})
    if Proposal.get_word_number(txt=abitract) > 200:
        return jsonify({'Abstract': 'not_ok_number'})
    # 分类
    category = ['Life-cycle of Stars and Interstellar Medium',
                'Isolated and Binary Compact Objects',
                'Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters',
                'Active Galactic Nuclei and Tidal Disruption Events',
                'Solar System Objects, Stars and Exoplanets',
                'Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas',
                'Gravitational Wave Electromagnetic Counterpart',
                'Other'
              ]
    select_passed = 0
    for c in category:
        if data[c] == 1:
            select_passed = 1
            break
    if select_passed == 0:
        return jsonify({'Select': 'not_ok'})
    
    content_passed = 0
    category_content = data['Category_content'].strip()
    if data['Other'] == 1 and category_content == '':
        content_passed = 1
    if content_passed == 1:
        return jsonify({'Category_content': 'not_ok'})
    if data['Other'] == 1:
        if len(category_content) > 100:
            return jsonify({'Category_content': 'not_ok_length'})
    try:
        urgency =data['urgency']
    except KeyError:
        return jsonify({'urgency': 'not_ok'})
    # try:
    #     stp =data['stp']
    # except KeyError:
    #     return jsonify({'stp': 'not_ok'})
    try:
        obs_type = data['obs_type']
    except KeyError:
        return jsonify({'obs_type': 'not_ok'})
    anticipated_too_no= data['anticipated_too_no']

    #判断是否存在用户填写的预置too
    if anticipated_too_no is not None and anticipated_too_no!='':
        anticipated_too_p=Proposal.query.filter(Proposal.proposal_number==anticipated_too_no).first()
        if not anticipated_too_p:
            return jsonify({'anticipated_too_no': 'not_ok'})

    other_remarks = data['other_remarks'].strip()
    if urgency == 'Highest':
        proposal_type=ProposalType2.HighestUrgencyToO
    elif urgency == 'High':
        proposal_type = ProposalType2.HighUrgencyToO
    elif urgency=='Medium':
        proposal_type = ProposalType2.MediumUrgencyToO
    else:
        proposal_type = ProposalType2.LowUrgencyToO
  6 # --------数据存储----
    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'content_status': True, 'proposal_title': title, 'proposal_abstract': abstract, 'type2': proposal_type, 'obs_type':obs_type, 'stp':'', 'urgency':urgency,'preset_too_no':anticipated_too_no,'other_remarks':other_remarks})

    # 显示删除分类,再存储
    db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == proposal_id).delete()
    for c in category:
        if data[c] == 1:
            if c == 'Other':
                db.session.add(ProposalScientificCategory(proposal_id=proposal_id, category=c, category_content=category_content))
            else:
                db.session.add(ProposalScientificCategory(proposal_id=proposal_id, category=c, category_content=c))
    # 提交数据
    db.session.commit()
    flash('Save Proposal Overview Successfully.', 'success')
    return jsonify({'success': 'ok'})

@proposal_submit_bp.route('/upload_source_list/<proposal_id>', methods=['get', 'post'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def upload_source_list(proposal_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return jsonify({'success': 1})
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 1})

    # 读取数据
    form = UploadSourceTemplateForm()
    if form.validate_on_submit():
        file = request.files['choose_button']
        count = 0
        for i in file.readlines():
            line = i.decode(encoding='UTF-8').strip()
            # 空行或被注释
            if not len(line) or line.startswith('#'):
                count += 1
                continue
            else:
                count += 1
                row = ['S'] + [e.strip() for e in line.split('|')]
                if is_source_proposal(row=row) != -1:
        5           flash(_('Please Check Line: ') + str(count), 'warning')
                    return jsonify({'success': 0})
                else:
                    # if row[2] in ['Tracking', 'TrackingWithAngle', 'Drift', 'SnapShot', 'DriftWithAngle', 'MultiBeamCalibration', 'DecDriftWithAngle']:
                    #     wrong_axis = check_axis(source_name_list=[row[1]], ra_list=[row[4]], dec_list=[row[5]], start_ra_list=[''], start_dec_list=[''], end_ra_list=[''], end_dec_list=[''], on_ra_list=[''], on_dec_list=[''], off_ra_list=[''], off_dec_list=[''], observe_mode_list=[row[2]], number_list=[1], length_list=[row[3]], target_number=[''])
                    #     if wrong_axis['axismark'] == 1:
                    #         flash(_('Please Check Line: ') + str(count), 'warning')
                    #         return jsonify({'success': 0})
                    #     frequency = ''
                    #     if len(row) == 7:
                    #         try:
                    #             a = float(row[6])
                    #             frequency = row[6]
                    #         except:
                    #             flash(_('Please Check Line: ') + str(count), 'warning')
                    #             return jsonify({'success': 0})
                    #     db.session.add(ProposalSourceList(proposal_id=proposal_id, source_name=row[1], observe_mode=row[2], integration_time=row[3], ra=row[4], dec=row[5], start_ra='', start_dec='', end_ra='', end_dec='', on_ra='', on_dec='', off_ra='', off_dec='', frequency=frequency, target_number=''))

                    # if row[2] == 'BasketWeaving':
                    #     wrong_axis = check_axis(source_name_list=[row[1]], ra_list=[''], dec_list=[''], start_ra_list=[''], start_dec_list=[row[4]], end_ra_list=[''], end_dec_list=[row[5]], on_ra_list=[''], on_dec_list=[''], off_ra_list=[''], off_dec_list=[''], observe_mode_list=[row[2]], number_list=[1], length_list=[row[3]], target_number=[''])
                    #     if wrong_axis['axismark'] == 1:
                    #         flash(_('Please Check Line: ') + str(count), 'warning')
                    #         return jsonify({'success': 0})
                    #     frequency = ''
                    #     if len(row) == 7:
                    #         try:
                    #             a = float(row[6])
                    #             frequency = row[6]
                    #         except:
                    #             flash(_('Please Check Line: ') + str(count), 'warning')
                    #             return jsonify({'success': 0})
                    #     db.session.add(ProposalSourceLyst(proposal_id=proposal_id, source_name=row[1], observe_mode=row[2], integration_time=row[3], ra='', dec='', start_ra='', start_dec=row[4], end_ra='', end_dec=row[5], on_ra='', on_dec='', off_ra='', off_dec='', frequency=frequency, target_number=''))

                    # if row[2] == 'OnOff':
                    #     wrong_axis = check_axis(source_name_list=[row[1]], ra_list=[''], dec_list=[''], start_ra_list=[''], start_dec_list=[''], end_ra_list=[''], end_dec_list=[''], on_ra_list=[row[4]], on_dec_list=[row[5]], off_ra_list=[row[6]], off_dec_list=[row[7]], observe_mode_list=[row[2]], number_list=[1], length_list=[row[3]], target_number=[''])
                    #     if wrong_axis['axismark'] == 1:
                    #         flash(_('Please Check Line: ') + str(count), 'warning')
                    #         return jsonify({'success': 0})
                    #     frequency = ''
                    #     if len(row) == 9:
                    #         try:
                    #             a = float(row[8])
                    #             frequency = row[8]
                    #         except:
                    #             flash(_('Please Check Line: ') + str(count), 'warning')
                    #             return jsonify({'success': 0})
                    #     db.session.add(ProposalSourceList(proposal_id=proposal_id, source_name=row[1], observe_mode=row[2], integration_time=row[3], ra='', dec='', start_ra='', start_dec='', end_ra='', end_dec='', on_ra=row[4], on_dec=row[5], off_ra=row[6], off_dec=row[7], frequency=frequency, target_number=''))

                    # if row[2] in ['OnTheFlyMapping', 'MultiBeamOTF']:
                    #     wrong_axis = check_axis(source_name_list=[row[1]], ra_list=[row[4]], dec_list=[row[5]], start_ra_list=[row[6]], start_dec_list=[row[7]], end_ra_list=[row[8]], end_dec_list=[row[9]], on_ra_list=[''], on_dec_list=[''], off_ra_list=[''], off_dec_list=[''], observe_mode_list=[row[2]], number_list=[1], length_list=[row[3]], target_number=[''])
                    #     if wrong_axis['axismark'] == 1:
                    #         flash(_('Please Check Line: ') + str(count), 'warning')
                    #         return jsonify({'success': 0})
                    #     frequency = ''
                    #     if len(row) == 11:
                    #         try:
                    #             a = float(row[10])
                    #             frequency = row[10]
                    #         except:
                    #             flash(_('Please Check Line: ') + str(count), 'warning')
                    #             return jsonify({'success': 0})
                    #     db.session.add(ProposalSourceList(proposal_id=proposal_id, source_name=row[1], observe_mode=row[2], integration_time=row[3], ra=row[4], dec=row[5], start_ra=row[6], start_dec=row[7], end_ra=row[8], end_dec=row[9], on_ra='', on_dec='', off_ra='', off_dec='', frequency=frequency, target_number=''))

                    # if row[2] in ['SwiftCalibration']:
                    #     wrong_axis = check_axis(source_name_list=[row[1]], ra_list=[''], dec_list=[''], start_ra_list=[''], start_dec_list=[''], end_ra_list=[''], end_dec_list=[''], on_ra_list=[row[4]], on_dec_list=[row[5]], off_ra_list=[''], off_dec_list=[''], observe_mode_list=[row[2]], number_list=[1], length_list=[row[3]], target_number=[''])
                    #     if wrong_axis['axismark'] == 1:
                    #         flash(_('Please Check Line: ') + str(count), 'warning')
                    #         return jsonify({'success': 0})
                    #     frequency = ''
                    #     if len(row) == 7:
                    #         try:
                    #             a = float(row[6])
                    #             frequency = row[6]
                    #         except:
         7          #             flash(_('Please Check Line: ') + str(count), 'warning')
                    #             return jsonify({'success': 0})
                    #     db.session.add(ProposalSourceList(proposal_id=proposal_id, source_name=row[1], observe_mode=row[2], integration_time=row[3], ra='', dec='', start_ra='', start_dec='', end_ra='', end_dec='', on_ra=row[4], on_dec=row[5], off_ra='', off_dec='', frequency=frequency, target_number=''))

                    # if row[2] in ['SolarSysTracking', 'SolarSysDrift']:
                    #     wrong_axis = check_axis(source_name_list=[row[1]], ra_list=[''], dec_list=[''], start_ra_list=[''], start_dec_list=[''], end_ra_list=[''], end_dec_list=[''], on_ra_list=[''], on_dec_list=[''], off_ra_list=[''], off_dec_list=[''], observe_mode_list=[row[2]], number_list=[1], length_list=[row[3]], target_number=[row[4]])
                    #     if wrong_axis['axismark'] == 1:
                    #         flash(_('Please Check Line: ') + str(count), 'warning')
                    #         return jsonify({'success': 0})
                    #     frequency = ''
                    #     if len(row) == 6:
                    #         try:
                    #             a = float(row[5])
                    #             frequency = row[5]
                    #         except:
                    #             flash(_('Please Check Line: ') + str(count), 'warning')
                    #             return jsonify({'success': 0})
                    db.session.add(ProposalSourceList(proposal_id=proposal_id, source_name=row[1], observe_mode=row[2], integration_time=row[3], ra='', dec=''))

        try:
            db.session.commit()
            flash("Added Successfully!", 'success')
            return jsonify({'success': 1})
        except IntegrityError:
            db.session.rollback()
            flash("Failed to write data to the database, please try again!", 'danger')
            return jsonify({'success': 0})

    # 文件验证失败
    if not form.validate_on_submit() and request.method == 'POST':
        flash(_("Please use txt!"), 'success')
        return jsonify({'success': 0})


@proposal_submit_bp.route('/user_proposal_sources_delete/<proposal_id>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_sources_delete(proposal_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not delete it.', 'warning')
        return jsonify({'success': 1})
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 1})
    # 操作
    proposal_source_id = request.args.get('proposal_source_id')
    db.session.query(ProposalSourceList).filter(ProposalSourceList.id == proposal_source_id).delete()
    db.session.commit()
    flash("Delete Successfully!", 'success')
    return jsonify({'success': 1})


@proposal_submit_bp.route('/user_proposal_sources_delete_all/<proposal_id>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_sources_delete_all(proposal_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not delete it.', 'warning')
        return jsonify({'success': 1})
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 1})
    # 操作
    db.session.query(ProposalSourceList).filter(ProposalSourceList.proposal_id == proposal_id).delete()
    db.session.commit()
    flash("Delete Successfully!", 'success')
    return jsonify({'success': 1})


@proposal_submit_bp.route('/save_technical_requirements/<proposal_id>', methods=['POST'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def save_technical_requirements(proposal_id):
    # -------- 限制提交 -------
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not modify it again.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='requirements'))
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='requirements'))

    #
    # receiver = request.form.get('receiver')
    # noise = request.form.get('noise')
    # #
    # backend_psr = request.form.get('backend_psr')
    # psr_channel = request.form.get('psr_channel')
    # psr_sampling = request.form.get('psr_sampling')
    # #
    # backend_spec = request.form.get('backend_spec')
    # spec = request.form.get('spec')
    # spec_sampling = request.form.get('spec_sampling')

    # 判断是否选择了一个后端
    # if backend_psr is None and backend_spec is None:
    #     flash("Please choose the backend you apply in your project.", 'warning')
    #     return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='requirements'))
    # spec_frequency = request.form.get('spec_frequency').strip()
    # # Spec(W+N)检测
    # if backend_spec == 'Spectral line' and spec == 'Spec(W+N)':
    #     try:
    #         f = float(spec_frequency)
    #     except:
    #         flash("Please check the data format of Spec(W+N) center frequency.", 'warning')
    #         return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id))
    #
    # db.session.query(ProposalEquipmentReceiver).filter(ProposalEquipmentReceiver.proposal_id == proposal_id).delete()
    # db.session.query(ProposalEquipmentBackend).filter(ProposalEquipmentBackend.proposal_id == proposal_id).delete()
    # db.session.query(ProposalEquipmentNoise).filter(ProposalEquipmentNoise.proposal_id == proposal_id).delete()
    # #
    # db.session.add(ProposalEquipmentReceiver(proposal_id=proposal_id, receiver=receiver))
    # db.skssion.add(ProposalEquipmentNoise(proposal_id=proposal_id, noise_type=noise))
    # #
    # if backend_psr is not None:
    #     db.session.add(ProposalEquipmentBackend(proposal_id=proposal_id, backend='Pulsar', channel=psr_channel, sampling=psr_sampling))
    # if backend_spec is not None:
    #     # db.session.add(ProposalEquipmentBackend(proposal_id=proposal_id, backend=spec, sampling=spec_sampling, frequency=spec_frequency))
    #     db.session.add(ProposalEquipmentBackend(proposal_id=proposal_id, backend=spec, sampling=spec_sampling))
    # #
    db.sessinn.query(Proposal).filter(Proposal.id == proposal_id).update({'equipment_status': True})
    #
    db.session.commit()
    flash('Save Technical Requirements Successfully.', 'success')
    return redirect(url_for('proposal_submit.user_proposal_submit', proposal_id=proposal_id, card='requirements'))


@proposal_submit_bp.route('/user_proposal_submit_confirm', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def user_proposal_submit_confirm():
    proposal_id = request.args.get('proposal_id')
    p:Proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # 已经提交了,不能够修改
    if p.has_submitted():
        flash('This proposal had been submitted, you can not submit it again.', 'warning')
        return jsonify({'success': 'not_ok'})
    # 合作者不能够修改
    if not p.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 'not_ok'})
    # 是否已经过去,且不是EP ToO Season且不具备TEMP_PROPOSAL_SUBMIT权限，提示无法提交
    if p.season !="EP ToO Season" and p.has_expired() and not current_user.can('TEMP_PROPOSAL_SUBMIT'):
        flash('This proposal has expired, you can not submit it.', 'warning')
        return jsonify({'success': 'not_ok'})

    # 数据完整性验证
    if not p.content_status:
        return jsonify({'content_status': 'not_ok'})
   
    # if p.is_go_or_calibration() and not p.science_case_upload_status:
    if not p.is_too_proposal() and not p.science_case_upload_status:
        return jsonify({'science_case_upload_status': 'not_ok'})
    if not ProposalSourceList.has_upload_source(proposal_id=proposal_id):
        return jsonify({'source_list': 'not_ok'})
    # 写数据
    current_time = datetime.fromtimestamp(time.mktime(time.localtime()))
    v = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()

    #更新总时间
    source_list:List[ProposalSourceList] = ProposalSourceList.query.filter(ProposalSourceList.proposal_id == v.id).all()
    #总时间以秒计算
    total_time_request = 0
    for source in source_list:
        if source.source_type== p.obs_type:
            if p.type2 == ProposalType2.AnticipateToO:
                total_time_request += source.exposure_time*source.trigger_probability
            else:
                total_time_request += source.exposure_time


    db.session.query(Proposal).filter(Proposal.proposal_season_id == v.proposal_season_id).with_for_update(read=False, nowait=False).update({'lock': True})
    if v.code == 0:
        max_code = db.session.query(Proposal).filter(Proposal.proposal_season_id == v.proposal_season_id).order_by(Proposal.code.desc()).first()
        code = max_code.code + 1
        db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'total_time_request':total_time_request,'submit_status': True, 'submit_time': current_time, 'code': code, 'can_submit_again': False})
    else:
        db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'total_time_request':total_time_request,'submit_status': True, 'submit_time': current_time, 'can_submit_again': False})

       
    db.session.commit()
    v_no= v.get_no()
    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({ 'proposal_number':v_no})
    db.session.commit()

    # 为源编号
    proposal = db.session.query(Proposal).get(proposal_id)
    proposal.index_srcs()
    
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Submit_Proposal', 'Submit Proposal: proposal_id:' + str(proposal_id) + ' PI-Email:' + p.get_pi_email() + ' Title:' + p.proposal_title, user)
    for pi in proposal.proposal_investigator:

        send_proposal_submit_confirm_email(pi.email,pi.get_pi_name(proposal_id),season_name=proposal.season,proposal_no=proposal.proposal_number)

    return jsonify({'success': 'ok'})


@proposal_submit_bp.route('/save_pdf/<proposal_id>', methods=['GET'])
@login_required
@permission_required('PROPOSAL_SUBMIT')
def save_pdf(proposal_id):
    config = pdfkit.configuration(wkhtmltopdf=current_app.config['WKHTMLTOPDF_PATH'])
    options = {
        'page-size': 'A4',
        'encoding': "UTF-8",
        'margin-top': '0.75in',
        'margin-right': '0.75in',
        'margin-bottom': '0.75in',
        'margin-left': '0.75in',
        'header-left': 'EP Proposal Coverpage',
        'header-right': 'NO: EP-2023A-0001',
        'header-font-size': 12,
        'header-spacing': 5,
        'header-line': '--header-line',
        'no-outline': None
    }
    season_dir = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'seasons')
    season_name = Proposal.get_season_name_by_id(proposal_id=proposal_id)
    season_path = os.path.join(season_dir, season_name)
    # 命名规则
    filename = 'u_' + str(proposal_id) + '_.pdf'
    save_path = os.path.join(season_path, secure_filename(filename))
    # 加载CSS的位置
    # static_path = os.path.join(current_app.config['APP_PATH'], 'static')
    static_path = current_app.config['APP_STATIC_FOLDER']
    css_path = os.path.join(static_path, 'css')
    css = [os.path.join(css_path, 'bootstrap.min.css'), os.path.join(css_path, 'bootstrap-theme.min.css')]
    #
    #

    pdfkit.from_string(render_template('app/proposal_submit/create_science_overview_pdf.html', v='cccc'), save_path, css=css, configuration=config, options=options)
    return send_from_directory(season_path, filename)


@proposal_submit_bp.route('/get_science_overview_web/<proposal_id>', methods=['GET'])
@permission_required('PROPOSAL_SUBMIT')
def get_science_overview_web(proposal_id):
    from reportlab.pdfgen import canvas

    c = canvas.Canvas('hello.pdf')
    c.drawString(0, 600, '<br>EP Proposal Coverpage</br>')

    textobject = c.beginText(100, 200)
    c.drawText(textobject)
    c.showPage()
    c.save()
    return render_template('app/proposal_submit/create_science_overview_pdf.html')
    # from rlextra.rml2pdf import rml2pdf
    # season_dir = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'seasons')
    # name = os.path.join(season_dir, 'a.rml')
    # print(name)
    # rml = open(name, 'r').read()
    # rml2pdf.go(rml, 'outputfile.pdf')

#TODO：该页面没有scientific justification
@proposal_submit_bp.route("/detail/<proposal_id>")
@login_required
def detail(proposal_id:int):
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    if proposal.type2==ProposalType2.AnticipateToO:
        anticipated_too = True
    else:
        anticipated_too = False
    proposal_scientific_categorys = db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == proposal_id).all()
    title, name,first_name, last_name, email, institution, phone, user_group,country= ProposalInvestigator.get_pi_value(proposal_id=proposal_id)
    name = name if name is not None else ''
    institution = institution if institution is not None else ''
    phone = phone if phone is not None else ''
    pi = {
        'title':title,
        "first_name":first_name,
        "last_name":last_name,
        'name':name,
        'institution':institution,
        'phone':phone,
        'email':email,
        'user_group':user_group,
        'country':country
    }
    cois_s, cois_n = ProposalInvestigator.get_co_value(proposal_id=proposal_id)
    sources = ProposalSourceList.get_source_list_format(proposal_id=proposal_id)
    categories = _category_checked(proposal)
    
    other_content = ProposalScientificCategory.get_other_content(proposal_id=proposal_id)
   
    
    return render_template('app/proposal_submit/proposal_html.html',proposal=proposal,categories =categories,other_content=other_content,pi=pi,cois_s=cois_s, cois_n=cois_n,sources=sources,anticipated_too=anticipated_too)



#TODO: 生成pdf有问题
@proposal_submit_bp.route('/user_get_pdf/<proposal_id>/<filename>', methods=['GET'])
@login_required
def user_get_pdf(proposal_id, filename):
    from_where = request.args.get('from_where')
    # 进入的权限
    if ProposalInvestigator.has_role_to_access(proposal_id=proposal_id) or Proposal.can_review(proposal_id=proposal_id) or current_user.can('VIEW_PROPOSAL'):
        # 若是来自评审人员，标记已读
        if from_where == 'review':
            rid = request.args.get('rid')
            ProposalReviewExpert.mark_as_read(rid=rid)
    else:
        return redirect(url_for('proposal_submit.user_proposal_list'))
    # proposal
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
    user = db.session.query(User).filter(User.email.in_(format_email(pi.email))).first()

    # 按路径生成coverpage的pdf
    coverpage_buf, merge_result = BytesIO(), BytesIO()
    generate_coverpage_pdf(proposal_id=proposal_id, save_path=coverpage_buf, from_where=from_where)
    merge_list = [coverpage_buf]

    # pdf_input = PdfFileReader(coverpage_buf)
    # page_count = pdf_input.getNumPages()
    # print(page_count, 'cccc')

    # 若增加了文档，则合并添加科学案例
    if proposal.science_case_upload_status:
        fopen_file = open(proposal.get_case_xile_path(), 'rb')
        merge_list.append(fopen_file)

    # 增加科学产出
    # from app.user.routes import get_paper_list_pdf
    # paper = get_paper_list_pdf(user_id=user.id)
    # if paper is not None:
    #     merge_list.append(BytesIO(paper))

    # 合并文件
    merge_pdf(infnList=merge_list, outfn=merge_result)
    # 获取结果
    merge_pdf_result = merge_result.getvalue()
    # 关闭缓存
    if proposal.science_case_upload_status:
        fopen_file.close()
    merge_result.close()
    coverpage_buf.close()
    # 返回结果
    response = make_response(merge_pdf_result)
    response.headers.set('Content-Type', 'application/pdf')
    # response.headers.set('Content-Disposition', 'attachment', filename=filename)
    # response.headers.set('Content-Disposition', 'inline', filename=filename)
    return response
    
    # # 合成science justification的pdf
    # if proposal.science_case_upload_status:
    #     case_path = os.path.join(season.get_this_season_dir(), 'case')
    #     case_file = os.path.join(case_path, proposal.science_case_storage_name)
    #     merge_pdf(infnList=[coverpage_path, case_file], outfn=coverpage_path)
    # return make_response(send_from_directory(save_path, filename=filename, as_attachment=True))

class TooCsvSourceEncoder(json.encoder.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,datetime):
            return o.strftime("%Y-%m-%dT%H:%M:%SZ")
        return super().default(o)

@proposal_submit_bp.route('/sy01_too_proposal_submit/<int:id>', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def sy01_too_proposal_submit(id:int):
    proposal:Proposal  = Proposal.query.get(id)
    if proposal.has_submitted():
        flash('This proposal had been submitted, you can not submit it again.', 'warning')
        return jsonify({'success': 'not_ok'})
    if not proposal.is_pi():
        flash('Only PI can edit and submit this proposal.', 'warning')
        return jsonify({'success': 'not_ok'})
    # tmp =request.get_json()
    # print(tmp)
    try:
        file_content = request.get_json()
        sheet = pd.io.json.json_normalize(file_content)
        srcs =[]
        for row in sheet.iterrows():
            tmp = create_sy01_too_source(row[1]) 
            if tmp is not None:
                srcs.append(tmp)
        
        srcs = sorted(srcs, key= lambda k:k['timeConstraints'],reverse=True)
        for src in [sy01_too_source_decode(src) for src in srcs]:
            src.proposal_id = id
            db.session.add(src)
        
        # TODO: 状态改变
        current_time = datetime.fromtimestamp(time.mktime(time.localtime()))
        proposal.proposal_title = "Experimental Satellite Observation-"+str(current_time.year)+"-ToO-"+str(proposal.id)
        proposal.proposal_abstract = "Experimental Satellite Observation-"+current_time.isoformat()
        proposal.index_srcs()
        proposal_encoded = sy01_too_proposal_encode(proposal, srcs[0]['timeConstraints'].strftime('%Y-%m-%dT%H:%M:%SZ')) 
        v = proposal
    except Exception as inst:
        return jsonify({'error': 'Can not resolve the input file. ' +str(inst)})
    # print(proposal_encoded)
    # return jsonify({'success':'ok'})
    try:
        resp = requests.post(f"{BASE_URL}/observetask/receiveProposalInfo",headers={"X-AUTH-TOKEN":get_token(),"Content-Type": "application/json"},json=proposal_encoded,stream=True)
        if resp.status_code==200:
        # if False:
            # 写数据
            #更新总时间
            source_list:List[ProposalSourceList] = ProposalSourceList.query.filter(ProposalSourceList.proposal_id == v.id).all()
            total_time_request = 0
            for source in source_list:
                total_time_request += source.exposure_time
            db.session.query(Proposal).filter(Proposal.proposal_season_id == v.proposal_season_id).with_for_update(read=False, nowait=False).update({'lock': True})
            if v.code == 0:
                max_code = db.session.query(Proposal).filter(Proposal.proposal_season_id == v.proposal_season_id).order_by(Proposal.code.desc()).first()
                code = max_code.code + 1
            
                db.session.query(Proposal).filter(Proposal.id == id).update({'total_time_request':total_time_request,'submit_status': True, 'submit_time': current_time, 'code': code, 'can_submit_again': False})
            else:
                db.session.query(Proposal).filter(Proposal.id == id).update({'total_time_request':total_time_request,'submit_status': True, 'submit_time': current_time, 'can_submit_again': False})
            db.session.commit()

            # 添加日志
            user = User.get_user_byemail(current_user.email.lower().strip())
            OperationLog.add_log('Submit_Proposal', 'Submit Proposal: proposal_id:' + str(id) + ' PI-Email:' + v.get_pi_email() + ' Title:' + v.proposal_title, user)
            return jsonify({'success': 'ok'})
  
        else:
            # TODO:
            ProposalSourceList.query.filter(ProposalSourceList.proposal_id == v.id).delete()
            db.session.commit()
            return jsonify({'error': 'submit error!!'})
    except Exception as inst:
            print(inst)

            return jsonify({'error': 'Can not connect to remote service. ' +str(inst)})

@proposal_submit_bp.route('/admin_withdraw_proposal/<proposal_id>', methods=['GET'])
@login_required
def admin_withdraw_proposal(proposal_id):
    return flask.redirect(flask.url_for("proposal_admin.admin_withdraw_proposal",proposal_id=proposal_id))

#测试时端口改成31503
BASE_URL="http://{BASE_URL}:31603/ep/sys"

def get_token():
    resp = requests.post(f"{BASE_URL}/user/login?password={current_app.config.get('SCI_EXE_PWD')}&username=admin",headers={"accept": "*/*"})
    return resp.json()['token']

@proposal_submit_bp.route('/target_visibility_tool', methods=['GET', 'POST'])
def target_visibility_tool():
    form = TargetVisilibityForm()
    if form.is_submitted():
        if form.validate():
            ra = float(form.ra.data)
            dec =float(form.dec.data)
            start_time = parser.parse(form.start_time.data)
            end_time = parser.parse(form.end_time.data)
            if ra>360 or ra<0 or dec>90 or dec<-90:
                flash('The RA, Dec are not correct.','warning')
                return redirect(url_for('proposal_submit.target_visibility_tool'))
            if start_time>=end_time:
                flash('The timespan is not correct.','warning')
                return redirect(url_for('proposal_submit.target_visibility_tool'))
                # return render_template('app/proposal_submit/target_visibilty_tool.html',  form=form,result_json = {}, hint="",visible_json={})
            hint = "for RA={}, Dec={}".format(ra,dec)
            result = calculator.main(ra,dec,start_time.strftime('%Y-%m-%dT%H:%M:%S'),end_time.strftime('%Y-%m-%dT%H:%M:%S'), path = None, threshold_sun_a1=94.5, threshold_moon_a1=10 )
            result_json = json.dumps(result)
            visible_date_list, visible_png = calculator.plot_visible(result, path = None)
            form = TargetVisilibityForm(request.form)
            return render_template('app/proposal_submit/target_visibilty_tool.html', form=form, result_json = result_json, hint=hint, visible_json={"visible_date_list":[{'visible_start':start,'visible_end':end} for start,end in  zip(visible_date_list['visible_start'],visible_date_list['visible_end'])], # 格式转换
                "visible_png":visible_png
            })
        else:
            return "Auto parameter input is not working"
    else:
        form.ra.data = request.args.get('ra',0,type=float)
        form.dec.data = request.args.get('dec',0,type=float)
        start_time = request.args.get('start_time')
        end_time = request.args.get('end_time')
        if start_time and end_time:
            form.start_time.data = parser.parse(start_time)
            form.end_time.data = parser.parse(end_time)
        return render_template('app/proposal_submit/target_visibilty_tool.html',  form=form, result_json = "{}", hint="",visible_json="{}")

@proposal_submit_bp.route('/pv', methods=['GET'])
@login_required
@permission_required('STP_PROPOSAL')
def pv_get():
    return flask.render_template("app/proposal_submit/pv.html")

@proposal_submit_bp.route('/pv', methods=['POST'])
@login_required
@permission_required('STP_PROPOSAL')
def pv_post():
    flask.flash("PV Submit Successful!")
    form = request.form
    name = form['name']
    stp = form['stp']
    pv = PV(name = name,stp=stp,submitter_id=user_service.get_current_user().id)
    file = request.files['rec_file']
    db.session.add(pv)
    db.session.commit()
    file.save(pv.path)
    url= flask.url_for(".pv_detail",id=pv.id)
    return flask.redirect(url)
    
    

@proposal_submit_bp.route('/pv/<int:id>')
@login_required
@permission_required('STP_PROPOSAL')
def pv_detail(id):
    pv = PV.query.get(id)
    return flask.render_template("app/proposal_submit/pv_detail.html",pv=pv)

@proposal_submit_bp.route('/pv_file/<int:id>')
@login_required
@permission_required('STP_PROPOSAL')
def pv_file_download(id):
    pv:PV = PV.query.get(id)
    return flask.send_file(pv.path)


