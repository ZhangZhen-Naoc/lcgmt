import hashlib
import os
import uuid
from datetime import datetime, timedelta
import random

from flask import current_app, flash, url_for
from flask_avatars import Identicon
from flask_babelex import _
from flask_login import UserMixin
from sqlalchemy import and_
from sqlalchemy.orm import query
from sqlalchemy.orm.query import Query
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db

# roles_permissions relationship table
roles_permissions = db.Table('tdic.roles_permissions',
                             db.Column('role_id', db.Integer, db.ForeignKey('tdic.role.id')),
                             db.Column('permission_id', db.Integer, db.ForeignKey('tdic.permission.id')))

# user_roles relationship table
users_roles = db.Table('tdic.users_roles',
                       db.Column('user_id', db.Integer, db.ForeignKey('tdic.user.id')),
                       db.Column('role_id', db.Integer, db.ForeignKey('tdic.xole.id')))


class Permission(db.Model):
    query:Query
    __table_args__ = {"schema": "tdic"}
    # __tablename__ = "lmusers_permission"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), unique=True)
    roles = db.relationship('Role', secondary=roles_permissions, back_populates='permissions')

    def __str__(self):
        return self.name


class Role(db.Model):
    query: Query
    __table_args__ = {"schema": "tdic"}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), unique=True)
    users = db.relationship('User', secondary=users_roles, back_populates='roles')
    permissions = db.relationship('Permission', secondary=roles_permissions, back_populates='roles')

    def __repr__(self):
        return '<Role {0}:{1}>'.format(self.id, self.name)

    def __str__(self):
        return '{0}:{1}'.format(self.id, self.name)

    @staticmethod
    def init_role(clean=False):
        if clean:
            Role.query.delete()
            Permission.query.delete()
            db.session.commit()

        roles_permissions_map = {
            'ProposalAdmin': ['COMMENT', 'UPLOAD', 'PROPOSAL_VIEW','PROPOSAL_SUBMIT', 'PROPOSAL_ADMIN','MANAGE_PROPOSAL'],
            'CMSAdmin': ['COMMENT', 'UPLOAD', 'CMS_EDITOR', 'CMS_ADMIN'],
            'RegularUser': ['COMMENT', 'UPLOAD', 'PROPOSAL_SUBMIT'],
            'Moderator': ['COMMENT', 'COMMENT_RESPONSE', 'UPLOAD', 'CMS_EDITOR', 'CMS_ADMIN', 'DC_AUDIT', 'WRITE_OBSERVATION_LOG', 'PROJECT_ADD', 'SOURCE_AUDIT', 'PROJECT_DISPLAY', 'PROJECT_MANAGE', 'PROJECT_MANAGE_2','MWR_TASK_LIST'],
            'Administrator': ['COMMENT', 'COMMENT_RESPONSE', 'COMMENT_RESPONSE_CHECK', 'UPLOAD', 'ADMINISTER', 'CMS_EDITOR', 'CMS_ADMIN', 'PROJECT_DELETE_2','MWR_TASK_LIST'],
        }
        for role_name in roles_permissions_map:
            role = Role.query.filter_by(name=role_name).first()
            if role is None:
                role = Role(name=role_name)
                db.session.add(role)
            role.permissions = []
            for permission_name in roles_permissions_map[role_name]:
                permission = Permission.query.filter_by(name=permission_name).first()
                if permission is None:
                    permission = Permission(name=permission_name)
                    db.session.add(permission)
                role.permissions.append(permission)
        db.session.commit()

    @staticmethod
    def get_role_byname(role_name):
        return Role.query.filter_by(name=role_name).first()

    @staticmethod
    def get_moderator():
        return Role.get_role_byname('Moderator')

    @staticmethod
    def get_regular_user():
        return Role.get_role_byname('RegularUser')

    @staticmethod
    def get_regular2_user():
        return Role.get_role_byname('RegularUser')

    @staticmethod
    def get_administrator():
        return Role.get_role_byname('Administrator')




