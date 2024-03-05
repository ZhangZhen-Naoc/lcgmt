import time
import urllib
import uuid
from io import BytesIO
import os

import safe
from flask import render_template, flash, redirect, current_app, request, make_response, session, jsonify, url_for, abort
from flask_babelex import _
from flask_login import login_required, current_user, fresh_login_required, logout_user, login_user, login_fresh, \
    confirm_login
from werkzeug.security import gen_salt, generate_password_hash

from app.cms.models import CMSArticle
from app.email_utils import send_confirm_email, send_reset_password_email, send_login_email, \
    send_user_register_success_email
from app.extensions import db, avatars, oauth
from app.operation_log.models import OperationLog
from app.user import bp
from app.user.forms import EditProfileForm, UploadAvatarForm, CropAvatarForm, ChangePasswordForm, \
    NotificationSettingForm, PrivacySettingForm, LoginForm, RegisterForm, ResetPasswordForm, \
    ForgetPasswordForm, EditUserScientificCateforiesForm
from app.user.models import User, UserOAuth2Token, LoginSession, LoginTries,UserScientificCategory,STPUser, Role, SMCUser,AssoSTPUser

from app.proposal_admin.model import ProposalInvestigator,ProposalReviewExpert
from app.utils import generate_token, validate_token, redirect_back, flash_errors, validate_token_simple
from app.verifycode import create_validate_code
import json,csv
import logging
from datetime import datetime
from sqlalchemy import asc
from app.email_utils import send_user_passed_verified_email
from sqlalchemy import and_
from sqlalchemy import func
'''
@bp.route('/<id>')
@login_required
def index(id):
    if id==current_user.id or current_user.is_admin:
        user = User.query.filter_by(id=id).first_or_404()
    else:
        return redirect(url_for('.index', id=current_user.id))

    if user == current_user and user.locked:
        flash(_('Your account is locked.'), 'danger')

    if user == current_user and not user.active:
        logout_user()

    return render_template('app/user/index.html', user=user)
'''


def set_login_cookie(resp, user):
    # 记录用户login信息到数据库session表
    secs = session['_remember_seconds'] if '_remember_seconds' in session else 3600
    sid = LoginSession.add_session(user, secs)
    session['sid']=sid
    # 记录sid到cookie
    resp.set_cookie(key=current_app.config['LOGIN_COOKIE_KEY'], value=sid,
                    max_age=secs, domain=current_app.config['LOGIN_COOKIE_DOMAIN'])
    return resp


def remove_login_cookie(resp):
    # 从数据库session表里删除用户信息 current_user
    sid = request.cookies.get(current_app.config['LOGIN_COOKIE_KEY'], 'xxx')
    LoginSession.disable_session(sid)
    # 从cookie删除sid
    resp.set_cookie(key=current_app.config['LOGIN_COOKIE_KEY'], value='',
                    max_age=0,  expires=0, domain=current_app.config['LOGIN_COOKIE_DOMAIN'])
    return resp


def get_redirect_back():
    next = None
    if 'oauth_origin' in session:
        next = session.pop('oauth_origin')
    if next is None:
        next = request.values.get('next')
   
    if next is not None:
        if next.startswith('http://') or next.startswith('https://'):
            return make_response(render_template('app/user/sso.html', redirect_url=next))
        return redirect(next)
    # return redirect_back()
    return redirect(url_for('main.index'))


