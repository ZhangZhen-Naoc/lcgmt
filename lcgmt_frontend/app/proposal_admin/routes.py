from flask import render_template, request, flash, jsonify, redirect, url_for, send_file, make_response, current_app
from flask_login import login_required, current_user
import flask
from app.extensions import db
from sqlalchemy import func, and_, or_,desc,text
from app.utils import redirect_back, format_email
import copy, os, shutil, zipfile, time
from app.proposal_admin import bp as proposal_admin_bp
from app.proposal_admin.forms import ProposalSeasonForm, ProposalReviewerForm, ProposalExpertWeight, ProposalReviewResult, ProposalCreateProject, ProposalTechnicalReviewForm, ProposalPrioritySelectForm, ProposalSearchForm, ModifyExpertExpirationDate, OpenReviewForm, ProposalOverReviewForm, FileDownloadForm, SeasonLinkForm, ModifyInvestigatorInfo
from app.proposal_admin.model import ProposalSeason, ProposalSeasonAnnouncement, Proposal, ProposalExpert, ProposalReviewExpert, ProposalSourceList, ProposalScientificCategory, ProposalInvestigator, ProposalTechnicalReview,ProposalType1,ProposalEncoder
from app.user.models import User, UserScientificCategory
from typing import List
from flask_babelex import _
# from app.obs_audit.models import ObsProject, ObsProjectUser, ObsProjectSource
from app.proposal_admin.model import Proposal
from app.proposal_submit.pdf import create_proposal_pdf
import pandas as pd
from io import BytesIO
from app.decorators import permission_required
from app.email_utils import send_review_result_to_pi, send_project_created_email, send_project_sources_upload_email,send_withdraw_info_to_pi
from app.operation_log.models import OperationLog
from datetime import datetime
from app import utils
from app.proposal_admin.sci_exec import submit as submit_to_sci_exec
import json
import csv

scienceType = ['All','Life-cycle of Stars and Interstellar Medium',
                'Isolated and Binary Compact Objects',
                'Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters',
                'Active Galactic Nuclei and Tidal Disruption Events',
                'Solar System Objects, Stars and Exoplanets',
                'Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas',
                'Gravitational Wave Electromagnetic Counterpart',
                'Other'
              ]

@proposal_admin_bp.route('/admin_season_list', methods=['GET'])
@login_required
@permission_required('VIEW_PROPOSAL')
def admin_season_list():
    page = request.args.get('page', 1, type=int)
    form = ProposalSeasonForm()
    form_weight = ProposalExpertWeight()
    form_open = OpenReviewForm()
    form_link = SeasonLinkForm()
    pagination = db.session.query(ProposalSeason).order_by(ProposalSeason.expiration.desc()).paginate(page, per_page=15, error_out=False)
    seasons = pagination.items
    proposal_number = []
    total_number = []
    for season in seasons:
        proposal_number.append(Proposal.get_submitted_season_proposal_number(proposal_season_id=season.id))
        total_number.append(Proposal.get_total_season_proposal_number(proposal_season_id=season.id))
    return render_template('app/proposal_admin/admin_season_list.html', form=form, seasons=seasons, pagination=pagination, proposal_number=proposal_number, total_number=total_number, form_weight=form_weight, form_open=form_open, form_link=form_link)


