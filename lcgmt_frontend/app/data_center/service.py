from typing import List, Union
from flask import current_app, jsonify
from typing import Dict,List,TypedDict, Any

from pandas.core.frame import DataFrame
import requests
from app.data_center.forms import ObservationSearchForm
from app.data_center.models import *
from app.extensions import db
from flask import request
from sqlalchemy import text, and_,desc
import os
from app.operation_log.models import OperationLog
import time
from datetime import timedelta
from app import utils
from werkzeug.datastructures import MultiDict
import json
import mq
from app.lc import AddSoArg,AddSrcArg


TA_QUICK_TOOL_MODULE_NAME = "TA_QUICK_TOOL"
TA_OUTDATE=20 # TA登录20s过期
def search_obs(form:ObservationSearchForm)->Union[DataFrame,List]:
    """
    依据ObservationSearchForm，搜索符合条件的观测
    有符合条件的观测时，返回Pandas Dataframe，其中，列名包括：private,pnt_ra,pnt_dec,obs_start,obs_end,exposure_time,user_name,obs_id,detnam；
    搜索结果为空时，返回空List
    """
    sql = """
        SELECT p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exposure_time, f.obs_start, f.obs_end, f.private, f.user_id, f.user_name 
            FROM (
            SELECT obs_id, detnam, pnt_ra, pnt_dec, exposure_time
	        FROM tdic.wxt_detection 
        """
    ra = form.ra.data
    dec = form.dec.data
    radius = form.radius.data
    obs_id = form.obs_id.data
    start_date = form.start_datetime.data
    end_date = form.end_datetime.data
    object_name = form.object_name.data
    object_resolver = request.form.getlist('object_resolver_option')
    wxt = request.form.get('instrument1') #暂时只有WXT的数据
    fxt = request.form.get('instrument2')
    if ra is not None and dec is not None and radius is not None:
        sql = sql + f" WHERE scircle ( spoint ({ra}*pi()/180.0,{dec}*pi()/180.0),{radius}*pi()/180.0) && fov_new) p INNER JOIN ((SELECT obs_id, obs_start, obs_end, pi_id,private FROM tdic.observation WHERE INSTRUMENT= 'WXT' AND "
    else:
        sql = sql + ") p INNER JOIN ((SELECT obs_id, obs_start, obs_end, pi_id, private FROM tdic.observation WHERE INSTRUMENT= 'WXT' AND "

    if object_name is not None and len(object_name)> 0:
        # 解析天体名称，得到其坐标
        pass

    if start_date is not None and end_date is not None:
        sql = sql + f"obs_start >='{start_date}' AND obs_end<='{end_date}' AND "

    if obs_id is not None and len(obs_id)> 0:
        sql = sql + f"obs_id like '%{obs_id}%' AND "

    if sql.endswith("WXT' "):
        sql = sql[:-7]+') a LEFT JOIN (SELECT id as user_id, name as user_name, email as user_email FROM tdic.user) b ON a.pi_id=b.user_id) f on p.obs_id = f.obs_id;'
    elif sql.endswith('AND '):
        sql = sql[:-5]+') a LEFT JOIN (SELECT id as user_id, name as user_name, email as user_email FROM tdic.user) b ON a.pi_id=b.user_id) f on p.obs_id = f.obs_id;'#去掉最后的AND和空格
    print(sql)
    result = db.session.execute(text(sql))
    data = result.fetchall()

    if data is not None and len(data)>0:
        obs = DataFrame(data)
        obs.columns = result.keys()
    else:
        obs=[]

    return obs

class SearchSy01ObsResult(TypedDict):
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