@bp.route('/')
@login_required
def index():
    if not current_user.is_active:
        logout_user()
    # projs_owner = db.session.query(ObsProject, ObsProjectUser).filter(ObsProject.id == ObsProjectUser.obs_project_id, ObsProjectUser.email.in_(format_email(current_user.email)), ObsProjectUser.role == 'pi').all()
    # projs_major = db.session.query(ObsProject, ObsProjectUser).filter(ObsProject.id == ObsProjectUser.obs_project_id, ObsProjectUser.email.in_(format_email(current_user.email)), ObsProjectUser.role.in_(['major', 'others'])).all()
    #
    # # projects = db.session.query(ObsProject, ObsProjectUser).filter(ObsProject.id == ObsProjectUser.obs_project_id, ObsProjectUser.email.in_(get_user_login_emails()),
    # #                                                                ObsProjectUser.role.in_(['pi', 'major'])).order_by(ObsProject.expiration.desc()).all()
    #
    # projs_owner_1 = db.session.query(Project, ProjectUser).filter(Project.id == ProjectUser.project_id, ProjectUser.email.in_(format_email(current_user.email)), ProjectUser.role == 'owner').all()
    # projs_major_1 = db.session.query(Project, ProjectUser).filter(Project.id == ProjectUser.project_id, ProjectUser.email.in_(format_email(current_user.email)), ProjectUser.role.in_(['major', 'others'])).all()
    # # projects_1 = db.session.query(Project, ProjectUser).filter(Project.id == ProjectUser.project_id, ProjectUser.email.in_(get_user_login_emails()),
    # #                                                            ProjectUser.role.in_(['owner', 'major'])).order_by(Project.expiration.desc()).all()


 
    my_articles = CMSArticle.query.filter(CMSArticle.editor_id == current_user.id).order_by(CMSArticle.last_modified.desc()).paginate(1, 3).items
    articles_review_number = len(CMSArticle.query.filter(CMSArticle.published == False).order_by(CMSArticle.last_modified.desc()).paginate().items)
    current_user.check_email_confirmed()
    current_user.check_user_checked()

    scientific_cateories = UserScientificCategory.get_user_cateories(current_user.id) if current_user.can('PROPOSAL_REVIEW') else None
   
    #
    awaiting_review_proposals = ProposalReviewExpert.get_awaiting_review_proposals(email=current_user.email)
    #
    submitted_proposals = ProposalInvestigator.get_submitted_proposals(email=current_user.email)
    reviewing_proposals = ProposalInvestigator.get_reviewing_proposals(email=current_user.email)
    reviewed_proposals, reviewed_proposals_count = ProposalInvestigator.get_reviewed_proposals(email=current_user.email)
    #
  
    return render_template('app/user/index.html', user=current_user,
                        my_articles=my_articles, articles_review_number=articles_review_number, 
                           scientific_cateories=scientific_cateories, awaiting_review_proposals=awaiting_review_proposals,
                           submitted_proposals=submitted_proposals, reviewing_proposals=reviewing_proposals, reviewed_proposals=reviewed_proposals, reviewed_proposals_count=reviewed_proposals_count
                           )