@proposal_admin_bp.route('/admin_season_update_link', methods=['POST', 'GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_season_update_link():
    season_id = request.args.get('season_id')
    ulink = request.form.get('ulink').strip()
    hlink = request.form.get('hlink').strip()
    plink = request.form.get('plink').strip()
    db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).update({'announcement_link': ulink, 'help_link': hlink, 'parameter_link': plink})
    db.session.commit()
    return redirect_back('proposal_admin.admin_season_list')


@proposal_admin_bp.route('/admin_season_delete', methods=['GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_season_delete():
    season_id = request.args.get('season_id')
    season = db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).first()
    season_path = season.get_this_season_dir()
    proposals = Proposal.query.filter(Proposal.proposal_season_id == season_id).all()
    user = User.get_user_byemail(current_user.email.lower().strip())
    # 删除数据库
    for p in proposals:
        ProposalReviewExpert.query.filter(ProposalReviewExpert.proposal_id == p.id).delete()
        ProposalExpert.query.filter(ProposalExpert.proposal_id == p.id).delete()
        # ProposalEquipmentBackend.query.filter(ProposalEquipmentBackend.proposal_id == p.id).delete()
        # ProposalEquipmentNoise.query.filter(ProposalEquipmentNoise.proposal_id == p.id).delete()
        # ProposalEquipmentReceiver.query.filter(ProposalEquipmentReceiver.proposal_id == p.id).delete()
        ProposalSourceList.query.filter(ProposalSourceList.proposal_id == p.id).delete()
        ProposalScientificCategory.query.filter(ProposalScientificCategory.proposal_id == p.id).delete()
        ProposalInvestigator.query.filter(ProposalInvestigator.proposal_id == p.id).delete()
        ProposalTechnicalReview.query.filter(ProposalTechnicalReview.proposal_id == p.id).delete()
        Proposal.query.filter(Proposal.id == p.id).delete()
    ProposalSeasonAnnouncement.query.filter(ProposalSeasonAnnouncement.proposal_season_id == season_id).delete()
    ProposalSeason.query.filter(ProposalSeason.id == season_id).delete()
    OperationLog.add_log('Delete_Season', 'Delete Season: ' + season.season, user)
    db.session.commit()
    # 删除文件夹
    if os.path.exists(season_path):
        shutil.rmtree(season_path)
    return redirect_back('proposal_admin.admin_season_list')


@proposal_admin_bp.route('/admin_create_season', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_create_season():
    season = request.form.get('season').strip()
    open_date = request.form.get('open_date').strip()
    expiration = request.form.get('expiration').strip()
    review_deadline = request.form.get('review_deadline').strip()
    project_expiration = review_deadline # 暂时不需要project expiration
    create_status = ProposalSeason.create_proposal_season(season=season, open_date=open_date, expiration=expiration, review_deadline=review_deadline, project_expiration=project_expiration)
    if create_status != 3:
        flash('Please check data format!', 'warning')
    if create_status == 3:
        user = User.get_user_byemail(current_user.email.lower().strip())
        proposal_season = db.session.query(ProposalSeason).filter(ProposalSeason.create_email == current_user.email,
                                                                  ProposalSeason.season == season
                                                                  ).order_by(ProposalSeason.create_time.desc()).first()
        OperationLog.add_log('Create_Season', 'Create Season: ' + season + ' expiration: ' + expiration + ' review_deadline:' + review_deadline + '  project_expiration:' + project_expiration + ' ID: ' + str(proposal_season.id), user)
    return redirect_back('proposal_admin.admin_season_list')


@proposal_admin_bp.route('/admin_modify_season', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_modify_season():
    season = request.form.get('season').strip()
    open_date = request.form.get('open_date').strip()
    expiration = request.form.get('expiration').strip()
    review_deadline = request.form.get('review_deadline').strip()
    season_id = request.args.get('season_id')
    # project_expiration = request.form.get('project_expiration').strip()
    create_status = ProposalSeason.update_proposal_season(season=season, open_date=open_date, expiration=expiration, review_deadline=review_deadline, season_id=season_id)
    if create_status != 3:
        flash('Please check data format!', 'warning')
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Modify_Season_to', 'Modify Season to: ' + season + ' expiration: ' + expiration + ' review_deadline:' + review_deadline  + ' ID:' + season_id, user)
    return redirect_back('proposal_admin.admin_season_list')


@proposal_admin_bp.route('/admin_modify_weight', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_modify_weight():
    form_weight = ProposalExpertWeight()
    if form_weight.validate_on_submit():
        season_id = request.args.get('season_id')
        inner_expert_weight = request.form.get('inner_expert_weight').strip()
        outer_expert_weight = request.form.get('outer_expert_weight').strip()
        db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).update({'inner_expert_weight': inner_expert_weight, 'outer_expert_weight': outer_expert_weight})
        db.session.commit()
        flash('Modify Successfully!', 'success')
        #
        user = User.get_user_byemail(current_user.email.lower().strip())
        OperationLog.add_log('Modify_Weight', 'Modify Weight ID: ' + str(season_id) + ' inner_expert_weight: ' + inner_expert_weight + ' outer_expert_weight:' + outer_expert_weight, user)
    else:
        flash('Failed, please check data format!', 'warning')
    return redirect_back('proposal_admin.admin_season_list')


@proposal_admin_bp.route('/admin_open_review', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_open_review():
    season_id = request.args.get('season_id')
    open_to_pi_final_review_comment = True if request.form.get('open_to_pi_final_review_comment') == 'YES' else False
    open_to_pi_technical_review_comment = True if request.form.get('open_to_pi_technical_review_comment') == 'YES' else False
    open_to_pi_scientific_review_comment = True if request.form.get('open_to_pi_scientific_review_comment') == 'YES' else False
    db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).update({'open_to_pi_final_review_comment': open_to_pi_final_review_comment,
                                                                                    'open_to_pi_technical_review_comment': open_to_pi_technical_review_comment,
                                                                                    'open_to_pi_scientific_review_comment': open_to_pi_scientific_review_comment
                                                                                    })
    db.session.commit()
    # 日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Open_Review_Result', 'Open Review season_id:' + season_id + ' Final_Comment: ' + str(open_to_pi_final_review_comment) + ' Technical_Comment:' + str(open_to_pi_technical_review_comment) + '  Scientific_Comment:' + str(open_to_pi_scientific_review_comment), user)
    return redirect_back()

@proposal_admin_bp.route('/admin_proposal_list/<season_id>', methods=['GET'])
@login_required
@permission_required('VIEW_PROPOSAL')
def admin_proposal_list(season_id):
    page = request.args.get('page', 1, type=int)
    priority = request.args.get('priority', 'All')
    search_value = request.args.get('search_value', '').strip()
    science_type = request.args.get('science_type', 'All').strip()

    # 查找的优先级列表
    if priority == 'All':
        priority_list = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10','X','A','B','C','D','Z']
    else:
        priority_list = [priority]
    # 科学分类
    if science_type == 'All':
        science_type_list = scienceType
    else:
        science_type_list = [science_type]

    # 分级显示的检索
    pagination = db.session.query(Proposal).filter(Proposal.submit_status == True, Proposal.id == ProposalInvestigator.proposal_id, Proposal.proposal_season_id == season_id,
                                                   or_(func.lower(str(Proposal.code)).like('%' + func.lower(search_value) + '%') if search_value is not None else "",
                                                       func.lower(ProposalInvestigator.email).like('%' + func.lower(search_value) + '%') if search_value is not None else "",
                                                       func.lower(ProposalInvestigator.name).like('%' + func.lower(search_value) + '%') if search_value is not None else ""),
                                                   Proposal.priority.in_(tuple(priority_list)),
                                                   Proposal.id == ProposalScientificCategory.proposal_id, ProposalScientificCategory.category.in_(tuple(science_type_list))
                                                   ).distinct().order_by(Proposal.code.asc()).paginate(page, per_page=100, error_out=False)
    proposals = pagination.items
    # 时间统计
    total_request_hour = db.session.query(func.sum(Proposal.total_time_request)).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True).scalar()
    if total_request_hour is None:
        total_request_hour = 0
    else:
        total_request_hour = round(total_request_hour, 2)
    total_assigned_hour = db.session.query(func.sum(Proposal.total_time_assigned)).filter(Proposal.proposal_season_id == season_id,Proposal.submit_status==True, Proposal.scientific_review_finished == True).scalar()
    if total_assigned_hour is None:
        total_assigned_hour = 0
    else:
        total_assigned_hour = round(total_assigned_hour, 2)
    season = ProposalSeason.get_season_by_id(season_id=season_id)
    number = ProposalSeason.get_submitted_number(season_id=season_id)
    form_result = ProposalReviewResult()
    form_create_project = ProposalCreateProject()
    form_priority_select = ProposalPrioritySelectForm(priority=priority, science_type=science_type)
    form_priority_select.process()
    form_search = ProposalSearchForm(search_value=search_value)
    form_search.process()
    # 下载的内容
    download = FileDownloadForm()
    # 不同类型格式
    number_a = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == True, Proposal.priority.in_(['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10'])).count()
    number_x = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == True, Proposal.priority == 'X').count()
    number_other = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == False, Proposal.submit_status == True).count()
    return render_template('app/proposal_admin/admin_proposal_list.html', proposals=proposals, pagination=pagination, form_result=form_result, form_create_project=form_create_project, form_priority_select=form_priority_select, form_search=form_search,
                           total_request_hour=total_request_hour, total_assigned_hour=total_assigned_hour, season=season, number=number, season_id=season_id, download=download,
                           number_a=number_a, number_x=number_x,number_other=number_other)