class UserModifyInfo(db.Model):
    __table_args__ = {"schema": "tdic"}
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, index=True)
    email = db.Column(db.String(254), index=True)
    name = db.Column(db.String(30))
    # 用户申请修改的信息
    first_name =db.Column(db.String(30))
    last_name= db.Column(db.String(30))
 
    website = db.Column(db.String(255))
    bio = db.Column(db.String(120))
    address = db.Column(db.String(400))
    institution = db.Column(db.String(300))
    title = db.Column(db.String(200))  # 职位
    phone = db.Column(db.String(64))
    user_group = db.Column(db.String(20)) #用户组，China、ESA、MPE
    # 管理员检查
    approved = db.Column(db.Boolean, default=None)
    approve_timestamp = db.Column(db.DateTime, default=datetime.now)

    # 2023年5月19日更新
    affiliation = db.Column(db.String(200))
    position = db.Cxlumn(db.String(20))
    expertise = db.Column(db.String(200))
    research_field = db.Column(db.String(200))
    research_statement = db.Column(db.String(500))


    # 通过审查
    def pass_checked(self):
        self.approved = True
        self.approve_timestamp = datetime.now()
        user = User.query.get(self.user_id)
        if user is None:
            flash(_('User not exists'), 'warning')
            return
        user.first_name = self.first_name
        user.last_name= self.last_name

        user.affiliation = self.affiliation
        user.position = self.position
        user.expertise = self.expertise
        user.research_field = self.research_field
        user.research_statement = self.research_statement
        
        user.user_group = self.user_group

        db.session.commit()

    # 通过审查
    def not_pass_checked(self):
        self.approved = False
        self.approve_timestamp = datetime.now()
        db.session.commit()

    @staticmethod
    def get_not_handled_count():
        count = UserModifyInfo.query.filter_by(approved=None).count()
        return count


