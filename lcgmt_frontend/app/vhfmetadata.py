import json
from typing import Dict, List, Tuple

from app.mwr.match_dao import cross_match
from app.mwr import match_dao
from app.mwr.querier import data_querier_factor
import traceback
from app.extensions import db
from app.data_center.models import Observation, Source, SourceObservation,  WXTDetection, VHFDetection, VHFSourceObservation, \
    Pipeline, ObsTrigger, TACommentRecord,BeidouDetection,BeidouSourceObservation,\
    WXTDataVersion, AbstractDetection, AbstractSourceObservation
from astropy.io import fits
import os, datetime
from dateutil.relativedelta import relativedelta
import numpy
from psycopg2.extensions import register_adapter, AsIs, Float
import numpy as np
from app.data_center.FovGenerator import getFovCornerPoints
import requests
from astropy import units as u
from astropy.table import Table
from astropy.coordinates import SkyCoord
from pandas import DataFrame
from app.data_center import service
from app.user.models import User
import pandas
import mq
from app.lc import AddSoArg
import logging
from dateutil import parser
from app.wxtmetadata import add_pipeline_info, getSourceMetaFromCatfile,getFovFromExpImage, addDataVersion, add_source, check_knownsource, make_wxt_det_copy, make_wxt_src_copy

CMOS_NUM=48  # 试验星设置为4，EP和模拟数据设置为48
POS_ERR_IN_SEC=10*60 # 位置误差, 10arcmin
def addapt_numpy_float32(numpy_float32):
    if np.isnan(numpy_float32):
        return AsIs('NULL')
    return AsIs(numpy_float32)
def addapt_numpy_int32(numpy_int32):
    return AsIs(numpy_int32)
register_adapter(numpy.float32, addapt_numpy_float32)
register_adapter(numpy.int32, addapt_numpy_int32)

def addMeta(data_path, obs_id):
    """ 从观测数据文件夹中获取该次观测的元数据信息，包括观测本身的信息，观测中提取的各个源的信息。观测元数据来自img文件，源信息数据来自cat文件
        data_path:
            观测数据文件夹
            
        四步：1，VHFDetection；2，VHFSourceObservation；3，WXTDetection；4，WXTSourceObservation

    """
    # if obs_id is None:
    #     if data_path[-1]=='/':
    #         obs_id = os.path.basename(os.path.dirname(data_path))
    #     else:
    #         obs_id = os.path.basename(data_path)
    
    
    # addedObsMeta = False
    # for cmos_index in range(1,CMOS_NUM+1):  # EP

    # 清理
    # cleanup(obs_id)
    
    for cmos_index in range(1,1+CMOS_NUM):  
    

        # 创建Observation和WXTDetection
        img_file_name = f'ep{obs_id}wxt{cmos_index}.img'
        img_file_path = os.path.join(data_path, img_file_name)
        if not os.path.exists(img_file_path):
            logging.info(f"CMOS {cmos_index} not exists")
            continue
        det = getObsMetaFromImgfile(obs_id, img_file_path,cmos_index)

        cat_file_name = f'ep{obs_id}wxt{cmos_index}.cat'
        cat_file_path = os.path.join(data_path, cat_file_name)
        getSourceMetaFromCatfile(obs_id,cat_file_path,cmos_index)
    db.engine.dispose()