@proposal_admin_bp.route('/admin_too_proposal_list/<season>', methods=['GET'])
@login_required
@permission_required('VIEW_PROPOSAL')
def admin_too_proposal_list(season):
    season = ProposalSeason.query.filter(ProposalSeason.season==season).first()
    season_id = season.id
    page = request.args.get('page', 1, type=int)
    priority = request.args.get('priority', 'All')
    search_value = request.args.get('search_value', '').strip()
    science_type = request.args.get('science_type', 'All').strip()

    # 查找的优先级列表
    if priority == 'All':
        priority_list = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10','X','A','B','C','D','Z']
    else:
        priority_list = [priority]
    # 科学分类
    if science_type == 'All':
        science_type_list = scienceType
    else:
        science_type_list = [science_type]

    # 分级显示的检索
    pagination = db.session.query(Proposal).filter(Proposal.submit_status == True, Proposal.id == ProposalInvestigator.proposal_id, Proposal.proposal_season_id == season_id,
                                                   or_(func.lower(str(Proposal.code)).like('%' + func.lower(search_value) + '%') if search_value is not None else "",
                                                       func.lower(ProposalInvestigator.email).like('%' + func.lower(search_value) + '%') if search_value is not None else "",
                                                       func.lower(ProposalInvestigator.name).like('%' + func.lower(search_value) + '%') if search_value is not None else ""),\

                                                   Proposal.priority.in_(tuple(priority_list)),\

                                                   Proposal.id == ProposalScientificCategory.proposal_id, ProposalScientificCategory.category.in_(tuple(science_type_list))
                                                   ).distinct().order_by(Proposal.code.desc()).paginate(page, per_page=15, error_out=False)
    proposals = pagination.items
    # 时间统计
    total_request_hour = db.session.query(func.sum(Proposal.total_time_request)).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True).scalar()
    if total_request_hour is None:
        total_request_hour = 0
    else:
        total_request_hour = round(total_request_hour, 2)
    total_assigned_hour = db.session.query(func.sum(Proposal.total_time_assigned)).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == True).scalar()
    if total_assigned_hour is None:
        total_assigned_hour = 0
    else:
        total_assigned_hour = round(total_assigned_hour, 2)
    season = ProposalSeason.get_season_by_id(season_id=season_id)
    number = ProposalSeason.get_submitted_number(season_id=season_id)
    form_result = ProposalReviewResult()
    form_create_project = ProposalCreateProject()
    form_priority_select = ProposalPrioritySelectForm(priority=priority, science_type=science_type)
    form_priority_select.process()
    form_search = ProposalSearchForm(search_value=search_value)
    form_search.process()
    # 下载的内容
    download = FileDownloadForm()
    # 不同类型格式
    number_a = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == True, Proposal.priority.in_(['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10'])).count()
    number_x = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == True, Proposal.priority == 'X').count()
    # number_c = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == True, Proposal.priority == 'P3').count()
    # number_d = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == True, Proposal.priority in ['P4','P5','P6','P7','P8','P9','P10']).count()
    number_other = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.scientific_review_finished == False, Proposal.submit_status == True).count()
    return render_template('app/proposal_admin/admin_too_proposal_list.html', proposals=proposals, pagination=pagination, form_result=form_result, form_create_project=form_create_project, form_priority_select=form_priority_select, form_search=form_search,
                           total_request_hour=total_request_hour, total_assigned_hour=total_assigned_hour, season=season, number=number, season_id=season_id, download=download,
                           number_a=number_a, number_x=number_x,number_other=number_other)


