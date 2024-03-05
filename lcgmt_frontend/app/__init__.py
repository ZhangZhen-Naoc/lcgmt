import os


import flask_excel as excel
from flask import Flask,Response
from flask_login import current_user

from app.comment.models import Comment, CommentResponse
from app.extensions import bootstrap, db, login_manager, dropzone, moment, avatars, csrf, babel, migrate, \
    table_admin, noreply_mail, admin_mail, get_locale, oauth, celery
from app.notification.models import Notification
from app.operation_log.models import OperationLog
from app.data_center.models import SourceObservation, Source, Observation, WXTDetection
# from app.data_center.models import Follow, Testuser
from app.mwr.models import CatalogueMetadata
from app.settings import config
from app.sysadmin.models import SystemMenu, FriendLink
from app.tableadmin import TableAdminModelView, TableAdminIndexView, SourceModelView, ObservationModelView,SourceObservationModelView
from app.user.models import Role, User, Permission, roles_permissions
from app.utils import get_subsite, humanbytes
from app.long_task import *
from app.observation_plan.models import *
from app.science_management_committee.models import MemeberType
import math
import flask
import typing
import logging
# from app.project.models import Project, ProjectKeyWord, ProjectParticipatingInstitution, ProjectResearchField, ProjectTypeOne, ProjectTypeThree, ProjectTypeTwo