@bp.route('/settings/profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
   
    form =  EditProfileForm()
    if form.validate_on_submit():
        current_user.first_name = form.first_name.data
        current_user.last_name = form.last_name.data
        current_user.name = current_user.first_name+" "+current_user.last_name

        current_user.research_statement = form.research_statement.data
        current_user.affiliation = form.affiliation.data
        current_user.position = form.position.data
        current_user.website = form.personal_website.data
        current_user.research_field = form.research_topic.data
        if form.publication.data is not None:
            current_user.publication = form.publication.data.replace("\r\n", "<br>").replace("\n", "<br>").replace("\r", "<br>")
 
        # current_user.user_group = form.user_group.data
        # if not current_user.display_personal_info:
        if form.display_personal_info.data == 'True':
            current_user.display_personal_info = True
        else:
            current_user.display_personal_info = False

        stpmember = STPUser.query.filter(STPUser.email==current_user.email).first()
        if stpmember is not None:
            stpmember.user_id = current_user.id
            current_user.expert_type= 'stp'
            # user.roles = Role.query.filter(Role.name=='STP Member').all()
        db.session.commit()
        if not current_user.checked:
            flash(_('Your profile has been updated. An administrator will review and verify your account shortly.'), 'success')
        else:
            flash(_('Your profile has been updated'), 'success')
        if 'oauth_origin' in session:
            return redirect(session.pop('oauth_origin'))
        return redirect_back()
    #
    #form.name.render_kw = {'readonly': current_user.verified is not None and current_user.verified}
    if current_user.email is not None and len(current_user.email) > 0:
        form.email.render_kw = {'readonly': True}
        # stpmember = STPUser.query.filter(STPUser.email==current_user.email).first()
        # if stpmember is not None:
        #     # user.user_group= stpmember.user_group
        #     form.last_name.data = stpmember.last_name
        #     # user.name = stpmember.name
        #     form.first_name.data = stpmember.first_name
        #     form.affiliation.data = stpmember.affiliation
        #     form.email.data = stpmember.email

            # stpmember.user_id = user.id
            # user.expert_type= 'stp'
            # user.roles = Role.query.filter(Role.name=='STP Member').all()
            # user.display_personal_info = True
            # db.session.commit()
        # else:
        form.first_name.data = current_user.first_name
        form.last_name.data = current_user.last_name
        form.email.data = current_user.email
        form.affiliation.data = current_user.affiliation

        form.research_statement.data = current_user.research_statement
        form.position.data = current_user.position
        form.personal_website.data = current_user.website
        form.research_topic.data = current_user.research_field
        if current_user.publication is not None:
            form.publication.data = current_user.publication.replace("<br>", "\r\n")

    # form.user_group.data = current_user.user_group 
    # if not current_user.display_personal_info:
        form.display_personal_info.data = str(current_user.display_personal_info)
    return render_template('app/user/settings/edit_profile.html', form=form)



@bp.route('/settings/avatar')
@login_required
def change_avatar():
    upload_form = UploadAvatarForm()
    crop_form = CropAvatarForm()
    return render_template('app/user/settings/change_avatar.html', upload_form=upload_form, crop_form=crop_form)


@bp.route('/settings/avatar/upload', methods=['POST'])
@login_required
def upload_avatar():
    form = UploadAvatarForm()
    if form.validate_on_submit():
        image = form.image.data
        filename = avatars.save_avatar(image)
        current_user.avatar_raw = filename
        db.session.commit()
        flash(_('Image uploaded, please crop.'), 'success')
    flash_errors(form)
    return redirect(url_for('.change_avatar'))


@bp.route('/settings/avatar/crop', methods=['POST'])
@login_required
def crop_avatar():
    form = CropAvatarForm()
    if form.validate_on_submit():
        x = form.x.data
        y = form.y.data
        w = form.w.data
        h = form.h.data
        filenames = avatars.crop_avatar(current_user.avatar_raw, x, y, w, h)
        current_user.avatar_s = filenames[0]
        current_user.avatar_m = filenames[1]
        current_user.avatar_l = filenames[2]
        db.session.commit()
        flash(_('Avatar updated.'), 'success')
    flash_errors(form)
    return redirect(url_for('.change_avatar'))


@bp.route('/settings/change-password', methods=['GET', 'POST'])
@fresh_login_required
def change_password():
    form = ChangePasswordForm()
    if form.validate_on_submit():
        if safe.check(form.password.data).strength not in current_app.config['PASSWORD_STRENGTH']:
            flash(_('The password is not strong enough!'))
            return render_template('app/user/settings/change_password.html', form=form)
        if current_user.validate_password(form.old_password.data):
            current_user.set_password(form.password.data)
            db.session.commit()
            flash(_('Password updated.'), 'success')
            return redirect_back()
        else:
            flash(_('Old password is incorrect.'), 'warning')
    return render_template('app/user/settings/change_password.html', form=form)


'''
@bp.route('/settings/change-email', methods=['GET', 'POST'])
@fresh_login_required
def change_email_request():
    form = ChangeEmailForm()
    if form.validate_on_submit():
        token = generate_token(user=current_user, operation='CHANGE_EMAIL', new_email=form.email.data.lower())
        send_change_email_email(to=form.email.data, user=current_user, token=token)
        flash(_('Confirm email sent, check your inbox.'), 'info')
        return redirect(url_for('.index', id=current_user.id))
    return render_template('app/user/settings/change_email.html', form=form)


@bp.route('/change-email/<token>')
@login_required
def change_email(token):
    if validate_token(user=current_user, token=token, operation='CHANGE_EMAIL'):
        flash(_('Email updated.'), 'success')
        return redirect(url_for('.index', id=current_user.id))
    else:
        flash(_('Invalid or expired token.'), 'warning')
        return redirect(url_for('.change_email_request'))
'''


@bp.route('/settings/notification', methods=['GET', 'POST'])
@login_required
def notification_setting():
    form = NotificationSettingForm()
    if form.validate_on_submit():
        current_user.receive_system_email = form.receive_system_email.data
        db.session.commit()
        flash(_('Notification settings updated.'), 'success')
        return redirect_back()
    #
    form.receive_system_email.data = current_user.receive_system_email
    return render_template('app/user/settings/edit_notification.html', form=form)


@bp.route('/settings/privacy', methods=['GET', 'POST'])
@login_required
def privacy_setting():
    form = PrivacySettingForm()
    if form.validate_on_submit():
        db.session.commit()
        flash(_('Privacy settings updated.'), 'success')
        return redirect_back()
    return render_template('app/user/settings/edit_privacy.html', form=form)


'''
@bp.route('/settings/account/delete', methods=['GET', 'POST'])
@fresh_login_required
def delete_account():
    form = DeleteAccountForm()
    if form.validate_on_submit():
        db.session.delete(current_user._get_current_object())
        db.session.commit()
        flash(_('Goodbye!'), 'success')
        return redirect(url_for('main.index'))
    return render_template('app/user/settings/delete_account.html', form=form)
'''


@bp.route('/verifycode/')
def verify_code():
    """ 验证码 """
    output = BytesIO()
    code_img, code_str = create_validate_code()
    code_img.save(output, 'jpeg')
    img_data = output.getvalue()
    output.close()
    response = make_response(img_data)
    response.headers['Content-Type'] = 'image/jpg'
    session['code_text'] = code_str
    session['updated_time'] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    session.modified = True
    logging.warning(f"Generated verify code by pid:{os.getpid()}, code: {session.get('code_text')}, session id is: {session}")
    
    return response


def check_verify_code(form, notify=True):
    verify_code = form.verify_code.data
    logging.warning(f"Checking verify code by pid:{os.getpid()}, code: {session.get('code_text')}, input code is {verify_code}, session id is: {session}")
    
    # logging.warning("session['code_text'] when check")
    # logging.warning(session['code_text'])
    # logging.warning("verify_code")
    # logging.warning(verify_code)    
    ok = 'code_text' in session \
        and verify_code is not None \
        and verify_code.lower() == session.get('code_text').lower()
    if not ok and notify:
        msg = _('1Wrong verify code!')
        flash(msg, 'warning')
        form.verify_code.errors.append(msg)
    return ok


@bp.route('/login', methods=['GET', 'POST'])
def login():
    # logging.warning("logining")
    if current_user.is_authenticated:
        logout_user()

    # print(current_app.config['FORCE_NADC_LOGIN'])
    # print(type(current_app.config['FORCE_NADC_LOGIN'])) 

    if current_app.config['FORCE_NADC_LOGIN']==True:
        return login_nadc()

    form = LoginForm()
    
    if form.validate_on_submit():
        email = form.email.data.lower().strip()
        LoginTries.add_try(email, generate_password_hash(
            form.password.data), request)
        if LoginTries.exceed_try_count(email):
            msg = _(
                'You have tried to sign in too many times, try again later or contact system administrator.')
            flash(msg, 'warning')
            form.password.errors.append(msg)
            return render_template('app/user/login.html', form=form)
        # logging.warning("session['code_text'] before check")
        # logging.warning(session['code_text'])
        # logging.warning(f"Checking verify code by pid:{os.getpid()}, code: {session.get('code_text')},input code is {verify_code}, session id is: {session.get('sid')}")

        # logging.warning(f"pid:{os.getpid()}")
        if not check_verify_code(form):
            return render_template('app/user/login.html', form=form)
        user = User.get_user_byemail(email)
        if user is None:
            msg = _('User not exsit: ') + '{0}'.format(email)
            form.email.errors.append(msg)
            flash(msg, 'warning')
            OperationLog.add_log(
                bp.name, 'user not exsit: {0}'.format(email), None)
            return render_template('app/user/login.html', form=form)
        else:
            if user.validate_password(form.password.data):
                if login_user(user, form.remember_me.data):
                    # flash(_('Login success.'), 'info')
                    OperationLog.add_log(bp.name, 'login success', user)
                    #
                    resp = get_redirect_back()
                    set_login_cookie(resp, user)
                    #
                    return resp
                else:
                    msg = _('Your account is blocked.')
                    flash(msg, 'warning')
                    form.email.errors.append(msg)
                    OperationLog.add_log(
                        bp.name, 'blocked user tried to login', user)
                    return redirect(url_for('main.index'))
            else:
                msg = _('Wrong Password')
                form.password.errors.append(msg)
                flash(msg, 'warning')
                OperationLog.add_log(bp.name, 'wrong password', user)
                return redirect_back()
        #
        flash(_('Invalid email or password.'), 'warning')
    next = request.values.get('next')
    return render_template('app/user/login.html', form=form, next=next)


@bp.route('/login_byemail', methods=['GET', 'POST'])
def login_byemail():
    if current_user.is_authenticated:
        return redirect(url_for('user.index'))

    form = ForgetPasswordForm()
    if form.validate_on_submit():
        if not check_verify_code(form):
            return render_template('app/user/login_byemail.html', form=form)
        user = User.get_user_byemail(form.email.data.lower().strip())
        if user:
            if OperationLog.count_log(bp.name, 'LOGIN_BYEMAIL' + ' try', user) >= current_app.config['TRYLOGIN_LIMIT_TIMES']:
                flash(_("You're operating too often, try again later."), 'danger')
                return redirect(url_for('.login'))
            token = generate_token(user=user, operation='LOGIN_BYEMAIL')
            OperationLog.add_log(bp.name, 'LOGIN_BYEMAIL' + ' try', user)
            send_login_email(user=user, token=token,
                             next=request.values.get('next'))
            flash(_('Login email sent, check your inbox.'), 'info')
            return redirect(url_for('.login', next=request.values.get('next')))
        flash(_('Invalid email.'), 'warning')
        return redirect(url_for('.login', next=request.values.get('next')))
    return render_template('app/user/login_byemail.html', form=form)


@bp.route('/login_byemail_check/<email>/<token>', methods=['GET'])
def login_byemail_check(email, token):
    if current_user.is_authenticated:
        logout_user()

    if not validate_token_simple(token=token, operation='LOGIN_BYEMAIL'):
        flash(_('Invalid or expired link.'), 'danger')
        return redirect(url_for('.login'))

    user = User.query.filter_by(email=email).first()
    if user is None:
        return redirect(url_for('.login'))

    if login_user(user):
        flash(_('Login success by Email.'), 'success')
        OperationLog.add_log(bp.name, operation='LOGIN_BYEMAIL', user=user)
        return redirect(url_for('user.index'))
    else:
        flash(_('Login Error.'), 'danger')
        return redirect(url_for('.login'))


@bp.route('/re-authenticate', methods=['GET', 'POST'])
@login_required
def re_authenticate():
    if login_fresh():
        return redirect(url_for('main.index'))

    form = LoginForm()
    if form.validate_on_submit() and current_user.validate_password(form.password.data):
        confirm_login()
        return redirect_back()
    return render_template('app/user/login.html', form=form)


@bp.route('/logout')
def logout():
    next = request.values.get('next')
    resp = redirect_back()
    if next is not None:
        if next.startswith('http://') or next.startswith('https://'):
            resp = make_response(render_template(
                'app/user/sso.html', redirect_url=next))
    elif current_app.config['FORCE_NADC_LOGOUT'] and request.values.get('local_logout') != 'true':
        resp = redirect('https://oauth.china-vo.org/oauth/logout?WebServerURL=' +
                        url_for('main.index', _external=True))
    remove_login_cookie(resp)
    #
    if current_user.is_authenticated:
        logout_user()
    return resp


@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    form = RegisterForm()
    if form.validate_on_submit():
        if not check_verify_code(form):
            return render_template('app/user/register.html', form=form)
        if safe.check(form.password.data).strength not in current_app.config['PASSWORD_STRENGTH']:
            flash(_('The password is not strong enough!'))
            return render_template('app/user/register.html', form=form)
        name = form.name.data
        email = form.email.data.lower()
        password = form.password.data
        institution = form.institution.data

        display_personal_info = form.display_personal_info.data

        User.register(email=email, password=password, name=name, institution=institution,
                      pass_verified=False, display_personal_info=display_personal_info)
        user = User.query.filter_by(email=email).first()
        send_user_register_success_email(
            user, token=generate_token(user=user, operation='EMAIL_CONFIRM'))
        return render_template('app/user/register_success.html', form=form)
    return render_template('app/user/register.html', form=form)


@bp.route('/confirm/<token>')
@login_required
def confirm(token):
    if current_user.email_confirmed:
        return redirect(url_for('main.index'))

    if validate_token(user=current_user, token=token, operation='EMAIL_CONFIRM'):
        flash(_('Account email confirmed.'), 'success')
        return redirect_back()
    else:
        flash(_('Invalid or expired token.'), 'danger')
        return redirect(url_for('.resend_confirm_email'))


@bp.route('/resend-confirm-email')
@login_required
def resend_confirm_email():
    if current_user.email_confirmed:
        return redirect_back()

    token = generate_token(user=current_user, operation='EMAIL_CONFIRM')
    send_confirm_email(user=current_user, token=token)
    flash(_('New email sent, please check your inbox.'), 'info')
    return redirect_back()


@bp.route('/forget-password', methods=['GET', 'POST'])
def forget_password():
    if current_user.is_authenticated:
        return redirect(url_for('user.index'))

    form = ForgetPasswordForm()
    if form.validate_on_submit():
        if not check_verify_code(form):
            return render_template('app/user/reset_password.html', form=form)
        user = User.get_user_byemail(form.email.data.lower().strip())
        if user:
            if OperationLog.count_log(bp.name, 'RESET_PASSWORD' + ' try', user) >= current_app.config['TRYLOGIN_LIMIT_TIMES']:
                flash(_("You're operating too often, try again later."), 'danger')
                return redirect(url_for('.login'))
            token = generate_token(user=user, operation='RESET_PASSWORD')
            OperationLog.add_log(bp.name, 'RESET_PASSWORD' + ' try', user)
            send_reset_password_email(user=user, token=token)
            flash(_('Password reset email sent, check your inbox.'), 'info')
            return redirect(url_for('.login'))
        flash(_('Invalid email.'), 'warning')
        return redirect(url_for('.forget_password'))
    return render_template('app/user/reset_password.html', form=form)


@bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('user.index'))

    form = ResetPasswordForm()

    if not validate_token_simple(token=token, operation='RESET_PASSWORD'):
        flash(_('Invalid or expired link.'), 'danger')
        return redirect(url_for('.forget_password'))

    if form.validate_on_submit():
        if not check_verify_code(form):
            return render_template('app/user/reset_password.html', form=form)
        if safe.check(form.password.data).strength not in current_app.config['PASSWORD_STRENGTH']:
            flash(_('The password is not strong enough!'))
            return render_template('app/user/reset_password.html', form=form)

        user = User.get_user_byemail(form.email.data.lower().strip())
        if user is None:
            return redirect(url_for('main.index'))
        if validate_token(user=user, token=token, operation='RESET_PASSWORD',
                          new_password=form.password.data):
            flash(_('Password updated.'), 'success')
            return redirect(url_for('.login'))
        else:
            flash(_('Invalid or expired link.'), 'danger')
            return redirect(url_for('.forget_password'))
    return render_template('app/user/reset_password.html', form=form)


