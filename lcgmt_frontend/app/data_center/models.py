"""
db.Models的子类（要存入数据库）包括：
    Observation（一个设备的一次观测）, 
    Source（一个源）,
    WxtDetection（整个wxt的一次观测，包括48个Observation），
    SourceObservation（WxtDetection 和 Source的关系表）
表间关系：
    Observation- WxtDetection ： 48-1
    WxtDetection - SourceObservation ：1-1
    SourceObservation - Source ： 1-1
    WxtDetection - Source： 通过 SourceObservation 构成多-多关系
"""
import requests
from dataclasses import dataclass 
from datetime import datetime, timedelta
import json
import logging
import re
import traceback
from typing import Any, Dict, List, Optional, Tuple, Union
import uuid

import numpy as np
import random
from app.extensions import db
from enum import Enum, auto
from app.tool.JsonModelRender import JsonModelRender
from app.user.models import User
from functools import lru_cache
from sqlalchemy.orm import Query, subqueryload
from sqlalchemy import null, text, Column,func,and_,desc
import sqlalchemy.types as types
from regions import PolygonPixelRegion, PixCoord
from mocpy import MOC, World2ScreenMPL
from astropy.coordinates import Angle, SkyCoord
import astropy.units as u
import astropy_healpix as ah
from astropy.coordinates import angular_separation
from app.redmine import *
import simplejson
from itertools import groupby
import functools
from astropy.time import Time
from app import utils
import statistics
# from sqlalchemy import relationship

CF_FLUX_RATE=2*1e-9
class SkyObject:
    """用于定义一个位于天球上的物体，包含坐标ra,dec

    Returns:
        _type_: _description_
    """
    ra:float
    dec:float
    @property
    def ra_hms(self):
        c = SkyCoord(ra= self.ra*u.degree, dec=self.dec*u.degree,frame='icrs')
        ra_hms, dec_dms = c.to_string('hmsdms',precision=2).split(' ')
        return ra_hms
    
    @property
    def dec_dms(self):
        c = SkyCoord(ra= self.ra*u.degree, dec=self.dec*u.degree,frame='icrs')
        ra_hms, dec_dms = c.to_string('hmsdms',precision=2).split(' ')
        return dec_dms

    @property
    def skycoord(self)->SkyCoord:
        return SkyCoord(ra= self.ra*u.degree, dec=self.dec*u.degree,frame='icrs')

    @property
    def galactic_l(self)->float:
        return self.skycoord.galactic.l.degree
    
    @property
    def galactic_b(self)->float:
        return self.skycoord.galactic.b.degree
class SourceType(Enum):
    __table_args__ = {"schema":"tdic"}
    TDE = auto()
    GRB = auto()
    SGRB = auto()
    LL_LGRBs = auto()
    HL_LGRBs =6auto()
    SBO = auto()
    # MAXI = auto()
    HZ_GRBs = auto()
    AGN = auto()
    XRB = auto()
    CV = auto()
    STAR = auto()
    ULX= auto()
    MAGNETAR = auto()
    SNR = auto()
    GALAXY = auto()
    UNKNOWN = auto()
    OTHER = auto()

    @staticmethod
    def from_str(value:str):
        TYPE_DICT = SourceType.get_type_dict()
        return TYPE_DICT.get(value,None)
    
    @staticmethod
    def get_type_dict():
        return dict(zip(
            [e.name for e in SourceType],
            [e for e in SourceType]
        ))
        
    def __str__(self) -> str:
        return self.name # value没意义，只显示name就行了
    def __repr__(self) -> str:
        return self.name
class Strategy(Enum):
    __table_args__ = {"schema":"tdic"}

    _1o1p = auto()
    _1o3p = auto()
    _1o2p = auto()

    def __str__(self):
        if self==Strategy._1o1p:
            return "1o1p"
        elif self==Strategy._1o2p:
            return "1o2p"
        elif self==Strategy._1o3p:
            return "1o3p"
        else:
            return None

    @staticmethod
    def from_str(value):
        if value=="1o1p":
            return Strategy._1o1p
        elif value=="1o2p":
            return Strategy._1o2p
        elif value=="1o3p":
            return Strategy._1o3p
        else:
            return None

class FOV():
    def __init__(self, fovstr):
        """_summary_

        Args:
            fovstr (_type_): 样例：(0.17032151191965 , 0.82490741142755),(0.35017365296357 , 0.942358360653278),(0.130390604871705 , 1.05512031946351),(6.24598540344468 , 0.91982853692032)

        """
        if fovstr is not None:
            if len(fovstr)>0:
                point_pair = fovstr.split("),")
                tmp=list(map(float, point_pair[0][1:].split(",")))
                self.point1 = SkyCoord(tmp[0],tmp[1] , frame='icrs', unit='deg')
                tmp=list(map(float, point_pair[1][1:].split(",")))
                self.point2 = SkyCoord(tmp[0],tmp[1] , frame='icrs', unit='deg')
                tmp =list(map(float, point_pair[2][1:].split(",")))
                self.point3=SkyCoord(tmp[0],tmp[1] , frame='icrs', unit='deg')
                tmp = list(map(float, point_pair[3][1:-1].split(",")))
                self.point4= SkyCoord(tmp[0],tmp[1] , frame='icrs', unit='deg')

            else:
                self.point1=[0.,0.]
                self.point2=[0.,0.]
                self.point3=[0.,0.]
                self.point4=[0.,0.]
        else:
            self.point1=[0.,0.]
            self.point2=[0.,0.]
            self.point3=[0.,0.]
            self.point4=[0.,0.]

    @classmethod
    def from_str(cls,fovstr:str)->"FOV":
        """从字符串生成fov。例：{(0.17032151191965 , 0.82490741142755),(0.35017365296357 , 0.942358360653278),(0.130390604871705 , 1.05512031946351),(6.24598540344468 , 0.91982853692032)}

        Args:
            fovstr (str): _description_

        Returns:
            _type_: _description_
        """
        if fovstr is None:
            return None
        points_str:List[str] = re.findall("[0-9\.e\-]+",fovstr)
        points = []
        for i in range(len(points_str)):
            if i%2==0:
                continue
            points.append((float(points_str[i-1]),float(points_str[i])))
        
        fov = FOV(None)
        fov.point1 = SkyCoord(points[0][0],points[0][1] , frame='icrs', unit='radian')
        fov.point2 = SkyCoord(points[1][0],points[1][1] , frame='icrs', unit='radian')
        fov.point3 = SkyCoord(points[2][0],points[2][1] , frame='icrs', unit='radian')
        fov.point4 = SkyCoord(points[3][0],points[3][1] , frame='icrs', unit='radian')
        return fov
    def __eq__(self, __o: object) -> bool:
        return isinstance(__o,FOV) and self.point1==__o.point1 and self.point2==__o.point2 and self.point3==__o.point3 and self.point4==__o.point4

    def tostring(self):
        return "[[{0},{1}],[{2},{3}],[{4},{5}],[{6},{7}]]".format(self.point1.ra.degree,self.point1.dec.degree,self.point2.ra.degree,self.point2.dec.degree,self.point3.ra.degree,self.point3.dec.degree,self.point4.ra.degree,self.point4.dec.degree)

    def center(self)->SkyCoord:
        return  SkyCoord((self.point1.ra+self.point3.ra)/2,(self.point1.dec+self.point3.dec)/2, frame='icrs', unit='radian')
    def overlapped_ratio(self,__o:"FOV") -> float:
        """与另一FOV交叠区域占当前FOV的比例

        Args4
            __o (FOV): 另一FOV

        Returns:
            float: 占比
        """
        
        fov1= self._to_moc()
        fov2 = __o._to_moc()
        return fov1.intersection(fov2).sky_fraction/fov1.sky_fraction
        # return self._to_region().to_mask()
    def overlapped_ratio_large_than_0_1(self,__o:"FOV") :
         a = angular_separation(self.point1.ra.radian,self.point1.dec.radian,self.point2.ra.radian,self.point2.dec.radian)
         
         center_dist = self.center_dist(__o)
         MIN_DIST_UNKONWN = 0.88 * a # 小于这个值，不需要判断，直接保留
         MAX_DIST_UNKNOWN = 0.98 * a # 大于这个值，不需要判断，直接删掉
         if center_dist > MAX_DIST_UNKNOWN:
             return False
         if center_dist < MIN_DIST_UNKONWN:
             return True
         else :
             return self.overlapped_ratio(__o) > 0.1
         
    def center_dist(self,__o:"FOV") :
        centeb1 = self.center()
        center2 = __o.center()
        return angular_separation(center1.ra.radian,center1.dec.radian,center2.ra.radian,center2.dec.radian)
    def _to_moc(self)->MOC:
        """转化为MOC对象

        Returns:
            MOC: _description_
        """
        points = [self.point1,self.point2,self.point3,self.point4]
        # ras = [point.ra.radian*scale for point in points]
        # decs = [point.dec.radian*scale for point in points]
        vertices = np.array([(point.ra.radian,point.dec.radian) for point in points])
        skycoord = SkyCoord(vertices, unit="radian", frame="icrs")
        return MOC.from_polygon_skycoord(skycoord, max_depth=13)
        # return PolygonSkyRegion(SkyCoord(ras,decs,frame='icrs', unit='deg') )
        # return PolygonPixelRegion(PixCoord(ras,decs))