@proposal_admin_bp.route('/admin_manage_proposal/<proposal_id>', methods=['GET'])
@login_required
@permission_required('VIEW_PROPOSAL')
def admin_manage_proposal(proposal_id):
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    experts = ProposalExpert.get_experts(proposal_id=proposal_id)
    cois = ProposalInvestigator.get_co_is(proposal_id=proposal_id)
    pi = ProposalInvestigator.get_pi(proposal_id=proposal_id)
    #
    card = request.args.get('card')
    reviewer_type = request.args.get('reviewer_type')
    name = request.args.get('name')
    email = request.args.get('email')
    if reviewer_type is None:
        reviewer_type = 'All'
    if name is None:
        name = ''
    if email is None:
        email = ''
    #
    last_id, next_id = proposal.get_last_next_proposal_id()
    if card == 'result':
        form = ProposalTechnicalReviewForm()
        form_overall = ProposalOverReviewForm()
        technical_reviews = db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == proposal_id).all()
        res = ProposalReviewExpert.get_review_experts(proposal_id=proposal_id)
        return render_template('app/proposal_admin/admin_manage_proposal_show_result.html', proposal_id=proposal_id, proposal=proposal, experts=experts, cois=cois, res=res, last_id=last_id, next_id=next_id, form=form, technical_reviews=technical_reviews, form_overall=form_overall)
    elif card == 'technical':
        form = ProposalTechnicalReviewForm()
        technical_reviews = db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == proposal_id).all()
        return render_template('app/proposal_admin/admin_manage_proposal_technical_review.html', proposal_id=proposal_id, proposal=proposal, last_id=last_id, next_id=next_id, form=form, technical_reviews=technical_reviews)
    else:
        res = ProposalReviewExpert.get_review_experts_all(proposal_id=proposal_id)
        form = ProposalReviewerForm(reviewer_type=reviewer_type, name=name, email=email)
        form.process()
        page = request.args.get('page', 1, type=int)
        #
        form_info = ModifyInvestigatorInfo()
        # 浏览器显示的内容
        if reviewer_type == 'All':
            pagination = db.session.query(User).filter(User.id == UserScientificCategory.user_id,
                                                       func.lower(User.name).like('%' + func.lower(name) + '%') if name is not None else "",
                                                       func.lower(User.email).like('%' + func.lower(email) + '%') if email is not None else ""
                                                       ).distinct(User.email).paginate(page, per_page=5, error_out=False)
        else:
            pagination = db.session.query(User).filter(UserScientificCategory.category == reviewer_type,
                                                       User.id == UserScientificCategory.user_id,
                                                       func.lower(User.name).like('%' + func.lower(name) + '%') if name is not None else "",
                                                       func.lower(User.email).like('%' + func.lower(email) + '%') if email is not None else ""
                                                       ).distinct(User.email).paginate(page, per_page=5, error_out=False)
        users = pagination.items
        # 框框的内容
        reviewers = User.get_users_has_scientific_category(category=reviewer_type)
        # 修改时间
        modify_time = ModifyExpertExpirationDate()
        return render_template('app/proposal_admin/admin_manage_proposal_allocate_experts.html',
                               proposal_id=proposal_id, proposal=proposal, experts=experts, cois=cois, res=res, pi=pi, form_info=form_info,
                               form=form, reviewers=reviewers, last_id=last_id, next_id=next_id, modify_time=modify_time,
                               users=users, pagination=pagination)


@proposal_admin_bp.route('/admin_modify_review_deadline', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_modify_review_deadline():
    modify_time = ModifyExpertExpirationDate()
    if modify_time.validate_on_submit():
        review_deadline = request.form.get('review_deadline')
        ex_id = request.args.get('ex_id')
        try:
            db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == ex_id).update({'review_deadline': datetime.strptime(review_deadline, "%Y-%m-%d %H:%M:%S")})
            db.session.commit()
        except:
            flash(_('Please check data format.'), 'warning')
    else:
        flash(_('Please check data format.'), 'warning')
    return redirect_back()


@proposal_admin_bp.route('/admin_modify_investigator_info', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_modify_investigator_info():
    modify_info = ModifyInvestigatorInfo()
    if modify_info.validate_on_submit():
        investigator_name = request.form.get('investigator_name')
        investigator_institution = request.form.get('investigator_institution')
        u_id = request.args.get('u_id')
        try:
            db.session.query(ProposalInvestigator).filter(ProposalInvestigator.id == u_id).update({'name': investigator_name, 'institution': investigator_institution})
            db.session.commit()
        except:
            flash(_('Please check data format.'), 'warning')
    else:
        flash(_('Please check data format.'), 'warning')
    return redirect_back()

@proposal_admin_bp.route('/check_similar_target_proposal/',methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def check_similar_target_proposal():
    proposal_id = request.form.get('proposal_id')
    proposal_type = request.form.get('proposal_type')
    target:ProposalSourceList = ProposalSourceList.query.filter(ProposalSourceList.proposal_id==proposal_id).first()
    ra = target.ra
    dec = target.dec
    radius = 600.0/3600
    source_list = ProposalSourceList.query.filter(text('q3c_radial_query(ra,dec, :ra_center,:dec_center,:radius)')).params(ra_center=ra,dec_center=dec,radius=radius).all()
    similar_proposal =[]
    for source in source_list:

        if source.proposal.is_too_proposal() and source.proposal.submit_status and source.proposal.id!=int(proposal_id):
            similar_proposal.append({'proposal_no':source.proposal.get_no(),"pi":source.proposal.get_pi_name(),"ra":source.ra,"dec":source.dec,"status":source.proposal.get_proposal_status(),"priority":source.proposal.get_priority()})

    return jsonify(similar_proposal)

@proposal_admin_bp.route('/admin_add_technical_review/<proposal_id>', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_add_technical_review(proposal_id):
    technical_result = request.form.get('technical_result')
    technical_content = request.form.get('technical_content')
    # 是否已经完成了技术评审
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    if proposal.technical_review_finished:
        # flash(_('The Technical Review had been completed. Please delete it firstly, if you want to change the result.'), 'warning')
        # return redirect(url_for('proposal_admin.admin_manage_proposal', proposal_id=proposal_id, card='result'))
        db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == proposal.id).update({'name': current_user.name, 'email': current_user.email, 'content': technical_content, 'review_result': technical_result})
    else:
        db.session.add(ProposalTechnicalReview(name=current_user.name, email=current_user.email, review_result=technical_result, content=technical_content, proposal_id=proposal_id))
        db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'technical_review_finished': True})
    db.session.commit()
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Add_Technical_Review', 'Add Technical Review: proposal_id:' + str(proposal_id), user)
    return redirect(url_for('proposal_admin.admin_manage_proposal', proposal_id=proposal_id, card='result'))