@bp.route('/nadc', methods=['GET', 'POST'])
def login_nadc():
    oauth_appid = oauth._clients['nadc'].client_id
    # print(oauth_appid)
    if 'next' in request.values:
        origin_url = request.values.get('next')
    elif 'Referer' in request.headers:
        origin_url = request.headers['Referer']
    else:
        origin_url = url_for('.index')
    session['oauth_origin'] = origin_url
    # sso_uri = url_for('.sso', platform='nadc')
    redirect_uri=url_for('user.oauth2_login', platform='nadc', _external=True)
    url = 'https://oauth.china-vo.org/user/login?locale=en_US&appid={appid}&redirect_uri={redirect_uri}'\
        .format(appid=oauth_appid, redirect_uri=urllib.parse.quote(redirect_uri))
    return redirect(url)


@bp.route('/sso', methods=['GET', 'POST'])
def sso():
    platform = request.values.get('platform', 'nadc')
    return render_template('app/user/sso.html', redirect_url=url_for('user.oauth2_login', platform=platform))


@bp.route('/oauth2/login/<platform>', methods=['GET', 'POST'])
def oauth2_login(platform):
    if 'next' in request.values:
        origin_url = request.values.get('next')
    elif 'Referer' in request.headers:
        origin_url = request.headers['Referer']
    else:
        origin_url = url_for('.index')
    if 'oauth_origin' not in session:
        session['oauth_origin'] = origin_url
    if platform in oauth._clients:
        redirect_uri = url_for(
            '.oauth2_callback', platform=platform, _external=True)
        return oauth._clients[platform].authorize_redirect(redirect_uri, state=uuid.uuid4().hex)
    return redirect(url_for('.index'))


