from threading import Thread

from flask import current_app, render_template

from app.email import Message
from app.extensions import noreply_mail, admin_mail


def _send_async_mail(mail, app, message):
    with app.app_context():
        mail.send(message)


def send_mail(mail, to, subject, template, **kwargs):
    if isinstance(to, list):
        message = Message(mail, current_app.config['APP_MAIL_SUBJECT_PREFIX'] + subject, recipients=to)
    else:
        message = Message(mail, current_app.config['APP_MAIL_SUBJECT_PREFIX'] + subject, recipients=[to])

    # message.body = render_template(template + '.txt', **kwargs)
    message.html = render_template(template + '.html', **kwargs)
    app = current_app._get_current_object()
    thr = Thread(target=_send_async_mail, args=[mail, app, message])
    thr.start()
    return thr


def send_editable_mail(to, subject, template, **kwargs):
    send_mail(admin_mail, to, subject, template, kwargs)


def send_confirm_email(user, token, to=None):
    send_mail(noreply_mail, subject='Email Confirm', to=to or user.email, template='app/emails/confirm', user=user, token=token)


def send_reset_password_email(user, token):
    send_mail(noreply_mail, subject='Password Reset', to=user.email, template='app/emails/reset_password', user=user, token=token)


def send_change_email_email(user, token, to=None):
    send_mail(noreply_mail, subject='Change Email Confirm', to=to or user.email, template='app/emails/change_email', user=user, token=token)


def send_comment_replied_email(user, comment, response_content, to=None):
    send_mail(noreply_mail, subject='Your comment is replied', to=to or user.email, template='app/emails/comment_reply', user=user, comment=comment, response_content=response_content)


def send_dc_auditor_notification_email(user, application, type, to=None):
    send_mail(noreply_mail, subject='[DATA-CENTER] An application is waiting for your approval', to=to or user.email,
              template='app/emails/dc_auditor_notification', user=user, application=application, type=type)


def send_account_owner_notification_email(user, application, type, to=None):
    send_mail(noreply_mail, subject='[DATA-CENTER] An application is waiting for your approval', to=to or user.email,
              template='app/emails/dc_account_owner_notification', application=application, type=type)


def send_dc_admin_notification_email(application, type, to=None):
    send_mail(noreply_mail, subject='[DATA-CENTER] An application is waiting for you to handle', to=to or current_app.config['APP_DC_ADMIN_EMAIL'],
              template='app/emails/dc_admin_notification', application=application, type=type)


def send_dc_account_assigned_email(user, application, to=None):
    send_mail(noreply_mail, subject='[DATA-CENTER]Your data center application is approved', to=to or user.email,
              template='app/emails/dc_application_approved', user=user, application=application)


def send_dc_data_authorised_email(user, application, to=None):
    send_mail(noreply_mail, subject='[DATA-CENTER]Required data has been authorised.', to=to or user.email,
              template='app/emails/dc_data_authorised', user=user, application=application)


def send_login_email(user, token):
    send_mail(noreply_mail, subject='Login by Email', to=user.email, template='app/emails/login_byemail',
              user=user, token=token)


def send_user_register_success_email(user, token):
    send_mail(noreply_mail, subject='Registration Success', to=user.email, template='app/emails/user_register_success', user=user, token=token)


def send_expert_register_success_email(user, token, default_password):
    send_mail(noreply_mail, subject='EP Expert Invitation', to=user.email, template='app/emails/expert_register_success', user=user, token=token, default_password=default_password)


def send_user_passed_checked_email(user):
    send_mail(noreply_mail, subject='Your account have passed review', to=user.email, template='app/emails/user_passed_checked', user=user)


def send_user_roles_changed_email(user, roles):
    des = '['
    count = len(roles) - 1
    if count >= 0:
        des += roles[0].name
    i = 1
    while i <= count:
        des += ',' + roles[i].name
        i += 1
    des += ']'
    send_mail(noreply_mail, subject='Your permissions changed', to=user.email, template='app/emails/user_permissions_changed', user=user, roles=des)


# def send_user_notpassed_checked_email(user):
#     send_mail(noreply_mail, subject='Account does not pass review', to=user.email, template='app/emails/user_notpassed_checked', user=user)


def send_project_passed_default_email(project, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Project was updated', to=to,
              template='app/emails/project_passed_default', project=project)


def send_project_passed_defined_email(project, content, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Project Information', to=to,
              template='app/emails/project_passed_defined', project=project, content=content)


def send_project_registered_email(user, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Project Information', to=to,
              template='app/emails/project_registered', user=user)


def send_project_created_email(user, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Project has been created', to=to,
              template='app/emails/project_created', user=user)


def send_project_sources_upload_email(project, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Project Information', to=to,
              template='app/emails/project_sources_upload', project=project)


def send_parameter_send_back_email(source, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Project Information', to=to,
              template='app/emails/parameter_send_back', source=source)


def send_parameter_edited_email(source, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Project Information', to=to,
              template='app/emails/parameter_edited', source=source)

def send_user_register_success_email(user, token):
    send_mail(noreply_mail, subject='Registration Success', to=user.email, template='app/emails/user_register_success', user=user, token=token)

def send_source_audit_email(source, checked, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Project Information', to=to,
              template='app/emails/source_audit', source=source, checked=checked)

def send_user_passed_verified_email(user):
    send_mail(noreply_mail, subject='Your account have passed review', to=user.email, template='app/emails/user_passed_verified', user=user)

def send_review_result_to_pi(dict_info, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Proposal Information', to=to,
              template='app/emails/proposal_review_result', dict_info=dict_info)

def send_withdraw_info_to_pi(dict_info, to=None):
    send_mail(noreply_mail, subject='Your EP Observation Proposal Information', to=to,template='app/emails/proposal_withdraw_info', dict_info=dict_info)

def send_project_changes_email(dict_info):
    subject = 'Summary of the status changes in project ' + dict_info['pid'] + '  ' + dict_info['count_time']
    send_mail(noreply_mail, subject=subject, to=dict_info['email'], template='app/emails/project_changes', dict_info=dict_info)

def send_epsm_application_confirm_email(to):
    subject = "EP卫星科学领域工作组正式成员（第一批）申请"
    send_mail(noreply_mail, subject=subject,to=to,template='app/emails/epsm_app_confirm')

def send_epasm_application_confirm_email(to):
    subject = "EP科学领域工作组中方候选一般成员（associate member）推荐"
    send_mail(noreply_mail, subject=subject,to=to,template='app/emails/epasm_app_confirm')

def send_proposal_submit_confirm_email(to,pi_name,season_name, proposal_no):
    subject = "EP Proposal Submit Confirm"
    send_mail(noreply_mail, subject=subject,to=to,pi_name=pi_name,season_name=season_name,proposal_no=proposal_no,template='app/emails/proposal_submit_confirm')

def send_ta_application_confirm_email(to):
    subject = "EP Transient Advocates Application Submission"
    send_mail(noreply_mail, subject=subject,to=to,template='app/emails/ta_app_confirm')