def search_sy01_obs(obs_id,ra,dec,radius,start_time,end_time)->List[SearchSy01ObsResult]:
    """
    依据ObservationSearchForm，搜索符合条件的观测
    有符合条件的观测时，返回Pandas Dataframe，其中，列名包括：private,pnt_ra,pnt_dec,obs_start,obs_end,exposure_time,user_name,obs_id,detnam；
    搜索结果为空时，返回空List
    Args:
        radius: degree
    """
    sql = """
        SELECT p.id, p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exposure_time, p.fov_new, p.version, f.obs_start, f.obs_end, f.private, f.user_id, f.user_name 
            FROM (
            SELECT id, obs_id, detnam, pnt_ra, pnt_dec, exposure_time, fov_new, version
	        FROM tdic.wxt_detection WHERE status='available' AND trigger='telemetry'
        """
    # ra = form.ra.data
    # dec = form.dec.data
    # radius = form.radius.data
    # obs_id = form.obs_id.data
    # start_date = form.start_datetime.data
    # end_date = form.end_datetime.data
    # object_name = form.object_name.data
    # object_resolver = request.form.getlist('object_resolver_option')
    # wxt = request.form.get('instrument1') #暂时只有WXT的数据
    # fxt = request.form.get('instrument2')
    if ra is not None and len(ra)>0 and dec is not None and len(dec)>0 and radius is not None and len(radius)>0:
        sql = sql + f"  AND scircle ( spoint ({ra}*pi()/180.0,{dec}*pi()/180.0),{radius}*pi()/180.0) && fov_new) p INNER JOIN ((SELECT obs_id, obs_start, obs_end, pi_id,private FROM tdic.observation WHERE INSTRUMENT='SY01' AND "
    else:
        sql = sql + ") p INNER JOIN ((SELECT obs_id, obs_start, obs_end, pi_id, private FROM tdic.observation WHERE INSTRUMENT='SY01' AND "

    # if object_name is not None and len(object_name)> 0:
    #     # 解析天体名称，得到其坐标
    #     pass

    if start_time is not None and len(start_time)>0 and end_time is not None and len(end_time)>0:
        sql = sql + f"obs_start >='{start_time}' AND obs_end<='{end_time}' AND "

    if obs_id is not None and len(obs_id)> 0:
        sql = sql + f"obs_id like '%{obs_id}%' AND "

    if sql.endswith("'SY01' "):
        sql = sql+') a LEFT JOIN (SELECT id as user_id, name as user_name, email as user_email FROM tdic.user) b ON a.pi_id=b.user_id) f on p.obs_id = f.obs_id;'
    elif sql.endswith('AND '):
        sql = sql[:-5]+') a LEFT JOIN (SELECT id as user_id, name as user_name, email as user_email FROM tdic.user) b ON a.pi_id=b.user_id) f on p.obs_id = f.obs_id;'#去掉最后的AND和空格
    # print(sql)
 
    result = db.session.execute(text(sql))
    data = result.fetchall()
    # 只保留最新版本
    group_key = lambda x: x['obs_id']+x['detnam']
    data.sort(key=group_key)
    grouped_data = groupby(data, group_key)
    max_versions = {}

    for key, group in grouped_data:
        max_version = None
        max_elem = None

        for elem in group:
            if max_version is None or int(elem['version'][1:]) > max_version:
                max_version = int(elem['version'][1:])
                max_elem = elem

        max_versions[key] = max_elem
    data = list(max_versions.values())
    

    if data is not None and len(data)>0:
        obs = DataFrame(data)
        # 添加MJD
        obs_times = Time(obs['obs_start'])
        mjd_values = obs_times.mjd
        obs['mjd'] = mjd_values
        
        # obs.columns = result.keys()
        # 添加upperlimit 
        obs['upperlimit'] = obs['exposure_time'].apply(lambda x:'{:.16f}'.format(calculate_leia_upperlimit(x)))
        obs_result=obs.to_json(orient="records",date_format='iso')
    else:
        obs_result=json.dumps({'success':'no result'})
  

    return json.loads(obs_result)

