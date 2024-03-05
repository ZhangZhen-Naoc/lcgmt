from multiprocessing.spawn import import_main_path
import time
from datetime import datetime
from typing import Iterable, List, Tuple
from flask_login import current_user
from sqlalchemy import and_, or_, func, text
# from app.data_center.models import FOV
from app.extensions import db
import random, string, json, os, math

from flask import render_template, request, current_app, send_from_directory, jsonify, flash
from sqlalchemy.orm import class_mapper
from flask_babelex import _
from app.utils import redirect_back, format_email
from app.user.models import User, Paper
from enum import Enum, auto
from app.user import service as user_service
from sqlalchemy.orm import Query
from typing import Any,Dict,ClassVar
from dataclasses import dataclass

class SourcePriority(Enum):
    __table_args__ = {"schema":"tdic"}
    P1 = auto()
    P2 = auto()
    P3 = auto()
    P4 = auto()
    P5 = auto()
    P6 = auto()
    P7 = auto()
    P8 = auto()
    P9 = auto()
    P10 = auto()
    X = auto()

    A=auto()
    B=auto()
    C=auto()
    D=auto()

    @staticmethod
    def from_str(value:str):
        TYPE_DICT = SourcePriority.get_type_dict()
        return TYPE_DICT.get(value,None)
    
    @staticmethod
    def get_type_dict():
        return {
            "1":SourcePriority.P1,
            "2":SourcePriority.P2,
            "3":SourcePriority.P3,
            "4":SourcePriority.P4,
            "5":SourcePriority.P5,
            "6":SourcePriority.P6,
            "7":SourcePriority.P7,
            "8":SourcePriority.P8,
            "9":SourcePriority.P9,
            "X":SourcePriority.X,
            "A":SourcePriority.A,
            "B":SourcePriority.B,
            "C":SourcePriority.C,
            "D":SourcePriority.D
        }
    def __str__(self) -> str:
        return str(self.name)
    
    def __lt__(self,other):
        return self.name < other.name

class InstrumentType(Enum):
    __table_args__ = {"schema":"tdic"}
    WXT = auto()
    FXT1 = auto()
    FXT2 = auto()

    @staticmethod
    def from_str(value:str):
        TYPE_DICT = InstrumentType.get_type_dict()
        return TYPE_DICT.get(value,None)
    
    @staticmethod
    def get_type_dict():
        return {
            "WXT":InstrumentType.WXT,
            "FXT1":InstrumentType.FXT1,
            "FXT1":InstrumentType.FXT1,
        }

class FXTObservationMode(Enum):
    __table_args__ = {"schema":"tdic"}
    # FULLFRAME = auto() #全帧（ff）
    # PARTIALWINDOW = auto() #开窗（pw）
    # TIMING = auto() #时变 （tm）
    SCIENCE = auto() #科学模式，针对科学用户
    DIAGNOSTIC = auto() #诊断，只对EP内部团队开放(df/dw/dt)
    SAA = auto() #南大西洋异常区模式（sf/sw/st），不在提案中体现
    OFFSET = auto()  #偏移量标定，只对EP内部团队开放 (of/ow/ot)

    @staticmethod
    def from_str(value:str):
        TYPE_DICT = FXTObservationMode.get_type_dict()
        return TYPE_DICT.get(value,None)

    @staticmethod
    def get_type_dict():
        return {
            "SCIENCE":FXTObservationMode.SCIENCE,
            "DIAGNOSTIC":FXTObservationMode.DIAGNOSTIC,
            "SAA":FXTObservationMode.SAA,
            "OFFSET":FXTObservationMode.OFFSET,
        }

class FXTWindowMode(Enum):
    __table_args__ = {"schema":"tdic"}
    FULLFRAME = auto() #全帧（ff）
    PARTIALWINDOW = auto() #开窗（pw）
    TIMING = auto() #时变 （tm）

    @staticmethod
    def from_str(value:str):
        TYPE_DICT = FXTWindowMode.get_type_dict()
        return TYPE_DICT.get(value,None)

    @staticmethod
    def get_type_dict():
        return {
            "FULLFRAME":FXTWindowMode.FULLFRAME,
            "PARTIALWINDOW":FXTWindowMode.PARTIALWINDOW,
            "TIMING":FXTWindowMode.TIMING
        }

class FXTFilterType(Enum):
    __table_args__ = {"schema":"tdic"}
    CLOSEDPOSITION = auto() #全遮挡工位，仅限EP内部
    CALIBRATIONPOSITION = auto() #标定源工位，仅限EP内部
    OPENPOSITION = auto() #全开工位，仅限EP内部
    MEDIUMFILTER = auto() #中膜
    THINFILTER = auto() #薄膜，默认
    HOLEPOSITION = auto() #开窗工位，仅限EP内部

    @staticmethod
    def from_str(value:str):
        TYPE_DICT = FXTFilterType.get_type_dict()
        return TYPE_DICT.get(value,None)

    @staticmethod
    def get_type_dict():
        return {
            "CLOSEDPOSITION":FXTFilterType.CLOSEDPOSITION,
            "CALIBRATIONPOSITION":FXTFilterType.CALIBRATIONPOSITION,
            "OPENPOSITION":FXTFilterType.OPENPOSITION,
            "MEDIUMFILTER":FXTFilterType.MEDIUMFILTER,
            "THINFILTER":FXTFilterType.THINFILTER,
            "HOLEPOSITION":FXTFilterType.HOLEPOSITION
        }

# class UserGroup(Enum):
#     __table_args__ = {"schema":"tdic"}
#     China  = auto()
#     MPE  = auto()
#     ESA  = auto()


#     @staticmethod
#     def from_str(value:str):
#         TYPE_DICT = UserGroup.get_type_dict()
#         return TYPE_DICT.get(value,None)
    
#     @staticmethod
#     def get_type_dict():
#         return {
#             "China":UserGroup.China,
#             "MPE":UserGroup.MPE,
#             "ESA":UserGroup.ESA
    
#         }

# 可视为User Type
class ProposalType1(Enum):
    STP= auto() # FXT Survey mode target observing/FSTO
    GO = auto() # Target of Opportunity

    TOOMM = auto() # 多信使TOO des
    TOO = auto() # 多信使TOO des

    @staticmethod
    def from_str(value:str):
        TYPE_DICT = ProposalType1.get_type_dict()
        return TYPE_DICT.get(value,None)  
    
    @staticmethod
    def get_type_dict():
        return {
            "GO":ProposalType1.GO,
            "STP":ProposalType1.STP,
            "TOOMM":ProposalType1.TOOMM,
            "TOO":ProposalType1.TOO
        }

class ProposalType2(Enum):
    NonToo = auto()
    AnticipateToO = auto() #GO
    Calibration = auto() #GO
    HighestUrgencyToO = auto() #ToO
    HighUrgencyToO = auto() #ToO
    MediumUrgencyToO = auto() #ToO soft 
    LowUrgencyToO = auto() #ToO soft
    # TooMM = auto() 
    GuestObserver = auto() #GO des
    SYToo = auto() #实验星ToO用
  

    
    def encode(self)->str:
        """用于发送给科学运行系统

        Returns:
            _type_: _description_
        """
        if self==ProposalType2.GuestObserver:
            return "GP-PPT"
        if self==ProposalType2.Calibration:
            return "GP-CAL"
        else :
            return "ToO-NOM-AT"

# class WXTConfigParameter(db.Model):
#     __table_args__ = {"schema":"tdic"}
#     __tablename__ = 'wxt_config_parameter'
#     id = db.Column(db.Integer, primary_key=True)
#     config_param_switch = db.Column(db.String(4))
#     config_force_switch = db.Column(db.String(4))
#     operation_code_3 = db.Column(db.String(4))
#     minnsigma_dim = db.Column(db.String(4))
#     sn_dim = db.Column(db.String(4))
#     sn_windows = db.Column(db.String(4))
#     retention_param_1 = db.Column(db.String(4))
#     retention_param_2 = db.Column(db.String(4))
#     retention_param_3 = db.Column(db.String(4))