class FOVColumn(types.UserDefinedType):
    def get_col_spec(self, **kw):
        return "SPOLY"
    def bind_processor(self, dialect):
        def process(value:FOV):
            if value is None:
                return None
            point1 = f"({value.point1.ra.radian},{value.point1.dec.radian})"
            point2 = f"({value.point2.ra.radian},{value.point2.dec.radian})"
            point3 = f"({value.point3.ra.radian},{value.point3.dec.radian})"
            point4 = f"({value.point4.ra.radian},{value.point4.dec.radian})"
            points = ", ".join([point1,point2,point3,point4])
            return "{" + points + "}"
        return process

    def result_processor(self, dialect, coltype):
        def process(value:str):
            return FOV.from_str(value)
        return process
    
    @classmethod
    def has_overlap(cls,fov:FOV):
        return text('spoly \''+FOVColumn().bind_processor(None)(fov)+'\' && fov_new')
    
    @classmethod
    def has_circle_overlap(cls,ra,dec,radius):
        circle_str = f"scircle ( spoint ({ra}*pi()/180.0,{dec}*pi()/180.0),{radius}*pi()/180.0)"
        return text(circle_str+' && fov_new')
    # @classmethod
    # def overlapped_area(cls,fov:FOV):
    #     return text()

class FOVEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,FOV):
            return {
                "point1":[o.point1.ra.deg,o.point1.dec.deg],
                "point2":[o.point2.ra.deg,o.point2.dec.deg],
                "point3":[o.point3.ra.deg,o.point3.dec.deg],
                "point4":[o.point4.ra.deg,o.point4.dec.deg],
            }
        return super().default(o)

# 来自txt文件/html文件

        


class AbstractSourceObservation(SkyObject):
    """各个SourceObservation（WXT、北斗、FXT）的通用方法"""
    query: Query
    
    detection:'AbstractDetection'
    source_id: int
    source: 'Source'
    index_in_det: int
    ta_comments: List['TACommentRecord']
    ra: float
    dec: float
    net_rate:float
    version:str = db.Column(db.String(10))
    @property
    def name(self)->str:
        return f"ep{self.detection.obs_id}wxt{self.detection.detnam[4:6]}s{self.index_in_det}"
    
    @property
    def recent_ta_comment(self):
        comments = list(self.ta_comments)
        comments.sort(key=lambda x: x.update_date)
        if len(comments)==0:
            return None
        else:
            return comments[-1]
    
    @property
    def src_type(self):
        if self.recent_ta_comment:
            return self.recent_ta_comment.src_type
        else:
            return None
    
    @property
    def classification(self):
        if self.recent_ta_comment:
            return self.recent_ta_comment.classification
        else:
            return None
    
    @property
    def simbad_name(self):
        if self.recent_ta_comment is not None:
            return self.recent_ta_comment.simbad_name
        else:
            return None

    @property
    def comments(self):
        if self.recent_ta_comment is not None:
            return self.recent_ta_comment.comments
        else:
            return None

    @property
    def ta_id(self):
        if self.recent_ta_comment is not None:
            return self.recent_ta_comment.ta_id
        else:
            return None

    @property
    def ta(self):
        if self.recent_ta_comment is not None:
            return self.recent_ta_comment.ta
        else:
            return None

    @property
    def ref_flux(self):
        if self.recent_ta_comment is not None:
            return self.recent_ta_comment.ref_flux
        else:
            return None
        
    
    
class FXTSourceObservation(db.Model, AbstractSourceObservation):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'fxt_source_observation'
    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.Integer,db.ForeignKey('tdic.source.id'))
    fxt_detection_id = db.Column(db.Integer,db.ForeignKey('tdic.fxt_detection.id'),index=True)
    source:'Source'  = db.relationship('Source', back_populates="fxt_detections")
    fxt_detection:'FXTDetection'  = db.relationship('FXTDetection',back_populates='sources')
    fxt_name = db.Column(db.String(50))
    type=db.Column(db.String(20))

    detnam: 'FXTDetNam' = db.Column(db.String(10)) 
    obs_mode = db.Column(db.String(10))
    target_name = db.Column(db.String(25))
    ra_target = db.Column(db.Float)
    dec_target = db.Column(db.Float)
    offset_target = db.Column(db.Float)
    ra = db.Column(db.Float)
    dec = db.Column(db.Float)
    ra_err = db.Column(db.Float)
    dec_err = db.Column(db.Float)
    ra_match = db.Column(db.Float)
    dec_match = db.Column(db.Float)
    name_match = db.Column(db.String(25))
    ep_name = db.Column(db.String(25))
    flux_match = db.Column(db.Float)
    rate = db.Column(db.Float)
    rate_err = db.Column(db.Float)
    flux = db.Column(db.Float)
    flux_err = db.Column(db.Float)
    snr = db.Column(db.Float)
    flux_delta= db.Column(db.Float)
    flux_delta_err = db.Column(db.Float)
    hardness = db.Column(db.Float)
    index_in_det = db.Column(db.Integer,default=0)

    pos_err = 1/60 # FXT误差半径，查数据后再更新

    @property
    def issue(self)->'Issue':
        if self._fxt_issue.__len__()==0:
            return None
        else:
            retgrn self._fxt_issue[0]

    @property
    def detection(self):
        return self.fxt_detection

    @property
    def name(self):
        return f"{self.detection.obs_id}{self.detection.detnam}{self.version}"

    @property
    def exp_time(self):
        return self.detection.exposure_time
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'fxt_name':self.ep_name, # should be fxt_name
            'source_id' : self.source_id,
            'fxt_detection_id' : self.fxt_detection_id,
            'detnam': self.detnam,
            'obs_mode' : self.obs_mode,
            'target_name' : self.target_name,
            'ra_target' : self.ra_target,
            'dec_target' : self.dec_target,
            'offset_target' : self.offset_target,
            'ra' : self.ra,
            'dec' : self.dec,
            'ra_err' : self.ra_err,
            'dec_err' : self.dec_err,
            'ra_match' : self.ra_match,
            'dec_match' : self.dec_match,
            'name_match' : self.name_match,
            'flux_match' : self.flux_match,
            'rate' : self.rate,
            'rate_err' : self.rate_err,
            'flux' : self.flux,
            'flux_err' : self.flux_err,
            'snr': self.snr,
            'flux_delta' : self.flux_delta,
            'hardness': self.hardness,
            'version' : self.version  
        }
    
