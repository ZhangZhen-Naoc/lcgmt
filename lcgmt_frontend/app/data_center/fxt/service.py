from app.data_center.models import FXTDetection,  DataStatus, FXTSourceObservation, FXTDetNam, SourceObservation ,WXTDetection, FXTAlertSourceObservation
from typing import *
from sqlalchemy import and_,text
from sqlalchemy.orm import Query
from enum import Enum
from app.csdb import csdb_31502
import mq
from pandas.core.frame import DataFrame
import json
from astropy.time import Time
from app.extensions import db

def queryObsByObsID(obs_id)->Optional[List[FXTDetection]]:
    query:Query = FXTDetection.query
    # 排除不可见数据
    query = query.filter(FXTDetection.status==DataStatus.available)
    query = query.filter(FXTDetection.obs_id.like(f"%{obs_id}%"))
    detections:List[FXTDetection] = query.order_by(FXTDetection.obs_start.desc()).all()
    # 最后筛选出最新的
    detections = [det for det in detections if det.version==det.latest_version.hl_latest_version]
    return detections

def queryObsByTimeSpan(start_datetime, end_datetime,ra:Optional[float]=None,dec:Optional[float]=None,radius:Optional[float]=None)->Optional[List[FXTDetection]]:
    """根据时间范围和触发类型查询源

    Args:
        start_datetime (_type_): 开始时间
        end_datetime (_type_): 结束时间
        trigger (_type_, optional):产生原因. Defaults to ObsTrigger.telemetry.value.

    Returns:
        Optional[List[SourceObservation]]: _description_
    """
    query:Query = FXTDetection.query
    # 排除不可见数据
    query = query.filter(FXTDetection.status==DataStatus.available)
    # 时间
    if start_datetime  and end_datetime :
        # sql_str = f'q3c_radial_query(ra,dec, {ra},{dec},{radius})'
        # start_time = datetime.now() - timedelta(3)
        query = query.filter(and_( FXTDetection.obs_start>start_datetime, FXTDetection.obs_end<end_datetime ))
    if ra is not None and dec is not None and radius is not None:
        query = query.filter(text(f'scircle ( spoint ({ra}*pi()/180.0,{dec}*pi()/180.0),{radius}*pi()/180.0) && fov_new')) 
    detections:List[FXTDetection] = query.order_by(FXTDetection.obs_start.desc()).all()
    # 最后筛选出最新的
    detections = [det for det in detections if det.version==det.latest_version.hl_latest_version]
    return detections

def queryFXTSourceObsByTimeSpan(start_datetime, end_datetime)->Optional[List[FXTSourceObservation]]:
    dets  = queryObsByTimeSpan(start_datetime,end_datetime)
    srcs = []
    for det in dets:
        ql_latest_version = det.latest_version.ql_latest_version
        srcs.extend([so for so in det.sources if so.version==ql_latest_version])

    return srcs

# 获取SourceObservation表中对应的SO
def querySourceObs(FXTSourceObs)->Optional[List[SourceObservation]]:
    srcs = []
    for fxtso in FXTSourceObs:
        wxt_detections = WXTDetection.query.filter(WXTDetection.obs_id==fxtso.fxt_detection.obs_id, WXTDetection.detnam ==fxtso.detnam,\
    #   WXTDetection.instrument=='FXT', \
        WXTDetection.trigger=='ihep', \
        WXTDetection.version==fxtso.fxt_detection.version).all()
        if wxt_detections is None:
            return srcs
        for wxt_detection in wxt_detections:
            wxt_detection_id = wxt_detection.id
            so = SourceObservation.query.filter(SourceObservation.wxt_detection_id==wxt_detection_id,SourceObservation.detnam==fxtso.detnam,SourceObservation.index_in_det==fxtso.index_in_det,SourceObservation.version==fxtso.version).first()
            if so is not None:
                srcs.append(so)
            # break # 只取一个wxt_detection的源
    return srcs


class FXTHLDataType(str,Enum):
    EP_FXT_IMGPNG="EP_FXT_IMGPNG"
    EP_FXT_LCPNG="EP_FXT_LCPNG"
    EP_FXT_PHAPNG="EP_FXT_PHAPNG"
    EP_FXT_PDSPNG="EP_FXT_PDSPNG"
    EP_FXT_EXPOPNG="EP_FXT_EXPOPNG"
    EP_FXT_EVT = "EP_FXT_EVT"
    EP_FXT_OOTEVT = "EP_FXT_OOTEVT"
    EP_FXT_EXPO = "EP_FXT_EXPO"
    EP_FXT_PHA = "EP_FXT_PHA"
    EP_FXT_LC = "EP_FXT_LC"
    EP_FXT_IMG = "EP_FXT_IMG"
    EP_FXT_ARF = "EP_FXT_ARF"
    EP_FXT_RMF = "EP_FXT_RMF"
    
    def __str__(self) -> str:
        return self.value
    @property
    def description(self):
        return self.value