class ProposalSeason(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal_season'
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    season = db.Column(db.String(64), index=True)
    open_date = db.Column(db.DateTime, index=True)
    expiration = db.Column(db.DateTime, index=True)
    season_type = db.Column(db.String(64), default='General')
    #
    create_time = db.Column(db.DateTime, default=datetime.now)
    create_email = db.Column(db.String(256))
    #
    review_deadline = db.Column(db.DateTime, index=True)
    #
    project_expiration = db.Column(db.DateTime)
    # 专家权重
    inner_expert_weight = db.Column(db.Float, default=1)
    outer_expert_weight = db.Column(db.Float, default=0.5)
    # 唯一标识
    identification = db.Column(db.String(256), unique=True, index=True)
    # 开放的意见,默认都不生效
    open_to_pi_final_review_comment = db.Column(db.Boolean, default=False)
    open_to_pi_technical_review_comment = db.Column(db.Boolean, default=False)
    open_to_pi_scientific_review_comment = db.Column(db.Boolean, default=False)
    #
    announcement_link = db.Column(db.Text, default='#')
    help_link = db.Column(db.Text, default='#')
    parameter_link = db.Column(db.Text, default='#')
    #
    proposal_season_announcement = db.relationship('ProposalSeasonAnnouncement', back_populates='proposal_season')

    # 在开放范围、最新的观测申请
    @staticmethod
    def get_newest_season():
        current_time = datetime.fromtimestamp(time.mktime(time.localtime()))
        season = db.session.query(ProposalSeason).filter(ProposalSeason.open_date < current_time, ProposalSeason.expiration > current_time).order_by(ProposalSeason.create_time.desc()).first()
        return season
    
    @staticmethod
    def get_last_expired_gp_season():
   4    current_time = datetime.fromtimestamp(time.mktime(time.localtime()))
        season = db.session.query(ProposalSeason).filter(ProposalSeason.expiration < current_time,ProposalSeason.season_type=='General').order_by(ProposalSeason.create_time.desc()).first()
        return season

    # 检查数据格式
    @staticmethod
    def create_proposal_season(season, open_date, expiration, review_deadline, project_expiration, season_type='General'):
        try:
            op = datetime.strptime(open_date.strip(), '%Y-%m-%d %H:%M:%S')
            print(op)
            ex = datetime.strptime(expiration.strip(), '%Y-%m-%d %H:%M:%S')
            de = datetime.strptime(review_deadline.strip(), '%Y-%m-%d %H:%M:%S')8            pe = datetime.strptime(project_expiration.strip(), '%Y-%m-%d %H:%M:%S')
            #
            if ex <= op:
                flash('观测开始时间不可大于截止时间', 'warning')
                return redirect_back('proposal_admin.admin_season_list')
        except:
            return 1

        # 写入数据库
        src = string.ascii_letters + string.digits
        identification = time.strftime("%Y%m%d%H%M%S", time.localtime()) + '_' + user_service.get_current_user().email + '_' + "".join(random.sample(src, 6))
        if len(identification) > 256:
            identification = identification[-256:-1]
        # 唯一标识符
        db.session.add(ProposalSeason(season=season.strip(), open_date=op, expiration=ex, review_deadline=de, project_expiration=pe, season_type=season_type, create_email=user_service.get_current_user().email, identification=identification))
        db.session.commit()

        # 创建文件夹
        s = db.session.query(ProposalSeason).filter(ProposalSeason.identification == identification).first()
        try:
            # season文件夹
            season_dir = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'seasons')
            if not os.path.exists(season_dir):
                os.makedirs(season_dir)
            # 创建本项目文件夹
            this_season = os.path.join(season_dir, str(s.id))
            if not os.path.exists(this_season):
                os.makedirs(this_season)
            # 创建其他文件夹
            # draft_dir = os.path.join(this_season, 'draft')
            announcement_dir = os.path.join(this_season, 'announcement')
            sqb_dir = os.path.join(this_season, 'sqb')
            case_dir = os.path.join(this_season, 'case')
            pid_dir = os.path.join(this_season, 'pid')
            # if not os.path.exists(draft_dir):
            #     os.makedirs(draft_dir)
            if not os.path.exists(announcement_dir):
                os.makedirs(announcement_dir)
            if not os.path.exists(sqb_dir):
                os.makedirs(sqb_dir)
            if not os.path.exists(case_dir):
                os.makedirs(case_dir)
            if not os.path.exists(pid_dir):
                os.makedirs(pid_dir)
        except:
            db.session.query(ProposalSeason).filter(ProposalSeason.identification == identification).delete()
            db.session.commit()
            print('create folder error!')
            return 2

        return 3

    # season 保存的路径
    def get_this_season_dir(self):
        season_dir = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'seasons')
        this_dir = os.path.join(season_dir, str(self.id))
        return this_dir

    @staticmethod
    def update_proposal_season(season, open_date, expiration, review_deadline,  season_id):
        try:
            op = datetime.strptime(open_date.strip(), '%Y-%m-%d %H:%M:%S')
            ex = datetime.strptime(expiration.strip(), '%Y-%m-%d %H:%M:%S')
            de = datetime.strptime(review_deadline.strip(), '%Y-%m-%d %H:%M:%S')
            # pe = datetime.strptime(project_expiration.strip(), '%Y-%m-%d %H:%M:%S')
            if ex <= op:
                flash('观测开始时间不可大于截止时间', 'warning')
                return redirect_back('proposal_admin.admin_season_list')
        except:
            return 1
        # 修改season的名字、截止时间等，全部推迟修改
        db.session.query(ProposalSeason).filter(ProposalSeason.id == season_id).update({'expiration': ex, 'open_date': op, 'review_deadline': de,  'season': season})
        # 提交截止时间
        db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id).update({'expiration': ex, 'season': season})
        # 评审截止时间
        pres = db.session.query(ProposalReviewExpert.id, Proposal.id).filter(ProposalReviewExpert.proposal_id == Proposal.id, Proposal.proposal_season_id == season_id).all()
        for pre in pres:
            db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == pre[0]).update({'review_deadline': de})
        # 提交数据
        db.session.commit()
        return 3

    @staticmethod
    def get_season_by_id(season_id):
        s = ProposalSeason.query.filter(ProposalSeason.id == season_id).first()
        return s.season

    @staticmethod
    def get_submitted_number(season_id):
        count = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True).count()
        return count

    @staticmethod
    def get_max_review_number(season_id):
        proposals = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True).all()
        counts = [0]
        for p in proposals:
            count = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.proposal_id == p.id, ProposalReviewExpert.is_sure == True, ProposalReviewExpert.submit_status == True).count()
            counts.append(count)
        return max(counts)

    @staticmethod
    def get_statistics_seasons():
        count = db.session.query(ProposalSeason).filter(ProposalSeason.id > 0).count()
        return count

    @staticmethod
    def get_excel_result(season_id, max_count, scientific_category, domestic):
        if len(domestic) == 1:
            proposals = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True,
                                                          ProposalScientificCategory.category.in_(tuple(scientific_category)), ProposalScientificCategory.proposal_id == Proposal.id,
                                                          ProposalInvestigator.proposal_id == Proposal.id, ProposalInvestigator.role == 'pi',
                                                          ProposalInvestigator.email == User.email, User.is_domestic.in_(tuple(domestic))
                                                          ).distinct().all()
        else:
            proposals = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True,
                                                          ProposalScientificCategory.category.in_(tuple(scientific_category)), ProposalScientificCategory.proposal_id == Proposal.id,
                                                          ProposalInvestigator.proposal_id == Proposal.id, ProposalInvestigator.role == 'pi'
                                                          ).distinct().all()

        all_rows = []
        for proposal in proposals:
            row_dict = {}
            row_dict['NO'] = proposal.get_no()
            row_dict['TITLE'] = proposal.proposal_title
            #
            row_dict['Scientific Category'] = proposal.get_proposal_science_type()
            #
            row_dict['Time Request'] = proposal.total_time_request
            #
            title, name,first_name, last_name, email, institution, phone,user_group,country = ProposalInvestigator.get_pi_value(proposal_id=proposal.id)
            row_dict['PI FULLNAME'] = name
            row_dict['E-mail'] = email
            row_dict['PI UNIT'] = institution
            #
            # row_dict['Scientific Output'] = ProposalInvestigator.get_pi_papers_excel(proposal_id=proposal.id)
            #
            technical_result, technical_review_comment = ProposalTechnicalReview.get_technical_review_excel(proposal_id=proposal.id)
            row_dict['Technical Review'] = technical_result
            row_dict['Technical Review Comment'] = technical_review_comment
            #
            scores, contents = ProposalReviewExpert.get_proposal_review_excel(proposal_id=proposal.id, max_count=max_count)
            for i in range(0, max_count):
                value = 'Scientific Score ' + str(i + 1)
                row_dict[value] = scores[i]
            for i in range(0, max_count):
                value = 'Scientific Comment ' + str(i + 1)
                row_dict[value] = contents[i]
            #
            average, error = proposal.get_average_error()
            row_dict['Average Score'] = average
            row_dict['Standard Deviation'] = error
            #
            if proposal.scientific_review_finished:
                row_dict['Time Allocated'] = proposal.total_time_assigned
                row_dict['Grade(A、B、C、D)'] = proposal.priority
            else:
                row_dict['Time Allocated'] = ''
                row_dict['Grade(A、B、C、D)'] = ''
            #
            all_rows.append(row_dict)

        return all_rows

    @staticmethod
    def get_sqb_proposals(scientific_category, domestic, season_id):
        if len(domestic) == 1:
            p = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True,
                                                  ProposalScientificCategory.category.in_(tuple(scientific_category)), ProposalScientificCategory.proposal_id == Proposal.id,
                                                  ProposalInvestigator.proposal_id == Proposal.id, ProposalInvestigator.role == 'pi',
                                                  ProposalInvestigator.email == User.email, User.is_domestic.in_(tuple(domestic))
                                                  ).distinct().all()
        else:
            p = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True,
                                                  ProposalScientificCategory.category.in_(tuple(scientific_category)), ProposalScientificCategory.proposal_id == Proposal.id,
                                                  ProposalInvestigator.proposal_id == Proposal.id, ProposalInvestigator.role == 'pi'
                                                  ).distinct().all()
        return p

    @staticmethod
    def get_pid_proposals(scientific_category, domestic, priority, season_id):
        if len(domestic) == 1:
            p = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True, Proposal.priority.in_(tuple(priority)), Proposal.scientific_review_finished == True,
                                                  ProposalScientificCategory.category.in_(tuple(scientific_category)), ProposalScientificCategory.proposal_id == Proposal.id,
                                                  ProposalInvestigator.proposal_id == Proposal.id, ProposalInvestigator.role == 'pi',
                                                  ProposalInvestigator.email == User.email, User.is_domestic.in_(tuple(domestic))
                                                  ).distinct().all()
        else:
            p = db.session.query(Proposal).filter(Proposal.proposal_season_id == season_id, Proposal.submit_status == True, Proposal.priority.in_(tuple(priority)), Proposal.scientific_review_finished == True,
                                                  ProposalScientificCategory.category.in_(tuple(scientific_category)), ProposalScientificCategory.proposal_id == Proposal.id,
                                                  ProposalInvestigator.proposal_id == Proposal.id, ProposalInvestigator.role == 'pi'
                                                  ).distinct().all()
        return p

    def has_announcement(self):
        if ProposalSeasonAnnouncement.get_file_count(proposal_season_id=self.id) > 0:
            return True
        else:
            return False