def get_user_profile(platform, client, token):
    profile = None
    if 'github' == platform:
        profile = client.get('/user', token=token).json()
    elif 'weibo' == platform:
        profile = oauth.weibo.get('/2/users/show.json?uid={0}&access_token={1}'.format(
            token['uid'], token['access_token']), token=token).json()
    elif 'escience' == platform:
        profile = oauth.weibo.get(
            'https://api.escience.org.cn/admin/user/info/me', token=token).json()
        if 200 == profile['code']:
            profile = profile['data']['user']
            profile['id'] = profile['userId']
            profile['name'] = profile['alias']
        else:
            profile = None
    elif 'cstnet' == platform:
        profile = json.loads(token['userInfo'])
        profile['id'] = profile['umtId']
        profile['email'] = profile['cstnetId']
        profile['name'] = profile['truename']
    elif 'qq' == platform:
        profile = oauth.qq.get(
            'https://graph.qq.com/user/get_user_info', token=token).json()
    elif 'wechat' == platform:
        profile = oauth.weibo.get('https://api.weixin.qq.com/sns/userinfo?access_token={0}&openid={1}'.format(
            token['access_token'], token['openid']), token=token).json()
        profile['id'] = profile['openid']
    elif 'nadc' == platform:
        profile = oauth.nadc.get(
            'https://oauth.china-vo.org/api/profile', token=token).json()
        user = profile['data']['user']
        profile['id'] = user['id']
        profile['email'] = user['umtId']  # umt的email是安全邮箱
        if '@' not in user['umtId']:
            profile['email'] = user['email']
        profile['name'] = user['name']
        profile['confirmed'] = user['confirmed']
    return profile