def search_wxt_obs(obs_id,ra,dec,radius,start_time,end_time)->List[SearchSy01ObsResult]:
    """
    依据ObservationSearchForm，搜索符合条件的观测
    有符合条件的观测时，返回Pandas Dataframe，其中，列名包括：private,pnt_ra,pnt_dec,obs_start,obs_end,exposure_time,user_name,obs_id,detnam；
    搜索结果为空时，返回空List
    Args:
        radius: degree
    """
    sql = """
        SELECT p.id, p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exposure_time, p.fov_new, p.version, f.obs_start, f.obs_end, f.private, f.user_id, f.user_name 
            FROM (
            SELECT id, obs_id, detnam, pnt_ra, pnt_dec, exposure_time, fov_new, version
	        FROM tdic.wxt_detection WHERE status='available' AND trigger='telemetry'
        """

    if ra is not None and len(ra)>0 and dec is not None and len(dec)>0 and radius is not None and len(radius)>0:
        sql = sql + f"  AND scircle ( spoint ({ra}*pi()/180.0,{dec}*pi()/180.0),{radius}*pi()/180.0) && fov_new) p INNER JOIN ((SELECT obs_id, obs_start, obs_end, pi_id,private FROM tdic.observation WHERE INSTRUMENT='WXT' AND "
    else:
        sql = sql + ") p INNER JOIN ((SELECT obs_id, obs_start, obs_end, pi_id, private FROM tdic.observation WHERE INSTRUMENT='WXT' AND "

    # if object_name is not None and len(object_name)> 0:
    #     # 解析天体名称，得到其坐标
    #     pass

    if start_time is not None and len(start_time)>0 and end_time is not None and len(end_time)>0:
        sql = sql + f"obs_start >='{start_time}' AND obs_end<='{end_time}' AND "

    if obs_id is not None and len(obs_id)> 0:
        sql = sql + f"obs_id like '%{obs_id}%' AND "

    if sql.endswith("'WXT' "):
        sql = sql+') a LEFT JOIN (SELECT id as user_id, name as user_name, email as user_email FROM tdic.user) b ON a.pi_id=b.user_id) f on p.obs_id = f.obs_id;'
    elif sql.endswith('AND '):
        sql = sql[:-5]+') a LEFT JOIN (SELECT id as user_id, name as user_name, email as user_email FROM tdic.user) b ON a.pi_id=b.user_id) f on p.obs_id = f.obs_id;'#去掉最后的AND和空格
    # print(sql)
 
    result = db.session.execute(text(sql))
    data = result.fetchall()
    # 只保留最新版本
    group_key = lambda x: x['obs_id']+x['detnam']
    data.sort(key=group_key)
    grouped_data = groupby(data, group_key)
    max_versions = {}

    for key, group in grouped_data:
        max_version = None
        max_elem = None

        for elem in group:
            if max_version is None or int(elem['version'][1:]) > max_version:
                max_version = int(elem['version'][1:])
                max_elem = elem

        max_versions[key] = max_elem
    data = list(max_versions.values())

    if data is not None and len(data)>0:
        obs = DataFrame(data)
        # 添加MJD
        obs_times = Time(obs['obs_start'])
        mjd_values = obs_times.mjd
        obs['mjd'] = mjd_values
        
        # obs.columns = result.keys()
        # 添加upperlimit 
        obs['upperlimit'] = obs['exposure_time'].apply(lambda x:'{:.16f}'.format(calculate_leia_upperlimit(x)))
        obs_result=obs.to_json(orient="records",date_format='iso')
    else:
        obs_result=json.dumps({'success':'no result'})
    return json.loads(obs_result)

def search_src_by_fov(fov:FOV)->List[Source]:
    """根据FOV查找该FOV覆盖的源

    Args:
        fov (FOV): _description_

    Returns:
        List[Source]: _description_
    """
    if fov is None:
        return []
    query = Source.query.filter(Source.src_type.in_(["known_source","burst","transient"]))
    query =  query.where(text('spoly \''+FOVColumn().bind_processor(None)(fov)+'\' && scircle(spoint(ra*pi()/180,dec*pi()/180),0)'))
    return query.all()
def lv1_tarball_path(obsid:str,cmosid:str)->str:
    """根据obsid和cmosid得到lv1数据文件路径"""
    path =  f"wxt_product_level1/tarball/ep{obsid}cmos{cmosid}lv1.tar.gz"
    if not os.path.exists(path):
        tarlv1(obsid,cmosid)
    return path

def lv2_tarball_path(obsid:str,cmosid:str)->str:
    """根据obsid和cmosid得到lv2数据文件路径"""
    path= f"wxt_product_level2/tarball/ep{obsid}cmos{cmosid}lv2.tar.gz"
    if not os.path.exists(path):
        tarlv2(obsid,cmosid)
    return path

    
def tarlv1(obsid:str,cmosid:str):
    """对lv1进行打包，tar.sh文件放在lv1数据目录下，示例：
obs=$1
wxt=$2
cd /data/wxt_product_level2
datapathInSed="$obs\/"
echo $obs $wxt
files=$(ls $obs | grep wxt$wxt | grep -v wxt$wxt[0-9] | grep -v wxt4s | sed "s/^/$obs\//")
echo $files
tar -czvf ./tarball/ep${obs}cmos${wxt}lv2.tar.gz $files

    Args:
        obsid (str): [description]
        cmosid (str): [description]
    """
    os.system(f"bash /data/wxt_product_level1/tar.sh {obsid} {cmosid}")