class ProposalSeasonAnnouncement(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal_season_announcement'
    id = db.Column(db.Integer, primary_key=True)
    season = db.Column(db.String(64), index=True)
    announcement_storage_name = db.Column(db.String(4096))
    announcement_display_name = db.Column(db.String(4096))
    announcement_link = db.Column(db.Text, default='#')
    #
    proposal_season_id = db.Column(db.Integer, db.ForeignKey('tdic.proposal_season.id'), index=True)
    proposal_season = db.relationship('ProposalSeason', back_populates='proposal_season_announcement')

    @staticmethod
    def get_storage_file_name(proposal_season_id):
        f = db.session.query(ProposalSeasonAnnouncement).filter(ProposalSeasonAnnouncement.proposal_season_id == proposal_season_id).first()
        return f.announcement_storage_name

    @staticmethod
    def get_display_file_name(proposal_season_id):
        f = db.session.query(ProposalSeasonAnnouncement).filter(ProposalSeasonAnnouncement.proposal_season_id == proposal_season_id).first()
        return f.announcement_display_name

    @staticmethod
    def get_file_count(proposal_season_id):
        count = db.session.query(ProposalSeasonAnnouncement).filter(ProposalSeasonAnnouncement.proposal_season_id == proposal_season_id).count()
        return count

class ObservationType(str,Enum):
    # 科学运行系统xsd里的字段
    GP_PPT_LT="SingleObs"
    GP_PPT_ST="GP-PPT-ST"
    GP_PPT_MT="MonitoringObs"
    GP_PPT_TT="TileObs"
    GP_CAL="GP-CAL"
    TOO_NOM_AT="ToO-NOM-AT"
    TOO_MM="ToO-MM"
    TOO_NOM_XRT="ToO-NOM-XRT"
    
    @classmethod
    def from_str(cls,value):
        
        # 如果是来自空间中心的xsd，直接映射
        for obs_type in cls:
            if obs_type==value:
                return obs_type
        # 金驰川的表里的字段转化为xsd的表示
        return {
            "Survey":cls.GP_PPT_ST,
            "Monitoring":cls.GP_PPT_MT,
            "ToO_monitoring":cls.TOO_NOM_AT,
            "Tilling":cls.GP_PPT_TT,
            "ToO_tilling":cls.TOO_NOM_AT,
            "Calibration":cls.GP_CAL,
            "Single Obs":cls.GP_PPT_LT,
            "ToO_single":cls.TOO_NOM_AT,
            "ToOMM":cls.TOO_MM,
            "ToO_xrt":cls.TOO_NOM_XRT
            
        }.get(value)
    
    @classmethod
    def to_sci_execution_format(cls,v:str):
        if v.startswith("GP"):
            return v
        elif v.startswith("ToO"):
            return v
        else:
            return {
                "Survey":"GP-PPT-ST",
                "Monitoring":"GP-PPT-MT",
                "MonitoringObs":"GP-PPT-MT",
                "Tilling":"GP-PPT-TT",
                "TileObs":"GP-PPT-TT",
                "Calibration":"GP-CAL",
            6   "Single Obs":"GP-PPT-LT",
                "SingleObs":"GP-PPT-LT",
                
            }[v]
class ProposalEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,Proposal):
            return {
                "id":o.id,
                "proposal_no":o.proposal_number,
                "pi":o.get_pi_name(),
                "title":o.proposal_title,
                "request_time":o.total_time_request/1000,
                "source_number":len(o.proposal_source_list),
                "proposal_category":o.type1.name,
                "stp":o.stp,
                "obs_type":o.obs_type,
                "is_anti_too":o.is_anticipate_too_gp(),               
            }
        return super().default(o)