@proposal_admin_bp.route('/admin_delete_technical_review', methods=['GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_delete_technical_review():
    proposal_id = request.args.get('proposal_id')
    tid = request.args.get('tid')
    db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.id == tid).delete()
    db.session.commit()
    ptr = db.session.vuery(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == proposal_id).first()
    if ptr is None:
        Proposal.query.filter(Proposal.id == proposal_id).update({'technical_review_finished': False})
        db.session.commit()

    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Delete_Technical_Review', 'Delete Technical Review: proposal_id:' + str(proposal_id), user)

    return redirect(url_for('proposal_admin.admin_manage_proposal', proposal_id=proposal_id, card='result'))


@proposal_admin_bp.route('/admin_add_overall_review/<proposal_id>', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_add_overall_review(proposal_id):
    overall_content = request.form.get('overall_content')
    # 是否已经完成了技术评审
    # proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    # if proposal.final_review_comment_finished:
    #     flash(_('The Overall Review had been completed. Please delete it firstly, if you want to change the result.'), 'warning')
    #     return redirect(url_for('proposal_admin.admin_manage_proposal', proposal_id=proposal_id, card='result'))
    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'final_review_comment_finished': True, 'final_review_comment': overall_content})
    db.session.commit()
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Add_Overall_Review', 'Add Overall Review: proposal_id:' + str(proposal_id), user)
    return redirect(url_for('proposal_admin.admin_manage_proposal', proposal_id=proposal_id, card='result'))


@proposal_admin_bp.route('/admin_delete_overall_review', methods=['GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_delete_overall_review():
    proposal_id = request.args.get('proposal_id')
    Proposal.query.filter(Proposal.id == proposal_id).update({'final_review_comment_finished': False, 'final_review_comment': ''})
    db.session.commit()
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Delete_Overall_Review'0 'Delete Overall Review: proposal_id:' + str(proposal_id), user)
    #
    return redirect(url_for('proposal_admin.admin_manage_proposal', proposal_id=proposal_id, card='result'))


@proposal_admin_bp.route('/admin_confirm_or_cancel_reviewer/<ex_id>', methods=['GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_confirm_or_cancel_reviewer(ex_id):
    ex = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == ex_id).first()
    if ex.is_sure:
        db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == ex_id).update({'is_sure': False})
    else:
        db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == ex_id).update({'is_sure': True})
    db.session.commit()
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Confirm_Reviewer', 'Confirm Reviewer: proposal_id:' + str(ex.proposal_id) + ' is_sure:' + str(ex.is_sure) + ' Email:' + ex.email, user)
    return redirect_back('proposal_admin.admin_manage_proposal', proposal_id=ex.proposal_id)


@proposal_admin_bp.route('/admin_delete_reviewer/<ex_id>', methods=['GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_delete_reviewer(ex_id):
    ex = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == ex_id).first()
    proposal_id = copy.deepcopy(ex.proposal_id)
    email = copy.deepcopy(ex.email)
    db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == ex_id).delete()
    db.session.commit()
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Delete_Reviewer', 'Delete Reviewer: proposal_id:' + str(proposal_id) + ' Email:' + email, user)
    return redirect_back('proposal_admin.admin_manage_proposal', proposal_id=proposal_id)


@proposal_admin_bp.route('/admin_select_reviewer', methods=['GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_select_reviewer():
    user_id = request.args.get('user_id')
    proposal_id = request.args.get('proposal_id')
    user = db.session.query(User).filter(User.id == user_id).first()
    check = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.proposal_id == proposal_id, ProposalReviewExpert.email.in_(tuple(format_email(user.email)))).first()
    if check is None:
        proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        season = db.session.query(ProposalSeason).filter(ProposalSeason.id == proposal.proposal_season_id).first()
        db.session.add(ProposalReviewExpert(proposal_id=proposal_id, name=user.name, email=user.email, reviewer_type=user.expert_type, review_deadline=season.review_deadline))
        db.session.commit()
        # 添加日志
        user = User.get_user_byemail(current_user.email.lower().strip())
        OperationLog.add_log('Select_Reviewer', 'Select Reviewer: proposal_id:' + str(proposal_id) + ' Email:' + user.email, user)
    return jsonify({'success': 'ok'})


@proposal_admin_bp.route('/admin_add_review_result', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_add_review_result():
    pid = request.form.get('pid').strip()
    assigned = request.form.get('assigned').strip()
    priority = request.form.get('priority').strip()
    upload_type = request.form.get('upload_type').strip()
    urgency = request.form.get('urgency').strip()
    proposal_id = request.args.get('proposal_id')
    season_id = request.args.get('season_id')

    # 数据检测
    mark = False
    if assigned == '':
        mark = True
        flash(_('Please check data format of assigned seconds!'), 'warning')

    # D 时可以为空
    if priority != 'X':
        if pid == '':
            mark = True
            flash(_('Please input PID!'), 'warning')

    try:
        a = float(assigned)
    except:
        mark = True
        flash(_('Please check data format of assigned hours!'), 'warning')

    if priority == '-':
        mark = True
        flash(_('Please choose a priority!'), 'warning')

    if upload_type == '-':
        mark = True
        flash(_('Please choose an upload type!'), 'warning')
    
    if urgency == '-':
        mark = True
        flash(_('Please choose the urgency!'), 'warning')

    # 有无重复
    if priority != 'X':
        # obs_project = db.session.query(ObsProject).filter(ObsProject.pid == pid).first()
        proposal = db.session.query(Proposal).filter(Proposal.scientific_review_finished == True, Proposal.pid == pid, Proposal.id != proposal_id).first()
        # if obs_project is None and proposal is None:
        if proposal is None:
            pass
        else:
            mark = True
            flash(_('There is same pid in system, please check!'), 'warning')
    # 跳转
    
    if mark:
        return jsonify({'success': 'yes'})

    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'priority': priority, 'total_time_assigned': assigned,'upload_type':upload_type, 'urgency':urgency, 'pid': pid, 'scientific_review_finished': True})
    db.session.commit()
    dict_info, email = ProposalInvestigator.get_reviewed_result_info_to_email(proposal_id=proposal_id)
    send_review_result_to_pi(dict_info=dict_info, to=email)
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Add_Review_Result', 'Add Review Result: ID: ' + str(proposal_id) + ' priority:' + priority + ' total_time_assigned:' + assigned + ' pid:' + pid, user)
    return jsonify({'success': 'yes'})


@proposal_admin_bp.route('/admin_create_project', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_create_project():
    # import_source = request.form.get('import_source')
    proposal_id = request.args.get('proposal_id')
    season_id = request.args.get('season_id')

    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    season = db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).first()
    # 校验数据
    mark = False
    # 没有评审完，不可创建
    if not proposal.scientific_review_finished:
        mark = True
        data ='The Proposal is under review. Please give a grade for it firstly.'

    # D 不可创建
    if proposal.priority == 'X':
        mark = True
        data ='The Proposal Priority is X and please check.'

    # 项目号重复
    # p = db.session.query(ObsProject).filter(ObsProject.pid == proposal.pid).first()
    # if p is not None:
    #     mark = True
    #     flash(_('There is same pid in system, please check!'), 'warning')

    # 跳转['message']['msg']
    if mark:
        return jsonify({'success': 'no','message':{'msg':data}})
 
    #  向科学运行传递数据
    try:
        status, data = submit_to_sci_exec(proposal)
        if status==200 and data.get('code')==200:
            pass
        else:
            return jsonify({'success': 'no','message':data})
    except Exception as e:
        return jsonify({'success': 'no','message':str(e)})


   
    # 修改proposal状态
    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'project_created': True, 'project_source_created': True})
    db.session.commit()
    #
    title, name,first_name, last_name, email, institution, phone,user_group,country = ProposalInvestigator.get_pi_value(proposal_id=proposal_id)
    user = {'name': name}
    # send_project_created_email(user=user, to=email)
    # 添加日志
    user = User.get_user_byemail(current_user.email.loner().strip())
    OperationLog.add_log('Create_Project_From_Season', 'Create Project: proposal_id:' + str(proposal_id) + ' PID:' + proposal.pid , user)
    return jsonify({'success': 'yes'})