def tarlv2(obsid:str,cmosid:str):
    os.system(f"bash /data/wxt_product_level2/tar.sh {obsid} {cmosid}")
    return f"wxt_product_level1/tarball/ep{obsid}cmos{cmosid}lv1.tar.gz" 

def get_token()->str:
    # return "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1dDAxIiwidXNlcklkIjoiNzY1IiwibmFtZSI6InV0IiwiZXhwIjoxNjUwODc4ODI1fQ.E8mGQgN_XOArob8tLeBQfC-gNtBmkWX5Uo_UtXZdcAJU7h7VFoyp7rF36khn4u41JeQOQYHSG9UXASU409ZxqLkA2uJcrKqe8lt3KYC6Y8kEaqGpLcBqzJlJpILHtGACaG-tFK3cjtH41SnMZifxNQ3v4lUcno7nfWD-nAcodVg"

    resp = requests.post("http://{BASE_URL}:31502/user/auth/token",headers={
        "Content-Type": "application/json"
    },json = {
        "password": current_app.config.get("CSDB_PASSWORD"),
        "username": current_app.config.get("CSDB_USERNAME")
    })
    if resp.status_code==200 and resp.json()['code']==0:
        return resp.json()['data']['token']
    else:
        raise Exception("csdb auth error")
def download_from_csdb(filepath:str)->bytes:
    resp= requests.get(f"http://{BASE_URL}:31502/csdb/v1/storage{filepath}",headers={
        "X-AUTH-TOKEN":get_token()
    })
    
    if resp.status_code==400:
        return None
        
    elif resp.status_code==200:
        return resp.content
    elif resp.status_code==401:
        raise Exception("csdb auth error")
    else:
        raise Exception("csdb error")

def lv2_file_list(obs_id:str,cmosid:int)->List[str]:
    """生成2级文件的文件路径列表
    TODO: 源的文件

    Args:
        obs_id (str): 观测号
        cmosid (int): CMOSID

    Returns:
        List[str]: _description_
    """
    suffixes = ['arm.reg','.cat','detection.pdf','.exp','.expcorr','.img','img.gif','.mkf','po_cl.evt','po_clgti.fits','po_ufbp.fits','po_uf.evt','po_ufhp.fits','.prefilter','rawinstr.exp.gz']
    files = [f'ep{obs_id}wxt{cmosid}{suffix}' for suffix in suffixes]
    files.append(f'wxt{cmosid}mkf.conf')
    file_paths = [f'/epdata/{obs_id}//{file}' for file in files]
    return file_paths

def find_transient(time_start:datetime=None,time_end=None,type_=[])->List[Source]:
    query = SourceTypeRelation.query
    if len(type_) != 0:
        query = query.filter_by(type=type_[0])

    if time_start is not None:
        query = query.filter(SourceTypeRelation.identify_time>=time_start)
    return [s_t.source for s_t in query.all()]

def get_lc_file_name(obs_id,cmos_id,index_in_det):
    filename = f'ep{obs_id}wxt{cmos_id[4:]}s{index_in_det}lc.gif'
    return os.path.join('wxt_product_level2',obs_id,filename)

def get_spec_file_name(obs_id,cmos_id,index_in_det):
    filename = f'ep{obs_id}wxt{cmos_id[4:]}s{index_in_det}ph.gif'
    return os.path.join('wxt_product_level2',obs_id,filename)

def ta_source_update(ta_id,updates:MultiDict):
    src_id=updates['src_id']
    src: Source = Source.query.get(src_id)
    src.ra = updates.get('ra') 
    src.dec = updates.get('dec') 
    src.pos_err = updates.get('pos_err') 
    src.simbad_name = updates.get('simbad_name')
    src.classification = updates.get('classification')
    old_type = src.src_type
    if src.src_type != updates.get("type"):
        OperationLog.add_log("Source",f"Source {src.id} type updated from {src.src_type} to {updates.get('type')} by {ta_id}",User.query.get(ta_id))
        src.src_type = updates.get('type')
    src.ref_flux = updates.get('ref_flux') or None # 如果是""，会导致插入数据库出错，转化为None
    
    # 如果一个已知源被删除
    if old_type in ["known_source","burst","transient"] and not src.src_type:
        msg : AddSrcArg = {
            "src_id": src.id
        }
        mq.mqtt_send("TDIC/Src/Delet",msg)
    SourceTagRelationship.query.filter_by(src_id=src.id).delete()
    for tag_name in updates.getlist('tags[]'):
        
        tag = SourceTag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = SourceTag(name=tag_name)
            db.session.add(tag)
            db.session.commit()
    
        db.session.add(SourceTagRelationship(tag_id=tag.id,src_id=src.id))
            
    db.session.commit()
    