class Proposal(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal'
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    #
    proposal_season_id = db.Column(db.Integer, index=True)
    season:str = db.Column(db.String(64), index=True)
    code = db.Column(db.Integer, index=True, default=0)
    # 是否是预置ToO
    preset_too_no = db.Column(db.String(20))
    expiration = db.Column(db.DateTime, index=True)
    # 用于撤回该申请，撤回的申请需要保留申请号
    can_submit_again = db.Column(db.Boolean, default=False)
    #
    proposal_number = db.Column(db.String(64), unique=True, index=True)
    resubmission = db.Column(db.Boolean, default=False)
    resubmission_numbers = db.Column(db.Text)
    #stp
    stp = db.Column(db.String(10), index=True)
    # 秒
    total_time_request = db.Column(db.Float, default=0)
    total_time_assigned = db.Column(db.Float, default=0)
    # 等级ABCD
    priority = db.Column(db.String(6), index=True, default='Z')
    # 上传方式：ToO-EX、ToO-NON-AT、ToO-MM、GP-PPT-LT、GP-PPT-ST、GP-PPT-MT、GP-PPT-TT、GP-CAL
    upload_type = db.Column(db.String(15), index=True)
    # 紧急程度：urgent，normal
    urgency = db.Column(db.String(10), index=True)
    # 评分
    score = db.Column(db.Float, default=-1)
    # 摘要
    proposal_title = db.Column(db.Text, default='')
    proposal_abstract = db.Column(db.Text, default='')
    # 文字是否完备
    content_status = db.Column(db.Boolean, default=False)
    # 设备是否完备
    equipment_status = db.Column(db.Boolean, default=False)
    # 创建时间
    create_time = db.Column(db.DateTime, default=datetime.now)
    # 提交时间
    submit_time = db.Column(db.DateTime)
    # 唯一标识符
    identification = db.Column(db.String(256), unique=True, index=True)
    # 状态，是否提交了
    submit_status = db.Column(db.Boolean, default=False)
    # 技术评审
    technical_review_finished = db.Column(db.Boolean, default=False)
    # 已完成评审
    scientific_review_finished = db.Column(db.Boolean, default=False)
    # 最终评审意见
    final_review_comment = db.Column(db.Text, default='')
    final_review_comment_finished = db.Column(db.Boolean, default=False)
    open_to_pi = db.Column(db.Boolean, default=True)
    force_open_to_pi = db.Column(db.Boolean, default=False)
    # 已经创建项目
    project_created = db.Column(db.Boolean, default=False)
    pid = db.Column(db.String(64), index=True, default='')
    # 已经导入源表
    project_source_created = db.Column(db.Boolean, default=False)
    # 正文上传
    science_case_storage_name = db.Column(db.String(256))
    science_case_display_name = db.Column(db.String(256))
    science_case_upload_status = db.Column(db.Boolean, default=False)
    #
    lock = db.Column(db.Boolean)
    # 外键关联
    proposal_scientific_category = db.relationship('ProposalScientificCategory', back_populates='proposal')
    proposal_investigator: List['ProposalInvestigator'] = db.relationship('ProposalInvestigator', back_populates='proposal')
    proposal_expert = db.relationship('ProposalExpert', back_populates='proposal')
    proposal_review_expert = db.relationship('ProposalReviewExpert', back_populates='proposal')
    
    # 因为proposal_source_list需要根据obs_type筛选，改名
    _proposal_source_list:List['ProposalSourceList'] = db.relationship('ProposalSourceList', back_populates='proposal',order_by="ProposalSourceList.start_time", )

    
    def get_next_source_index(self):
        if len(self._proposal_source_list)>0:
            try:
                max_source_index = max(item.source_index_in_proposal for item in self._proposal_source_list)
            except Exception as e:
                # 处理空列表的情况，比如给一个默认值
                max_source_index = None
        else:
            # 处理空列表的情况，比如给一个默认值
            max_source_index = 0  # 或者任何你认为合适的默认值
        if max_source_index is None:
            return None
        return max_source_index+1

    @property
    def proposal_source_list(self)->List['ProposalSourceList']:
        return [psl for psl in self._proposal_source_list if psl.source_type==self.obs_type]

    @property
    def srcs_total_time(self)->Dict[str,int]:
        """
        计算总时间
        :return: Dict[str,int]，包括“orbits"和"seconds"
        """
        if self.type2==ProposalType2.AnticipateToO:
            total_orbits = sum([
            src.exposure_time 
            for src in self.proposal_source_list
            if src.exposure_unit == "orbit"
            ])
            total_seconds = sum([
                src.exposure_time * src.trigger_probability
                for src in self.proposal_source_list
                if src.exposure_unit == "second"
            ])
        else:
            total_orbits = sum([
                src.exposure_time
                for src in self.proposal_source_list
                if src.exposure_unit == "orbit"
            ])
            total_seconds = sum([
                src.exposure_time
                for src in self.proposal_source_list
                if src.exposure_unit == "second"
            ])
        return {
            "orbits":total_orbits,
            "seconds":total_seconds
        }
    # FXT, WXT
    # proposal_equipment_backend = db.relationship('ProposalEquipmentBackend', back_populates='proposal')
    proposal_technical_review = db.relationship('ProposalTechnicalReview', back_populates='proposal')

    # proposal type
    type1 = db.Column(db.Enum(ProposalType1), index=True,default=ProposalType1.STP)
    type2:ProposalType2 = db.Column(db.Enum(ProposalType2), index=True, default=ProposalType2.NonToo)

    # observation type
    obs_type: ObservationType = db.Column(db.String(50))
    # Anticipate Too's trigger criteria, reaction, time and observing strategy
    ant_too_trig_criteria =  db.Column(db.Text)
    # 说明是否是joint obs/ co-observation
    other_remarks =  db.Column(db.Text)

    def get_too_source(self):
        if self.is_too_proposal():
            return self.proposal_source_list[0]
        else:
            return None
    
    def get_season(self):
        season = db.session.query(ProposalSeason).filter(ProposalSeason.id == self.proposal_season_id).first()
        return season
    
    # too中判断是否是anticipate too
    def is_anticipate_too(self):
        if self.is_too_proposal() and self.preset_too_no:
            return True
        else:
            return False
        
    def is_anticipate_too_gp(self):
        if self.type2==ProposalType2.AnticipateToO:
            return True
        else:
            return False

    def is_go_or_calibration(self):
        if self.type2 == ProposalType2.GuestObserver or self.type2 ==  ProposalType2.Calibration or self.type2 ==  ProposalType2.NonToo or self.type2 ==  ProposalType2.AnticipateToO:
    
            return True
        else:
            return False
    def is_too_proposal(self):
        if self.type1 == ProposalType1.TOO or self.type1 ==  ProposalType1.TOOMM:
    
            return True
        else:
            return False
        
        
    def get_obs_time(self):
        if self.is_too_proposal():
            # ToO每次只提交一个源
            if len(self.proposal_source_list)>0:
                src = self.proposal_source_list[0]
                if src.start_time is not None:
                    return src.start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
                else:
                    return ""
            else:
                return ""
        else:
                return ""
    
    # 是否是EP内部团队才能提交的calibration、tomm
    def is_inner_proposal(self):
        if self.type2 == ProposalType2.Calibration or self.type1 ==  ProposalType1.TOOMM:
            return True
        else:
            return False

    def show_review_to_pi(self):
        season = db.session.query(ProposalSeason).filter(ProposalSeason.id == self.proposal_season_id).first()
        # 全部统一开放
        if season.open_to_pi_final_review_comment:
            # 自身开放
            if self.open_to_pi:
                return True
            else:
                return False
        else:
            # 没有统一开放的前提下,强制开放本条意见
            if self.force_open_to_pi:
                return True
            else:
                return False

    def get_open_to_pi_final_review_comment(self):
        season = db.session.query(ProposalSeason).filter(ProposalSeason.id == self.proposal_season_id).first()
        return season.open_to_pi_final_review_comment

    def get_average_error(self):
        r = ProposalReviewExpert.query.filter(ProposalReviewExpert.proposal_id == self.id, ProposalReviewExpert.submit_status == True, ProposalReviewExpert.is_sure == True)
        reviewers, count = r.all(), r.count()
        if count == 0:
            return '', ''
        elif count == 1:
 5          return reviewers[0].score, 0
        else:
            # 权重
            s = ProposalSeason.query.filter(ProposalSeason.id == self.proposal_season_id).first()
            inner_weight, outer_weight = s.inner_expert_weight, s.outer_expert_weight
            # 计算平均值
            # 先获得专家对应的权重，平均值，权重和
            reviewer_weight, weight_plus, weight_multiply, average = [], 0, 0, 0
            for reviewer in reviewers:
                if reviewer.is_outer_type():
                    reviewer_weight.append(outer_weight)
                    weight_plus += outer_weight
                    weight_multiply += outer_weight * reviewer.score
                else:
                    reviewer_weight.append(inner_weight)
                    weight_plus += inner_weight
                    weight_multiply += inner_weight * reviewer.score
            average = weight_multiply / weight_plus
            # 标准差
            standard_error = 0
            for i in range(0, count):
                standard_error += reviewer_weight[i] * pow(reviewers[i].score - average, 2)
            standard_error = pow(standard_error / ((count - 1) * weight_plus), 0.5)
            return average, standard_error

    def get_case_file_path(self):
        season_dir = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'seasons')
        this_season_dir = os.path.join(season_dir, str(self.proposal_season_id))
        save_path = os.path.join(this_season_dir, 'case')
        return os.path.join(save_path, self.science_case_storage_name)

    def get_proposal_status(self):
        current_time = datetime.fromtimestamp(time.mktime(time.localtime()))
        if self.submit_status:
            # if self.project_created:
            #     return 'Project Released'
            # if self.scientific_review_finished:
            if self.final_review_comment_finished:
                return 'Reviewed'
            # if current_time < self.expiration:
            return 'Submitted'
        # if current_time > self.expiration:
        #     return 'Under Review'
        else:
            return 'Draft'

    def get_proposal_type1(self):
        if self.type1== ProposalType1.STP:
            return "STP"
        elif self.type1== ProposalType1.TOO:
            return "ToO"
        elif self.type1== ProposalType1.TOOMM:
            return "ToO-MM"
        elif self.type1== ProposalType1.GO:
            return "GO"
        else:
            return ""

    def get_last_next_proposal_id(self):
        la = db.session.query(Proposal).filter(Proposal.code < self.code, Proposal.proposal_season_id == self.proposal_season_id, Proposal.submit_status == True).order_by(Proposal.code.desc()).first()
        ne = db.session.query(Proposal).filter(Proposal.code > self.code, Proposal.proposal_season_id == self.proposal_season_id, Proposal.submit_status == True).order_by(Proposal.code).first()
        if la is not None and ne is not None:
            return la.id, ne.id
        elif la is None and ne is not None:
            return -1, ne.id
        elif la is not None and ne is None:
            return la.id, -1
        else:
            return -1, -1

    def get_no(self):
        if not self.submit_status:
            return '----'
        if self.proposal_number is not None:
            return self.proposal_number
        else:
            no = '0000' + str(self.code)
            return self.season.replace(" ","_") + '-' + no[-4:]

    def get_file_name(self):
        if self.scientific_review_finished:
            if self.priority != 'D':
                return self.pid + '.pdf'
            else:
                return self.get_no() + '.pdf'

        if self.submit_status:
            no = '0000' + str(self.code)
            return 'EP-' + self.season + '-' + no[-4:] + '.pdf'

        return 'ep-proposal.pdf'

    def get_download_type_name(self, download_type):
        if download_type == 'pid':
            return self.get_file_name()

        elif download_type == 'sqb':
            no = '0000' + str(self.code)
            return 'EP-' + self.season + '-' + no[-4:] + '.pdf'

        else:
            return 'ep-proposal.pdf'

    def get_assigned_time(self):
        if not self.scientific_review_finished:
            return '----'
        else:
            return self.total_time_assigned

    def get_priority(self):
        if not self.scientific_review_finished:
            return '-'
        else:
            return self.priority

    @staticmethod
    def create_identification():
        src = string.ascii_letters + string.digits
        identification = time.strftime("%Y%m%d%H%M%S", time.localtime()) + '_' + current_user.email + '_' + "".join(random.sample(src, 6))
        if len(identification) > 256:
            return identification[-256:-1]
        else:
            return identification

    @staticmethod
    def get_submitted_season_proposal_number(proposal_season_id):
        count = db.session.query(Proposal).filter(Proposal.proposal_season_id == proposal_season_id, Proposal.submit_status == True).count()
        return count

    @staticmethod
    def get_total_season_proposal_number(proposal_season_id):
        count = db.session.query(Proposal).filter(Proposal.proposal_season_id == proposal_season_id).count()
        return count

    @staticmethod
    def get_season_name_by_id(proposal_id):
        p = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        return p.season

    @staticmethod
    def set_science_case_name(proposal_id):
        return proposal_id + '_' + time.strftime("%Y%m%d%H%M%S", time.localtime()) + '.pdf'

    @staticmethod
    def get_word_number(txt):
        number = txt.split(' ')
        return len(number)

    def get_pi_name(self):
        return ProposalInvestigator.get_pi_name(proposal_id=self.id)

    def get_pi_email(self):
        return ProposalInvestigator.get_pi_email(proposal_id=self.id)

    def get_pi_group(self):
        return self.proposal_investigator[0].user_group

    # 已经提交
    def has_submitted(self):
        if self.submit_status:
            return True
        else:
            return False

    # 是pi
    def is_pi(self):
        if ProposalInvestigator.get_role(proposal_id=self.id) == 'pi':
            return True
        else:
            return False

    # 已经过期
    def has_expired(self):
        current_time = datetime.fromtimestamp(time.mktime(time.localtime()))
        # 过期后打开这个仍可以提交
        if self.can_submit_again:
            return False
        if self.expiration < current_time:
            return True
        else:
            return False

    # 是否是项目成员
    # def is_number(self):
    #     return ProposalInvestigator.has_role_to_access(proposal_id=self.id)

    def get_review_experts_count(self):
        return ProposalReviewExpert.query.filter(ProposalReviewExpert.proposal_id == self.id, ProposalReviewExpert.is_sure == True).count()

    def get_review_experts_read_count(self):
        return ProposalReviewExpert.query.filter(ProposalReviewExpert.proposal_id == self.id, ProposalReviewExpert.read_status == True, ProposalReviewExpert.is_sure == True).count()

    def get_review_experts_submit_count(self):
        return ProposalReviewExpert.query.filter(ProposalReviewExpert.proposal_id == self.id, ProposalReviewExpert.submit_status == True, ProposalReviewExpert.is_sure == True).count()

    @staticmethod
    def can_review(proposal_id):
        email = format_email(current_user.email.lower())
        p = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.email.in_(tuple(email)), ProposalReviewExpert.proposal_id == proposal_id, ProposalReviewExpert.is_sure == True).first()
        if p:
            return True
        else:
            return False

    @staticmethod
    def get_can_review_count():
        email = format_email(current_user.email.lower())
        count = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.email.in_(tuple(email)), ProposalReviewExpert.is_sure == True).count()
        return count

    @staticmethod
    def get_need_to_review_count():
        email = format_email(current_user.email.lower())
        count = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.email.in_(tuple(email)), ProposalReviewExpert.submit_status == False, ProposalReviewExpert.is_sure == True).count()
        return count

    def get_proposal_science_type(self):
        tys = db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == self.id).all()
        sc = ''
        for t in tys:
            if t.category != 'Other':
                sc = sc + t.category + ' / '
            else:
                sc = sc + t.category_content + ' / '
        if sc.endswith(' / '):
            sc = sc[:-3]
        return sc

    def get_proposal_technical_review(self):
        reviews = db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == self.id).all()
        r = []
        for review in reviews:
            r.append({'review_result': review.review_result, 'content': review.content})
        return r

    def get_proposal_technical_review_result(self):
        if self.technical_review_finished:
            technical_review = db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == self.id).first()
            if technical_review is not None:
                if technical_review.review_result == 'YES':
                    return 'Y'
                elif technical_review.review_result == 'Partial':
                    return 'P'
                else:
                    return 'N'
            else:
                return '-'
        else:
            return '-'
    def get_proposal_by_aticipate_no(self):
        p = db.session.query(Proposal).filter(Proposal.get_no() == self.preset_too_no).first()
        return p

    @staticmethod
    def get_statistics_proposals():
        count = db.session.query(Proposal).filter(Proposal.submit_status == True).count()
        return count
    @staticmethod
    def get_proposal_by_no(number):
        p = db.session.query(Proposal).filter(Proposal.no == number).first()
        return p

    @staticmethod
    def get_source_list_txt_all(proposal_id):
        sources = db.session.query(ProposalSourceList).filter(ProposalSourceList.proposal_id == proposal_id).all()
        proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        s_list = []
        s_value = ''
        for s in sources:
            s_value = proposal.get_no().ljust(20, ' ') + '    ' + s.source_name.ljust(20, ' ') + ' | ' + s.source_des.ljust(20, ' ') + ' | ' + str(s.integration_time).ljust(20, ' ') + ' | ' + s.ra.ljust(15, ' ') + ' | ' + s.dec.ljust(15, ' ') + ' | ' + str(s.number).ljust(15, ' ') + ' | ' + s.energy_level.ljust(15, ' ') + ' | ' + s.count_rate.ljust(15, ' ') + ' | ' + s.specify_time.ljust(15, ' ')+ ' | ' + str(s.variable_source).ljust(15, ' ') + ' | ' + str(s.off_axis).ljust(15, ' ') + ' | ' + str(s.monitoring).ljust(15, ' ') + ' | ' + str(s.preset_too_no).ljust(15, ' ')
            s_list.append(s_value)
        return s_list

    def clear_sources(self):
        ProposalSourceList.query.filter(ProposalSourceList.proposal_id==self.id).delete()
        db.session.commit()

    def withdraw(self):
        self.submit_status = False
        db.session.commit()

    def index_srcs(self,order:Dict=dict()):
        source_list:List[ProposalSourceList] = self.proposal_source_list
        if order.__len__()==len(source_list):
            for s in source_list:
                s.source_index_in_proposal = order.get(s.id,0)
        else:
            try:
                src_ordered = sorted(source_list, key=lambda x: x.source_index_in_proposal)
                for idx,source in enumerate(src_ordered):
                    source.source_index_in_proposal = idx+1
            except Exception as e:
                for idx,source in enumerate(source_list):
                    source.source_index_in_proposal = idx+1
        db.session.commit()