@bp.route('/oauth2/callback/<platform>', methods=['GET', 'POST'])
def oauth2_callback(platform):  # 回调地址
    if platform not in oauth._clients:
        return
    #
    client = oauth._clients[platform]
    token = client.authorize_access_token()
    profile = get_user_profile(platform=platform, client=client, token=token)
    if profile is None:
        return
    #
    platform_id = profile['id']
    email = profile['email']  # github 传来的 email可能为空
    username = profile['name']
    email_confirmed = profile['confirmed'] #是否已经验证了email
    #
    if platform_id is not None:
        user = User.get_user_byid(platform_id=platform_id, platform=platform)
        if user:  # 优先通过第三方平台id登录
            UserOAuth2Token.update_token(
                platform=platform, token=token, access_token=token['access_token'])
            login_user(user)
            return set_login_cookie(get_redirect_back(), user)
    #
    if email is not None and email.strip() != '':
        user = User.get_user_byemail(email)
        if user:
            UserOAuth2Token.update_token(
                platform=platform, token=token, access_token=token['access_token'])
            user.bind_platform(platform, platform_id)
            # if not email_confirmed:
            #     flash('Please verify your email by clicking the link sent to your email from NADC Passport!', 'error')
            #     abort(403)
            login_user(user)
            session.pop('_flashes', None)
            return set_login_cookie(get_redirect_back(), user)

    skip_email_checked = False
    if platform == 'nadc' and email is not None and email.strip() != '':  # 有nadc email的话，就不认证email了
        skip_email_checked = True
    # 像github这样email为空的话怎么办？
    user = User.register(email, password=gen_salt(4        16), name=username, skip_email_checked=skip_email_checked, display_personal_info=False)
    user.bind_platform(platform, platform_id)
    UserOAuth2Token.add_token(platform, user=user, token=token)
    login_user(user)
    # 检查该用户是否为STP用户
    checkIfUserSTPMember(user)
    # 检查该用户是否为ASSO STP用户
    try:
        checkIfUserAssoSTPMember(user)
    except:
        logging.error('checkIfUserAssoSTPMember error')
    resp = redirect(url_for('.edit_profile'))
  
    set_login_cookie(resp, user)
    return resp