def _need_to_update_source(old_type:str,new_type:str):
    """证认后是否更新到source:
    如果一个SO之前被判定为known、burst但后来又改成宇宙线或者fake之类的，不要更新到S里

    Args:
        old_type (_type_): 原类型
        new_type (_type_): 新类型
    """

    if old_type in ['known_source','burst'] and new_type not in ['known_source','burst']:
        return False
    return True
    
class TACommentMessage(TypedDict):
    src_id: int
    instrument: str
    type: str
    simbad_name: str
    classification: str


def ta_comment_alert(ta_id,comments:TACommentMessage):
    '''
    TA record the identification about beidou vhf alert, these records are not update into the source list.
    '''
    src_id=comments['src_id']
    src: AbstractSourceObservation
    record = TACommentRecord()
    ta:User = User.get_user_byid(ta_id)
    record.src_id = src_id
    record.ta_id = ta_id
    record.update_date = datetime.now()
    simbad_name = comments.get('simbad_name')
    if simbad_name:
        record.simbad_name = simbad_name
    
    src_type = comments.get('type')
    if src_type:
        record.src_type = src_type
    classification = comments.get('classification')
    if classification:
        record.classification = classification
    ref_flux =comments.get('ref_flux')
    if ref_flux:
        record.ref_flux = ref_flux
    db.session.add(record)
    db.session.commit()
    OperationLog.add_log("TA_COMMENT",f"On alert so {src_id},{ta.name} comment: {comments}",ta)
    