def getObsMetaFromImgfile(obs_id, img_file_path,cmos_index:int)->WXTDetection:
    """ 从各个CMOS的img文件中获取obs元数据 
        obs_id:
            obs_id
        img_file_path:
            img文件路径
    """
    try:
        hdul = fits.open(img_file_path)
    except IOError as e:
        print("open file error")
        print(e)
        return False

    try:
        obs = Observation.query.filter_by(obs_id = obs_id).first()
        print(obs)
        if not obs: 
            assert obs_id==hdul[0].header['OBS_ID'], f'IMG文件中的OBS_ID{hdul[0].header["OBS_ID"]}与输入obs_id{obs_id}不一致'
            # instrument = hdul[0].header['INSTRUME'] # EP
            instrument = "WXT" # 试验星
            obj_ra = hdul[0].header['RA_OBJ']
            obj_dec = hdul[0].header['DEC_OBJ']
            obs_start = hdul[0].header['DATE-OBS']
            obs_end = hdul[0].header['DATE-END']
            target_id = hdul[0].header['TARG_ID']
            object_name = hdul[0].header['OBJECT']
            seqp_num = hdul[0].header['SEQPNUM']
            seg_num = hdul[0].header['SEG_NUM']
            detnam = hdul[0].header['DETNAM']  # for each cmos
            pnt_ra = hdul[0].header['RA_PNT'] # for each cmos
            pnt_dec = hdul[0].header['DEC_PNT'] # for each cmos
            pa_pnt = hdul[0].header['PA_PNT'] # for each cmos
            exposure_time = hdul[0].header['EXPOSURE']  # for each cmos
            obs = Observation(obs_id=obs_id,
                                instrument = instrument,
                                obj_ra = obj_ra,
                                obj_dec = obj_dec,
                                obs_start = obs_start,
                                obs_end = obs_end,
                                target_id = target_id,
                                object_name=object_name,
                                
                                seqp_num = seqp_num,
                                seg_num = seg_num,
                                # exposure_time =exposure_time,
                                # pnt_ra=pnt_ra,
                                # pnt_dec =pnt_dec,
                                # pa_pnt= pa_pnt
                                )
            db.session.add(obs)
            db.session.commit()
            print("update observation success")
        else:
            print("the observaiton record exists")
    except Exception as e:
        print("update observation table error")
        print(e)
    
    try:
        archive_time = datetime.datetime.utcnow()
        process_time = hdul[0].header['DATE'] # file creation date
        publish_time = datetime.datetime.utcnow()+relativedelta(years=+1)
        detnam = hdul[0].header['DETNAM']  # for each cmos
        # print(wxt_det)
        pnt_ra = hdul[0].header['RA_PNT'] # for each cmos
        pnt_dec = hdul[0].header['DEC_PNT'] # for each cmos
        pa_pnt = hdul[0].header['PA_PNT'] # for each cmos
        exposure_time = hdul[0].header['EXPOSURE']  # for each cmos
        trig_time = parser.parse(hdul[0].header['TRIGTIME']).timestamp()
        proc_ver = hdul[0].header['PROCVER']
        soft_ver = hdul[0].header['SOFTVER']
        caldb_ver = hdul[0].header['CALDBVER']
        wxt_det = WXTDetection(
            obs_id=obs_id, 
            detnam=detnam, 
            pnt_ra = pnt_ra, 
            pnt_dec = pnt_dec, 
            pa_pnt=pa_pnt, 
            exposure_time = exposure_time,
            archive_time=archive_time,
            publish_time = publish_time,
            process_time = process_time,
            trig_time = trig_time,
            proc_ver = proc_ver,
            soft_ver = soft_ver,
            caldb_ver = caldb_ver,
        )
        wxt_det.instrument = "WXT" 
        wxt_det.trigger = ObsTrigger.vhf
        wxt_det.obs_start = obs.obs_start
        wxt_det.obs_end = obs.obs_start
        db.session.add(wxt_det)
        db.session.flush()
        
        # 更新版本
        version:WXTDataVersion = addDataVersion(wxt_det)
        # 写入版本信息
        with open(os.path.join(os.path.dirname(img_file_path),f"CMOS{cmos_index}.version"),"w") as f:
            f.write(version.version)
        
        # 更新wxt_detection表中的fov
        corners = getFovFromExpImage(obs_id,cmos_index,data_path=os.path.dirname(img_file_path))
        # sql_str_update_fov = f'UPDATE tdic.wxt_detection set fov = scircle ( spoint (pnt_ra*pi()/180.0,pnt_dec*pi()/180.0),6.6*pi()/180.0) where id={wxt_det.id};'
        sql_str_update_fov= f'UPDATE tdic.wxt_detection set fov_new = spoly \'{{({corners[0].ra.degree}d, {corners[0].dec.degree}d),({corners[1].ra.degree}d, {corners[1].dec.degree}d),({corners[2].ra.degree}d, {corners[2].dec.degree}d),({corners[3].ra.degree}d, {corners[3].dec.degree}d)}}\' where id={wxt_det.id};'
        # print(sql_str_update_fov)
        db.session.execute(sql_str_update_fov)
        db.session.commit()
        print("insert {} {} info success".format(obs_id, detnam))

        
        
        return wxt_det
    except Exception as e:
        print("update wxt detection error")
        print(e)