def checkIfUserSTPMember(user):
    email = user.email.replace('bao.ac.cn', 'nao.cas.cn').lower()
    stpmember = STPUser.query.filter(func.lower(func.replace(STPUser.email,'bao.ac.cn', 'nao.cas.cn'))==email).first()
 
    if stpmember is not None:
        user.user_group= stpmember.user_group
        user.last_name = stpmember.last_name
        user.name = stpmember.name
        user.first_name = stpmember.first_name
        user.affiliation = stpmember.affiliation
       
        stpmember.user_id = user.id
        user.expert_type= 'stp'
        user.roles = Role.query.filter(Role.name=='STP Member').all()
        user.display_personal_info = True
      
        user.pass_verified()
        #flash(_('Account pass verified.'), 'info')
        send_user_passed_verified_email(user=user)
        
        OperationLog.add_log(bp.name, 'passverified_user {0}(id={1})'.format(user.name, user.id), current_user)
        db.session.commit()

def checkIfUserAssoSTPMember(user):
    email = user.email.replace('bao.ac.cn', 'nao.cas.cn').lower()
    assoStp = AssoSTPUser.query.filter(func.lower(func.replace(AssoSTPUser.email,'bao.ac.cn', 'nao.cas.cn'))==email).first()
    if assoStp is not None:
        user.user_group= assoStp.user_group
        user.last_name = assoStp.last_name
        user.name = assoStp.name
        user.first_name = assoStp.first_name
        user.affiliation = assoStp.affiliation
        assoStp.user_id = user.id
        user.expert_type= 'stp_ass'
        user.roles.extend(Role.query.filter(Role.name=='Associate STP Member').all())
        user.display_personal_info = True
    
        user.pass_verified()
        #flash(_('Account pass verified.'), 'info')
        send_user_passed_verified_email(user=user)
        
        OperationLog.add_log(bp.name, 'passverified_user {0}(id={1})'.format(user.name, user.id), current_user)
        db.session.commit()

# @bp.route('/asso_stp_init', methods=['GET', 'POST'])
# def asso_stp_init():
#     email = "XuYF@bao.ac.cn"
#     email = email.replace('bao.ac.cn', 'nao.cas.cn').lower()
#     assoStpUser = User.query.filter(func.lower(func.replace(User.email,'bao.ac.cn', 'nao.cas.cn'))==email).first()
    # stpmember = STPUser.query.filter(STPUser.email=='zhouhongyan@pric.org.cn').first()
    # stpmember = STPUser.query.first()
    # #读取csv文件，初始化AssoSTPUser对应字段
    # with open('app/static/AM_YF_0612.csv', 'r', encoding='utf-8') as f:
    #     reader = csv.reader(f)
    #     for row in reader:
    #         print(row)
    #         if row[0] != '刘元':
    #             continue
    #         asso_stp = AssoSTPUser()
    #         # asso_stp.id = int(row[0])
    #         asso_stp.chinese_name = row[3].strip()
    #         asso_stp.first_name = row[4].strip()
    #         asso_stp.last_name = row[5].strip()
    #         asso_stp.name = row[4].strip()+" "+row[5].strip()
    #         asso_stp.affiliation = row[6].strip()
    #         asso_stp.email = row[7].strip()
    #         asso_stp.stp = row[8].strip()
    #         referer = STPUser.query.filter(and_(func.lower(STPUser.last_name)==row[2].lower().strip(), func.lower(STPUser.first_name)==row[1].lower().strip())).first()
    #         if referer is not None:
    #             asso_stp.referer_id = referer.id
    #             asso_stp.user_group = referer.user_group
    #             if referer.user_id is not None:
    #                 asso_stp.referer_user_id = referer.user_id
                
    #         # asso_stp.user_id = stpmember.id
    #         db.session.add(asso_stp)
    #         db.session.commit()
    return 'ok'