logging.basicConfig(level=os.environ.get('LOG_LEVEL','INFO'), format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
def handle_nested_nan(content:typing.Union[typing.List,typing.Dict]):
    """处理json字典，如果有NaN，替换成None

    Args:
        content (dict): _description_

    Returns:
        _type_: _description_
    """
    if isinstance(content, dict):
        for key, value in content.items():
            # 递归处理嵌套的字典
            if isinstance(value, dict):
                content[key] = handle_nested_nan(value)
            # 处理NaN值
            if isinstance(value,float) and math.isnan(value):
                content[key] = None
    elif isinstance(content,list):
        return [ 
            handle_nested_nan(item) for item in content]
    return content

def after_request(response:Response):
    if response.is_json:
        return flask.jsonify(handle_nested_nan(response.get_json()))
    return response
        
def create_app(config_name=None):
    if config_name is None:
        config_name = os.getenv('FLASK_CONFIG')

    if config_name is None:
        raise Exception('config_name is None')
    


    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.config['FLASK_CONFIG']=config_name
    app.config['DEBUG']=True

    app.secret_key = app.config['SECRET_KEY']
    app.static_folder = app.config['APP_STATIC_FOLDER']
    app.data_folder = app.config['APP_STATIC_FOLDER']
    for d in ['APP_STATIC_FOLDER', 'AVATARS_SAVE_PATH']:
        path = app.config[d]
        if not os.path.exists(path):
            os.makedirs(path)

    register_extensions(app)
    
    register_auth(app)
    
        
    extend_url_map(app)
    register_blueprints(app)
    extend_jinja(app)
    register_shell_context(app)
    register_template_context(app)
    from app.cli import register_commands
    register_commands(app)
    register_celery(app)
    
    app.after_request(after_request)
    

    return app


def register_extensions(app:Flask):
    bootstrap.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    dropzone.init_app(app)
    moment.init_app(app)
    avatars.init_app(app)
    csrf.init_app(app)
    babel.init_app(app)
    excel.init_excel(app)
    noreply_mail.init_app(app, config_name='NOREPLY_MAIL_SETTING')
    admin_mail.init_app(app, config_name='ADMIN_MAIL_SETTING')
    
    

    table_admin.init_app(app, index_view=TableAdminIndexView(
        name='DataTable',
        template='app/table_admin/index.html',
        url=app.config['APP_URL_PREFIX'] + '/table_admin',
        endpoint='admin'
    ))
    prefix = table_admin.url
    if 'admin.systemmenu_table' not in app.blueprints:
        table_admin.add_views(
            TableAdminModelView(SystemMenu, db.session, endpoint='systemmenu_table', url=prefix + '/systemmenu_table'),
            TableAdminModelView(FriendLink, db.session, endpoint='friendlink_table', url=prefix + '/friendlink_table'),
            TableAdminModelView(User, db.session, category='User', endpoint='user_table', url=prefix + '/user_table'),
            TableAdminModelView(Role, db.session, category='User', endpoint='role_table', url=prefix + '/role_table'),
            TableAdminModelView(Permission, db.session, category='User', endpoint='permission_table'),
            # TableAdminModelView(roles_permissions, db.session, endpoint='roles_permissions_table', category='User'), # roles_permissions不是一个类
            # TableAdminModelView(Comment, db.session, category='Comment', endpoint='comment_table', url=prefix+'/comment_table'),
            # TableAdminModelView(CommentResponse, db.session, category='Comment', endpoint='comment_response_table', url=prefix+'/comment_response_table'),
            TableAdminModelView(OperationLog, db.session, endpoint='operation_log_table', url=prefix + '/operation_log_table'),
            TableAdminModelView(CatalogueMetadata, db.session, endpoint='catalogue_metadata_table', url=prefix + '/catalogue_metadata_table'),
            SourceModelView(Source, db.session, endpoint='data_center_source_table', url=prefix + '/data_center_source_table'),
            ObservationModelView(Observation, db.session, endpoint='data_center_observation_table', url=prefix + '/data_center_observation_table'),
            SourceObservationModelView(SourceObservation, db.session, endpoint='data_center_source_observation_table', url=prefix + '/data_center_source_observation_table'),
            TableAdminModelView(WXTDetection, db.session, endpoint='data_center_wxt_detection_table', url=prefix + '/data_center_wxt_detection_table')



            # TableAdminModelView(Project, db.session, endpoint='project_table', url=prefix+'/project_table'),
            # TableAdminModelView(ObservationLog, db.session, endpoint='observation_log_table', url=prefix+'/observation_log_table'),
        )


# def register_auth_localtest(app):
#     oauth.init_app(app)
#     # NADC OAuth2.0回调地址在这设置https://oauth.china-vo.org/user/workbench
#     # 注意，若系统对用户是以https方式提供服务的话，flask应用本身也必须以https方式启动，否则会出各种奇怪的错误
#     oauth.register(
#         name='nadc',
#         client_id='QONAfXkBgKk1V0dNgtoRs28M',
#         client_secret='hJ7PkR99vF9Ije5iRQ21BkviJfVfiRz3c6hZQ4eA43O2GHy2',
#         api_base_url='https://oauth.china-vo.org/api',
#         authorize_url='https://oauth.china-vo.org/oauth/authorize',
#         authorize_params=None,
#         access_token_url='https://oauth.china-vo.org/oauth/token',
#         access_token_params=None,
#         client_kwargs={'scope': 'profile', 'token_endpoint_auth_method': 'client_secret_post'},
#     )





def register_auth(app):
    # ldap server 10.2.3.52:389
    #
    oauth.init_app(app)
    # NADC OAuth2.0回调地址在这设置https://oauth.china-vo.org/user/workbench
    # 注意，若系统对用户是以https方式提供服务的话，flask应用本身也必须以https方式启动，否则会出各种奇怪的错误
    # oauth.register(
    #     name='nadc',
    #     client_id=app.config['NADC_OAUTH_CLIENT_ID'],
    #     client_secret=app.config['NADC_OAUTH_CLIENT_SECRET'],
    #     api_base_url='https://oauth.china-vo.org/api',
    #     authorize_url='https://oauth.china-vo.org/oauth/authorize',
    #     authorize_params=None,
    #     access_token_url='https://oauth.china-vo.org/oauth/token',
    #     access_token_params=None,
    #     client_kwargs={'scope': 'profile', 'token_endpoint_auth_method': 'client_secret_post'},
    # )
    # # github回调地址在这设置https://github.com/settings/developers
    # oauth.register(
    #     name='github',
    #     client_id='d503f57f6ba4cd0b4a15',
    #     client_secret='23074a5c2dc6a3ea8662a43f265dd5d33e5e1662',
    #     api_base_url='https://api.github.com/',
    #     authorize_url='https://github.com/login/oauth/authorize',
    #     authorize_params=None,
    #     access_token_url='https://github.com/login/oauth/access_token',
    #     access_token_params=None,
    #     client_kwargs={'scope': 'user:email'},
    # )
    # # 微博回调地址在这设置https://open.weibo.com/apps
    # oauth.register(
    #     name='weibo',
    #     client_id='3964236134',
    #     client_secret='dafeb958c4e985e57e510fa8bb71824f',
    #     api_base_url='https://api.weibo.com/',
    #     authorize_url='https://api.weibo.com/oauth2/authorize',
    #     authorize_params=None,
    #     access_token_url='https://api.weibo.com/oauth2/access_token',
    #     access_token_params=None,
    #     client_kwargs={'scope': 'user:email'},
    # )
    # # escience回调地址 https://www.escience.org.cn/manage/apps/page，注意设置GrantTypes
    # # 文档见 https://escience.org.cn/documents/oauth/
    # oauth.register(
    #     name='escience',
    #     client_id='jj6eq4emioe0fwm7',
    #     client_secret='K1rm7DFG3Upe89VMCX9ZGv9a7PkRwl360RArjcTB',
    #     api_base_url='https://oauth.escience.org.cn',
    #     authorize_url='https://oauth.escience.org.cn/oauth/authorize',
    #     authorize_params=None,
    #     access_token_url='https://oauth.escience.org.cn/oauth/token',
    #     access_token_params=None,
    #     client_kwargs={'scope': 'user:email'},
    # )
    # # cstnet回调地址
    # oauth.register(
    #     name='cstnet',
 3  #     client_id='28896',
    #     client_secret='EQ4GSlshxPX84hoHTvgobIecyl7PVUQ9',
    #     api_base_url='https://passport.escience.cn',
    #     authorize_url='https://passport.escience.cn/oauth2/authorize',
    #     authorize_params={'theme': 'full'},
    #     access_token_url='https://passport.escience.cn/oauth2/token',
    #     access_token_params={'client_id': '28896', 'client_secret': 'EQ4GSlshxPX84hoHTvgobIecyl7PVUQ9'},
    #     client_kwargs={},
    # )
    # # 腾讯开放平台 https://open.tencent.com/
    # # QQ回调地址 https://wiki.connect.qq.com/%E4%BD%BF%E7%94%A8authorization_code%E8%8E%B7%E5%8F%96access_token
    # oauth.register(
    #     name='qq',
    #     client_id='101884573',
    #     client_secret='c9f2ffd98a39aef05f5fcdae7e26e262',
    #     api_base_url='https://graph.qq.com/',
    #     authorize_url='https://graph.qq.com/oauth2.0/authorize',
    #     authorize_params={'response_type': 'code', 'scope': 'get_user_info', 'display': 'PC'},
    #     access_token_url='https://graph.qq.com/oauth2.0/token',
    #     access_token_params={},
    #     client_kwargs={},
    # )
    # # 微信回调地址
    # oauth.register(
    #     name='wechat',
    #     client_id='',
    #     client_secret='',
    #     api_base_url='https://open.weixin.qq.com',
    #     authorize_url='/connect/oauth2/authorize',
    #     authorize_params=None,
    #     access_token_url='/connect/oauth2/token',
    #     access_token_params=None,
    #     client_kwargs={'scope': 'user:email'},
    # )
    # 自己的oatuh2机制，以供其他第三方开发者接入


def set_static_url_rule(app, endpoint, static_url):
    for rule in app.url_map.iter_rules(endpoint):
        app.url_map._rules.remove(rule)
    app.url_map._rules_by_endpoint[endpoint] = []
    app.add_url_rule(f'' + static_url + '/<path:filename>', endpoint=endpoint)  # , view_func=app.send_static_file)


def set_bluprint_static_url_rule(app, prefix, blueprint_name=None):
    if blueprint_name is None:
        static_url_path = prefix + '/static'
        app.static_url_path = static_url_path
        endpoint = 'static'
    else:
        app.blueprints[blueprint_name].url_prefix = prefix + '/' + blueprint_name
        static_url_path = app.blueprints[blueprint_name].url_prefix + '/static'
        app.blueprints[blueprint_name].static_url_path = static_url_path
        endpoint = blueprint_name + '.static'
    set_static_url_rule(app, endpoint, static_url_path)


def register_blueprints(app:Flask):
    prefix = "/lcgmt"
    #
    for bp in [None, 'avatars', 'bootstrap', 'dropzone']:  # 在有prefix的情况下重设这几个static的路径为/prefix/avatars/static，否则就会是默认的/avatars/static
        set_bluprint_static_url_rule(app, prefix, bp)
    #
    app.blueprints['avatars'].url_prefix = app.config['APP_URL_PREFIX'] + '/avatars'
    app.blueprints['avatars'].static_url_path = app.blueprints['avatars'].url_prefix + '/static'
    set_static_url_rule(app, 'avatars.static', app.blueprints['avatars'].static_url_path)
    #
    app.blueprints['dropzone'].url_prefix = app.config['APP_URL_PREFIX'] + '/dropzone'
    app.blueprints['dropzone'].static_url_path = app.blueprints['dropzone'].url_prefix + '/static'
    set_static_url_rule(app, 'dropzone.static', app.blueprints['dropzone'].static_url_path)
    #
    # from app.mwr import bp as mwr_bp
    # arp.register_blueprint(mwr_bp, url_prefix=prefix + '/mwr')
    # #
    # from app.ajax import bp as ajax_bp
    # app.register_blueprint(ajax_bp, url_prefix=prefix + '/ajax')
    # #
    # from app.errors import bp as errors_bp
    # app.register_blueprint(errors_bp, url_prefix=prefix)
    # #
    # from app.main import bp as main_bp
    # app.register_blueprint(main_bp, url_prefix=prefix)
    # #
    # from app.notification import bp as notification_bp
    # app.register_blueprint(notification_bp, url_prefix=prefix + '/notification')
    # #
    # from app.cms import bp as cms_bp
    # app.register_blueprint(cms_bp, url_prefix=prefix + '/cms')
    # #
    # # from app.file_upload import bp as file_upload_bp
    # # app.register_blueprint(file_upload_bp, url_prefix=prefix + '/file_upload')
    # #
    # # from app.comment import bp as comment_bp
    # # app.register_blueprint(comment_bp, url_prefix='/comment')
    # #
    # from app.user import bp as user_bp
    # app.register_blueprint(user_bp, url_prefix=prefix + '/user')
    # #
    # from app.sysadmin import bp as sysadmin_bp
    # app.register_blueprint(sysadmin_bp, url_prefix=prefix + '/sysadmin')
    # #
    # from app.operation_log import bp as operation_log_bp
    # app.register_blueprint(operation_log_bp, url_prefix=prefix + '/operation_log')
    # #
    # from app.data_center import bp as data_center_bp
    # app.register_blueprint(data_center_bp, url_prefix=prefix + '/data_center')
    # #
    # from app.api.v1 import bp as api_v1_bp
    # app.register_blueprint(api_v1_bp, url_prefix=prefix + '/api/v1')

    # #
    # from app.proposal_submit import bp as proposal_submit_bp
    # app.register_blueprint(proposal_submit_bp, url_prefix=prefix + '/proposal_submit')
    # #
    # # from app.obs_audit import bp as obs_audit_bp
    # # app.register_blueprint(obs_audit_bp, url_prefix=prefix +'/obs_audit')
    # # #
    # # from app.obs_parameter import bp as obs_parameter_bp
    # # app.register_blueprint(obs_parameter_bp, url_prefix=prefix +'/obs_parameter')
    # #
    # from app.proposal_review import bp as proposal_review_bp
    # app.register_blueprint(proposal_review_bp, url_prefix=prefix +'/proposal_review')
    # #
    # from app.proposal_admin import bp as proposal_admin_bp
    # app.register_blueprint(proposal_admin_bp, url_prefix=prefix +'/proposal_admin')
    # #
    # from app.simulator import bp as simulator_bp
    # app.register_blueprint(simulator_bp, url_prefix=prefix +'/simulator')
    # #
    # from app.observation_plan import bp as observation_plan_bp
    # app.register_blueprint(observation_plan_bp, url_prefix=prefix+'/observation_plan')
    # #
    # from app.science_management_committee import bp as science_management_committee_bp
    # app.register_blueprint(science_management_committee_bp, url_prefix=prefix+'/science_management_committee')
    
    # from app.alert import bp as alert_bp
    # app.register_blueprint(alert_bp, url_prefix=prefix+'/alert')
    

    
    from app.api_proxy import proxy
    app.register_blueprint(proxy,url_prefix=prefix)
    if app.config.get('DEV_MOCK'):
        from app.dev_mock import bp as dev_mock_bp
        app.register_blueprint(dev_mock_bp,url_prefix=prefix)
    
    from app.lc import bp as lc_bp
    app.register_blueprint(lc_bp,url_prefix=prefix)
        
    #
    # from app.project import bp as project_bp
    # app.register_blueprint(project_bp, url_prefix=prefix + '/project')
    #
    # from app.metadata_submission import bp as metadata_submission_bp
    # app.register_blueprint(metadata_submission_bp, url_prefix=prefix + '/metadata_submission')
    #
    # from app.metadata_management import bp as metadata_management_bp
    # app.register_blueprint(metadata_management_bp, url_prefix=prefix+'/metadata_management')
    #
    # from app.resource_display import bp as resource_display_bp
    # app.register_blueprint(resource_display_bp, url_prefix=prefix + '/data_browse')
    #
    # from app.form_submition import bp as form_submition_bp
    # app.register_blueprint(form_submition_bp, url_prefix=prefix + '/form_submition')
    #

def extend_jinja(app):
    app.jinja_env.globals['get_locale'] = get_locale
    #
    from app.jinja_extension import date_filter, timestamp_filter, emphasis, get_articles_by_category, \
        get_thumbnail_articles_by_categoryid, get_system_menu, get_friend_links, get_carousel
    app.jinja_env.filters['date'] = date_filter
    app.jinja_env.filters['timestamp'] = timestamp_filter
    app.jinja_env.filters['emphasis'] = emphasis
    #
    app.jinja_env.globals['get_articles_by_category'] = get_articles_by_category
    app.jinja_env.globals['get_thumbnail_articles_by_categoryid'] = get_thumbnail_articles_by_categoryid
    app.jinja_env.globals['get_system_menu'] = get_system_menu
    app.jinja_env.globals['get_friend_links'] = get_friend_links
    app.jinja_env.globals['get_carousel'] = get_carousel
    app.jinja_env.globals['get_subsite'] = get_subsite
    app.jinja_env.globals['humanbytes'] = humanbytes
    app.jinja_env.globals['current_app'] = app


def register_shell_context(app):
    @app.shell_context_processor
    def make_shell_context():
        return dict(db=db, User=User, Notification=Notification)


def register_template_context(app):
    @app.context_processor
    def make_template_context():
        if current_user.is_authenticated:
            notification_count = Notification.query.with_parent(current_user).filter_by(is_read=False).count()
        else:
            notification_count = None
        return dict(notification_count=notification_count)

def register_celery(app):
    celery.config_from_object(app.config)
 
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
 
    celery.Task = ContextTask

def extend_url_map(app):
    """修复负数不认的情况

    Args:
        app (_type_): _description_
    """
    from werkzeug.routing import FloatConverter, ValidationError, BaseConverter

    class SignedFloatConverter(BaseConverter):
        regex = r'\-?\d+\.\d+'
        num_convert = float
            
        

    app.url_map.converters['float'] = SignedFloatConverter