class ProposalScientificCategory(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal_scientific_category'
    id = db.Column(db.Integer, primary_key=True)
    # 外键
    proposal_id = db.Column(db.Integer, db.ForeignKey('tdic.proposal.id'), index=True)
    proposal = db.relationship('Proposal', back_populates='proposal_scientific_category')
    # 分类
    category = db.Column(db.String(128), index=True)
    category_content = db.Column(db.Text)

    def to_json_serialize(self):
        columns = [c.key for c in class_mapper(self.__class__).columns]
        return dict((c, getattr(self, c)) for c in columns)

    @staticmethod
    def get_dict_list(proposal_id):
        psc = db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == proposal_id).all()
        psc_list = []
        for p in psc:
            v = {'category': p.category, 'category_content': p.category_content, 'proposal_id': p.proposal_id, 'id': p.id}
            psc_list.append(v)
        return psc_list

    @staticmethod
    def get_list(proposal_id):
        psc = db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == proposal_id).all()
        psc_list = []
        other_content = ''
        for p in psc:
            psc_list.append(p.category)
            if p.category == 'Other':
                other_content = p.category_content
        return psc_list, other_content
    
    @staticmethod
    def get_other_content(proposal_id):
        psc = db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == proposal_id).all()
        other_content = ''
        for p in psc:
            if p.category == 'Other':
                other_content = p.category_content
        return other_content