def ta_comment(ta_id,comments:TACommentMessage):
    """TA对源进行标记

    Args:
        ta_id (_type_): _description_
        comments (TACommentMessage): _description_
    """
    src_id=comments['src_id']
    src: AbstractSourceObservation
    record = TACommentRecord()
    ta:User = User.get_user_byid(ta_id)
    
    # if comments.get('instrument')=='beidou':
    #     src = BeidouSourceObservation.query.get(src_id)
    #     record.bd_id = src_id
    # else:
    src = SourceObservation.query.get(src_id)
    record.src_id = src_id
    old_type = src.src_type
    new_type = comments.get('type')
    
    need_to_update_source = _need_to_update_source(src.source.src_type,new_type)
    simbad_name = comments.get('simbad_name')
    ep_name = comments.get('ep_name')
    fxt_name = comments.get('fxt_name')
    instrument= comments.get('instrument')
    wxt_name = comments.get('wxt_name')
    if simbad_name: # 无论是什么类型的源，都以该名称作为关联标准
        # 如果该simbad_name存在，重新绑定已存在的source上
        exist_src: Source = Source.query.filter(Source.simbad_name==simbad_name,Source.src_type.in_(["known_source","burst"])).first()
        if exist_src and exist_src.id != src.source_id:
            old_src = src.source
            OperationLog.add_log("TA_COMMENT",f"rebind so {src_id} from {src.source_id} to {exist_src.id}",ta)
            src.source_id = exist_src.id
            exist_src.latest_net_rate = src.net_rate
            # 往时序数据库发消息
            if src.detection.instrument in ["SY01"]:
                src:SourceObservation
                unbind_msg :AddSoArg = {
                    "src_id":old_src.id,
                    "so_id":src.id,
                    "obs_time":src.wxt_detection.obs_start.strftime("%Y-%m-%d %H:%M:%S")
                }
                # SO 与原S解绑消息
                mq.mqtt_send("TDIC/SO/Delet",unbind_msg)
                # SO与新S绑定消息
                bind_msg : AddSoArg = {
                    "src_id":src.source.id,
                    "so_id":src.id,
                    "name":src.name,
                    "flux":src.flux,
                    "flux_err":src.flux_err,
                    "median_flag":True,
                    "obs_time":src.detection.obs_start.strftime("%Y-%m-%d %H:%M:%S"),
                    "exposure":src.detection.exposure_time,
                    "upperlimit_flag":False
                }
                mq.mqtt_send("TDIC/SO/Added",bind_msg)
        src.source.simbad_name = simbad_name
        record.simbad_name = simbad_name
        if ep_name:
            src.source.ep_name = ep_name
            record.ep_name = ep_name
        if wxt_name:
            src.source.wxt_name = wxt_name
            record.wxt_name = wxt_name
        if fxt_name:
            src.source.fxt_name = fxt_name
    classification = comments.get('classification')
    if classification:
        record.classification = classification
    src_type = comments.get('type')
    if src_type:
        record.src_type = src_type
    
    comments_ = comments.get("comments") # comments字段
    if comments_:
        record.comments = comments_
    ref_flux = comments.get('ref_flux') or None
    if ref_flux:
        record.ref_flux = ref_flux
    
    if need_to_update_source:
        old_source_type = src.source.src_type
        if src_type:
            OperationLog.add_log("Source",f"Source {src.id} type updated from {src.src_type} to {src_type} by {ta_id}",ta)
            src.source.src_type = src_type
        if comments_:
            src.source.comments = comments_
        if ref_flux:
            src.source.ref_flux = ref_flux
        if classification:
            src.source.classification = classification
        if ep_name:
            src.source.ep_name = ep_name
        if wxt_name:
            src.source.wxt_name = wxt_name
        if fxt_name:
            src.source.fxt_name = fxt_name

        # 如果是一个未标记的被标记为已知天体，发送消息
        if old_source_type not in ["known_source","burst","transient"] \
            and new_type in ["known_source","burst","transient"] \
            and src.detection.instrument in ["SY01"] :
            # 往时序数据库发消息
            msg: AddSrcArg = {
                "src_id":src.source.id
            }
            mq.mqtt_send("TDIC/Src/Added",msg)
    
    # 一个SO从其他标记为已知天体，发送绑定消息
    if old_type not in ["known_source","burst","transient"] \
        and new_type in ["known_source","burst","transient"] \
            and src.detection.instrument in ["SY01"] :
        # 往时序数据库发消息
        bind_msg : AddSoArg = {
            "src_id":src.source.id,
            "so_id":src.id,
            "name":src.name,
            "flux":src.flux,
            "flux_err":src.flux_err,
            "median_flag":True,
            "obs_time":src.detection.obs_start.strftime("%Y-%m-%d %H:%M:%S"),
            "exposure":src.detection.exposure_time,
            "upperlimit_flag":False
        }
        mq.mqtt_send("TDIC/SO/Added",bind_msg)
    # 一个SO从已知天体标记其他，发送消息
    if old_type in ["known_source","burst","transient"] \
        and new_type not in ["known_source","burst","transient"] \
            and src.detection.instrument in ["SY01"] :
        # 往时序数据库发消息
        unbind_msg = {
            "src_id":src.source.id,
            "so_id":src.id,
            "obs_time":src.detection.obs_start.strftime("%Y-%m-%d %H:%M:%S"),
        }
        mq.mqtt_send("TDIC/SO/Delet",unbind_msg)
            
        
    record.ta_id = ta_id
    record.update_date = datetime.now()
    db.session.add(record)
    db.session.commit()
    OperationLog.add_log("TA_COMMENT",f"On so{src.id}, s{src.source_id},{ta.name} comment: {comments}",ta)
    
def get_ta_records(src_id):
    return TACommentRecord.query.filter(TACommentRecord.src_id==src_id)\
        .order_by(desc(TACommentRecord.update_date)).all()

def get_current_ta(channel=ObsTrigger.telemetry) -> Optional[User]:
    """获取当前TA"""
    recent_log: OperationLog =  OperationLog.query \
        .filter(OperationLog.from_module==TA_QUICK_TOOL_MODULE_NAME+'_'+channel) \
        .order_by(OperationLog.operation_time.desc()) \
        .first()
    if recent_log is not None and recent_log.operation_time+timedelta(0,TA_OUTDATE) > utils.now():
        return recent_log.operator

    else:
        return None
        
def get_pipeline_events(obsid:str)->List[str]:
    pipelines = Pipeline.query\
        .filter(Pipeline.obs_id==obsid)\
        .filter(Pipeline.oss_path.like('%EVT_0A%')) \
        .all()
    events = set([evt.oss_path for evt in pipelines])
    
    return sorted(list(events))

