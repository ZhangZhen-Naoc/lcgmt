from flask import render_template, request, flash, jsonify
from flask_login import login_required, current_user
from app.extensions import db
from sqlalchemy import func
from app.utils import redirect_back,format_email
from sqlalchemy import and_, or_, func
from flask_babelex import _
from datetime import datetime
import time, json

from app.proposal_review import bp as proposal_review_bp
# from app.proposal_admin.forms import ProposalSeasonForm
from app.proposal_review.forms import ReviewForm
from app.proposal_admin.model import ProposalSeason, Proposal, ProposalExpert, ProposalReviewExpert, ProposalSourceList, ProposalScientificCategory, ProposalInvestigator


@proposal_review_bp.route('/review_proposal_list', methods=['GET'])
@login_required
def review_proposal_list():
    if not current_user.can('PROPOSAL_REVIEW'):
        return redirect_back('proposal_submit.user_proposal_list')
    page = request.args.get('page', 1, type=int)
    pagination = db.session.query(Proposal, ProposalReviewExpert).filter(PrrposalReviewExpert.email.in_(tuple(format_email(current_user.email))), Proposal.id == ProposalReviewExpert.proposal_id, ProposalReviewExpert.is_sure == True, Proposal.submit_status == True).distinct().paginate(page, per_page=20, error_out=False)
    review_proposals = pagination.items
    can_review_count = Proposal.get_can_review_count()
    need_to_review_count = Proposal.get_need_to_review_count()
    form = ReviewForm()
    return render_template('app/proposal_review/review_proposal_list.html',
                           pagination=pagination, review_proposals=review_proposals,
                           can_review_count=can_review_count, need_to_review_count=need_to_review_count,
                           form=form)


@proposal_review_bp.route('/review_proposal', methods=['POST'])
@login_required
def review_proposal():
    data = json.loads(request.get_data(as_text=True))
    # 是否可以评审
    if not Proposal.can_review(proposal_id=data['proposal_id']):
        return redirect_back('proposal_submit.user_proposal_list')
    # 数据格式检查
    try:
        a = float(data['score'].strip())
        if not 0 <= a <= 10:
            return jsonify({'score': 'not_in'})
    except:
        return jsonify({'score': 'not_ok'})
    # 空
    if data['comment'].strip() == '':
        return jsonify({'comment': 'not_ok'})
    # 成功
    current_time = datetime.fromtimestamp(time.mktime(time.localtime()))
    # 截止时间是否到了
    expiration = ProposalReviewExpert.get_review_expiration(proposal_review_expert_id=data['reviewer_id'])
    if expiration is not None and  current_time > expiration:
    
        return jsonify({'time': 'not_ok'})
    #
    db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == data['reviewer_id']).update({'submit_time': current_time, 'submit_status': True, 'read_status': True, 'score': data['score'].strip(), 'content': data['comment'], 'familiar': data['familiar']})
    db.session.commit()
    return jsonify({'success': 'ok'})


@proposal_review_bp.route('/get_review_result', methods=['GET'])
@login_required
def get_review_result():
    reviewer_id = request.args.get('reviewer_id')
    proposal_id = request.args.get('proposal_id')
    if not Proposal.can_review(proposal_id=proposal_id):
        return redirect_back('proposal_submit.user_proposal_list')
    review = ProposalReviewExpert.query.filter(ProposalReviewExpert.id == reviewer_id).first()
    return jsonify({'score': review.score, 'comment': review.content, 'familiar': review.familiar})


@proposal_review_bp.route('/get_technical_review_result', methods=['GET'])
@login_required
def get_technical_review_result():
    proposal_id = request.args.get('proposal_id')
    rid = request.args.get('rid')
    if not Proposal.can_review(proposal_id=proposal_id):
        return redirect_back('proposal_submit.user_proposal_list')
    # 已读标记
    ProposalReviewExpert.mark_as_read(rid=rid)
    # 获取技术评审数据
    proposal = Proposal.query.filter(Proposal.id == proposal_id).first()
    technical_reviews = proposal.get_proposal_technical_review()
    return jsonify(technical_reviews)