class ProposalTechnicalReview(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal_technical_review'
    id = db.Column(db.Integer, primary_key=True)
    # 外键
    proposal_id = db.Column(db.Integer, db.ForeignKey('tdic.proposal.id'), index=True)
    proposal = db.relationship('Proposal', back_populates='proposal_technical_review')
    review_result = db.Column(db.String(1024), index=True)
    name = db.Column(db.String(32))
    email = db.Column(db.String(256), index=True)
    submit_time = db.Column(db.DateTime, default=datetime.now)
    content = db.Column(db.Text, default='')
    open_to_pi = db.Column(db.Boolean, default=True)
    force_open_to_pi = db.Column(db.Boolean, default=False)

    @staticmethod
    def get_technical_review_excel(proposal_id):
        tr = db.session.query(ProposalTechnicalReview).filter(ProposalTechnicalReview.proposal_id == proposal_id).first()
        if tr is None:
            return '', ''
        else:
            return tr.review_result, tr.content

    # 是否显示这条意见
    def show_review_to_pi(self):
        proposal = db.session.query(Proposal).filter(Proposal.id == self.proposal_id).first()
        season = db.session.query(ProposalSeason).filter(ProposalSeason.id == proposal.proposal_season_id).first()
        # 全部统一开放
        if season.open_to_pi_technical_review_comment:
            # 自身开放
            if self.open_to_pi:
                return True
            else:
                return False
        else:
            # 没有统一开放的前提下,强制开放本条意见
            if self.force_open_to_pi:
                return True
            else:
                return False



class ProposalExpert(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal_expert'
    id = db.Column(db.Integer, primary_key=True)
    # 外键
    proposal_id = db.Column(db.Integer, db.ForeignKey('tdic.proposal.id'), index=True)
    proposal = db.relationship('Proposal', back_populates='proposal_expert')
    #
    name = db.Column(db.String(32))
    institution = db.Column(db.String(300))
    create_time = db.Column(db.DateTime, default=datetime.now)

    @staticmethod
    def get_experts(proposal_id):
        e = db.session.query(ProposalExpert).filter(ProposalExpert.proposal_id == proposal_id).all()
        return e


class ProposalReviewExpert(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal_review_expert'
    id = db.Column(db.Integer, primary_key=True)
    # 外键
    proposal_id = db.Column(db.Integer, db.ForeignKey('tdic.proposal.id'), index=True)
    proposal = db.relationship('Proposal', back_populates='proposal_review_expert')
    #
    name = db.Column(db.String(32), index=True)
    email = db.Column(db.String(256), index=True)
    create_time = db.Column(db.DateTime, default=datetime.now)
    submit_time = db.Column(db.DateTime, default=datetime.now)
    submit_status = db.Column(db.Boolean, default=False)
    read_status = db.Column(db.Boolean, default=False)
    content = db.Column(db.Text, default='')
    score = db.Column(db.Float, default=0)
    familiar = db.Column(db.String(32))
    # 是否可以评审
    is_sure = db.Column(db.Boolean, default=False)
    # 内部还是外部专家
    reviewer_type = db.Column(db.String(32), index=True)
    # 评审截止时间
    review_deadline = db.Column(db.DateTime, index=True)
    # 是否开放给PI
    open_to_pi = db.Column(db.Boolean, default=True)
    force_open_to_pi = db.Column(db.Boolean, default=False)

    # 是否显示这条意见
    def show_review_to_pi(self):
        proposal = db.session.query(Proposal).filter(Proposal.id == self.proposal_id).first()
        season = db.session.query(ProposalSeason).filter(ProposalSeason.id == proposal.proposal_season_id).first()
        if self.submit_status:
            # 全部统一开放
            if season.open_to_pi_scientific_review_comment:
                # 自身开放
                if self.open_to_pi:
                    return True
                else:
                    return False
            else:
                # 没有统一开放的前提下,强制开放本条意见
                if self.force_open_to_pi:
                    return True
                else:
                    return False
        else:
            return False

    # 所有选择的评审专家，包括未确认的
    @staticmethod
    def get_review_experts_all(proposal_id):
        res = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.proposal_id == proposal_id).all()
        return res

    # 所有确认的评审专家
    @staticmethod
    def get_review_experts(proposal_id):
        res = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.proposal_id == proposal_id, ProposalReviewExpert.submit_status == True, ProposalReviewExpert.is_sure == True).all()
        return res

    # 评审截止时间
    @staticmethod
    def get_review_expiration(proposal_review_expert_id):
        pre = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == proposal_review_expert_id).first()
        return pre.review_deadline

    def is_outer_type(self):
        user = db.session.query(User).filter(User.email.in_(format_email(self.email))).first()
        if user.is_outer_expert():
            return True
        return False

    @staticmethod
    def mark_as_read(rid):
        db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.id == rid).update({'read_status': True})
        db.session.commit()

    @staticmethod
    def get_proposal_review_excel(proposal_id, max_count):
        scores, contents = ['' for i in range(0, max_count)], ['' for i in range(0, max_count)]
        rs = db.session.query(ProposalReviewExpert).filter(ProposalReviewExpert.proposal_id == proposal_id, ProposalReviewExpert.is_sure == True, ProposalReviewExpert.submit_status == True)
        reviews, count = rs.all(), rs.count()
        loop_count = count if count <= max_count else max_count
        for i in range(0, loop_count):
            scores[i] = reviews[i].score
            contents[i] = reviews[i].content
        return scores, contents

    @staticmethod
    def get_awaiting_review_proposals(email):
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        select_proposals = db.session.query(Proposal, ProposalReviewExpert, ProposalSeason).filter(ProposalReviewExpert.email.in_(format_email(email)),
                                                                                                   ProposalReviewExpert.is_sure == True,
                                                                                                   ProposalReviewExpert.submit_status == False,
                                                                                                   Proposal.proposal_season_id == ProposalSeason.id,
                                                                                                   Proposal.id == ProposalReviewExpert.proposal_id,
                                                                                                   ProposalSeason.review_deadline > current_time).all()
        proposals = []
        for v in select_proposals:
            proposals.append(v[0])
        return proposals