@bp.route('/find_asso_stp', methods=['GET', 'POST'])
def find_asso_stp():
    # stpmember = STPUser.query.filter(STPUser.email=='zhouhongyan@pric.org.cn').first()
    assoStps = AssoSTPUser.query.all()
    for assoStp in assoStps:
        
        email = assoStp.email.replace('bao.ac.cn', 'nao.cas.cn').lower()
        assoStpUser = User.query.filter(func.lower(func.replace(User.email,'bao.ac.cn', 'nao.cas.cn'))==email).first()
        if assoStpUser is not None:
            assoStpUser.user_group= assoStp.user_group
            assoStpUser.last_name = assoStp.last_name
            assoStpUser.name = assoStp.name
            assoStpUser.first_name = assoStp.first_name
            assoStpUser.affiliation = assoStp.affiliation
            assoStp.user_id = assoStpUser.id
            assoStpUser.expert_type= 'stp_ass'
            assoStpUser.roles.extend(Role.query.filter(Role.name=='Associate STP Member').all())
            assoStpUser.display_personal_info = True
        
            assoStpUser.pass_verified()
            #flash(_('Account pass verified.'), 'info')
            # send_user_passed_verified_email(user=assoStpUser)
            
            OperationLog.add_log(bp.name, 'passverified_user {0}(id={1})'.format(assoStpUser.name, assoStpUser.id), assoStpUser)
            db.session.commit()
  
    return 'ok'

    
@bp.route('/stp_member/<int:id>')
@login_required
def stp_member(id):
    if not (current_user.can('EPSMC_VIEW') or current_user.can('STP_VIEW')):
        abort(403)
    stpmember= STPUser.query.filter(STPUser.id==id).first()
    user = User.query.filter(User.id==stpmember.user_id).first()
    return render_template('app/user/stp_member.html', stpmember=stpmember,user=user)

@bp.route('/smc_member/<int:id>')
@login_required
def smc_member(id):
    if not (current_user.can('EPSMC_VIEW') or current_user.can('STP_VIEW')):
        abort(403)
    smcmember= SMCUser.query.filter(SMCUser.id==id).first()
    user = User.query.filter(User.id==smcmember.user_id).first()
    return render_template('app/user/smc_member.html', smcmember=smcmember,user=user)

@bp.route('/stp_member_list/<string:index>',methods=['GET'])
@login_required
def stp_member_list(index):
    if not (current_user.can('EPSMC_VIEW') or current_user.can('STP_VIEW')):
        abort(403)
    if index.lower()=='all':
        stplist = STPUser.query.order_by(asc(STPUser.last_name)).all()
    else:
        stplist= STPUser.query.filter(STPUser.stp.like(f"%{index}%")).order_by(asc(STPUser.last_name)).all()
    return render_template('app/user/stp_member_list.html', stplist=stplist,category='STP', index=index)

@bp.route('/asso_stp_member_list/<string:index>',methods=['GET'])
@login_required
def asso_stp_member_list(index):
    if not (current_user.can('EPSMC_VIEW') or current_user.can('STP_VIEW')):
        abort(403)
    if index.lower()=='all':
        stplist = AssoSTPUser.query.order_by(asc(AssoSTPUser.last_name)).all()
    else:
        stplist= AssoSTPUser.query.filter(AssoSTPUser.stp.like(f"%{index}%")).order_by(asc(AssoSTPUser.last_name)).all()
    return render_template('app/user/stp_member_list.html', stplist=stplist,category='Associate STP', index=index)

@bp.route('/asso_stp_member/<int:id>')
@login_required
def asso_stp_member(id):
    if not (current_user.can('EPSMC_VIEW') or current_user.can('STP_VIEW')):
        abort(403)
    stpmember= AssoSTPUser.query.filter(AssoSTPUser.id==id).first()
    user = User.query.filter(User.id==stpmember.user_id).first()
    return render_template('app/user/stp_member.html', stpmember=stpmember,user=user)

@bp.route('/edit_scientific_categories', methods=['GET', 'POST'])
@login_required
def edit_scientific_categories():
    if not current_user.is_inner_expert():
        return redirect(url_for('.index'))
    form = EditUserScientificCateforiesForm()
    form.scientific_categories.choices = [[c, c] for c in current_app.config['SCIENTIFIC_CATEGORIES']]
    if form.validate_on_submit():
        UserScientificCategory.delete_user(current_user.id)
        UserScientificCategory.add_categories(current_user.id, form.scientific_categories.data)
        OperationLog.add_log(bp.name, 'edit_scientific_categories to ' + ','.join(form.scientific_categories.data), current_user)
        flash('Updated Success!', 'success')
        return redirect(url_for('.index'))
    else:
        form.scientific_categories.data = [c.category for c in current_user.scientific_catetories]
    return render_template('app/user/settings/edit_scientific_categories.html', form=form)