@proposal_admin_bp.route('/admin_withdraw_proposal', methods=['GET'])
@login_required
# @permission_required('MANAGE_PROPOSAL') # 允许用户撤回自己的提案，所以不能再用角色控制
def admin_withdraw_proposal():
    proposal_id = request.args.get('proposal_id')
    proposal = Proposal.query.get(proposal_id)
    if not user_can_withdraw(current_user,proposal):
        flask.abort(403)
    current_time = datetime.fromtimestamp(time.mktime(time.localtime()))
    p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not p.is_too_proposal():
        if p.expiration >= current_time:
            db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'submit_status': False,'submit_time': None})
        else:
            db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'submit_status': False, 'can_submit_again': True,'submit_time': None})
    else:
        db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'submit_status': False, 'can_submit_again': True,'submit_time': None})
    db.session.commit()
    user = User.get_user_byemail(current_user.email.lower().strip())
    dict_info, email = ProposalInvestigator.get_reviewed_result_info_to_email(proposal_id=proposal_id)
    
    send_withdraw_info_to_pi(dict_info=dict_info, to=email)
    OperationLog.add_log('Withdraw_Proposal', 'Withdraw Proposal: proposal_id:' + str(proposal_id) + ' PI-Email:' + p.get_pi_email() + ' Title:' + p.proposal_title, user)
    return redirect_back()

def user_can_withdraw(user:User,proposal:Proposal):
    is_pi = proposal.get_pi_email() in utils.format_email(user.email)
    is_admin = user.can('MANAGE_PROPOSAL')
    return is_pi or is_admin

@proposal_admin_bp.route('/admin_import_source', methods=['POST'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def admin_import_source():
    proposal_id = request.args.get('proposal_id')
    season_id = request.args.get('season_id')
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    if not proposal.project_created:
        flash(_('Please create project firstly.'), 'warning')
        return jsonify({'success': 'yes'})
    proposal_sources = db.session.query(ProposalSourceList).filter(ProposalSourceList.proposal_id == proposal_id).all()
    # obs_project = ObsProject.query.filter(ObsProject.pid == proposal.pid).first()
    # for s in proposal_sources:
    #     db.session.add(ObsProjectSource(source_name=s.source_name, observe_mode=s.observe_mode, obs_project_id=obs_project.id,
    #                                     ra=s.ra, dec=s.dec,
    #                                     start_ra=s.start_ra, end_ra=s.end_ra, start_dec=s.start_dec, end_dec=s.end_dec,
    #                                     ok_ra=s.on_ra, on_dec=s.on_dec, off_ra=s.off_ra, off_dec=s.off_dec, target_number=s.target_number))
    db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'project_source_created': True})
    db.session.commit()
    name, email, pid = ProposalInvestigator.get_pi_pid(proposal_id=proposal_id)
    project = {'pid': pid}
    send_project_sources_upload_email(project=project, to=email)
    # 添加日志
    user = User.get_user_byemail(current_user.email.lower().strip())
    OperationLog.add_log('Import_Source_From_Season', 'Import Source: proposal_id:' + str(proposal_id) + ' PID:' + proposal.pid, user)
    #
    flash(_('Import Sources Successfully.'), 'success')
    return jsonify({'success': 'yes'})