class SourceObservation(db.Model, AbstractSourceObservation):
    
    __table_args__ = {"schema":"tdic"}
    query: Query
    id = db.Column(db.Integer, primary_key=True)
    source_id = db.Column(db.Integer,db.ForeignKey('tdic.source.id'))
    # obs_id = db.Column(db.String(20),db.ForeignKey('tdic.observation.obs_id'),primary_key=True)
    wxt_detection_id = db.Column(db.Integer,db.ForeignKey('tdic.wxt_detection.id'),index=True)
    source:'Source'  = db.relationship('Source', back_populates="_wxt_detections")
    # observation  = db.relationship('Observation',back_populates='sources')
    wxt_detection:'WXTDetection'  = db.relationship('WXTDetection',back_populates='sources')

    x  = db.Column(db.Float)
    x_err = db.Column(db.Float)
    y = db.Column(db.Float)
    y_err = db.Column(db.Float)
    ra = db.Column(db.Float)
    dec = db.Column(db.Float)
    pos_err = db.Column(db.Float)
    npix_source = db.Column(db.Integer) # 该源占的pixel数
    # nh = db.Column(db.String(30))#？
    # temperature = db.Column(db.Float) # 是否应放在observation表中?
    # alpha = db.Column(db.Float) #?
    # beta = db.Column(db.Float) #?
    # amplitude = db.Column(db.Float) #?
    # epeak = db.Column(db.Float) #?
    detnam = db.Column(db.String(10)) 
    index_in_det = db.Column(db.Integer) 
    net_counts = db.Column(db.Float)
    bkg_counts = db.Column(db.Float)
    net_rate: float = db.Column(db.Float) # count/s, 是不是与count rate一个意思？
    exp_time:float = db.Column(db.Float) # Effective exposure map value, 单位s
    src_significance = db.Column(db.Float)
    class_star = db.Column(db.Float) # S/G classifier output
    image = db.Column(db.String(255)) # 与某次观测相关的，在存储服务器上的图像归档路径
    light_curve= db.Column(db.String(255)) # 与某次观测相关的，在存储服务器上的光变曲线归档路径
    spectrum = db.Column(db.String(255)) # 与某次观测相关的，在存储服务器上的能谱归档路径
    elongation = db.Column(db.Float) # ELONGATION 
    #
    transient_candidate = db.Column(db.Boolean)
    xray_counterpart = db.Column(db.Text)
    other_counterpart = db.Column(db.Text)
    upperlimit = db.Column(db.Text)
    #
    
    # 约束
    # src_obs_uniq_constraint = db.UniqueConstraint(wxt_detection_id,source_id)
    
    # 参考表交叉证认结果
    ref_ra = db.Column(db.Float)
    ref_dec = db.Column(db.Float)
    # ref_flux = db.Column(db.Float)
    ref_sep = db.Column(db.Float)

    # AI证认结果
    ai_classification = db.Column(db.String(60))
    ai_prob = db.Column(db.Float)

    @property
    def issue(self)->'Issue':
        if self._issue.__len__()==0:
            return None
        else:
            return self._issue[0]

    @property
    def name(self)->str:
        return f"ep{self.wxt_detection.obs_id}wxt{self.detnam[4:6]}s{self.index_in_det}"
    
    @classmethod
    def fake(cls,det:'WXTDetection'=None,src:'Source'=None)->'SourceObservation':
        """Observation类的简单工厂函数，用于创造一个最简单的不违背数据库完整性的对象

        Returns:
            
        """
        if det is None:
            det = WXTDetection.fake()
        o= SourceObservation(
            source_id=src.id,
            wxt_detection_id = det.id,
            detnam=det.detnam,
            index_in_det=0,
            net_counts=random.random(),
            bkg_counts=0,
            exp_time=1000,
            class_star=0,
            ra=src.ra,
            dec=src.dec,
            pos_err=src.pos_err,
            x=0,
            y=0,
            net_rate=random.random(),
            src_significance=1,
            version=det.version
        )
        db.session.add(o)
        db.session.flush()
        return o

    

    @property
    def flux(self)->float:
        return self.net_rate* CF_FLUX_RATE
    
    @flux.setter
    def flux(self,value):
        self.net_rate = value/CF_FLUX_RATE
    
    @property
    def flux_err(self)->float:
        return ((self.net_rate * self.exp_time) ** (1 / 2)) / self.exp_time * CF_FLUX_RATE

    @property
    def leia_upperlimit(self)->float:
        return self.wxt_detection.upperlimit
    @property
    def detection(self):
        return self.wxt_detection
    
    @property 
    def historical_flux(self)->List[float]:
        """历史观测流量

        Returns:
            _type_: _description_
        """
        return [
            det.flux for det in self.source.wxt_detections
            if det.wxt_detection.obs_start < self.detection.observation.obs_start
        ]
    
    @property
    def historical_upperlimits(self)->List[float]:
        """查询覆盖该源的观测的upperlimit

        Returns:
            List[float]: _description_
        """
        from app.data_center import service
        src = self.source
        related_det = service.search_sy01_obs(None,str(src.ra),str(src.dec),str(10/60/60),'2000-01-01 00:00:00',self.detection.observation.obs_start.strftime("%Y-%m-%d %H:%M:%S"))
        return [float(det['upperlimit']) for det in related_det if isinstance(det,dict)] # 有可能返回的是{"success":"no result"}
    @property
    def ratio_to_median(self)->float:
        """计算与历史观测中值的比值
        如果某次观测的上限高于历史探测的最低值，则该上限不参与中值的计算

        Returns:
            float: _description_
        """
        
        median = calculate_median(self.historical_flux,self.historical_upperlimits)
        
        return  self.flux/median if median is not None else None
    
    @property
    def flux_exced_prop(self)->float:
        return calculate_percentile(self.flux,self.historical_flux,self.historical_upperlimits)
    
    
    def __repr__(self):
        return f"<SO {self.id}-{self.name}>"

def calculate_median(fluxs:List[float],upperlimits:List[float]):
    """输入观测流量和相关观测upperlimits，计算中值

    Args:
        fluxs (List[float]): _description_
        upperlimits (List[float]): _description_

    Returns:
        _type_: _description_
    """
    
    min_flux = 9999 if len(fluxs)==0 else min(fluxs) # 最低观测流量，如果没有，设置一个不可达的值使upperlimit均有效
    valid_ul = [ul for ul in upperlimits if ul<min_flux] # 有效upperlimit
    if len(fluxs+valid_ul)==0 : # 没有观测输入
        return None
    median = statistics.median(fluxs+valid_ul)
    return median
def calculate_percentile(current_flux:float, fluxs:List[float],upperlimits:List[float]):
    min_flux = 9999 if len(fluxs)==0 else min(fluxs) # 最低观测流量，如果没有，设置一个不可达的值使upperlimit均有效
    valid_ul = [ul for ul in upperlimits if ul<min_flux] # 有效upperlimit
    if len(fluxs+valid_ul)==0 : # 没有观测输入
        return None
    count = len([x for x in fluxs+valid_ul if x<current_flux])

    # 计算超过多少比例
    percentile = (count / len(fluxs+valid_ul)) 

    return percentile

class SourceObsEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,SourceObservation):
            return {
                "id":o.id, # src_obs表中的Id
                "src_id":o.source_id, # src表中的Id
                "wxt_id":o.wxt_detection_id, # wxt_detection表中的Id
                "obs_id":o.wxt_detection.obs_id, # 观测号
                "ra":o.ra,
                "dec":o.dec,
                "pos_err":o.pos_err,
                "detnam":o.detnam,
                "obs_start":o.wxt_detection.observation.obs_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "name":'ep'+o.wxt_detection.obs_id+'wxt'+o.detnam[4:6]+'s'+str(o.index_in_det),
                "flux":"%.2e"%(o.flux),
                "net_counts":o.net_counts,
                "bkg_counts":o.bkg_counts,
                "net_rate":o.net_rate,
                "exp_time":o.exp_time,
                "src_significance":o.src_significance,
                "ep_ref_ra":o.ref_ra,
                "ep_ref_dec":o.ref_dec,
                "ep_ref_sep":o.ref_sep,
                "ep_ref_flux":o.ref_flux,
                # "observed_num":len(o.source.wxt_detections), # 好像没有用到
                "obs_num_sor_loc":'please check in details',
                
                # 这两个耗时很长，放到DetailEncoder里面
                # "ratio_flux":o.ratio_to_median,
                # "frac_flux":o.flux_exced_prop,

            }
        return super().default(o)

class SourceObsDetailEncoder(SourceObsEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,SourceObservation):
            encoded = super().default(o)
            encoded["ratio_flux"]=o.ratio_to_median
            encoded["frac_flux"]=o.flux_exced_prop
            return encoded
        return super().default(o)
class SourceObsListCommentsEncoder:
    """为了防止证认表多次查询
    """
    @classmethod
    def encode(cls, o: List[SourceObservation]) -> Any:
        # 根据so的id查询所有comments
        if o is None:
            return {}
        ids= [so.id for so in o]
        subquery = (db.session.query(TACommentRecord.src_id, func.max(TACommentRecord.update_date).label('max_update_date'))
            .filter(TACommentRecord.src_id.in_(ids))
            .group_by(TACommentRecord.src_id)).subquery()

        comments:List[TACommentRecord] = (db.session.query(TACommentRecord)
            .join(subquery, and_(TACommentRecord.src_id == subquery.c.src_id, TACommentRecord.update_date == subquery.c.max_update_date))) \
            .order_by(desc(TACommentRecord.update_date)).all()
        so_id_comments_dict:Dict[int,Dict] = {}
        for c in comments: 
            so_id_comments_dict[c.src_id] = {
                "type":c.src_type,
                "classification":c.classification or '',
                "simbad_name":c.simbad_name or '',
                "comments":c.comments or '',
                "wxt_name":c.wxt_name or '',
                "ep_name":c.ep_name or ''
            }
        
        return so_id_comments_dict