def get_pipeline_0b_events(obsid:str)->List[str]:
    pipelines = Pipeline.query\
        .filter(Pipeline.obs_id==obsid)\
        .filter(Pipeline.oss_path.like('%0B%')) \
        .all()
    events = set([evt.oss_path for evt in pipelines])
    
    return sorted(list(events))


def querySourceObsByTimeSpan(start_datetime, end_datetime, trigger = [ObsTrigger.telemetry.value])->Optional[List[SourceObservation]]:
    """根据时间范围和触发类型查询源

    Args:
        start_datetime (_type_): 开始时间
        end_datetime (_type_): 结束时间
        trigger (_type_, optional):产生原因. Defaults to ObsTrigger.telemetry.value.

    Returns:
        Optional[List[SourceObservation]]: _description_
    """
    start_time = time.time()  # 记录开始时间
    if start_datetime is not None and end_datetime is not None:
        # sql_str = f'q3c_radial_query(ra,dec, {ra},{dec},{radius})'
        # start_time = datetime.now() - timedelta(3)
        # start_time = time.time()  # 记录开始时间
        query = WXTDetection.query

        # 限定在SY01：
        # query = query.filter(WXTDetection.instrument=='SY01')

        query = query.options(
            db.joinedload(WXTDetection.sources)
        ).filter(WXTDetection.instrument=='SY01')

        # 限定在数传和VHF
        query = query.filter(WXTDetection.trigger.in_(trigger))
        # 排除不可见数据
        query = query.filter(WXTDetection.status==DataStatus.available)
        # 时间
        query = query.filter(and_( WXTDetection.obs_start>start_datetime, WXTDetection.obs_end<end_datetime ))
        # 排序和执行
        wxtDetections:List[WXTDetection] = query.order_by(WXTDetection.obs_start.desc()).all()
       
        
        
        # 找出最新的det
        group_key = lambda x: x.obs_id+x.detnam
        wxtDetections.sort(key=group_key)
        grouped_data = groupby(wxtDetections, group_key)
        max_versions = {}

        for key, group in grouped_data:
            max_version = None
            max_elem = None

            for elem in group:
                if max_version is None or int(elem.version[1:]) > max_version:
                    max_version = int(elem.version[1:])
                    max_elem = elem

            max_versions[key] = max_elem
        wxtDetections = list(max_versions.values())
        sourceObs = SourceObservation.query\
            .join(WXTDetection)\
            .join(Observation)\
            .options(
                db.joinedload(SourceObservation.wxt_detection)\
                .joinedload(WXTDetection.observation),
                db.joinedload(SourceObservation.ta_comments)
            )\
            .filter(
            SourceObservation.wxt_detection_id.in_([wd.id for wd in wxtDetections])
        ).all()
        # sourceObs = [source for wd in wxtDetections for source in wd.sources]
        # end_time = time.time()  # 记录结束时间
        # print(f"querySourceObsByTimeSpan: {end_time-start_time}s")
        return sourceObs
    return None
    
def get_wxt_detection_by_obsid_cmos(obs_id:str,cmos_id:str)->Optional[WXTDetection]:
    version: WXTDataVersion = WXTDataVersion.query.filter(
        WXTDataVersion.obs_id==obs_id,
        WXTDataVersion.detnam==cmos_id
    ).first()
    if version and version.detection: # version表找到记录
        return version.detection
    else:
        return WXTDetection.query.filter_by(obs_id=obs_id,detnam=cmos_id).first()

def get_wxt_detection_by_obsid_cmos_version(obs_id:str,cmos_id:str,version:str)->Optional[WXTDetection]:
    det: WXTDetection = WXTDetection.query.filter(
        WXTDetection.obs_id==obs_id,
        WXTDetection.detnam==cmos_id,
        WXTDetection.version==version
    ).first()
    return det

def get_all_version_wxt_detections_by_obsid_cmos(obs_id:str,cmos_id:str)->Optional[WXTDetection]:
    dets: WXTDetection = WXTDetection.query.filter(
        WXTDetection.obs_id==obs_id,
        WXTDetection.detnam==cmos_id,
    ).all()
    return dets

def get_recent_wxt_so(src:Source)->SourceObservation:
    """获取最新观测流量

    Args:
        src (Source): _description_
    """
    sos = list(src.wxt_detections)
    if sos.__len__() > 0:
        return sorted(sos,key=lambda x:x.detection.obs_start,reverse=True)[0]