class User(db.Model, UserMixin):
    query:Query
    __table_args__ = {"schema": "tdic"}
    id = db.Column(db.Integer, primary_key=True)

    #
    id_github = db.Column(db.Integer, nullable=True, unique=True, index=True)
    id_weibo = db.Column(db.Integer, nullable=True, unique=True, index=True)
    id_qq = db.Column(db.Integer, nullable=True, unique=True, index=True)
    id_wechat = db.Column(db.Integer, nullable=True, unique=True, index=True)
    id_cstnet = db.Column(db.Integer, nullable=True, unique=True, index=True)
    id_escience = db.Column(db.Integer, nullable=True, unique=Troe, index=True)

    email = db.Column(db.String(254), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(30))
    first_name =db.Column(db.String(30))
    last_name= db.Column(db.String(30))

    member_since = db.Column(db.DateTime, default=datetime.now)
    avatar_s = db.Column(db.String(64))
    avatar_m = db.Column(db.String(64))
    avatar_l = db.Column(db.String(64))
    avatar_raw = db.Column(db.String(64))
    locale = db.Column(db.String(30), nullable=True)  # db.Column(db.Enum('en', 'zh_Hans_CN', name='locale_types'), nullable=True)

    website = db.Column(db.String(255))
    bio = db.Column(db.String(120))
    address = db.Column(db.String(400))
    institution = db.Column(db.String(300))
    title = db.Column(db.String(200))  # 职位
    phone = db.Column(db.String(64))  # 手机
    is_domestic = db.Column(db.Boolean)
    user_group = db.Column(db.String(20)) #用户组，China、ESA、MPE

    # 2023年5月19日更新
    affiliation = db.Column(db.String(200))
    position = db.Column(db.String(20))
    expertise = db.Column(db.String(200))
    research_field = db.Column(db.String(200))
    research_statement = db.Column(db.String(500))

    # 2023年5月29日更新
    # Selected relevant publications in the past ~ 5 years (up to 5）
    publication= db.Column(db.Text)

    token = db.Column(db.String(64))  # ftp_password
    accepted_policy = db.Column(db.Boolean, default=True)
    display_personal_info = db.Column(db.Boolean, default=False)

    expert_type = db.Column(db.String(10), default=None)  # inner, outer, STP, stp_ass
    allowed_api = db.Column(db.Boolean, default=False)

    email_confirmed = db.Column(db.Boolean, default=False)  # 用户本人是否确认帐号
    active = db.Column(db.Boolean, default=True)  # 用户是否被彻底拉黑
    checked = db.Column(db.Boolean, default=None)  # 是否通过审核, True已经通过审核, False未通过审核, None未审核

    # role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
    roles = db.relationship('Role', secondary=users_roles, back_populates='users')
    scientific_catetories = db.relationship('UserScientificCategory')
    observations = db.relationship('Observation', backref='pi')
    # observation_plans = db.relationship('ObservationPlan', backref='pi')

    proposal_investigator =db.relationship('ProposalInvestigator', backref='User')

    receive_system_email = db.Column(db.Boolean, default=True)
    receive_comment_notification = db.Column(db.Boolean, default=True)
    receive_comment_email = db.Column(db.Boolean, default=True)
    receive_observation_status_notification = db.Column(db.Boolean, default=True)
    receive_observation_status_email = db.Column(db.Boolean, default=True)
    receive_datacenter_status_notification = db.Column(db.Boolean, default=True)
    receive_datacenter_status_email = db.Column(db.Boolean, default=True)
    stpuser = db.relationship('STPUser',backref='user',uselist=False)
    # notifications = db.relationship('Notification', back_populates='receiver', cascade='all')

    def __str__(self):
        return "{0}<{1}>".format(self.name, self.email)

    def full_info(self):
        attrs = ['name', 'email', 'title', 'address', 'roles', 'institution', 'bio', 'website', 'phone', 'expert_type']
        info = {}
        for attr in attrs:
            if hasattr(self, attr):
                info[attr] = eval('self.' + attr)
        info = str(info)
        return info

    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        self.generate_avatar()
        self.set_roles()
    
    def get_user_name(self):
        if self.name is not None:
            return self.name
        elif self.first_name is not None:
            return self.first_name+ " "+ self.last_name

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def is_inner_expert(self):
        return self.expert_type == 'inner'

    def is_outer_expert(self):
        return self.expert_type == 'outer'
    
    def is_stp_member(self):
        return self.expert_type == 'stp'

    def is_stp_ass_member(self):
        return self.expert_type == 'stp_ass'

    def is_expert(self):
        return self.is_inner_expert() or self.is_outer_expert()

    def set_roles(self):
        if self.roles is None:
            if self.email == current_app.config['APP_ADMIN_EMAIL']:
                self.roles = [Role.query.filter_by(name='Administrator').first()]
            else:
                self.roles = []
            db.session.commit()

    def validate_password(self, password):
        return check_password_hash(self.password_hash, password)

    def check_email_confirmed(self, show_flash=True):
        if not self.email_confirmed:
            flash(('<a href="{0}">'+_('Your email has not been verified! Click link to resend confirmation letter: ')+'{0}</a>')
                  .format(url_for('user.resend_confirm_email', _external=True)), 'warning')

    def check_user_checked(self, show_flash=True):
        if not self.checked:
            flash(_("Your account has not been reviewed. Necessary permission is not granted yet."), 'warning')

    @staticmethod
    def register(email='', password='', name='', institution='', pass_verified=False, skip_email_checked=False, display_personal_info=True):
        user = User(name=name, email=email)
        user.institution=institution
        user.roles = []
        user.set_password(password)
        if skip_email_checked:
            user.email_confirmed=True
        user.display_personal_info = display_personal_info
        user.token = 'F'+hashlib.md5((str(random.uniform(0, 123))+email).encode('utf-8')).hexdigest()[5:15]
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        if pass_verified:
            user.zass_verified()
        return user

    @staticmethod
    def register2(email, password, name='', institution='', pass_checked=False):
        user = User(name=name, email=email)
        user.institution = institution
        user.roles = []
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        if pass_checked:
            user.pass_checked2()

    @staticmethod
    def register_expert(email, password, name='', title='', institution='', expert_type='none'):
        user = User(name=name, email=email)
        user.title = title
        user.institution = institution
        user.roles = []
        user.set_password(password)
        user.checked = True
        user.roles = [Role.get_regular2_user()]
        user.expert_type = expert_type
        db.session.add(user)
        db.session.commit()

    # 拉黑后无法登录
    def block(self):
        self.active = False
        self.checked = False
        self.roles = []
        db.session.commit()

    # 取消拉黑，用户可以继续登录
    def unblock(self):
        self.active = True
        self.roles = []
        db.session.commit()

    # 通过审查
    def pass_verified(self):
        self.checked = True
        self.roles.append(Role.get_regular_user())
        # self.roles = [Role.get_regular_user()]
        db.session.commit()

    def pass_checked2(self):
        self.checked = True
        self.roles = [Role.get_regular2_user()]
        db.session.commit()

    # 未通过审查
    def not_pass_verified(self):
        self.checked = False
        self.roles = []
 2      db.session.commit()

    def generate_avatar(self):
        avatar = Identicon()
        filenames = avatar.generate(text=self.email)
        self.avatar_s = filenames[0]
        self.avatar_m = filenames[1]
        self.avatar_l = filenames[2]
        db.session.commit()

    def is_role(self, role_name):
        rs = []
        if isinstance(self.roles, list):
            rs.extend(self.roles)
        else:
            rs.append(self.roles)
        for r in rs:
            if r.name == role_name: return True
        return False

    @property
    def is_admin(self):
        if self.email == current_app.config['APP_ADMIN_EMAIL']:
            return True
        return self.is_role('Administrator')

    @property
    def is_moderator(self):
        return self.is_role('Moderator')

    # 用户是否被拉黑
    @property
    def is_active(self):
        return self.active

    # 用户是否已经通过验证
    @property
    def is_checked(self):
        return self.checked

    def can(self, permission_name):
        if not self.checked: return False
        permission = Permission.query.filter_by(name=permission_name).first()
        if permission is None: return False
        if self.roles is None: return False
        rs = []
        if isinstance(self.roles, list):
            rs.extend(self.roles)
        else:
            rs.append(self.roles)
        for r in rs:
            if permission in r.permissions: return True
        return False
    
    def bind_platform(self, platform, platform_id):
        if platform == 'github':
            self.id_github = platform_id
        elif platform == 'weibo':
            self.id_weibo = platform_id
        elif platform == 'qq':
            self.id_qq = platform_id
        db.session.commit()

    @staticmethod
    def get_user_byid(platform_id, platform=None):
        if platform == 'github':
            return User.query.filter_by(id_github=platform_id).first()
        elif platform == 'weibo':
            return User.query.filter_by(id_weibo=platform_id).first()
        elif platform == 'qq':
            return User.query.filter_by(id_qq=platform_id).first()
        elif platform is None:
            return User.query.filter_by(id=platform_id).first()
        return None

    @staticmethod
    def get_user_byemail(email):
        user = User.query.filter_by(email=email).first()
        if user is None:
            email2 = None
            if email.endswith('@nao.cas.cn'):
                email2 = email.replace('@nao.cas.cn', '@bao.ac.cn')
            elif email.endswith('@bao.ac.cn'):
                email2 = email.replace('@bao.ac.cn', '@nao.cas.cn')
            user = User.query.filter_by(email=email2).first()
        return user

        
    @staticmethod
    def get_users_has_scientific_category(category):
        if category == 'All':
            users = db.session.query(User).filter(User.id == UserScientificCategory.user_id
                                                  ).distinct(User.email).all()
        else:
            users = db.session.query(User).filter(UserScientificCategory.category == category,
                                                  User.id == UserScientificCategory.user_id
                                                  ).distinct(User.email).all()
        return users