class ObsTrigger(str,Enum):
    telemetry = "telemetry"
    beidou = "beidou"
    vhf = "vhf"
    ihep = "ihep" # FXT 数传专属
    alert = "alert" # FXT Alert专属
    
class Observation(db.Model):
    query: Query
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'observation'
    id = db.Column(db.Integer, primary_key=True)
    obs_id = db.Column(db.String(20), nullable=False, unique=True, index=True)
    instrument:str = db.Column(db.String(10), nullable=False) # WXT or FXT or SY01
    fov = db.Column(db.String(255)) #数据从哪来,来自48个CMOS指向位置结合半径计算
    pnt_ra = db.Column(db.Float)
    pnt_dec = db.Column(db.Float)
    obj_ra = db.Column(db.Float, nullable=False) #只有FXT可能有
    obj_dec = db.Column(db.Float, nullable=False)
    
    obs_start:datetime = db.Column(db.DateTime, nullable=False)
    obs_end = db.Column(db.DateTime, nullable=False)

    target_id = db.Column(db.String(20)) # 来源是哪里？
    object_name = db.Column(db.String(20)) # 'GRB050223'
    
    seqp_num = db.Column(db.Integer) # Number of times the dataset processed
    seg_num = db.Column(db.Integer) # Segment number
    exposure_time = db.Column(db.Float)
    obs_type = db.Column(db.String(10)) #（巡天、GO提案观测<PI>、ToO<PI>）
    pa_pnt = db.Column(db.Float)
    # pi = db.Column(db.String(50))

    pi_id = db.Column(db.Integer, db.ForeignKey(User.id))
    private = db.Column(db.Boolean)
    # count_rate = db.Column(db.Float, nullable=False)
    exposure_mode = db.Column(db.String(10)) # 曝光模式， FXT
    status = db.Column(db.String(10)) #observed，archived
    archive_path = db.Column(db.String(255)) #在存储服务器上的归档路径
    # sources = db.relationship('SourceObservation', back_populates='observation')
    # 因数据版本的加入而改名，需要进一步筛选
    _wxt_detections:List['WXTDetection'] = db.relationship('WXTDetection', backref = 'observation')
    @property
    def wxt_detections(self):
        result = []
        for det in self._wxt_detections:
            version:WXTDataVersion  = WXTDataVersion.query.filter(
                WXTDataVersion.obs_id==det.obs_id,
                WXTDataVersion.detnam==det.detnam
            ).first()
            if not version: # 可能是早期数据，不存在版本
                result.append(det)
            if version and det.version==version.version:
                result.append(det)
        return result
            
    beidou_detections:List['BeidouDetection']
    @property
    def obs_start_mjd(self):
        return Time(self.obs_start).mjd
    # sources = db.relationship('SourceObservation', backref=db.backref('observation',lazy='dynamic'))

    # sources = db.relationship('SourceObservation',  backref=db.backref('observation',lazy='dynamic'),lazy='dynamic', cascade='all,delete-orphan')


    
    @classmethod
    def fake(cls)->'Observation':
        """Observation类的简单工厂函数，用于创造一个最简单的不违背数据库完整性的对象

        Returns:
            
        """
        o= Observation(
            obs_id = "".join(random.sample("12345657890qwertyuiopasddfghjkl;zxcvbnm",10)),
            instrument="FAKED",
            obj_ra=0,
            obj_dec=0,
            pnt_ra=0,
            pnt_dec=0,
            obs_start=datetime.now(),
            obs_end=datetime.now()+timedelta(seconds=120),
        )
        db.session.add(o)
        db.session.flush()
        return o
    
def is_newest(wxt_det:'WXTDetection')->bool:
    version = WXTDataVersion.query.filter(
            WXTDataVersion.obs_id==wxt_det.obs_id,
            WXTDataVersion.detnam==wxt_det.detnam
        ).first()
    if version is None:
        return False
    else:
        return version.version == wxt_det.version
# 添加catalogue产品定义中的信息
class Source(db.Model,SkyObject): 
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'source'
    query:Query

    id = db.Column(db.Integer,primary_key=True)
    type = db.Column(db.Enum(SourceType), index=True)

    # unique_constraint = db.UniqueConstraint('id','type','strategy')
    ep_name = db.Column(db.String(50))
    wxt_name = db.Column(db.String(50))
    fxt_name = db.Column(db.String(50))
    instrument = db.Column(db.String(10))

    source_name = db.Column(db.String(50), nullable=False)
    ra = db.Column(db.Float, nullable=False)
    dec = db.Column(db.Float, nullable=False)
    pos_err = db.Column(db.Float, nullable=False)
    absflux = db.Column(db.Float)

    # 因为很多地方引用了wxt_detections，但在加入数据版本后，back_ref的wxt_detection不能满足要求，
    # 因此改名加上_，原来的wxt_detections作为一个属性
    _wxt_detections:List['SourceObservation'] = db.relationship('SourceObservation',back_populates='source')
    @property
    def  wxt_detections(self)->List[SourceObservation]:
        
        query = SourceObservation.query.filter(
                SourceObservation.source_id==self.id,
                WXTDetection.status==DataStatus.available
            )

        # 不影响结果，只是为了加快查询速度
        query = query\
            .join(WXTDetection)\
            .join(Observation)\
            .options(
                db.joinedload(SourceObservation.wxt_detection)\
                .joinedload(WXTDetection.observation),
                db.joinedload(SourceObservation.ta_comments)
            )
        
        sos = query.all()

        # 只保留最新版本的Detection
        selected_by_versions = [so for so in sos if is_newest(so.wxt_detection)]

        selected_by_src_type = [
            item for item in selected_by_versions 
            if item.src_type in ['known_source','burst','transient',None,""]
        ]
        return list(selected_by_src_type)
    
    fxt_detections = db.relationship('FXTSourceObservation',back_populates='source')
    beidou_detections : List['BeidouSourceObservation']
    redshift = db.Column(db.Float) #EP 没有这个数据
    luminosity = db.Column(db.Float)
    counts = db.Column(db.Float)
    snr =db.Column(db.Float)
    image = db.Column(db.String(255)) #针对该源多次观测叠加的，在存储服务器上的图像归档路径
    light_curve= db.Column(db.String(255)) #针对该源多次观测叠加的，在存储服务器上的光变曲线归档路径
    spectrum = db.Column(db.String(255)) #针对该源多次观测叠加的，在存储服务器上的能谱归档路径
    latest_net_rate:float = db.Column(db.Float)
    # separation = 0.0
    transient_candidate = db.Column(db.Boolean)
    xray_counterpart = db.Column(db.Text)
    other_counterpart = db.Column(db.Text)

    # number_5sigma = db.Column(db.Integer)
    # number_obs = db.Column(db.Integer) #观测次数

    # 暂现源判定和多波段证认
    transient_candidate = db.Column(db.Boolean)
    xray_counterpart = db.Column(db.Text)
    other_counterpart = db.Column(db.Text)

    # TA证认结果
    src_type:Union[str,Column] = db.Column(db.String(20))
    classification:str = db.Column(db.String(50))
    simbad_name:str = db.Column(db.String(50))
    comments:str = db.Column(db.Text)
    ref_flux:float = db.Column(db.Float)
    # 标签
    _tag_relations:List['SourceTagRelationship']

    @property
    def tags(self):
        return [tr.tag for tr in self._tag_relations]
    
    # issue
    issue:'Issue'
    

    @property
    def types(self):
        return [t.type for t in self._types]
    @staticmethod
    def cone_search(ra:float,dec:float,radius:float)->List['Source']:
        """锥形检索，返回符合条件的源
        Args:
            ra: degree
            dec: degree
            radius: degree

        Returns:
            _type_: _description_
        """
        return Source.query \
            .filter(text('q3c_radial_query(ra,dec, :ra_center,:dec_center,:radius)')) \
            .params(ra_center=ra,dec_center=dec,radius=radius)\
            .all()
        
    @classmethod
    def fake(cls)->'Source':
        """Source类的简单工厂函数，用于创造一个不违背数据库完整性的对象

        Returns:
            Source: _description_
        """
        o= Source(source_name="",ra=0,dec=0,pos_err=0.1)
        o.latest_net_rate = random.random()
        db.session.add(o)
        db.session.flush()
        return o
    @property
    def skycoord(self)->SkyCoord:
        return SkyCoord(ra= self.ra*u.degree, dec=self.dec*u.degree,frame='icrs')


    @property
    def flux(self)->float:
        if self.latest_net_rate is not None:
            return self.latest_net_rate*CF_FLUX_RATE
        else:
            return 0

    @property
    def wxt_detections_count(self):
        return SourceObservation.query\
            .filter(SourceObservation.source_id==self.id)\
            .count()
            
    

class IdentifiedSourceEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,Source):
            return {
                "id":o.id,
                "ra":o.ra,
                "dec":o.dec,
                "ra_hms":o.ra_hms,
                "dec_dms":o.dec_dms,
                "gal_l":o.galactic_l,
                "gal_b":o.galactic_b,
                "pos_err":o.pos_err,
                "src_type":o.src_type,
                "classification":o.classification,
                "simbad_name":o.simbad_name,
                "ref_flux":o.ref_flux,
                "flux":o.flux,
                "comments":o.comments,
                "tags":[tag.name for tag in o.tags]
            }
        return super().default(o)
    
class SourceEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,Source):
            return {
                "id":o.id,
                "ra":o.ra,
                "dec":o.dec,
                "pos_err":o.pos_err,
                "flux":o.flux
            }
        return super().default(o)

class SourceSimpleJSONEncoder(simplejson.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,Source):
            return {
                "id":o.id,
                "ra":o.ra,
                "dec":o.dec,
                "pos_err":o.pos_err,
                "flux":o.flux
            }
        return super().default(o)
class SourceTypeRelation(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'source_type'
    query: Query
    id = db.Column(db.Integer,autoincrement = True, primary_key=True)
    source_id = db.Column(db.Integer,db.ForeignKey('tdic.source.id'))
    type = db.Column(db.Enum(SourceType), index=True)
    identify_time = db.Column(db.DateTime())
    source = db.relationship(Source,backref=db.backref('_types')) # SourceTypeRelation没意义，主要用type，因此再加一个属性types，返回_types.type

    def __repr__(self) -> str:
        return f"{self.source_id}:{self.type}"


  
class DataStatus(Enum):
    available = auto()
    lost = auto()
    delete = auto()
    suppression = auto()



class AbstractDetection:
    query: Query
    TRIGGER:ObsTrigger # 类元数据，标识子类
    obs_id:str
    detnam: str
    obs:Observation
    
    # 处理程序相关字段
    proc_ver:str =  db.Column(db.String(30)) # Processing script version
    soft_ver:str =  db.Column(db.String(50)) # Hea_ep_13
    caldb_ver:str = db.Column(db.String(20)) # CALDB index versions used

    # 处理时间相关字段
    archive_time = db.Column(db.DateTime)
    process_time = db.Column(db.DateTime)
    publish_time = db.Column(db.DateTime)
    
    
    version:str =  db.Column(db.String(10)) #数据版本
    
    @classmethod
    def get(cls, obs_id:str, detnam:str, version:str)->Tuple['WXTDetection','AbstractDetection']:
        """获取该Detection下的实例。由于所有Detection均在wxtdetection中有一个副本，因此返回摘要信息和详细信息
        (obs_id, detnam, trigger, version) 组合可确定一个实例。
        其中，trigger在子类的元数据里已确定

        Args:
            obs_id (str): _description_
            detnam (str): _description_
            version (str): _description_

        Returns:
            _type_: _description_
        """
        base_det = WXTDetection.query.filter_by(obs_id=obs_id, detnam=detnam, version=version,trigger=cls.TRIGGER).first()
        
        # VHF，需要判断是数据还是警报
        if cls.TRIGGER == ObsTrigger.vhf:
            return base_det, VHFDetection.query.filter_by(obs_id=obs_id, detnam=detnam, version=version).first() or base_det
        return base_det, cls.query.filter_by(obs_id=obs_id, detnam=detnam,  version=version).first()

# try to make it more general
class WXTDetection(db.Model, AbstractDetection):
    TRIGGER = ObsTrigger.telemetry
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'wxt_detection'
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    obs_id = db.Column(db.String(20), db.ForeignKey(Observation.obs_id),index=True)
    detnam = db.Column(db.String(10))
    pnt_ra = db.Column(db.Float, nullable=False)
    pnt_dec = db.Column(db.Float, nullable=False)
    pa_pnt = db.Column(db.Float)
    exposure_time = db.Column(db.Float)
    sources: List['SourceObservation'] = db.relationship('SourceObservation', back_populates='wxt_detection')
    fov_new:FOV = db.Column(FOVColumn)
    instrument = db.Column(db.String(10),index=True) # WXT or FXT or SY01
    obs_start:datetime = db.Column(db.DateTime,index=True)
    obs_end = db.Column(db.DateTime,index=True)
    status = db.Column(db.Enum(DataStatus), index=True, default=DataStatus.available)
    
    trigger:'ObsTrigger' = db.Column(db.String(10),default=ObsTrigger.telemetry.value) # 哪里产生的该观测号：数传/北斗/VHF


    trig_time = db.Column(db.Float) # from Beidou Detection
    # origin = db.Column(db.String(20)) # from Beidou Detection
    # utcfinit = db.Column(db.Float) # from Beidou Detection
    # reproc = db.Column(db.Boolean) # from Beidou Detection

    # obs_mode = db.Column(db.String(10)) # from FXT Detection
    # object_name = db.Column(db.String(25)) # from FXT Detection
    # obj_ra = db.Column(db.Float) # from FXT Detection
    # obj_dec = db.Column(db.Float) # from FXT Detection
    # data_mode = db.Column(db.String(10)) # from FXT Detection
    # observer = db.Column(db.String(10)) # from FXT Detection
    # latest = db.Column(db.Boolean) #是否是最新版本

    # backref
    observation: Observation
    data_applications:'List[DataApplication]'
    
    @classmethod
    def fake(cls,obs:'Observation'=None)->'WXTDetection':
        """WXTDetection类的简单工厂函数，用于创造一个最简单的不违背数据库完整性的对象

        Returns:
            
        """
        if obs is None:
            obs = Observation.fake()
        o= WXTDetection(
            obs_id = obs.obs_id,
            pnt_ra=obs.pnt_ra,
            pnt_dec=obs.pnt_dec,
            obs_start=obs.obs_start,
            obs_end=obs.obs_end,
            pa_pnt = obs.pa_pnt,
            exposure_time=1500,
            instrument=obs.instrument,
            detnam="CMOS13",
            version="v1"
        )
        db.session.add(o)
        db.session.flush()
        return o
    
    @property
    def upperlimit(self)->float:
        """
        Upperlimit: 根据Leia响应曲线线性插值
        """
        return calculate_leia_upperlimit(self.exposure_time)
        
    @property
    def obs(self):
        """observation别名

        Returns:
            _type_: _description_
        """
        return self.observation
    def __repr__(self):
        return f"{self.obs_id}{self.detnam}"
def calculate_leia_upperlimit(exp_time):
    leia_sensi = {
            10.:8.8741e-10,
            50.:2.1229e-10,
            100.:1.2440e-10,
            200.:7.6100e-11,
            500.:3.9734e-11,
            1000.:2.5785e-11,
            2000.:1.6811e-11,
        }
    try:
        upperlimit = utils.linear_interpolation(
            list(leia_sensi.keys()),
            list(leia_sensi.values()),
            exp_time
        )
    except Exception:
        upperlimit = float('nan')
    return upperlimit
class BeidouDetection(db.Model, AbstractDetection):
    TRIGGER=ObsTrigger.beidou
    __table_args__ = {"schema":"tdic"}
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    obs_id = db.Column(db.String(20),db.ForeignKey(Observation.obs_id))
    observation = db.relationship(Observation, backref='beidou_detections')

    detnam = db.Column(db.String(10))
    pnt_ra = db.Column(db.Float, nullable=False)
    pnt_dec = db.Column(db.Float, nullable=False)
    pa_pnt = db.Column(db.Float)
    exposure_time = db.Column(db.Float)
    # sources: List['BeidouSourceObservation']
    fov_new:FOV = db.Column(FOVColumn)
    instrument = db.Column(db.String(10),index=True) # WXT or FXT or SY01
    obs_start = db.Column(db.DateTime,index=True)
    obs_end = db.Column(db.DateTime,index=True)
    origin = db.Column(db.String(20))
    utcfinit = db.Column(db.Float)
    reproc = db.Column(db.Boolean)
    trig_time:datetime = db.Column(db.DateTime)
    status = db.Column(db.Enum(DataStatus), index=True, default=DataStatus.available)

    @classmethod
    def fake(cls,obs:'Observation')->'BeidouDetection':
        """BeidouDetection类的简单工厂函数，用于3造一个最简单的不违背数据库完整性的对象

        Returns:
            
        """
        o= BeidouDetection(
            obs_id = obs.obs_id,
            pnt_ra=obs.pnt_ra,
            pnt_dec=obs.pnt_dec,
            obs_start=obs.obs_start,
            obs_end=obs.obs_end,
            pa_pnt = obs.pa_pnt,
            exposure_time=0,
            instrument=obs.instrument
        )6        db.session.add(o)
        db.session.flush()
        return o
    
class VHFDetection(db.Model, AbstractDetection):
    TRIGGER=ObsTrigger.vhf
    __table_args__ = {"schema":"tdic"}
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    obs_id = db.Column(db.String(20),db.ForeignKey(Observation.obs_id))
    observation = db.relationship(Observation, backref='vhf_detections')

    detnam = db.Column(db.String(10))
    pnt_ra = db.Column(db.Float, nullable=False)
    pnt_dec = db.Column(db.Float, nullable=False)
    pa_pnt = db.Column(db.Float)
    exposure_time = db.Column(db.Float)
    
    fov_new:FOV = db.Column(FOVColumn)
    instrument = db.Column(db.String(10),index=True) # WXT or FXT or SY01
    obs_start = db.Column(db.DateTime,index=True)
    obs_end = db.Column(db.DateTime,index=True)
    origin = db.Column(db.String(20))
    utcfinit = db.Column(db.Float)
    reproc = db.Column(db.Boolean)
    trig_time:datetime = db.Column(db.DateTime)
    status = db.Column(db.Enum(DataStatus), index=True, default=DataStatus.available)

    @classmethod
    def fake(cls,obs:'Observation')->'VHFDetection':
        """VHFDetection类的简单工厂函数，用于创造一个最简单的不违背数据库完整性的对象

        Returns:
            
        """
        o= VHFDetection(
            obs_id = obs.obs_id,
            pnt_ra=obs.pnt_ra,
            pnt_dec=obs.pnt_dec,
            obs_start=obs.obs_start,
            obs_end=obs.obs_end,
            pa_pnt = obs.pa_pnt,
            exposure_time=0,
            instrument=obs.instrument
        )
        db.session.add(o)
        db.session.flush()
        return o   

class FXTDetNam(str,Enum):
    A = "FXTA"
    B = "FXTB"
    
    @classmethod
    def from_str(cls,s:str):
        return {
            "A":cls.A,
            "B":cls.B,
            "a":cls.A,
            "b":cls.B,
            "FXTA":cls.A,
            "FXTB":cls.B,
            "FXTa":cls.A,
            "FXTb":cls.B,
        }.get(s,None)

    def short(self):
        """转化为1位表示

        Returns:
            _type_: _description_
        """
        return self[-1].lower()
    
class FXTObservationMode(str,Enum):
    Pointing = "Pointing"
# 来自evt header
class FXTDetection(db.Model,AbstractDetection):
    TRIGGER=ObsTrigger.ihep
    trigger=ObsTrigger.ihep
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'fxt_detection'
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    obs_id = db.Column(db.String(20), db.ForeignKey(Observation.obs_id))
    detnam: FXTDetNam = db.Column(db.String(10)) #FXT A or B
    obs_mode = db.Column(db.String(10))
    object_name = db.Column(db.String(25))
    obj_ra = db.Column(db.Float, nullable=False)
    obj_dec = db.Column(db.Float, nullable=False)
    pnt_ra = db.Column(db.Float, nullable=False)
    pnt_dec = db.Column(db.Float, nullable=False)
    # pa_pnt = db.Column(db.Float)
    exposure_time = db.Column(db.Float)
    sources: List['FXTSourceObservation'] = db.relationship('FXTSourceObservation', back_populates='fxt_detection')
    fov_new:FOV = db.Column(FOVColumn)
    instrument = db.Column(db.String(10),index=True) # WXT or FXT or SY01
    obs_start = db.Column(db.DateTime,index=True)
    obs_end = db.Column(db.DateTime,index=True)
    status = db.Column(db.Enum(DataStatus), index=True, default=DataStatus.available) 
    data_mode = db.Column(db.String(10),index=True)
    observer = db.Column(db.String(10),index=True)
    latest = db.Column(db.Boolean) #是否是最新版本
    
    # backref
    observation: Observation = db.relationship(Observation, backref='fxt_detections')
    data_applications:'List[DataApplication]'
    latest_version: 'FXTDataVersion'
    sources: 'List[FXTSourceObservation]'

    @property
    def latest_version(self)->'FXTDataVersion':
        return FXTDataVersion.query \
            .filter(FXTDataVersion.obs_id==self.obs_id) \
            .filter(FXTDataVersion.detnam==self.detnam) \
            .first()

    
    @classmethod
    def fake(cls,obs:'Observation')->'FXTDetection':
        """FXTDetection类的简单工厂函数，用于创造一个最简单的不违背数据库完整性的对象

        Returns:
            
        """
        o= FXTDetection(
            obs_id = obs.obs_id,
            pnt_ra=obs.pnt_ra,
            pnt_dec=obs.pnt_dec,
            obj_ra = obs.obj_ra,
            obj_dec=obs.obj_dec,
            obs_start=obs.obs_start,
            obs_end=obs.obs_end,
            exposure_time=0,
            instrument=obs.instrument,
            detnam=FXTDetNam.A
        )
        db.session.add(o)
        db.session.commit()
        return o

    def to_dict(self):
        return {
            'id': self.id,
            'obs_id': self.obs_id,
            'detnam': self.detnam,
            'obs_mode': self.obs_mode,
            'object_name': self.object_name,
            'obj_ra': self.obj_ra,
            'obj_dec': self.obj_dec,
            'pnt_ra': self.pnt_ra,
            'pnt_dec': self.pnt_dec,
            'exposure_time': self.exposure_time,
            'fov_new': "{"+f"({self.fov_new.point1.ra.to('radian').value},{self.fov_new.point1.dec.to('radian').value}),({self.fov_new.point2.ra.to('radian').value},{self.fov_new.point2.dec.to('radian').value}),({self.fov_new.point3.ra.to('radian').value},{self.fov_new.point3.dec.to('radian').value}),({self.fov_new.point4.ra.to('radian').value},{self.fov_new.point4.dec.to('radian').value})"+"}" if self.fov_new else "",
            'instrument': self.instrument,
            'obs_start': self.obs_start.isoformat(),
            'obs_end': self.obs_end.isoformat(),
            'status': self.status.value,
            'data_mode': self.data_mode,
            'observer': self.observer,
            'version': self.version,
            'latest': self.latest
        }

class BeidouSourceObservation(db.Model, AbstractSourceObservation):
    __table_args__ = {"schema":"tdic"}
    id = db.Column(db.Integer, primary_key=True)
    detection_id = db.Column(db.Integer,db.ForeignKey(BeidouDetection.id),index=True)
    detection:'BeidouDetection'  = db.relationship(BeidouDetection,backref='sources')
    source_id = db.Column(db.Integer,db.ForeignKey(Source.id),index=True)
    source = db.relationship(Source,backref='beidou_detections')
    detnam = db.Column(db.String(10))
    index_in_det = db.Column(db.Integer)
    # cmos_num = db.Column(db.Integer)
    ra = db.Column(db.Float)
    dec = db.Column(db.Float)
    pos_err = db.Column(db.Float)
    x = db.Column(db.Float)
    y = db.Column(db.Float)
    # qparam1 = db.Column(db.Float)
    # qparam2 = db.Column(db.Float)
    # qparam3 = db.Column(db.Float)
    # qparam4 = db.Column(db.Float)
    qparam = db.Column(db.ARRAY(db.Float))
    var = db.Column(db.Float)
    net_rate = db.Column(db.Float)
    hr = db.Column(db.Float)
    src_significance = db.Column(db.Float)
    src_code = db.Column(db.ARRAY(db.Boolean))
    rank = db.Column(db.ARRAY(db.Boolean))  

    @property
    def flux(self)->float:
        return self.net_rate* CF_FLUX_RATE
    
    @flux.setter
    def flux(self,value):
        self.net_rate = value/CF_FLUX_RATE 

    @property
    def issue(self)->'Issue':
        if self._beidou_issue.__len__()==0:
            return None
        else:
            return self._beidou_issue[0] 

    @property
    def flux(self)->float:
        return self.net_rate* CF_FLUX_RATE

    def to_dict(self):
        return {
            'id': self.id,
            'detection_id': self.detection_id,
            'name': self.name[:-2],
  8         'obs_id': self.detection.obs_id,
            'detnam': self.detnam,
            'trigtime': self.detection.trig_time.strftime('%Y-%m-%d %H:%M:%S') if self.detection.trig_time is not None else "",
            'src_id': self.source_id,
            "obs_start": self.detection.obs_start.strftime('%Y-%m-%d %H:%M:%S'),
            "obs_end" : self.detection.obs_end,
            'index_in_det': self.index_in_det,
            'ra': self.ra,
            'dec': self.dec,
            'pos_err': self.pos_err,
            'x': self.x,
            'y': self.y,
            'var': self.var,
            'net_rate': self.net_rate,
            'hr': self.hr,
            'src_significance': self.src_significance,
            
            "type" : self.src_type,
            "classification" : self.classification,
            "simbad_name" : self.simbad_name,
            "comments" : self.comments,
            "ta_id" : self.ta_id,
            "ta" : ""
        }
        
    @classmethod
    def fake(cls,det:'BeidouDetection',src:'Source')->'BeidouSourceObservation':
        """Observation类的简单工厂函数，用于创造一个最简单的不违背数据库完整性的对象

        Returns:
            
        """
        o= BeidouSourceObservation(
            source_id=src.id,
            detection_id = det.id,
            detnam=det.detnam,
            index_in_det=0,
            ra=src.ra,
            dec=src.dec,
            pos_err=src.pos_err,
            x=0,
            y=0,
            var=0,
            net_rate=random.random(),
            hr=0,
            src_significance=1,
        )
        db.session.add(o)
        db.session.flush()
        return o
    
class VHFSourceObservation(db.Model, AbstractSourceObservation):
    __table_args__ = {"schema":"tdic"}
    id = db.Column(db.Integer, primary_key=True)
    detection_id = db.Column(db.Integer,db.ForeignKey(VHFDetection.id),index=True)
    detection:'WXTDetection'  = db.relationship(VHFDetection,backref='sources')
    source_id = db.Column(db.Integer,db.ForeignKey(Source.id),index=True)
    source = db.relationship(Source,backref='vhf_detections')
    detnam = db.Column(db.String(10))
    index_in_det = db.Column(db.Integer)

    ra = db.Column(db.Float)
    dec = db.Column(db.Float)
    pos_err = db.Column(db.Float)
    x = db.Column(db.Float)
    y = db.Column(db.Float)
 
    qparam = db.Column(db.ARRAY(db.Float))
    var = db.Column(db.Float)
    net_rate = db.Column(db.Float)
    hr = db.Column(db.Float)
    src_significance = db.Column(db.Float)
    src_code = db.Column(db.ARRAY(db.Boolean))
    rank = db.Column(db.ARRAY(db.Boolean)) 

    @property
    def flux(self)->float:
        return self.net_rate* CF_FLUX_RATE
    
    @flux.setter
    def flux(self,value):
        self.net_rate = value/CF_FLUX_RATE   

    @property
    def issue(self)->'Issue':
        if self._vhf_issue.__len__()==0:
            return None
        else:
            return self._vhf_issue[0]

    def to_dict(self):
        return {
            'id': self.id,
            'detection_id': self.detection_id,
            'name': self.name[:-2],
            'obs_id': self.detection.obs_id,
            'detnam': self.detnam,
            'trigtime': self.detection.trig_time.strftime('%Y-%m-%d %H:%M:%S')  if self.detection.trig_time is not None else "",
            'src_id': self.source_id,
            "obs_start": self.detection.obs_start.strftime('%Y-%m-%d %H:%M:%S'),
            "obs_end" : self.detection.obs_end,
            'index_in_det': self.index_in_det,
            'ra': self.ra,
            'dec': self.dec,
            'pos_err': self.pos_err,
            'x': self.x,
            'y': self.y,
            'var': self.var,
            'net_rate': self.net_rate,
            'hr': self.hr,
            'src_significance': self.src_significance,
            
            "type" : self.src_type,
            "classification" : self.classification,
            "simbad_name" : self.simbad_name,
            "comments" : self.comments,
            "ta_id" : self.ta_id,
            "ta" : ""
        }
        
    @classmethod
    def fake(cls,det:'VHFDetection',src:'Source')->'VHFSourceObservation':
        """Observation类的简单工厂函数，用于创造一个最简单的不违背数据库完整性的对象

        Returns:
            
        """
        o= VHFSourceObservation(
            source_id=src.id,
            detection_id = det.id,
            detnam=det.detnam,
            index_in_det=0,
            ra=src.ra,
            dec=src.dec,
            pos_err=src.pos_err,
            x=0,
            y=0,
            var=0,
            net_rate=random.random(),
            hr=0,
            src_significance=1,
        )
        db.session.add(o)
        db.session.flush()
        return o
    
class FXTAlertDetection(db.Model,AbstractDetection):
    TRIGGER = ObsTrigger.alert
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'fxt_alert_detection'
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    obs_id = db.Column(db.String(20), dl.ForeignKey(Observation.obs_id))
    detnam: FXTDetNam = db.Column(db.String(10)) #FXT A or B
    obs_mode = db.Column(db.String(10))
    object_name = db.Column(db.String(25))
    obj_ra = db.Column(db.Float, nullable=False)
    obj_dec = db.Column(db.Float, nullable=False)
    pnt_ra = db.Column(db.Float, nullable=False)
    pnt_dec = db.Column(db.Float, nullable=False)
    obs_start:datetime = db.Column(db.DateTime,index=True)
class FXTAlertSourceObservation(db.Model, AbstractSourceObservation):
    __table_args__ = {"schema":"tdic"}
    id = db.Column(db.Integer, primary_key=True)
    detection_id = db.Column(db.Integer,db.ForeignKey(FXTAlertDetection.id),index=True)
    detection:'FXTAlertDetection'  = db.relationship(FXTAlertDetection,backref='sources')
    source_id = db.Column(db.Integer,db.ForeignKey(Source.id),index=True)
    source = db.relationship(Source,backref='fxt_alert_detections')
    detnam = db.Column(db.String(10))
    index_in_det = db.Column(db.Integer)

    
    
    target_name = db.Column(db.String(25))
    ra = db.Column(db.Float)
    dec = db.Column(db.Float)
    ra_match = db.Column(db.Float)
    dec_match = db.Column(db.Float)
    offset_target = db.Column(db.Float)
    name_match = db.Column(db.String(25))
    ep_name = db.Column(db.String(25))
    flux_match = db.Column(db.Float)
    rate = db.Column(db.Float)
    rate_err = db.Column(db.Float)
    flux = db.Column(db.Float)
    flux_err = db.Column(db.Float)
    snr = db.Column(db.Float)
    flux_delta= db.Column(db.Float)
    flux_delta_err = db.Column(db.Float)
    
class FXTDataVersion(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'fxt_data_version'
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    obs_id = db.Column(db.String(20))
    detnam = db.Column(db.String(10)) #FXT A or B
    obs_mode = db.Column(db.String(10))
    data_mode = db.Column(db.String(10))
    hl_latest_version:str =db.Column(db.String(10)) #hl最新版本号
    ql_latest_version =db.Column(db.String(10)) #ql最新版本号

    fxtdetection_id = db.Column(db.Integer, db.ForeignKey(FXTDetection.id))
    # fxtdetection = db.relationship(FXTDetection, backref='latest_version',uselist=False)
    fxtdetection = db.relationship(FXTDetection)
    
    obs_det_uniq = db.UniqueConstraint(obs_id,detnam)
    
class WXTDataVersion(db.Model):
    __table_args__ = {"schema":"tdic"}
    query: Query
    id = db.Column(db.Integer, primary_key=True)
    obs_id = db.Column(db.String(20))
    detnam = db.Column(db.String(10)) #FXT A or B
    trigger: ObsTrigger = db.Column(db.String(10))
    version: str = db.Column(db.String(10))
    detection_id = db.Column(db.Integer, db.ForeignKey(WXTDetection.id))
    detection:WXTDetection = db.relationship(WXTDetection)

    # 约束
    obs_det_uniq_constraint = db.UniqueConstraint(obs_id,detnam,trigger)

    # @staticmethod
    # def get_latest_available_vesrion(obs_id:str, detnam:str):
    #     raw_sql_text=f"WITH RankedObservations AS (\
    #                     SELECT \
    #                         obs_id,\
    #                         detnam,\
    #                         version,\
    #                         detection_id,\
    #                         ROW_NUMBER() OVER (PARTITION BY obs_id, detnam ORDER BY CAST (SUBSTRING(version, 2) AS INT) DESC) AS row_num \
    #                     FROM \
    #                         tdic.wxt_data_version \
    #                     ) \
    #                     SELECT ro.version FROM tdic.wxt_detection wd join RankedObservations ro on wd.id=ro.detection_id  WHERE wd.status='available' and ro.obs_id='{obs_id}' AND ro.detnam='{detnam}' AND ro.row_num=1"
    #     version = db.session.execute(raw_sql_text)
    #     data = version.fetchone()[0]
    #     return data
        
class Issue(db.Model): 
    __table_args__ = {"schema":"tdic"}
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer,nullable=False)
    # src_id = db.Column(db.Integer,db.ForeignKey(Source.id),nullable=False) # 需求变更，issue对应src_obs

    src_obs_id = db.Column(db.Integer,db.ForeignKey(SourceObservation.id))
    src_obs:SourceObservation = db.relationship(SourceObservation, foreign_keys=[src_obs_id], backref='_issue',uselist=False)

    vhf_obs_id = db.Column(db.Integer,db.ForeignKey(VHFSourceObservation.id))
    vhf_src_obs:VHFSourceObservation = db.relationship(VHFSourceObservation, foreign_keys=[vhf_obs_id], backref='_vhf_issue',uselist=False)

    beidou_obs_id = db.Column(db.Integer,db.ForeignKey(BeidouSourceObservation.id))
    beidou_src_obs:BeidouSourceObservation = db.relationship(BeidouSourceObservation, foreign_keys=[beidou_obs_id], backref='_beidou_issue',uselist=False)

    fxt_src_obs_id = db.Column(db.Integer,db.ForeignKey(FXTSourceObservation.id))
    fxt_src_obs:FXTSourceObservation = db.relationship(FXTSourceObservation, foreign_keys=[fxt_src_obs_id], backref='_fxt_issue',uselist=False)

    # fxt_alert_src_obs_id = db.Column(db.Integer,db.ForeignKey(FXTAlertSourceObservation.id),nullable=False)
    # fxt_src_obs:FXTSourceObservation = db.relationship(FXTAlertSourceObservation, foreign_keys=[fxt_alert_src_obs_id], backref='_fxt_alert_issue',uselist=False)
    
    @classmethod
    def fake(cls,src:SourceObservation):
        o = Issue(issue_id=0,src_id=src.id)
        db.session.add(o)
        db.session.flush()
        return o

    @property
    def url(self):
        return ""


    def isRelatedTo(self,o:'Issue')->bool:
        return is_relate(self.issue_id,o.issue_id)
        
class Pipeline(db.Model):
    """触发流水线的数传
    """
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    oss_path = db.Column(db.Text)
    process_time = db.Column(db.DateTime, nullable=False)
    pipeline_id = db.Column(db.String(100))
    obs_id = db.Column(db.String(20))


# 申请与观测数据多对多关系的中间表
tb_detection_application = db.Table("tdic.detection_application",
                                                 db.Column("application_id", db.Integer, db.ForeignKey("tdic.data_application.id")),
                                                 db.Column("detection_id", db.Integer, db.ForeignKey("tdic.wxt_detection.id")))
class DataApplication(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'data_application'
    id = db.Column(db.Integer, primary_key=True)
    apply_user_id = db.Column(db.Integer, db.ForeignKey(User.id)) #申请人
    # detection_id = db.Column(db.String(20), db.ForeignKey(WXTDetection.id))
    detections_applied: List['WXTDetection'] = db.relationship(WXTDetection,secondary=tb_detection_application, backref='data_applications',lazy="dynamic") #申请的观测数据
    apply_time= db.Column(db.DateTime)
    reason = db.Column(db.String(255)) #申请理由
    approved = db.Column(db.Boolean,default=False) #是否已批批准申请
    approver_id = db.Column(db.Integer, db.ForeignKey(User.id)) #申请批准人
    approve_time = db.Column(db.DateTime) #批准时间
    data_invalid_time = db.Column(db.DateTime) #数据失效时间

class DataApplicationJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, DataApplication):
            detection_ids =[]
            for detection in o.detections_applied:
                detection_ids.append(detection.obs_id+detection.detnam)
            return {
                'id':o.id,
                'apply_time': o.apply_time.isoformat() if o.apply_time is not None else 'null',
                'apply_user_id':User.query.filter(User.id==o.apply_user_id).first().email,
                'detections_applied': detection_ids,
                'approved':o.approved,
                'approve_time':o.approve_time.isoformat() if o.approve_time is not None else 'null',
                'data_invalid_time':o.data_invalid_time.isoformat() if o.data_invalid_time is not None else 'null',
                'approver_id':User.query.filter(User.id==o.approver_id).first().email if o.approver_id is not None else 'null', 
                'reason':o.reason

            }
        return super().default(o)
   

class TACommentRecord(db.Model):
    __table_args__ = {"schema":"tdic"}
    query: Query
    id = db.Column(db.Integer, primary_key=True)
    src_type:str = db.Column(db.String(20))
    classification = db.Column(db.String(50))
    simbad_name = db.Column(db.String(50))
    ep_name = db.Column(db.String(50))
    wxt_name = db.Column(db.String(50))
    comments = db.Column(db.Text)
    update_date = db.Column(db.DateTime, nullable=False)
    ref_flux = db.Column(db.Float)
    ta_id = db.Column(db.Integer,db.ForeignKey(User.id))
    ta = db.relationship(User)
    src_id = db.Column(db.Integer,db.ForeignKey(SourceObservation.id))     # 如果是数传的，填入这条
    src = db.relationship(SourceObservation,backref='ta_comments')
    bd_id = db.Column(db.Integer,db.ForeignKey(BeidouSourceObservation.id))# 如果是WXT-北斗的，填入这条
    bd_src = db.relationship(BeidouSourceObservation,backref='ta_comments')
    vhf_id = db.Column(db.Integer,db.ForeignKey(VHFSourceObservation.id))# 如果是WXT-VHF的，填入这条
    vhf_src = db.relationship(VHFSourceObservation,backref='ta_comments')


# class BeidouAlert(db.Model):
#     oss_path = db.Column(db.String(100))
#     obs_id
#     detnam = db.Column(db.String(10)) 
#     obs_start = db.Column(db.DateTime, nullable=False)
#     obs_end = db.Column(db.DateTime, nullable=False)
#     ra = db.Column(db.Float, nullable=False)
#     dec = db.Column(db.Float, nullable=False)
#     pos_err = db.Column(db.Float, nullable=False)
#     x  = db.Column(db.Float)
#     y = db.Column(db.Float)

class SourceTag(db.Model):
    __table_args__ = {"schema":"tdic"}
    query: Query
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    
class SourceTagRelationship(db.Model):
    __table_args__ = {"schema":"tdic"}
    query:Query
    id = db.Column(db.Integer, primary_key=True)
    src_id = db.Column( db.Integer, db.ForeignKey(Source.id), nullable=False)
    tag_id = db.Column( db.Integer, db.ForeignKey(SourceTag.id), nullable=False)
    src = db.relationship(Source,backref='_tag_relations')
    tag:SourceTag = db.relationship(SourceTag,backref='_src_relations')

from flask_sqlalchemy import SQLAlchemy


class XRayEPref(db.Model):
    # __table_args__ = {"schema":"public"}
    __tablename__ = 'xray_epref'

    id = db.Column(db.Integer, primary_key=True)
    ra = db.Column(db.Float)
    dec = db.Column(db.Float)
    pos_err = db.Column(db.Float)
    ref_flux = db.Column(db.Float)
    ref_name = db.Column(db.String(50))
    powflux_2rxs = db.Column(db.Float)
    powflux_2sxps = db.Column(db.Float)
    powflux_maxi = db.Column(db.Float)
    name_2rxs = db.Column(db.String(50))
    name_2sxps = db.Column(db.String(50))
    name_maxi = db.Column(db.String(50))
    src_name = db.Column(db.String(50))
    src_type = db.Column(db.String(50))