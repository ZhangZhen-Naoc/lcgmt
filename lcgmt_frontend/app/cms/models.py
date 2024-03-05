# -*- coding: utf-8 -*-

from datetime import datetime
from email.policy import default
from unicodedata import name
from xml.dom import INUSE_ATTRIBUTE_ERR

from matplotlib.pyplot import title

from app import db
from app.user.models import User
from enum import Enum, auto

class ArticleType(Enum):
    __table_args__ = {"schema":"tdic"}
    NEWS = auto()
    FLATPAGE = auto()
    


class CMSCategory(db.Model):
    '''CMS文章类别'''
    __tablename__ = "cms_category"
    # __bind_key__ = 'mwr'

    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    # path = db.Column(db.String(100), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False, index=True)
    description = db.Column(db.String(2000), nullable=False, index=False)
    category_type = db.Column(db.Enum(ArticleType), index=True,default=ArticleType.NEWS)

    @property
    def articles(self):
        return CMSArticle.query.filter_by(category_id=self.id).all()

    def __repr__(self):
        return self.name


class CMSArticle(db.Model):
    '''CMS文章'''
    # __bind_key__ = 'mwr'
    __tablename__ = "cms_article"

    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    # path = db.Column(db.String(200), index=True)
    title = db.Column(db.String(300), nullable=False, index=True)
    article_type = db.Column(db.Enum(ArticleType), index=True,default=ArticleType.NEWS)
    category_id = db.Column(db.Integer)

    @property
    def category(self):
        return CMSCategory.query.filter_by(id=self.category_id).first()

    thumbnail_path = db.Column(db.String(255))
    top_image_path = db.Column(db.String(255))

    # abstract = db.Column(db.String(2000))
    content = db.Column(db.Text, index=False)
    content_text = db.Column(db.Text, index=False)#用于elasticsearch

    published = db.Column(db.Boolean, default=False)
    ontop = db.Column(db.Boolean, default=False)
    recommended = db.Column(db.Boolean, default=False)
    upcoming_event = db.Column(db.Boolean, default=False)

    hits = db.Column(db.Integer, default=0)
    order = db.Column(db.Integer, default=1)

    editor_id = db.Column(db.Integer)

    @property
    def editor(self):
        return User.query.filter_by(id=self.editor_id).first()

    auditor_id = db.Column(db.Integer)

    @property
    def auditor(self):
        return User.query.filter_by(id=self.auditor_id).first()

    created = db.Column(db.DateTime, default=datetime.now)
    last_modified = db.Column(db.DateTime, default=datetime.now)

    @staticmethod
    def get_recommended(limit=10):
        articles = CMSArticle.query.filter_by(recommended=True).filter_by(published=True).order_by(CMSArticle.order.asc() ).limit(limit).all()
        return articles

    def add_hits(self):
        self.hits+=1
        db.session.commit()

    def __repr__(self):
        return self.title


class CMSCarousel(db.Model):
    '''轮播图, category_id为0时代表首页'''
    # __table_args__ = {"schema": "cms"}
    # __tablename__ = "csstbp_cms_carousel"
    # __bind_key__ = 'mwr'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    category_id = db.Column(db.Integer)

    @property
    def category(self):
        return CMSCategory.query.filter_by(id=self.category_id).first()

    title = db.Column(db.String(300), nullable=True, index=True)
    content = db.Column(db.String(1000), nullable=True, index=False)
    link = db.Column(db.String(300), nullable=True, index=False)
    image_url = db.Column(db.String(300), nullable=True, index=False)
    order = db.Column(db.Integer, nullable=True)

class ScienceTeamSurvey(db.Model):
    # __bind_key__ = 'mwr'
    __table_args__ = {"schema":"tdic"}
    __tablename__ = "science_team_survey"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    name = db.Column(db.String(30), nullable=False, index=True)
    title = db.Column(db.String(30), nullable=False, index=True)
    institute = db.Column(db.String(100), nullable=False, index=True)
    address = db.Column(db.String(100), nullable=True, index=True)
    email = db.Column(db.String(254), nullable=False, index=True)
    telephone = db.Column(db.String(20), nullable=True, index=True)
    reseach_type = db.Column(db.String(200), nullable=False, index=True)
    observation_research = db.Column(db.String(200), nullable=False, index=True)
    how_to_analyze_data = db.Column(db.String(200), nullable=False, index=True)
    expected_joint_doctoral_candidate = db.Column(db.String(20), default='0')
    expected_joint_postdoctoral = db.Column(db.String(20), default='0')

    #1.Active Galactic Nuclei & Tidal Disruption Events
    agntde = db.Column(db.Boolean(),default=False)
    agntde_paper = db.Column(db.String(500))
    #2.Fast Extragalactic Transients
    fet = db.Column(db.Boolean(),default=False)
    fet_paper = db.Column(db.String(500))
    #3.Multi-messenger Astronomy
    mma = db.Column(db.Boolean(),default=False)
    mma_paper = db.Column(db.String(500))
    #4.Compact Stellar Objects
    cso = db.Column5db.Boolean(),default=False)
    cso_paper = db.Column(db.String(500))
    #5.Observatory Science
    os = db.Column(db.Boolean(),default=False)
    os_type = db.Column(db.String(100))
    os_paper = db.Column(db.String(500))
    #6.Follow-up Observation Activiuies
    fuoa = db.Column(db.Boolean(),default=False)
    fuoa_paper = db.Column(db.String(500))
    fuoa_intro = db.Column(db.String(500))
    #对EP科学团队的意见和建议
    comment=db.Column(db.String(500))
    submit_time= db.Column(db.DateTime, default=datetime.now) 
    accept = db.Column(db.Boolean,default=False)

