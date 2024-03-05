from faker import Faker
from sqlalchemy.exc import IntegrityError
from app.sysadmin.models import SystemMenu, FriendLink
from app.cms.models import CMSCategory, CMSCarousel, CMSArticle
from app.extensions import db
from app.notification.models import Notification
from app.user.models import User, Role, Permission


def init_role_permission(clean):
    if clean:
        Role.query.delete()
        Permission.query.delete()
        db.session.commit()

    roles_permissions_map = {
        'RegularUser': ['COMMENT', 'UPLOAD', 'FILE_UPLOAD'],
        'SuperUser': ['DASHBOARD_VIEW', 'COMMENT', 'COMMENT_RESPONSE', 'UPLOAD', 'CMS_EDIT', 'CMS_ADMIN', 'FILE_UPLOAD', 'FILE_UPLOAD_ADMIN'],
        'Administrator': ['DASHBOARD_VIEW', 'SYSTEM_ADMIN', 'USER_ADMIN', 'COMMENT', 'COMMENT_RESPONSE',
                          'COMMENT_ADMIN', 'UPLOAD', 'CMS_EDIT', 'CMS_ADMIN',
                          'FILE_UPLOAD', 'FILE_UPLOAD_ADMIN'
                          ],
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


def init_cms_category(clean):
    if clean:
        CMSCategory.query.delete()
        db.session.commit()
    #
    categories = [
        [1, '项目介绍', ''],
        [2, '核心技术', ''],
        [3, '人才队伍', ''],
        [4, '新闻进展', ''],
        [5, '荣誉成果', ''],
        [6, '在线体验', ''],
        [7, '其他', '']
    ]
    for c in categories:
        category = CMSCategory()
        category.id = c[0]
        category.name = c[1]
        category.description = c[2]
        db.session.add(category)
    #
    db.session.commit()


def init_cms_article(url_prefix, clean):
    if clean:
        CMSArticle.query.delete()
        db.session.commit()
    #
    articles = [
        # title, category_id, thumbnail_path, published
        ['技术1', 2, '/cms/files/docker.jpg', True],
        ['2018.12 筹划', 4, '', True],
        ['2019.01 基金申请会1', 4, '', True],
        ['2019.02 基金申请会2', 4, '', True],
        ['2019.03 基金申请会3', 4, '', True],
        ['2019.04 基金申请会4', 4, '', True],
        ['荣誉1', 5, '/cms/files/rongyu.jpg', True],
    ]
    for a in articles:
        article = CMSArticle()
        article.title=a[0]
        article.content=a[0]
        article.category_id=a[1]
        article.thumbnail_path=url_prefix+a[2]
        article.published=a[3]
        db.session.add(article)
    #
    db.session.commit()


def init_cms_carousel(url_prefix, clean):
    if clean:
        CMSCarousel.query.delete()
        db.session.commit()
    #
    links=[
        # category_id, title, content, link, image_url, order
        [0, '质量优化', '制定优化策略', '', '/cms/files/web1.jpg', 1],
        [0, '人工智能软件实验平台', '为不同设备定制控制系统智能化软件，缩减开发时间和维护成本', '', '/cms/files/web2.gif', 2],
        [0, '运行可靠性管理', '建立寿命预测模型，为维修计划 的制定做决策依据，建立应急管理预案', '', '/cms/files/web3.jpg', 3],
    ]
    for l in links:
        link=CMSCarousel()
        link.category_id=l[0]
        link.title=l[1]
        link.content=l[2]
        link.link=l[3]
        link.image_url=url_prefix+l[4]
        link.order=l[5]
        db.session.add(link)
    #
    db.session.commit()


def init_systemmenu(url_prefix, clean):
    if clean:
        SystemMenu.query.delete()
        db.session.commit()
    #
    menus=[
        #id, parent_id, url, order, name_zh, name_en
        [1, -1, '/cms/category/view?id=1', 1, '项目介绍', 'Project'],
    ]
    for m in menus:
        menu=SystemMenu()
        menu.id=m[0]
        menu.parent_id=m[1]
        menu.url=url_prefix+m[2]
        menu.order=m[3]
        menu.title_zh=m[4]
        menu.title_en = m[5]
        db.session.add(menu)
    #
    db.session.commit()


def init_friend_link(url_prefix, clean):
    if clean:
        FriendLink.query.delete()
        db.session.commit()
    #
    links=[
        #name_zh, name_en, url, logo_url, order
        ['中国科学院', 'Chinese Academy of Sciences', 'http://www.cas.cn/', '/static/images/index-logos/cas_logo.png', 1],
        ['国家天文台', 'National Astronomical Observatories, CAS', 'http://nao.cas.cn/', '/static/images/index-logos/naoc_logo_a.png', 3],
        ['中国天文科学数据中心', 'National Astronomical Data Center', 'https://nadc.china-vo.org/', '/static/images/index-logos/NADCLogoTransHorizontal.png', 4],
        ['中国虚拟天文台', 'Chinese Virtual Observatory', 'http://www.china-vo.org/','/static/images/index-logos/cvo_logo_sm_transbg.png', 5],
    ]
    for l in links:
        link=FriendLink()
        link.name_zh=l[0]
        link.name_en=l[1]
        link.url = l[2]
        link.logo_url = url_prefix+l[3]
        link.order = l[4]
        db.session.add(link)
    #
    db.session.commit()


def init_admin():
    admin = User(name='Fan Dongwei',
                 email='fandongwei@nao.cas.cn',
                 bio='',
                 website='',
                 email_confirmed=True,
                 active=True,
                 verified=True)
    admin.roles = [Role.query.filter_by(name='Administrator').first()]
    admin.set_password('fandongwei')
    notification = Notification(message='Hello, welcome to EP TDIC.', receiver=admin)
    db.session.add(notification)
    db.session.add(admin)
    db.session.commit()


def init_fakeuser(count):
    fake = Faker()
    for i in range(count):
        user = User(name=fake.name(),
                    email_confirmed=True,
                    bio=fake.sentence(),
                    address=fake.city(),
                    website=fake.url(),
                    member_since=fake.date_this_decade(),
                    email=fake.email()
                    )
        user.set_password('123456')
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