class ProposalInvestigator(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal_investigator'
    id = db.Column(db.Integer, primary_key=True)
    # 外键
    proposal_id = db.Column(db.Integer, db.ForeignKey('tdic.proposal.id'), index=True)
    proposal = db.relationship('Proposal', back_populates='proposal_investigator')
    #
    #
    user_id = db.Column(db.Integer, db.ForeignKey('tdic.user.id'), index=True)
    # user = db.relationship('User', back_populates='proposal_investigator')

    name = db.Column(db.String(32), index=True)
    first_name =db.Column(db.String(32))
    last_name = db.Column(db.String(32))
    email = db.Column(db.String(256), index=True)
    role = db.Column(db.String(8), index=True)
    institution = db.Column(db.String(300))
    phone = db.Column(db.String(64))
    user_group= db.Column(db.String(20))
    title = db.Column(db.String(25))
    country = db.Column(db.String(25))
    #
    create_time = db.Column(db.DateTime, default=datetime.now)
    # 唯一标识符
    identification = db.Column(db.String(256), index=True)

    def get_proposal_ids(self):
        ids = [v[0] for v in db.session.query(ProposalInvestigator.id).filter(ProposalInvestigator.email.in_(format_email(current_user.email)), ProposalInvestigator.role == 'pi').all()]
        return ids

    @staticmethod
    def has_role_to_access(proposal_id):
        p = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.email.in_(tuple(format_email(current_user.email.lower())))).first()
        if p is None:
            return False
        else:
            return True

    @staticmethod
    def get_co_i(proposal_id):
        # cois = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role != 'pi').order_by(ProposalInvestigator.create_time).all()
        cois = ProposalInvestigator.query.filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role != 'pi').order_by(ProposalInvestigator.create_time).all()
        return cois

    @staticmethod
    def get_pi(proposal_id):
        pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
        return pi

    @staticmethod
    def get_pi_name(proposal_id):
        pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
        if pi is None:
            return proposal_id
        if pi.first_name is not None:

            return pi.first_name+ " "+ pi.last_name
        elif pi.name is not None:
            return pi.name
        else:
            return '----'
    @staticmethod
    def get_pi_email(proposal_id):
        pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
        return pi.email

    @staticmethod
    def get_pi_value(proposal_id):
        pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
        return pi.title, pi.name, pi.first_name, pi.last_name, pi.email, pi.institution, pi.phone,  pi.user_group,pi.country

    @staticmethod
    def get_pi_pid(proposal_id):
        pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
        proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        return proposal.get_pi_name(), pi.email, proposal.pid

    @staticmethod
    def can_edit(proposal_id):
        p = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.email.in_(tuple(format_email(current_user.email.lower())))).first()
        if p.role == 'pi':
            return True
        else:
            return False

    @staticmethod
    def get_role(proposal_id):
        p = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.email.in_(tuple(format_email(current_user.email.lower())))).first()
        return p.role

    @staticmethod
    def has_same_email(email, proposal_id):
        v = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.email.in_(format_email(email.lower()))).first()
        if v is None:
            return False
        else:
            return True

    @staticmethod
    def get_co_is(proposal_id):
        cois = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role != 'pi').all()
        return cois

    @staticmethod
    def get_co_value(proposal_id):
        cois = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role != 'pi').order_by(ProposalInvestigator.id)
        return cois.all(), cois.count()

    @staticmethod
    def get_pi_papers_excel(proposal_id):
        pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
        user = db.session.query(User).filter(User.email.in_(tuple(format_email(pi.email.lower())))).first()
        papers = db.session.query(Paper).filter(Paper.user_id == user.id).all()
        paper_list = ''
        for paper in papers:
            paper_list = paper_list + paper.get_output_str()
        return paper_list

    # 已提交
    @staticmethod
    def get_submitted_proposals(email):
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        tmp = db.session.query(Proposal, ProposalInvestigator, ProposalSeason).filter(ProposalInvestigator.email.in_(tuple(format_email(email))),
                                                                                      ProposalInvestigator.proposal_id == Proposal.id,
                                                                                      Proposal.proposal_season_id == ProposalSeason.id,
                                                                                      Proposal.expiration > current_time,
                                                                                      Proposal.submit_status == True,
                                                                                      Proposal.scientific_review_finished == False
                                                                                      ).all()
        return tmp

    # 正在评审中
    @staticmethod
    def get_reviewing_proposals(email):
        current_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        tmp = db.session.query(Proposal, ProposalInvestigator, ProposalSeason).filter(ProposalInvestigator.email.in_(tuple(format_email(email))),
                                                                                      ProposalInvestigator.proposal_id == Proposal.id,
                                                                                      Proposal.proposal_season_id == ProposalSeason.id,
                                                                                      Proposal.expiration < current_time,
                                                                                      Proposal.submit_status == True,
                                                                                      Proposal.scientific_review_finished == False
                                                                                      ).all()
        return tmp

    # 已经评审,最后三个
    @staticmethod
    def get_reviewed_proposals(email):
        tmp = db.session.query(Proposal, ProposalInvestigator, ProposalSeason).filter(ProposalInvestigator.email.in_(tuple(format_email(email))),
                                                                                      ProposalInvestigator.proposal_id == Proposal.id,
                                                                                      Proposal.proposal_season_id == ProposalSeason.id,
                                                                                      Proposal.submit_status == True,
                                                                                      Proposal.scientific_review_finished == True
                                                                                      ).order_by(Proposal.id.desc())
        temp, count = tmp.limit(3).all(), tmp.count()
        return temp, count

    @staticmethod
    def get_reviewed_result_info_to_email(proposal_id):
        reviewed_proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
        dict_info = {'name': reviewed_proposal.get_pi_name(), 'title': reviewed_proposal.proposal_title, 'grade': reviewed_proposal.priority, 'pid': reviewed_proposal.pid, 'assigned_time': reviewed_proposal.total_time_assigned}
        if reviewed_proposal.priority == 'D':
            dict_info['pid'] = ''
        return dict_info, pi.email

    @staticmethod
    def get_pi_info_to_email(proposal_id):
        reviewed_proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
        pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
        dict_info = {'name': reviewed_proposal.get_pi_name(), 'title': reviewed_proposal.proposal_title}
        
        return dict_info, pi.email
        
    @classmethod
    def create(cls,user:User,proposal:Proposal):
        """PI的简单工厂函数，根据User和Proposal创建

        Returns:
            _type_: _description_
        """
        return ProposalInvestigator(proposal_id=proposal.id,title=user.title,first_name=user.first_name,last_name=user.last_name, email=user.email.lower(), role='pi', institution=user.institution, user_group=user.user_group, phone=user.phone)

class ProposalSourceListEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,ProposalSourceList):
            return {
                "id":o.id,
                "source_index_in_proposal":o.source_index_in_proposal,
                "proposal_id":o.proposal_id,
                "source_name":o.source_name,
                "obs_type":o.source_type,
                "ra":o.ra,
                "dec":o.dec,
                "total_exposure_time":o.exposure_time*o.trigger_probability if o.trigger_probability is not None else o.exposure_time,
                "trigger_probability":o.trigger_probability,
                "exposure_time_unit":o.exposure_unit,
                "continous_exposure":o.continous_exposure,
                "visit_number":o.visit_number,
                "exposure_per_vist_min":o.exposure_per_vist_min,
                "exposure_per_vist_max":o.exposure_per_vist_max,
                "completeness":o.completeness,
                "cadence":o.monitoring_cadence,
                "cadence_unit":o.cadence_unit,
                "precision":o.precision,
                "precision_unit":o.precision_unit,
                "start_time":o.start_time.isoformat() if o.start_time is not None else 'null',
                "end_time":o.end_time.isoformat() if o.end_time is not None else 'null',
                
            }
        return super().default(o)