class AssociateScienceTeamApplication(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = "associate_science_team_application"    
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    referer_name = db.Column(db.String(30), nullable=False, index=True)
    referer_given_name = db.Column(db.String(30), nullable=False)
    referer_family_name = db.Column(db.String(30), nullable=False)

    name1 = db.Column(db.String(30), nullable=False)
    given_name1 = db.Column(db.String(30), nullable=False)
    family_name1 = db.Column(db.String(30), nullable=False)
    title1 = db.Column(db.String(30), nullable=False)
    institute1 = db.Column(db.String(100), nullable=False)
    email1 = db.Column(db.String(254), nullable=False)
    agntde1 = db.Column(db.Boolean(),default=False)
    fet1 = db.Column(db.Boolean(),default=False)
    mma1 = db.Column(db.Boolean(),default=False)
    cso1 = db.Column(db.Boolean(),default=False)
    os1 = db.Column(db.Boolean(),default=False)
    fuoa1 = db.Column(db.Boolean(),default=False)
    intro1 = db.Column(db.String(500),nullable=False)
    
    name2 = db.Column(db.String(30), nullable=True)
    given_name2 = db.Column(db.String(30), nullable=True)
    family_name2 = db.Column(db.String(30), nullable=True)
    title2 = db.Column(db.String(30), nullable=True)
    institute2 = db.Column(db.String(100), nullable=True)
    email2 = db.Column(db.String(254), nullable=True)
    agntde2 = db.Column(db.Boolean(),default=False)
    fet2 = db.Column(db.Boolean(),default=False)
    mma2 = db.Column(db.Boolean(),default=False)
    cso2 = db.Column(db.Boolean(),default=False)
    os2 = db.Column(db.Boolean(),default=False)
    fuoa2 = db.Column(db.Boolean(),default=False)
    intro2 = db.Column(db.String(500))

    name3 = db.Column(db.String(30), nullable=True)
    given_name3 = db.Column(db.String(30), nullable=True)
    family_name3 = db.Column(db.String(30), nullable=True)
    title3 = db.Column(db.String(30), nullable=True)
    institute3 = db.Column(db.String(100), nullable=True)
    email3 = db.Column(db.String(254), nullable=True)
    agntde3 = db.Column(db.Boolean(),default=False)
    fet3 = db.Column(db.Boolean(),default=False)
    mma3 = db.Column(db.Boolean(),default=False)
    cso3 = db.Column(db.Boolean(),default=False)
    os3 = db.Column(db.Boolean(),default=False)
    fuoa3 = db.Column(db.Boolean(),default=False)
    intro3 = db.Column(db.String(500))

    submit_time= db.Column(db.DateTime, default=datetime.now) 
    accept = db.Column(db.Boolean,default=False)

class ScienceTeamApplication(db.Model):
    # __bind_key__ = 'mwr'
    __table_args__ = {"schema":"tdic"}
    __tablename__ = "science_team_application"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    name = db.Column(db.String(30), nullable=False, index=True)
    title = db.Column(db.String(30), nullable=False, index=True)
    institute = db.Column(db.String(100), nullable=False, index=True)
    address = db.Column(db.String(100), nullable=True, index=True)
    email = db.Column(db.String(254), nullable=False, index=True)
    telephone = db.Column(db.String(20), nullable=True, index=True)
    reseach_type = db.Column(db.String(200), nullable=False, index=True)
    observation_research = db.Column(db.String(200), nullable=False, index=True)
    # how_to_analyze_data = db.Column(db.String(200), nullable=False, index=True)
    # expected_joint_doctoral_candidate = db.Column(db.String(20), default='0')
    # expected_joint_postdoctoral = db.Column(db.String(20), default='0')

    #1.Active Galactic Nuclei & Tidal Disruption Events
    agntde = db.Column(db.Boolean(),default=False)
    agntde_paper = db.Column(db.String(500))
    #2.Fast Extragalactic Transients
    fet = db.Column(db.Boolean(),default=False)
    fet_paper = db.Column(db.String(500))
    #3.Multi-messenger Astronomy
    mma = db.Column(db.Boolean(),default=False)
    mma_paper = db.Column(db.String(500))
    #4.Compact Stellar Objects
    cso = db.Column(db.Boolean(),default=False)
    cso_paper = db.Column(db.String(500))
    #5.Observatory Science
    os = db.Column(db.Boolean(),default=False)
    os_type = db.Column(db.String(100))
    os_paper = db.Column(db.String(500))
    #6.Follow-up Observation Activities
    fuoa = db.Column(db.Boolean(),default=False)
    fuoa_paper = db.Column(db.String(500))
    fuoa_intro = db.Column(db.String(500))
    #上传申请文件
    application_file=db.Column(db.String(500))
    #上传承诺书
    commitment_file=db.Column(db.String(500))

    submit_time= db.Column(db.DateTime, default=datetime.now) 
    accept = db.Column(db.Boolean,default=False)
    #是否愿意成为工作组负责人
    be_chair = db.Column(db.Boolean,default=False)

class TAApplication(db.Model):
     # __bind_key__ = 'mwr'
    __table_args__ = {"schema":"tdic"}
    __tablename__ = "ta_application"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    name = db.Column(db.String(30), index=True)
    stp = db.Column(db.String(6), index=True)
    co_stp_name = db.Column(db.String(30), index=True)
    institute = db.Column(db.String(100),  index=True)
    position = db.Column(db.String(20), index=True)
    email = db.Column(db.String(254), nullable=False, index=True)
    telephone = db.Column(db.String(20), nullable=True, index=True)
    remark = db.Column(db.String(500), nullable=True, index=True)
    submit_time= db.Column(db.DateTime, default=datetime.now) 



