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
from app.sysadmin import bp
from app.sysadmin.forms import EditProfileAdminForm
from app.user.models import Role, User, Permission, UserScientificCategory
from app.proposal_admin.model import ProposalSeason, Proposal
from app.utils import redirect_back, two_sets_equal


@bp.route('/')
@login_required
@permission_required('DASHBOARD_VIEW')
def index():
    statistics = {}
    #
    statistics['user_count'] = User.query.count()
    statistics['unverified_user_count'] = User.query.filter(User.checked == None).count()
    statistics['season_count'] = ProposalSeason.get_statistics_seasons()
    statistics['proposal_count'] = Proposal.get_statistics_proposals()
    if current_user.can('COMMENT_RESPONSE') or current_user.can('COMMENT_ADMIN'):
        statistics['comment_unresponsed_count'] = Comment.get_unresponsed_count()
        statistics['comment_count'] = Comment.query.count()
        statistics['get_responsed_but_not_published_count'] = Comment.get_responsed_but_not_published_count()
    return render_template('app/sysadmin/index.html', statistics=statistics)


@bp.route('/profile/<int:user_id>', methods=['GET', 'POST'])
@login_required
@permission_required('USER_ADMIN')
def edit_profile_admin(user_id):
    user = User.query.get_or_404(user_id)
    form = EditProfileAdminForm(user=user)
    form.scientific_categories.choices = [[c, c] for c in current_app.config['SCIENTIFIC_CATEGORIES']]
    # form.expert_type.choices = [[c, c] for c in current_app.config['EXPERT_TYPES']]
   
    if form.validate_on_submit():
        user.first_name = form.first_name.data
        user.last_name = form.last_name.data
        user.name = user.first_name+" "+user.last_name
        pre_roles = user.roles
        roles = []
        for r in form.roles.data:
            roles.append(Role.query.filter_by(id=r).first())
        if not two_sets_equal(pre_roles, roles):
            send_user_roles_changed_email(user, roles)
        user.roles = roles
        # user.bio = form.bio.data
        # user.website = form.website.data
        user.email_confirmed = form.email_confirmed.data
        # user.address = form.address.data
        user.email = form.email.data
        # user.title = form.title.data
        # user.institution = form.institution.data
        # user.phone = form.phone.data
        # user.allowed_api = form.allowed_api.data

        # user.expert_type = form.expert_type.data
        # user.is_domestic = form.is_domestic.data

        user.research_statement = form.research_statement.data
        user.affiliation = form.affiliation.data
        user.position = form.position.data
        # user.expertise = form.expertise.data
        user.research_field = form.research_topic.data
        user.website = form.personal_website.data
        if form.publication.data is not None:
            user.publication = form.publication.data.replace("\r\n", "<br>").replace("\n", "<br>").replace("\r", "<br>")

        UserScientificCategory.delete_user(user.id)
        UserScientificCategory.add_categories(user.id, form.scientific_categories.data)
        db.session.commit()
        flash(_('User profile is updated.'), 'success')
        return redirect_back()
    form.first_name.data = user.first_name
    form.last_name.data = user.last_name
    role_ids=[]
    for r in user.roles:
        role_ids.append(r.id)
    form.roles.data = role_ids
    # form.bio.data = user.bio
    # form.title.data = user.title
    # form.institution.data = user.institution
    # form.phone.data = user.phone
    # form.website.data = user.website
    # form.address.data = user.address


    # form.email.data = user.email
    form.research_statement.data = user.research_statement
    form.affiliation.data = user.affiliation
    form.position.data = user.position
    # form.expertise.data = user.expertise
    form.research_topic.data = user.research_field
    form.personal_website.data =user.website
    if user.publication is not None:
        form.publication.data = user.publication.replace("<br>", "\r\n")
    form.email.data = user.email
    form.email_confirmed.data = user.email_confirmed
    # form.allowed_api.data = user.allowed_api
    # form.expert_type.data = user.expert_type
    # form.is_domestic.data = user.is_domestic
    form.scientific_categories.data = [c.category for c in user.scientific_catetories]
    
    return render_template('app/sysadmin/edit_profile.html', form=form, user=user)


@bp.route('/block/user/<int:user_id>', methods=['POST'])
@login_required
@permission_required('USER_ADMIN')
def block_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.is_admin or user.is_role('Moderator'):
        flash(_('Permission denied.'), 'warning')
        OperationLog.add_log(bp.name, 'block_user {0}(id={1}) failed'.format(user.name, user.id), current_user)
    else:
        user.block()
        flash(_('Account blocked.'), 'info')
        OperationLog.add_log(bp.name, 'block_user {0}(id={1})'.format(user.name, user.id), current_user)
    return redirect_back()