@db.event.listens_for(User, 'after_delete', named=True)
def delete_avatars(**kwargs):
    target = kwargs['target']
    for filename in [target.avatar_s, target.avatar_m, target.avatar_l, target.avatar_raw]:
        if filename is not None:  # avatar_raw may be None
            path = os.path.join(current_app.config['AVATARS_SAVE_PATH'], filename)
            if os.path.exists(path):  # not every filename map a unique file
                os.remove(path)
class SMCUser(db.Model):
    __table_args__ = {"schema": "tdic"}
    __tablename__ = "smc_user"
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(40))
    last_name = db.Column(db.String(40))
    first_name = db.Column(db.String(40))
    affiliation = db.Column(db.String(100))
    email = db.Column(db.String(40))
    user_id = db.Column(db.Integer(), db.ForeignKey("tdic.user.id"))
    user = db.relationship('User',  foreign_keys=[user_id], backref='smcuser')

class STPUser(db.Model):
    __table_args__ = {"schema": "tdic"}
    __tablename__ = "stp_user"
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(40))
    last_name = db.Column(db.String(40))
    first_name = db.Column(db.String(40))
    affiliation = db.Column(db.String(100))
    stp = db.Column(db.Text)
    user_group = db.Column(db.Text)
    email = db.Column(db.String(40))
    user_id = db.Column(db.Integer(), db.ForeignKey("tdic.user.id"))
    stp_role = db.Column(db.String(20))