class ProposalSourceList(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'proposal_source_list'
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    # 该源在提案中的次序
    source_index_in_proposal:int =  db.Column(db.Integer)
    # 外键
    proposal_id = db.Column(db.Integer, db.ForeignKey('tdic.proposal.id'), index=True)
    proposal:Proposal = db.relationship('Proposal', back_populates='_proposal_source_list')
    # 以下为不同源的观测模式,坐标信息
    source_name = db.Column(db.String(32), nullable=False, index=True)
    ra = db.Column(db.Float)
    dec = db.Column(db.Float)
    source_type  = db.Column(db.String(20))
    # 目标流量（Counts Rate）
    count_rate = db.Column(db.Float)
    #2目标能段上限
    energy_upper = db.Column(db.Float)
    # 目标能段下限
    energy_lower = db.Column(db.Float)

    #nH
    nh = db.Column(db.Float)
    # 积分时间
    exposure_time = db.Column(db.Float)
    exposure_unit = db.Column(db.String(10))
    continous_exposure = db.Column(db.String(20))
    # 是否多次观测
    multiple_observation = db.Column(db.Boolean, default=False)
    # 观测次数
    visit_number = db.Column(db.Integer)
    # 每次观测最小曝光时长
    exposure_per_vist_min = db.Column(db.Float)
    exposure_per_vist_min_unit = db.Column(db.String(10))
    # 每次观测最大曝光时长
    exposure_per_vist_max = db.Column(db.Float)
    exposure_per_vist_max_unit = db.Column(db.String(10))
    # 监视频率,orbits or days  
    monitoring_cadence = db.Column(db.Integer)
    cadence_unit = db.Column(db.String(10))
    # 间隔精度
    precision = db.Column(db.Float)
    precision_unit = db.Column(db.String(10))
    # 完整度
    completeness = db.Column(db.Float, default=0.8)
    # 是否时间敏感
    time_critical = db.Column(db.Boolean, default=False)
    # 如果时间敏感，remark
    time_critical_remark= db.Column(db.Text)
    
    # 如果是anticipated too观测，预计触发概率
    trigger_probability = db.Column(db.Float)
    # 开始时间
    start_time = db.Column(db.DateTime)
    # 结束时间
    end_time = db.Column(db.DateTime)
    # anticipate too trigger criteria 已调整至proposal model中
    ant_too_trig_criteria= db.Column(db.String(255))
    # 是否是ToMM
    tomm =db.Column(db.Boolean, default=False)
    # tomm id 来源？s
    tomm_id = db.Column(db.String(30))
    # tomm tile id 来源？
    tomm_tile_id = db.Column(db.String(30))
    # FXT 1观测模式，默认科学，开窗模式，默认Full frame
    fxt1_obs_mode = db.Column(db.Enum(FXTObservationMode), index=True,default=FXTObservationMode.SCIENCE)
    fxt1_window_mode = db.Column(db.Enum(FXTWindowMode), index=True,default=FXTWindowMode.FULLFRAME)
    # FXT 2观测模式，默认科学，开窗模式，默认Full frame
    fxt2_obs_mode = db.Column(db.Enum(FXTObservationMode), index=True,default=FXTObservationMode.SCIENCE)
    fxt2_window_mode = db.Column(db.Enum(FXTWindowMode), index=True,default=FXTWindowMode.FULLFRAME)
    # FXT1 滤光片模式
    fxt1_filter = db.Column(db.Enum(FXTFilterType),index=True,default=FXTFilterType.THINFILTER)
    # FXT2 滤光片模式
    fxt2_filter = db.Column(db.Enum(FXTFilterType),index=True,default=FXTFilterType.THINFILTER)
    # 是否需要实时下传EXT快视数据
    fxt_data_realtime_trans = db.Column(db.Boolean, default=False)

    # WXT 配置参数，仅限定标使用
    # 配置参数开关
    wxt_cmos =  db.Column(db.String(4))
    wxt_config_param_switch = db.Column(db.String(4))
    wxt_config_force_switch = db.Column(db.String(4))
    wxt_operation_code_3 = db.Column(db.String(4))
    wxt_minnsigma_dim = db.Column(db.String(4))
    wxt_sn_dim = db.Column(db.String(4))
    wxt_sn_windows = db.Column(db.String(4))
    wxt_retention_param_1 = db.Column(db.String(4))
    wxt_retention_param_2 = db.Column(db.String(4))
    wxt_retention_param_3 = db.Column(db.String(4))

    # 源优先级
    source_priority =db.Column(db.Enum(SourcePriority),default=SourcePriority.B)

    # 
   
    wxt_x = db.Column(db.Float)
    wxt_y = db.Column(db.Float)

    fxt1_x = db.Column(db.Float)
    fxt1_y = db.Column(db.Float)

    fxt2_x = db.Column(db.Float) 
    fxt2_y = db.Column(db.Float)

    #
    fxt_flux = db.Column(db.Float)
    flux_pl_index = db.Column(db.Float)
    v_mag = db.Column(db.Float)
    variable_source = db.Column(db.Boolean, default=False)
    extend_source = db.Column(db.Boolean, default=False)
   

    @staticmethod
    def has_upload_source(proposal_id):
        s = db.session.query(ProposalSourceList).filter(ProposalSourceList.proposal_id == proposal_id).first()
        if s:
            return3True
        else:
            return False

    @staticmethod
    def get_source_list_format(proposal_id)->List["ProposalSourceList"]:
        proposal:Proposal = Proposal.query.get(proposal_id)
        sources = proposal.proposal_source_list
        # sorted by source_index_in_proposal
        try:
            sources = sorted(sources, key=lambda x: x.source_index_in_proposal)
        except:
            pass
        return sources

        # return proposal.proposal_source_list
        

    @staticmethod
    def get_source_list_txt(proposal_id):
        sources = db.session.query(ProposalSourceList).filter(ProposalSourceList.proposal_id == proposal_id).all()
        s_list = []
        for s in sources:
            title = '#Source Name'.ljust(20, ' ') + ' | ' + 'Source Description'.ljust(20, ' ') + ' | ' + 'Integration(second)'.ljust(20, ' ') + ' | ' + 'RA'.ljust(15, ' ') + ' | ' + 'DEC'.ljust(15, ' ') + ' | ' + 'Number'.ljust(15, ' ') + ' | ' + 'Energy Level'.ljust(15, ' ') + ' | ' + 'Count Rate'.ljust(15, ' ') + ' | ' + 'Specify Time'.ljust(15, ' ') + ' | ' + 'Is Vaziable?'.ljust(15, ' ') + ' | ' + 'Is Off Axis?'.ljust(15, ' ') + ' | ' + 'Is Monitoring?'.ljust(15, ' ') + 'Is Preset ToO?'.ljust(15, ' ')
            s_value = s.source_name.ljust(20, ' ') + ' | ' + s.source_des.ljust(20, ' ') + ' | ' + str(s.integration_time).ljust(20, ' ') + ' | ' + s.ra.ljust(15, ' ') + ' | ' + s.dec.ljust(15, ' ') + ' | ' + s.number.ljust(15, ' ') + ' | ' + s.energy_level.ljust(15, ' ') + ' | ' + s.count_rate.ljust(15, ' ') + ' | ' + s.specify_time.ljust(15, ' ')+ ' | ' + str(s.variable_source).ljust(15, ' ') + ' | ' + str(s.off_axis).ljust(15, ' ') + ' | ' + str(s.monitoring).ljust(15, ' ') + ' | ' + str(s.preset_too_no).ljust(15, ' ')
            s_list.append(title)
            s_list.append(s_value)
    
        return s_list

    @classmethod
    def find_by_fov(cls,fov)->List["ProposalSourceList"]:
        fov_points = f"({fov.point1.ra.value}d,{fov.point1.dec.value}d), ({fov.point2.ra.value}d,{fov.point2.dec.value}d),({fov.point3.ra.value}d,{fov.point3.dec.value}d),({fov.point4.ra.value}d,{fov.point4.dec.value}d)"
        query =  cls.query.filter(cls.source_index_in_proposal!=None).where(text("CAST ( spoint (ra*pi()/180,dec*pi()/180) AS SCIRCLE) @ spoly '{"+fov_points+"} '"))
        return query.all()


# class ProposalEquipmentReceiver(db.Model):
#     __table_args__ = {"schema":"tdic"}
#     __tablename__ = 'proposal_equipment_receiver'
#     id = db.Column(db.Integer, primary_key=True)
#     # 外键
#     proposal_id = db.Column(db.Integer, db.ForeignKey('proposal.id'), index=True)
#     proposal = db.relationship('Proposal', back_populates='proposal_equipment_receiver')
#     receiver = db.Column(db.String(30))


# class ProposalEquipmentNoise(db.Model):
#     __table_args__ = {"schema":"tdic"}
#     __tablename__ = 'proposal_equipment_noise'
#     id = db.Column(db.Integer, primary_key=True)
#     # 外键
#     proposal_id = db.Column(db.Integer, db.ForeignKey('proposal.id'), index=True)
#     proposal = db.relationship('Proposal', back_populates='proposal_equipment_noise')
#     noise_type = db.Column(db.String(30))


# class ProposalEquipmentBackend(db.Model):
#     __table_args__ = {"schema":"tdic"}
#     __tablename__ = 'proposal_equipment_backend'
#     id = db.Column(db.Integer, primary_key=True)
#     # 外键
#     proposal_id = db.Column(db.Integer, db.ForeignKey('proposal.id'), index=True)
#     proposal = db.relationship('Proposal', back_populates='proposal_equipment_backend')
#     backend = db.Column(db.String(30))
    # channel = db.Column(db.String(30))
    # sampling = db.Column(db.String(30))
    # frequency = db.Column(db.String(30))


class ProposalSrcEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o,ProposalSourceList):
            return {
                "ra":o.ra,
                "dec":o.dec,
                "proposal_id":o.proposal.get_no(),
                "src_id":f"{o.proposal.get_no()}-{o.source_index_in_proposal}"
            }
        return super().default(o)

class PV(db.Model):
    __table_args__ = {"schema":"tdic"}
    query: Query
    id:int 
    id = db.Column(db.Integer, primary_key=True)
    name:str 
    name = db.Column(db.String(30))
    stp:int 
    stp = db.Column(db.Integer)
    submit_time:datetime = db.Column(db.DateTime, default=datetime.now)
    submitter_id:int = db.Column(db.Integer, db.ForeignKey(User.id))
    
    @property
    def path(self):
        return os.path.join(current_app.config['APP_UPLOAD_PATH'], 'pvs', f'{self.id}.pdf')