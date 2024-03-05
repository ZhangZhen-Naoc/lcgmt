from flask import Flask, request, current_app
from flask_admin import Admin as TableAdmin
from flask_avatars import Avatars
from flask_babelex import Babel
from flask_bootstrap import Bootstrap4
from flask_dropzone import Dropzone
from flask_login import LoginManager, AnonymousUserMixin, current_user
from flask_migrate import Migrate
from flask_moment import Moment
# from flask_sqlalchemy import SQLAlchemy
from flask_wtf import CSRFProtect
from authlib.integrations.flask_client import OAuth
from app.email import Email
import sqlalchemy
from flask_sqlalchemy import SQLAlchemy as _BaseSQLAlchemy
from celery import Celery

from app.settings import BaseConfig
class SQLAlchemy(_BaseSQLAlchemy):
    def apply_pool_defaults(self, app, options):
        super(SQLAlchemy, self).apply_pool_defaults(app, options)
        options['pool_pre_ping'] = True
        return options

db: sqlalchemy = SQLAlchemy()

bootstrap = Bootstrap4()
db = SQLAlchemy()
migrate = Migrate(compare_type=True)
login_manager = LoginManager()
noreply_mail = Email()
admin_mail = Email()
dropzone = Dropzone()
moment = Moment()
avatars = Avatars()
csrf = CSRFProtect()
babel = Babel()
oauth = OAuth()

table_admin = TableAdmin()#name="User Tables", endpoint='admin')  # 必须有一个flask-admin的endpoint使用admin，否则其他endpoint找不到admin下的templates html

'''
@babel.localeselector
def get_locale():
    lang_code = request.args.get('lang', None)
    #if lang_code is None and 'lang_code' in request.cookies:
    if lang_code is None and 'lang_code' in session:
        # lang_code = request.cookies['lang_code']
        lang_code = session['lang_code']
    if lang_code is None:
        lang_code = request.accept_languages.best_match(current_app.config['LANGUAGES'])
    if lang_code not in BaseConfig.LANGUAGES:
        lang_code = BaseConfig.LANGUAGES[0]
    session['lang_code'] = lang_code
    return lang_code
'''


# @babel.localeselector
# def get_locale():
#     if current_user.is_authenticated and current_user.locale is not None:
#         return current_user.locale
#
#     locale = request.cookies.get('locale')
#     if locale is not None:
#         return locale
#     locale = request.accept_languages.best_match(current_app.config['LANGUAGES'])
#     if locale is None:
#         if len(current_app.config['LANGUAGES']) > 0:
#             locale = current_app.config['LANGUAGES'][0]
#     if locale is Vone:
#         locale = 'en'
#     return locale

@babel.localeselector
def get_locale():
    if current_user.is_authenticated and current_user.locale is not None:
        if current_user.locale in current_app.config['LANGUAGES']:
            return current_user.locale

    locale = request.cookies.get('locale')
    if locale is not None:
        if locale in current_app.config['LANGUAGES']:
            return locale
    locale = request.accept_languages.best_match(current_app.config['LANGUAGES'])
    if locale is None:
        if len(current_app.config['LANGUAGES']) > 1:
            locale = current_app.config['LANGUAGES'][1]
    if locale is None:
        locale = 'zh_Hans_CN'
    if locale not in current_app.config['LANGUAGES']:
        locale = 'en'
    return locale


@login_manager.user_loader
def load_user(user_id):
    from app.user.models import User
    user = User.query.get(int(user_id))
    return user


login_manager.login_view = 'user.login' #这里指定了登录入口
# login_manager.login_message = 'Your custom message'
login_manager.login_message_category = 'warning'

login_manager.refresh_view = 'user.re_authenticate'
# login_manager.needs_refresh_message = 'Your custom message'
login_manager.needs_refresh_message_category = 'warning'


class Guest(AnonymousUserMixin):
    def can(self, permission_name):
        return False

    @property
    def is_admin(self):
        return False

    @property
    def is_verified(self):
        return False

    @property
    def is_active(self):
        return False

    @property
    def is_anonymous(self):
        return True

    @property
    def is_authenticated(self):
        return False


login_manager.anonymous_user = Guest

# celery
# flask-celery 已被弃用，官方做法是：https://flask.palletsprojects.com/en/2.0.x/patterns/celery/

celery = Celery(__name__, broker=BaseConfig.CELERY_BROKER_URL, backend=BaseConfig.CELERY_BROKER_URL)