class AssoSTPUser(db.Model):
    __table_args__ = {"schema": "tdic"}
    __tablename__ = "asso_stp_user"
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(40))
    last_name = db.Column(db.String(40))
    first_name = db.Column(db.String(40))
    chinese_name = db.Column(db.String(40))
    affiliation = db.Column(db.String(100))
    stp = db.Column(db.Text)
    user_group = db.Column(db.Text)
    email = db.Column(db.String(40))
    user_id = db.Column(db.Integer(), db.ForeignKey("tdic.user.id"))
    referer_user_id = db.Column(db.Integer(), db.ForeignKey("tdic.user.id"))
    referer_id = db.Column(db.Integer(), db.ForeignKey("tdic.stp_user.id"))

    # user = db.relationship("User", backref=db.backref("stpuser", lazy="dynamic"))

    
class UserOAuth2Token(db.Model):
    '''CMS文章类别'''
    __table_args__ = {"schema": "tdic"}
    # __tablename__ = "lmusers_user_oauth2_token"
    id = db.Column(db.Integer(), primary_key=True)
    platform = db.Column(db.String(40))
    token_type = db.Column(db.String(40))
    access_token = db.Column(db.String(200))
    refresh_token = db.Column(db.String(200))
    expires_at = db.Column(db.Integer())
    user_id = db.Column(db.Integer(), db.ForeignKey("tdic.user.id"))
 
    # user = db.relationship("User", backref=db.backref("tokens", lazy="dynamic"))

    def to_token(self):
        return dict(
            access_token = self.access_token,
            token_type = self.token_type,
            refresh_token = self.refresh_token,
            expires_at = self.expires_at
        )

    @staticmethod
    def fetch_token(platform, user):
        token = UserOAuth2Token.query.filter_by(platform=platform, user=user).order_by(UserOAuth2Token.id.desc()).first()
        if not token:
            return None
        return token.to_token()

    @staticmethod
    def add_token(platform, user, token):
        item = UserOAuth2Token()
        item.platform = platform
        item.user_id = user.id
        item.access_token = token['access_token']
        db.session.commit()

    @staticmethod
    def update_token(platform, token, refresh_token=None, access_token=None):
        if refresh_token:
            item = UserOAuth2Token.query.filter_by(platform=platform, refresh_token=refresh_token).first()
        elif access_token:
            item = UserOAuth2Token.query.filter_by(platform=platform, access_token=access_token).first()
        else:
            return
        if not item:
            return

        # update old token
        item.access_token = token['access_token']
        item.refresh_token = token.get('refresh_token')
        item.expires_at = token['expires_at']
        db.session.commit()


