from flask import render_template, flash, request, current_app
from flask_babelex import _
from flask_login import login_required, current_user
from sqlalchemy import or_

from app import OperationLog
from app.comment.models import Comment
from app.decorators import permission_required
from app.email_utils import send_user_passed_verified_email, send_user_roles_changed_email
from app.extensions import db
from app.notification.models import Notification
from app.science_management_committee import bp

from app.user.models import Role, User, Permission, UserScientificCategory
from app.proposal_admin.model import ProposalSeason, Proposal
from app.utils import redirect_back, two_sets_equal
from app.cms.models import CMSCategory, CMSArticle

@bp.route('/')
@login_required
@permission_required('EPSMC_VIEW')
def index():

    id_document = 22 # EP Document ID

    page = request.args.get('page', 1, type=int)
    page_size = current_app.config['APP_DEFAULT_PAGE_ROWS']
    ep_documents_q=CMSArticle.query.filter_by(category_id=id_document).filter_by(published=True).order_by(CMSArticle.order.asc())
    pagination_document=ep_documents_q.paginate(page, page_size)

    id_meeting_summary = 23 # Meeting summary id
    meeting_summary_q=CMSArticle.query.filter_by(category_id=id_meeting_summary).filter_by(published=True).order_by(CMSArticle.order.asc())
    pagination_meeting_summary=meeting_summary_q.paginate(page, page_size)
    
    id_proposal_lists = 29 # proposal lists id
    proposal_lists_q=CMSArticle.query.filter_by(category_id=id_proposal_lists).filter_by(published=True).order_by(CMSArticle.order.asc())
    pagination_proposal_lists=proposal_lists_q.paginate(page, page_size)

        
    return render_template('app/science_management_committee/index.html',  pagination_document=pagination_document,aocument_articles=pagination_document.items, pagination_meeting_summary=pagination_meeting_summary,summary_articles=pagination_meeting_summary.items, pagination_proposal_lists=pagination_proposal_lists,proposal_lists_articles=pagination_proposal_lists.items)
    # else:
    #     return render_template('app/cms/category_view.html', category=cat, pagination=pagination,
    #                        articles=pagination.items,root_menu_id=root_menu_id,root_menu_name=root_menu_name, selected_menu_name=selected_menu_name)