class FXTQLDataType(str,Enum):
    EP_FXT_SRC20MINLCPNG="EP_FXT_SRC20MINLCPNG"
    EP_FXT_SRC60SLCPNG="EP_FXT_SRC60SLCPNG"
    EP_FXT_SRC1SLCPNG="EP_FXT_SRC1SLCPNG"
    EP_FXT_SRCBBPHAPNG="EP_FXT_SRCBBPHAPNG"
    EP_FXT_SRCPLPHAPNG="EP_FXT_SRCPLPHAPNG"
    EP_FXT_SRCORIPHAPNG="EP_FXT_SRCORIPHAPNG"
    EP_FXT_SRCPDSPNG="EP_FXT_SRCPDSPNG"
    EP_FXT_SRCIMGPNG="EP_FXT_SRCIMGPNG"
    
    def __str__(self) -> str:
        return self.value
    
    @property
    def description(self):
        return self.value
    
def get_fxt_hl_resource(datatype:FXTHLDataType,obsId:str,module:FXTDetNam,version:str):
    return csdb_31502.down_by_meta_data(datatype,metadata={
        "obsID":obsId,
        "module":module.short(),
        "HLver":version
    })
    

def get_fxt_ql_resource(datatype:FXTQLDataType,obsId:str,module:FXTDetNam,version:str,index_in_det:int):
    return csdb_31502.down_by_meta_data(datatype,metadata={
        "obsID":obsId,
        "module":module.short(),
        "QLver":version,
        "srcID":str(index_in_det)
    })

def send_fxt_classify_result(fxt_name: str, version: str, identified_name: str, types: str, classification: str, comments: str, ref_flux: str,ep_name:str, wxt_name:str):
    """
    通过MQTT发送FXT分类结果
    """
    msg = {
        "fxt_name": fxt_name,
        "version": version,
        "identified_name": identified_name,
        "type": types,
        "classification": classification,
        "comments": comments,
        "ref_flux": ref_flux,
        "ep_name":ep_name,
        "wxt_name":wxt_name
    }
    try:
        mq.mqtt_send("TDIC/FXT/Classify", msg=msg)
        return None
    except Exception as e:
        return "mqtt send TDIC/FXT/Classify error: "+ str(e).encode('utf-8')
    
class SearchFXTAlertResult(TypedDict):
    id:int
    obs_id:str
    detnam:str
    pnt_ra:float
    pnt_dec:float 
    obs_start:str
    source_id: str
    target_name: str
    name_match: str
    ep_name: str
    ra: float
    dec: float
    flux_match: float
    snr: float
    rate: float

def search_fxt_alert(obs_id,ra,dec,radius,start_time,end_time)->List[SearchFXTAlertResult]:
    sql = """
        SELECT f.id, p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.obs_start, f.target_name, f.name_match, f.ep_name, f.ra, f.dec,
        f.flux_match, f.snr, f.rate
            FROM (
            SELECT id, obs_id, detnam, pnt_ra, pnt_dec, obs_start 
	        FROM tdic.fxt_alert_detection WHERE
        """
    
    if start_time is not None and len(start_time)>0 and end_time is not None and len(end_time)>0:
        sql = sql + f"obs_start >='{start_time}' AND obs_start<='{end_time}' AND "
    if obs_id is not None and len(obs_id)> 0:
        sql = sql + f"obs_id like '%{obs_id}%' AND "
    if sql.endswith('AND '):
        sql = sql[:-5]+""") p 
            LEFT JOIN 
            (SELECT id, detection_id, target_name, ra, dec, name_match, ep_name, flux_match, rate, snr FROM tdic.fxt_alert_source_observation) f
            on p.id = f.detection_id;"""
    print(sql)
 
    result = db.session.execute(text(sql))
    data = result.fetchall()


    if data is not None and len(data)>0:
        obs = DataFrame(data)
        # 添加MJD
        obs_times = Time(obs['obs_start'])
   
        mjd_values = obs_times.mjd
        obs['mjd'] = mjd_values
        obs_result=obs.to_json(orient="records",date_format='iso')
    else:
        obs_result=json.dumps({'success':'no result'})
  

    return json.loads(obs_result)