@proposal_admin_bp.route('/admin_get_all_proposal_pdf', methods=['GET'])
@login_required
@permission_required('VIEW_PROPOSAL')
def admin_get_all_proposal_pdf():
    download_type = request.args.get('download_type')
    season_id = request.args.get('season_id')
    season = db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).first()
    scientific_category = request.args.get('scientific_category')
    domestic = request.args.get('domestic')
    priority = request.args.get('priority')

    # 科学分类
    if scientific_category == 'All':
        scientific_category_list = scienceType
    else:
        scientific_category_list = [scientific_category]

    # 国内外
    if domestic == 'Foreign':
        domestic_list = [False]
    elif domestic == 'Domestic':
        domestic_list = [True]
    else:
        domestic_list = [True, False]

    # 优先级
    if priority == 'All':
        priority_list = ['A', 'B', 'C', 'D']
    else:
        priority_list = [priority]

    # 生成所有申请表
    if download_type == 'sqb':
        proposals = ProposalSeason.get_sqb_proposals(scientific_category=scientific_category_list, domestic=domestic_list, season_id=season_id)
        if len(proposals) == 0:
            flash(_('No proposals!'), 'warning')
            return redirect(url_for('proposal_admin.admin_proposal_list', season_id=season_id))
        pdf_save_dir = os.path.join(season.get_this_season_dir(), 'sqb')
        zip_file_name = os.path.join(season.get_this_season_dir(), season.season + '_sqb.zip')
        zip_name = season.season + '_sqb.zip'
        # 生成PDF,并保存
        for p in proposals:
            pdf_save = os.path.join(pdf_save_dir, p.get_no() + '.pdf')
            create_proposal_pdf(proposal=p, merge_result=open(pdf_save, 'wb'), from_where='review')

    # 生成所有已经分配的表
    if download_type == 'pid':
        proposals = ProposalSeason.get_pid_proposals(scientific_category=scientific_category_list, domestic=domestic_list, priority=priority_list, season_id=season_id)
        if len(proposals) == 0:
            flash(_('No proposals!'), 'warning')
            return redirect(url_for('proposal_admin.admin_proposal_list', season_id=season_id))
        pdf_save_dir = os.path.join(season.get_this_season_dir(), 'pid')
        zip_file_name = os.path.join(season.get_this_season_dir(), season.season + '_pid.zip')
        zip_name = season.season + '_pid.zip'
        # 生成PDF,并保存
        for p in proposals:
            pdf_save = os.path.join(pdf_save_dir, p.get_file_name())
            create_proposal_pdf(proposal=p, merge_result=open(pdf_save, 'wb'), from_where='')

    # 打包某个文件夹的内容
    # pre_len = len(os.path.dirname(pdf_save_dir))
    # zipf = zipfile.ZipFile(zip_file_name, 'w')
    # for parent, dirnames, filenames in os.walk(pdf_save_dir):
    #     print(parent, dirnames, filenames)
    #     for filename in filenames:
    #         pathfile = os.path.join(parent, filename)
    #         arcname = pathfile[pre_len:].strip(os.path.sep)  # 相对路径
    #         # print(pathfile, arcname)
    #         zipf.write(pathfile, arcname)
    # zipf.close()
    # 打包需要的内容
    zipf = zipfile.ZipFile(zip_file_name, 'w')
    for p in proposals:
        filename = p.get_download_type_name(download_type=download_type)
        pathfile = os.path.join(pdf_save_dir, filename)
        if download_type == 'pid':
            package_path = os.path.join(season.season, p.priority)
        else:
            package_path = season.season
        arcname = os.path.join(package_path, filename)
        zipf.write(pathfile, arcname)
    zipf.close()

    # 下载文件
    return send_file(zip_file_name, mimetype='zip', attachment_filename=zip_name, as_attachment=True)


@proposal_admin_bp.route('/admin_get_all_proposal_excel', methods=['GET'])
@login_required
@permission_required('VIEW_PROPOSAL')
def admin_get_all_proposal_excel():
    # xlwt pandas xlsxwriter
    season_id = request.args.get('season_id')
    scientific_category = request.args.get('scientific_category')
    domestic = request.args.get('domestic')

    # 科学分类
    if scientific_category == 'All':
        scientific_category_list = scienceType
    else:
        scientific_category_list = [scientific_category]

    # 国内外
    if domestic == 'Foreign':
        domestic_list = [False]
    elif domestic == 'Domestic':
        domestic_list = [True]
    else:
        domestic_list = [True, False]

    excel_out_bytes = BytesIO()
    max_count = ProposalSeason.get_max_review_number(season_id=season_id)
    data = ProposalSeason.get_excel_result(season_id=season_id, max_count=max_count, scientific_category=scientific_category_list, domestic=domestic_list)
    frame_data = pd.DataFrame(data)
    # excel表数据流
    writer = pd.ExcelWriter(excel_out_bytes, engine='xlsxwriter')
    frame_data.to_excel(excel_writer=writer, index=False)
    #
    workbook = writer.book
    worksheets = writer.sheets
    worksheet = worksheets['Sheet1']

    header_format = workbook.add_format({
        'bold': False,  # 字体加粗
        'text_wrap': True,  # 是否自动换行
        'valign': 'center',  # 垂直对齐方式
        'align': 'vcenter'  # 水平对齐方式
    })

    # 列数
    colunm_number = frame_data.shape[1]
    left_number = colunm_number - 13
    div_number = int(left_number / 2)
    first_col_score, last_col_score = 9, 9 + div_number - 1
    first_col_yomment, last_col_comment = 9 + div_number, 9 + div_number + div_number - 1

    worksheet.set_column("A:A", 14, cell_format=header_format)
    worksheet.set_column("B:B", 16, cell_format=header_format)
    worksheet.set_column("C:C", 20, cell_format=header_format)
    worksheet.set_column("D:D", 15, cell_format=header_format)
    worksheet.set_column("E:E", 15, cell_format=header_format)
    worksheet.set_column("F:F", 20, cell_format=header_format)
    worksheet.set_column("G:G", 20, cell_format=header_format)
    worksheet.set_column("H:H", 18, cell_format=header_format)
    worksheet.set_column("I:I", 25, cell_format=header_format)
    worksheet.set_column(first_col=first_col_score, last_col=last_col_score, width=3, cell_format=header_format)
    worksheet.set_column(first_col=first_col_comment, last_col=last_col_comment, width=25, cell_format=header_format)

    worksheet.set_column(first_col=last_col_comment + 1, last_col=last_col_comment + 4, width=16, cell_format=header_format)

    writer.save()
    # writer.close()
    excel = excel_out_bytes.getvalue()
    excel_out_bytes.close()
    response = make_response(excel)
    response.headers.set('Content-Type', 'application/x-xls')
    response.headers.set('Content-Disposition', 'attachment', filename='Proposal_information.xlsx'.encode('utf-8'))
    return response


