from app.data_center.models import BeidouDetection,BeidouSourceObservation,  DataStatus,SourceObservation,WXTDetection
from typing import *
from sqlalchemy import and_, text
import json
from pandas.core.frame import DataFrame
from astropy.time import Time
from app.extensions import db
from itertools import groupby

def queryBeidouSourceObsByTimeSpan(start_datetime, end_datetime)->Optional[List[BeidouSourceObservation]]:
    """根据时间范围和触发类型查询源

    Args:
        start_datetime (_type_): 开始时间
        end_datetime (_type_): 结束时间
        trigger (_type_, optional):产生原因. Defaults to ObsTrigger.telemetry.value.

    Returns:
        Optional[List[SourceObservation]]: _description_
    """
    if start_datetime is not None and end_datetime is not None:
        # sql_str = f'q3c_radial_query(ra,dec, {ra},{dec},{radius})'
        # start_time = datetime.now() - timedelta(3)
        query = BeidouDetection.query


        # 排除不可见数据
        query = query.filter(BeidouDetection.status==DataStatus.available)
        # 时间
        query = query.filter(and_( BeidouDetection.obs_start>start_datetime, BeidouDetection.obs_end<end_datetime ))
        # 排序和执行
        wxtDetections = query.order_by(BeidouDetection.obs_start.desc()).all()
        sourceObs = []
        for wd in wxtDetections:
            sourceObs.extend(wd.sources)
        return sourceObs
    return None

# 获取SourceObservation表中对应的SO
def querySourceObs(BeidouSourceObs)->Optional[List[SourceObservation]]:
    srcs = []
    for beidou_so in BeidouSourceObs:
        wxt_detections = WXTDetection.query.filter(WXTDetection.obs_id==beidou_so.detection.obs_id,WXTDetection.detnam ==beidou_so.detnam, WXTDetection.instrument=='WXT',\
        WXTDetection.trigger=='beidou', \
        WXTDetection.version==beidou_so.detection.version).all()
        if wxt_detections is None:
            return srcs
        for wxt_detection in wxt_detections:
            wxt_detection_id = wxt_detection.id
            so = SourceObservation.query.filter(SourceObservation.wxt_detection_id==wxt_detection_id,SourceObservation.detnam==beidou_so.detnam,SourceObservation.index_in_det==beidou_so.index_in_det\
                                                # ,SourceObservation.version==beidou_so.version\
                                                    ).first()
            if so is not None:
                srcs.append(so)
    return srcs

class SearchBeidouObsResult(TypedDict):
    id:int
    obs_id:str
    detnam:str
    pnt_ra:float
    pnt_dec:float 
    exposure_time:float
    fov_new:Any
    version:str
    obs_start:str
    obs_end:str
    private:Any
    user_id:int
    user_name:str
    upperlimit:str # 为保证精度，不能转换成float传输

def search_beidou_obs(obs_id,ra,dec,radius,start_time,end_time)->List[SearchBeidouObsResult]:
    sql = """
        SELECT p.id, p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exposure_time, p.fov_new, p.version, p.obs_start, p.obs_end, p.trig_time, f.ra, f.dec, f.pos_err, f.x, f.y, f.hr, f.net_rate, f.var, f.src_significance, f.src_code 
            FROM (
            SELECT id, obs_id, detnam, pnt_ra, pnt_dec, exposure_time, fov_new, version, obs_start, obs_end, trig_time 
	        FROM tdic.beidou_detection WHERE status='available' AND
        """
    
    # if ra is not None and len(ra)>0 and dec is not None and len(dec)>0 and radius is not None and len(radius)>0:
    #     sql = sql + f"  AND scircle ( spoint ({ra}*pi()/180.0,{dec}*pi()/180.0),{radius}*pi()/180.0) && fov_new) p INNER JOIN ((SELECT obs_id, obs_start, obs_end, pi_id,private FROM tdic.observation WHERE INSTRUMENT='beidou' AND "
    # else:
    #     sql = sql + ") p INNER JOIN ((SELECT obs_id, obs_start, obs_end, pi_id, private FROM tdic.observation WHERE INSTRUMENT='beidou' AND "

    # if object_name is not None and len(object_name)> 0:
    #     # 解析天体名称，得到其坐标
    #     pass

    if start_time is not None and len(start_time)>0 and end_time is not None and len(end_time)>0:
        sql = sql + f"obs_start >='{start_time}' AND obs_end<='{end_time}' AND "

    if obs_id is not None and len(obs_id)> 0:
        sql = sql + f"obs_id like '%{obs_id}%' AND "

    if sql.endswith("'beidou' "):
        sql = sql+') p LEFT JOIN (SELECT detection_id , ra, dec, pos_err,x,y,hr,net_rate,var,src_significance,src_code FROM tdic.beidou_source_observation) b ON a.pi_id=b.user_id) f on p.id = f.detection_id;'
    elif sql.endswith('AND '):
        sql = sql[:-5]+') p LEFT JOIN (SELECT detection_id , ra, dec, pos_err,x,y,hr,net_rate,var,src_significance,src_code FROM tdic.beidou_source_observation) f on p.id = f.detection_id;'#去掉最后的AND和空格
    # print(sql)
 
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

def get_beidou_sourceobs_by_id(alert_id:str)->Optional[BeidouSourceObservation]:
    beidou_sourceobs: BeidouSourceObservation = BeidouSourceObservation.query.filter(
        BeidouSourceObservation.detection_id==alert_id
    ).first()
    return beidou_sourceobs