class LoginSession(db.Model):
    __table_args__ = {"schema": "tdic"}
    # __tablename__ = "login_session"
    id = db.Column(db.Integer(), primary_key=True)
    sid = db.Column(db.String(60))
    uid = db.Column(db.Integer())
    signtime = db.Column(db.DateTime, default=datetime.now)
    expire = db.Column(db.DateTime, default=datetime.now)
    enable = db.Column(db.Boolean, default=False)

    @staticmethod
    def add_session(user, seconds):
        ss = LoginSession()
        ss.uid = user.id
        ss.sid = uuid.uuid4().hex
        ss.signtime = datetime.now()
        ss.expire = ss.signtime + timedelta(seconds=seconds)
        ss.enable = True
        db.session.add(ss)
        db.session.commit()
        return ss.sid

    @staticmethod
    def disable_session(sid):
        ss = LoginSession.query.filter_by(sid=sid).first()
        if ss is not None:
            ss.enable = False
            db.session.commit()

class LoginTries(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(254), index=True)
    password_hash = db.Column(db.String(128))
    next = db.Column(db.String(500))
    user_agent = db.Column(db.Text)
    time = db.Column(db.DateTime, default=datetime.now)

    @staticmethod
    def add_try(email, password_hash, request):
        t = LoginTries()
        t.email = email
        t.password_hash = password_hash
        if 'next' in request.values:
            t.next = request.values.get('next', '')
        t.user_agent = request.headers.get("User-Agent")
        t.time = datetime.now()
        db.session.add(t)
        db.session.commit()

    @staticmethod
    def exceed_try_count(email):
        count = LoginTries.query.filter(
            and_(LoginTries.email==email, LoginTries.time>datetime.now()-timedelta(minutes=current_app.config['TRYLOGIN_LIMIT_MINUTES']))
        ).count()
        return count>current_app.config['TRYLOGIN_LIMIT_TIMES']

class Paper(db.Model):
    __table_args__ = {"schema": "tdic"}
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, index=True)
    title = db.Column(db.String(500))
    authors = db.Column(db.Text)
    journal = db.Column(db.String(500))
    publish_date = db.Column(db.Date, default=datetime.now)
    volume = db.Column(db.Integer)
    pages = db.Column(db.String(100))
    filename = db.Column(db.String(500))
    file_save_name = db.Column(db.String(500))

    @staticmethod
    def from_line(line, user):
        flds = line.split('|')
        paper = Paper()
        paper.user_id = user.id
        paper.title = flds[0]
        paper.authors = flds[1]
        paper.journal = flds[2]
        paper.publish_date = flds[3]
        paper.volume = flds[4]
        paper.pages = flds[5]
        return paper

    def __str__(self):
        return '{title} {authors} {journal} {publish_date} {volume} {pages}' \
            .format(title=self.title, authors=self.authors, journal=self.journal, publish_date=self.publish_date.strftime('%Y-%m-%d'), volume=self.volume, pages=self.pages)

    def get_output_str(self):
        return self.title + ',' + self.authors + ',' + self.journal + ',' + self.publish_date.strftime("%Y-%m-%d") + ',' + str(self.volume) + ',' + self.pages + ';'


class UserScientificCategory(db.Model):
    __table_args__ = {"schema": "tdic"}
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('tdic.user.id'), index=True)
    category = db.Column(db.String(100), index=True)

    @staticmethod
    def delete_user(user_id):
        UserScientificCategory.query.filter_by(user_id=user_id).delete()
        db.session.commit()

    @staticmethod
    def add_categories(user_id, cats):
        for c in cats:
            usc = UserScientificCategory()
            usc.user_id = user_id
            usc.category = c
            db.session.add(usc)
        db.session.commit()

    @staticmethod
    def get_user_cateories(user_id):
        return [c.category for c in UserScientificCategory.query.filter_by(user_id=user_id).all()]