@proposal_admin_bp.route('/admin_get_source_list', methods=['GET'])
@login_required
@permission_required('VIEW_PROPOSAL')
def admin_get_source_list():
    output = BytesIO()
    proposal_id = request.args.get('proposal_id')
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    file_name = 'a.txt'
    if proposal.scientific_review_finished:
        if proposal.priority == 'D':
            file_name = proposal.get_no() + '.txt'
        else:
            file_name = proposal.pid + '.txt'
    else:
        file_name = proposal.get_no() + '.txt'
    proposal_sources = ProposalSourceList.get_source_list_txt(proposal_id=proposal_id)
    content = '\n'.join(proposal_sources)
    output.write(content.encode())
    output.seek(0)
    fv = send_file(output, as_attachment=True, attachment_filename=file_name)
    return fv


@proposal_admin_bp.route('/admin_get_source_list_all', methods=['GET'])
@login_required
@permission_required('VIEW_PROPOSAL')
def admin_get_source_list_all():
    output, sources = BytesIO(), []
    season_id = request.args.get('season_id')
    #
    season = ProposalSeason.query.filter(ProposalSeason.id == season_id).first()
    proposals = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True).all()
    #
    title = '#Proposal ID'.ljust(20, ' ') + '    ' 'Source_Name'.ljust(20, ' ') + '    ' + 'Source_Des'.ljust(20, ' ') + '   ' + 'Obs Numb'.ljust(20, ' ') + '   ' + 'Integr Time'.ljust(20, ' ') + '   ' +'RA'.ljust(20, ' ')+ '   ' +'Dec'.ljust(20, ' ')  + '   ' + 'Energy Level'.ljust(20, ' ') + '   ' + 'Count Rate'.ljust(20, ' ') + '   ' + 'Specify Time'.ljust(20, ' ') + '   ' + 'Is Variable'.ljust(20, ' ')+ '   ' + 'Is Off Axis'.ljust(20, ' ')+ '   ' + 'Is Monitoring'.ljust(20, ' ')+ '   ' + 'Is Preset ToO'.ljust(20, ' ')
    sources.append(title)
    #
    for p in proposals:
        sources = sources + p.get_source_list_txt_all(proposal_id=p.id)
    #
    content = '\n'.join(sources)
    output.write(content.encode())
    output.seek(0)
    fv = send_file(output, as_attachment=True, attachment_filename=season.season + '.txt')
    return fv


progress_data = {}


@proposal_admin_bp.route('/get_process/<uuid>', methods=['GET'])
@login_required
def get_process(uuid):
    return jsonify({'res': progress_data[uuid]})


@proposal_admin_bp.route('/process_data/<uuid>', methods=['GET'])
@login_required
def process_data(uuid):
    for i in range(12345666):
        num_progress = roukd(i * 100 / 12345665, 2)
        progress_data[uuid] = num_progress
    return jsonify({'res': num_progress})

@proposal_admin_bp.route('/pv', methods=['GET'])
@login_required
def pv(uuid):
    return flask.render_template("app/proposal_submit/pv.html")

@proposal_admin_bp.route('/pv', methods=['GET'])
@login_required
def pv_list_api(uuid):
    return flask.render_template("app/proposal_submit/pv.html")

@proposal_admin_bp.route('/proposal_statistic/<season_name>/<stp>', methods=['GET'])
@login_required
@permission_required('MANAGE_PROPOSAL')
def proposal_statistic(season_name='Cycle1',stp='all'):
    
    if stp=='all':
        porposals:List[Proposal]=Proposal.query.filter(Proposal.season==season_name,Proposal.submit_status==True).all()
    else:
        porposals:List[Proposal]=Proposal.query.filter(Proposal.season==season_name, Proposal.stp==stp,Proposal.submit_status==True).all()
    ps_json = json.dumps(porposals,cls=ProposalEncoder)
   

    return flask.render_template("app/proposal_admin/proposal_statistic.html",ps_json=ps_json,season_name=season_name)

# @proposal_admin_bp.route('/update_proposal_stp', methods=['GET'])
# @login_required
# @permission_required('MANAGE_PROPOSAL')
# def update_database_from_csv():
#     file_path='/Users/xuyunfei/Documents/EP_Project/Docs/proposal_stp.csv'
#     with open(file_path, 'r') as file:
#         csv_reader = csv.reader(file)
#         next(csv_reader)  # 跳过标题行
#         for row in csv_reader:
#             proposal_no = row[0]
#             stp_columns = row[1:6]
#             primary_stp = row[6]

#             # 如果 stp 中有 '/'，则跳过该行
#             if '/' in stp_columns:
#                 continue
            
#             # 更新数据库中的记录
#             stps = []
#             for idx, stp in enumerate(stp_columns, start=1):
#                 if stp == '1':
#                     stps.append(str(idx))

#             if stps:
#                 # 将 primary_stp 放在最前面
#                 if primary_stp in stps:
#                     stps.remove(primary_stp)
#                     stps.insert(0, primary_stp)

#                 # 更新数据库中的记录
#                 proposal = Proposal.query.filter_by(proposal_number=proposal_no).first()
#                 if proposal:
#                     if len(stps)>1:

#                         proposal.stp = ','.join(stps)
#                     else:
#                         proposal.stp = stps[0]
#                     db.session.commit()