@bp.route('/unblock/user/<int:user_id>', methods=['POST'])
@login_required
@permission_required('USER_ADMIN')
def unblock_user(user_id):
    user 0 User.query.get_or_404(user_id)
    user.unblock()
    flash(_('Block canceled.'), 'info')
    OperationLog.add_log(bp.name, 'unblock_user {0}(id={1})'.format(user.name, user.id), current_user)
    return redirect_back()


@bp.route('/passverified/user/<int:user_id>', methods=['POST'])
@login_required
@permission_required('USER_ADMIN')
def passverified_user(user_id):
    user = User.query.get_or_404(user_id)
    user.pass_verified()
    #flash(_('Account pass verified.'), 'info')
    send_user_passed_verified_email(user=user)
    Notification.add_notification(user_id, "Your account have passed the review, you are a regular user now!")
    OperationLog.add_log(bp.name, 'passverified_user {0}(id={1})'.format(user.name, user.id), current_user)
    return redirect_back()


@bp.route('/notpassverified/user/<int:user_id>', methods=['POST'])
@login_required
@permission_required('USER_ADMIN')
def notpassverified_user(user_id):
    user = User.query.get_or_404(user_id)
    user.not_pass_verified()
    #flash(_('Account does not pass verified.'), 'info')
    #Notification.add_notification(user_id, _("Your account does not passed the review, please change your profile to fit the requirements. or you can try to contact the system administrator."))
    #send_user_notpassed_verified_email(user)
    OperationLog.add_log(bp.name, 'notpassverified_user {0}(id={1})'.format(user.name, user.id), current_user)
    return redirect_back()


'''
@bp.route('/lock/user/<int:user_id>', methods=['POST'])
@login_required
@permission_required('USER_ADMIN')
def lock_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.role.name in ['Administrator', 'Moderator']:
        flash(_('Permission denied.'), 'warning')
    else:
        user.lock()
        flash(_('Account locked.'), 'info')
    return redirect_back()


@bp.route('/unlock/user/<int:user_id>', methods=['POST'])
@login_required
@permission_required('USER_ADMIN')
def unlock_user(user_id):
    user = User.query.get_or_404(user_id)
    user.unlock()
    flash(_('Lock canceled.'), 'info')
    return redirect_back()
'''

@bp.route('/manage/user')
@login_required
@permission_required('USER_ADMIN')
def manage_user():
    filter_rule = request.args.get('filter', 'all')  # 'all', 'locked', 'blocked', 'administrator', 'moderator'
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_MANAGE_USER_PER_PAGE']

    filtered_users = None

    if filter_rule == 'blocked':
        filtered_users = User.query.filter(User.active==False)
    elif filter_rule == 'verified':
        filtered_users = User.query.filter(User.checked == True)
    elif filter_rule == 'denied':
        filtered_users = User.query.filter(User.checked != True)
    elif filter_rule == 'unverified':
        filtered_users = User.query.filter(User.checked == None)
    elif filter_rule == 'administrator':
        filtered_users = User.query.join(Role.users).filter(Role.id == Role.get_administrator().id)
    elif filter_rule == 'manager':
        ROLES_ids = Role.query.join(Permission.roles).filter(Permission.name=='DASHBOARD_VIEW').subquery()
        filtered_users = User.query.join(Role.users).join(ROLES_ids).distinct()
    # elif filter_rule == 'moderator':
    #     filtered_users = User.query.join(Role.users).filter(Role.id == Role.get_moderator().id)
    # elif filter_rule == 'regular_user':
    #     filtered_users = User.query.join(Role.users).filter(Role.id == Role.get_regular_user().id)
    else:
        filtered_users = User.query
    #print(filtered_users)
    pagination = filtered_users.order_by(User.id.desc()).paginate(page, per_page)
    return render_template('app/sysadmin/manage_user.html', filter=filter_rule, pagination=pagination, users=pagination.items)


@bp.route('/manage/search_user', methods=['GET', 'POST'])
@login_required
@permission_required('USER_ADMIN')
def search_user():
    q = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_SEARCH_RESULT_PER_PAGE']
    pagination = User.query.filter(or_(User.name.ilike('%' + q + '%'), User.email.ilike('%' + q + '%'))).paginate(page, per_page)
    return render_template('app/sysadmin/manage_user.html', pagination=pagination, users=pagination.items)