def create_vhf_alert(data_path:str):
    header:Dict = fits.getheader(data_path)
    
    obs_id = header['OBS_ID']
    cmos = int(header['DETNAM'][4:])
    # cleanup_wxt(obs_id,cmos)
    obs,det = create_vhf_obs(data_path)
    # 创建wxt中的副本
    wxt_det = make_wxt_det_copy(det)
    srcs = create_vhf_src(data_path)
    add_pipeline_info(obs_id,uuid=os.environ.get("PIPELINE_UUID",""),oss_paths=os.environ.get("OSS_PATH","").split("-"))
    
    for src in srcs:
        make_wxt_src_copy(src,wxt_det)
    db.engine.dispose()

def create_vhf_obs(data_path:str):
    header:Dict = fits.getheader(data_path)
    
    obs_id = header['OBS_ID']
    obs = Observation.query.filter_by(obs_id = obs_id).first()
    if not obs:
        obs = Observation.fake()
        db.session.add(obs)
    obs.obs_id = obs_id
    obs.obs_start = header['DATE-OBS']
    obs.obs_end = header['DATE-END']
    obs.obj_ra=header['RA_OBJ']
    obs.obj_dec=header['DEC_OBJ']
    obs.pnt_ra = header['RA_PNT']
    obs.pnt_dec = header['DEC_PNT']
    obs.pa_pnt= header['PA_PNT']
    obs.target_id = header['TARG_ID']
    obs.object_name = header['OBJECT']
    
    obs.seqp_num = header['SEQPNUM']
    obs.seg_num = header['SEG_NUM']
    # obs.instrument = header['INSTRUME']
    
    db.session.commit()
    cmos = int(header['DETNAM'][4:])
    
    wxt:VHFDetection = VHFDetection.fake(obs)
    wxt.detnam = header['DETNAM']
    wxt.proc_ver = header['PROCVER']
    wxt.soft_ver = header['SOFTVER']
    wxt.origin = header['ORIGIN']
    wxt.archive_time = datetime.datetime.utcnow()
    wxt.publish_time = datetime.datetime.utcnow()+relativedelta(years=+1)
    wxt.trig_time = header['TRIGTIME']
    wxt.utcfinit = header['UTCFINIT']
    wxt.reproc = header['REPROC']
    
    wxt.trigger = ObsTrigger.vhf
    db.session.add(wxt)
    db.session.commit()
    return obs,wxt
   


def create_vhf_src(data_path:str):
    header:Dict = fits.getheader(data_path)
    obs_id = header['OBS_ID']
    obs = Observation.query.filter_by(obs_id = obs_id).first()
    cmos = int(header['DETNAM'][4:])
    wxt = get_vhf_det(obs_id,cmos)
    srcs: List[VHFSourceObservation] = []
    for idx,item in enumerate(Table.read(data_path)):
        source_name = f'ep{obs_id}wxt{cmos}bds{idx+1}'
        source = add_source(item['RA'],item['DEC'],item['POS_ERR']/3600,source_name)
        # 这里相比标准数传缺失太多数据，所以重写
        src_obs = VHFSourceObservation()
        src_obs.source_id = source.id
        src_obs.detection_id = wxt.id
        src_obs.detnam = wxt.detnam
        src_obs.ra = item['RA']
        src_obs.dec = item['DEC']
        src_obs.pos_err = item['POS_ERR']/3600 # 角秒转化为度
        src_obs.x = item['X']
        src_obs.y = item['Y']
        src_obs.var = item['VAR']
        src_obs.hr = item['HR']
        src_obs.net_rate = item['NET_RATE']
        src_obs.src_significance = item['SRC_SIGNIFICANCE']
        src_obs.index_in_det = idx+1
        
        src_obs.qparam = item["QPARAM"]
        src_obs.src_code = item["SRC_CODE"]
        src_obs.rank = item["RANK"]
        
        srcs.append(src_obs)
        db.session.add(src_obs)
        db.session.commit()  # 因为下面需要用到id
        
    return srcs
 
def get_vhf_det(obs_id,cmos_index)->VHFDetection:
    """
    根据观测id和cmosid得到VHF wxtdet对象
    """
    version:WXTDataVersion = WXTDataVersion.query.filter_by(obs_id = obs_id, detnam=f'CMOS{cmos_index}',trigger=ObsTrigger.vhf).first()
    if version is None:
        return None
    wxt = version.detection
    
    return VHFDetection.get(obs_id,f'CMOS{cmos_index}', version.version)[1] #0是base_detection


