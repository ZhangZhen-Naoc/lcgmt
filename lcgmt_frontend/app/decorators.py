from functools import wraps


import flask_login
from flask import abort, request, current_app
from flask_login import current_user, login_user
from itsdangerous import (TimedJSONWebSignatureSerializer
                         as Serializer, BadSignature, SignatureExpired)
from app.utils import handle_error


'''# 取消用户确认机制
def confirm_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not current_user.email_confirmed:
            message = Markup(
                'Please confirm your account first.'
                'Not receive the email?'
                '<a class="alert-link" href="%s">Resend Confirm Email</a>' %
                url_for('auth.resend_confirm_email'))
            flash(message, 'warning')
            return redirect(url_for('main.index'))
        return func(*args, **kwargs)
    return decorated_function
'''


def permission_required(permission_name):
    def decorator(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            if isinstance(permission_name, list):
                for p in permission_name:
                    if None!=request.values.get('token'):
                        status, user = verify_auth_token(request)
                        if status != 0:
                            return handle_error(status)
                        else:
                            if user.can(p):
                                return func(*args, **kwargs)
                    elif current_user.can(p):
                        return func(*args, **kwargs)
            else:
                if None!=request.values.get('token'):
                        status, user = verify_auth_token(request)
                        if status != 0:
                            return handle_error(status)
                        else:
                            if user.can(permission_name):
                                return func(*args, **kwargs)
                elif current_user.can(permission_name):
                    return func(*args, **kwargs)
            abort(403)
        return decorated_function
    return decorator

def verify_auth_token(request):
    token = request.values.get("token", type=str, default='')
    s = Serializer(current_app.config['SECRET_KEY'], salt='2019-10-11')
    try:
        data = s.loads(token)
    except SignatureExpired:
        return 1, None # valid token, but expired
    except BadSignature:
        return 2, None  # invalid token
    #
    if not current_user.is_authenticated:
        from app.user.models import User
        user = User.query.filter_by(id=data['id']).first()
        login_user(user)
    
    if not current_user:
        return 3, None
    if not current_user.allowed_api:
        return 4, current_user
    else:
        return 0, current_user
    return 2, None

def auth_required(func):
    @wraps(func)
    def decorated_view(*args, **kwargs):
        if request.method in flask_login.config.EXEMPT_METHODS:
            return func(*args, **kwargs)
        elif current_app.config.get('LOGIN_DISABLED'):
            return func(*args, **kwargs)
        elif None!=request.values.get('token'):
            status, user = verify_auth_token(request)
            if status != 0:
                return handle_error(status)
            return func(*args, **kwargs)
        elif not current_user.is_authenticated:
            return current_app.login_manager.unauthorized()
        return func(*args, **kwargs)
    return decorated_view
