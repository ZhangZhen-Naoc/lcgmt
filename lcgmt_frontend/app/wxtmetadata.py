import json
from typing import Dict, List, Tuple

from app.mwr.match_dao import cross_match
from app.mwr import match_dao
from app.mwr.querier import data_querier_factor
import traceback
from app.extensions import db
from app.data_center.models import Observation, Source, SourceObservation, SourceType, WXTDetection,\
    Pipeline, ObsTrigger, TACommentRecord,BeidouDetection,BeidouSourceObservation,\
    WXTDataVersion, AbstractDetection, AbstractSourceObservation, CF_FLUX_RATE
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
import logging
from app.lc import AddSoArg
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
#def nan_to_null(f,
#        _NULL=AsIs('NULL'),
#        _Float=Float):
#    if not np.isnan(f):
#        return _Float(f)
#    return _NULL
#
#def nan_to_null(f,
#        _NULL=AsIs('NULL'),
#        _NaN=np.NaN,
#        _Float=Float):
#    if f is not _NaN:
#        return _Float(f)
#    return _NULL
#register_adapter(float, nan_to_null)
# data_path="/Users/xuyunfei/tdic/data/wxt_product/11900000019/"
# obs_id = "11900000019"
# addMeta(obs_id, data_path)


def addMeta(data_path, obs_id):
    """ 从观测数据文件夹中获取该次观测的元数据信息，包括观测本身的信息，观测中提取的各个源的信息。观测元数据来自img文件，源信息数据来自cat文件
        data_path:
            观测数据文件夹

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
        getObsMetaFromImgfile(obs_id, os.path.join(data_path, img_file_name),cmos_index)

        cat_file_name = f'ep{obs_id}wxt{cmos_index}.cat'
        getSourceMetaFromCatfile(obs_id,os.path.join(data_path, cat_file_name),cmos_index)
    db.engine.dispose()

def addBeidouMeta(data_path):
    # oss_paths = os.environ.get("OSS_PATH","").split("-")
    # pipelines = Pipeline.qu
    header:Dict = fits.getheader(data_path)
    
    obs_id = header['OBS_ID']
    cmos = int(header['DETNAM'][4:])
    cleanup_wxt(obs_id,cmos)
    obs,bd_det = create_bd_obs(data_path)
    srcs = create_bd_src(data_path)
    wxt_det = make_wxt_det_copy(bd_det)
    for src in srcs:
        make_wxt_src_copy(src,wxt_det)
    add_pipeline_info(obs_id,uuid=os.environ.get("PIPELINE_UUID",""),oss_paths=os.environ.get("OSS_PATH","").split("-"))
    db.engine.dispose()
    
def create_bd_obs(data_path:str):
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
    obs.instrument = "beidou"
    
    db.session.commit()
    cmos = int(header['DETNAM'][4:])
    wxt = get_bd_det(obs_id,cmos)
    if not wxt:
        
        
        
        wxt:BeidouDetection = BeidouDetection.fake(obs)
        wxt.detnam = header['DETNAM']
        wxt.proc_ver = header['PROCVER']
        wxt.soft_ver = header['SOFTVER']
        wxt.origin = header['ORIGIN']
        wxt.archive_time = datetime.datetime.utcnow()
        wxt.publish_time = datetime.datetime.utcnow()+relativedelta(years=+1)
        wxt.trig_time = header['TRIGTIME']
        wxt.utcfinit = header['UTCFINIT']
        wxt.reproc = header['REPROC']
        
        wxt.trigger = ObsTrigger.beidou.value
        db.session.add(wxt)
        db.session.commit()
    return obs,wxt
    

def create_bd_src(data_path:str):
    header:Dict = fits.getheader(data_path)
    obs_id = header['OBS_ID']
    obs = Observation.query.filter_by(obs_id = obs_id).first()
    cmos = int(header['DETNAM'][4:])
    wxt = get_bd_det(obs_id,cmos)
    srcs: List[BeidouSourceObservation] = []
    for idx,item in enumerate(Table.read(data_path)):
        source_name = f'ep{obs_id}wxt{cmos}bds{idx+1}'
        source = add_source(item['RA'],item['DEC'],item['POS_ERR']/3600,source_name)
        # 这里相比标准数传缺失太多数据，所以重写
        src_obs = BeidouSourceObservation()
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
        # check_transient(src_obs) # 有点问题，暂时注释掉
        check_knownsource(src_obs)
        
        db.session.commit()
    return srcs
def cleanup(obs_id):    
    obs:Observation = Observation.query.filter(Observation.obs_id==obs_id).first()
    if obs is None:
        return
    for wxt in obs.wxt_detections:
        for src in wxt.sources:
            # if(src.issue):
            #     db.session.delete(src.issue)
            TACommentRecord.query.filter(TACommentRecord.src_id==src.id).delete()
            db.session.delete(src)
        db.session.delete(wxt)
    db.session.delete(obs)
    db.session.commit()

def cleanup_wxt(obs_id,cmos):
    """只删除某个cmos的数据

    Args:
        obs_id (_type_): _description_
        cmos (_type_): _description_
    """
    obs:Observation = Observation.query.filter(Observation.obs_id==obs_id).first()
    if obs is None:
        return
    for wxt in obs.beidou_detections:
        if int(wxt.detnam[4:])!=cmos:
            continue
        for src in wxt.sources:
            # if(src.issue):
            #     db.session.delete(src.issue)
            db.session.delete(src)
        db.session.delete(wxt)
    db.session.commit()
    
def add_pipeline_info(obs_id,uuid,oss_paths):

    for oss_path in oss_paths:
        pipeline = Pipeline(
            oss_path = oss_path,
            process_time = datetime.datetime.now(),
            pipeline_id=uuid,
            obs_id = obs_id
        )
        db.session.add(pipeline)
    db.session.commit()
    



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
            instrument = "SY01" # 试验星
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
        trig_time = hdul[0].header['TRIGTIME']
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
        wxt_det.instrument = "WXT" # 试验星
        wxt_det.obs_start = obs.obs_start
        wxt_det.obs_end = obs.obs_start
        db.session.add(wxt_det)
        db.session.flush()
        # 更新版本
        version:WXTDataVersion = addDataVersion(wxt_det)
        # 更新wxt_detection表中的fov
        corners = getFovFromExpImage(obs_id,cmos_index,data_path=os.path.dirname(img_file_path))
        # sql_str_update_fov = f'UPDATE tdic.wxt_detection set fov = scircle ( spoint (pnt_ra*pi()/180.0,pnt_dec*pi()/180.0),6.6*pi()/180.0) where id={wxt_det.id};'
        sql_str_update_fov= f'UPDATE tdic.wxt_detection set fov_new = spoly \'{{({corners[0].ra.degree}d, {corners[0].dec.degree}d),({corners[1].ra.degree}d, {corners[1].dec.degree}d),({corners[2].ra.degree}d, {corners[2].dec.degree}d),({corners[3].ra.degree}d, {corners[3].dec.degree}d)}}\' where id={wxt_det.id};'
        # print(sql_str_update_fov)
        db.session.execute(sql_str_update_fov)
        db.session.commit()
        print("insert {} {} info success".format(obs_id, detnam))

        
        # 写入版本信息
        with open(os.path.join(os.path.dirname(img_file_path),f"CMOS{cmos_index}.version"),"w") as f:
            f.write(version.version)
        return wxt_det
    except Exception as e:
        print("update wxt detection error")
        print(e)

def addDataVersion(wxt_det:WXTDetection)->WXTDataVersion:
    version:WXTDataVersion = WXTDataVersion.query.filter(
            WXTDataVersion.obs_id==wxt_det.obs_id,
            WXTDataVersion.detnam==wxt_det.detnam,
            WXTDataVersion.trigger==wxt_det.trigger 
        ).first()
    if not version: # 第一次运行，创建版本
        wxt_det.version="v1"
        version  =WXTDataVersion(
            obs_id = wxt_det.obs_id,
            detnam = wxt_det.detnam,
            trigger = wxt_det.trigger,
            version = "v1",
            detection_id = wxt_det.id
        )
        
        db.session.add(version)
    else: # 再次运行，版本加1
        old_version  =version.version
        old_det = version.detection
        new_version = "v" + str(int(old_version[1:]) + 1)
        wxt_det.version=new_version
        version.version=new_version
        version.detection_id = wxt_det.id
        
        # 发送移除旧数据的消息
        if wxt_det.trigger == ObsTrigger.telemetry:
            _remove_old_version(old_det)
    db.session.commit()
    return version

def getFovFromExpImage(obs_id,cmos_index,data_path='/data/wxt_data_new/level2'):
    exp_file_name = f'{data_path}/ep{obs_id}wxt{cmos_index}.exp'
    corners = getFovCornerPoints(exp_file_name)
    return corners
   

def getSourceMetaFromCatfile(obs_id, cat_file_path, cmos_index):
    """从cat文件中获取源信息
        obs_id:
            obs_id
        cat_file_path:
            cat_file_path
        cmos_index:
            用于生成source name
    """
    
    hdul = read_hdu(cat_file_path)
    try:
        wxt_detection = get_wxt_det(obs_id,cmos_index)
        # print(obs)
        if not wxt_detection:
            return False
        else:
            assert obs_id==hdul['OBJECTS'].header['OBS_ID'], 'CAT文件中的OBS_ID与输入obs_id不一致'
            source_data = hdul['OBJECTS'].data
            src_cnt = source_data.shape[0]
            
            for index in range(src_cnt):
                source_row = source_data[index]
                number = source_row['NUMBER']
                ra = source_row['RA']
                dec = source_row['DEC']
                pos_err = source_row['POS_ERR']
                source_name = f'ep{obs_id}wxt{cmos_index}s{number}'
                source = add_source(ra,dec,pos_err,source_name)
                new_so = add_src_obs(source,source_row,wxt_detection)
                ai_file_path = os.path.join(os.path.dirname(cat_file_path),'ai_classify.csv')
                new_so.ai_classification,new_so.ai_prob = get_ai_class(ai_file_path,new_so.name)
            try:
                db.session.commit()
                print("insert {} {} source info success".format(obs_id, str(cmos_index)))
                # 发送添加upperlimit消息
                detected_sources = [so.source for so in wxt_detection.sources]
                print(detected_sources,".............................................")
                for src in service.search_src_by_fov(wxt_detection.fov_new):
                    if src in detected_sources:
                        print("skip.............................................................")
                        continue
                    msg: AddSoArg = {
                        "src_id":src.id,
                        "so_id":wxt_detection.id,
                        "name":f'ep{wxt_detection.obs_id}wxt{wxt_detection.detnam[4:]}',
                        "flux":wxt_detection.upperlimit,
                        "flux_err":0,
                        "median_flag":True,
                        "obs_time":wxt_detection.obs_start.strftime("%Y-%m-%d %H:%M:%S"),
                        "exposure":wxt_detection.exposure_time,
                        "upperlimit_flag":True
                    }
                    mq.mqtt_send("TDIC/SO/Added",msg)
            except Exception as e:
                print(e)
                db.session.rollback()
    except Exception as e:
        print("update source and source_observation error")
        print(type(e))
        traceback.print_exc()
        print(e)

def get_type_from_cat_file(cat_file_path:str) -> SourceType:
    """
    根据文件路径获取源类型
    方法：倒数第三个/和倒数第二个/之间的部分即为类型
    """
    types = SourceType.get_type_dict().keys()
    for t in types:
        s0 = cat_file_path.rfind("/")
        s1 = cat_file_path.rfind("/",0,s0)
        s0 = cat_file_path.rfind("/",0,s1)
        if cat_file_path[s0:s1].find(t) != -1:
            return SourceType.from_str(t)


class MultiSourceException(Exception):
    ra:float
    dec:float
    def __init__(self, ra,dec) -> None:
        super().__init__()
        self.ra = ra
        self.dec = dec

def add_source(ra,dec,pos_err,name="")->Source:
    """
    - so先和已确定类型的s匹配
    - 如果没有找到匹配的s，则和其他没有类型的匹配
    - 如果也没有，则插入一条s，不设置其类别
    - TA对该so确定类别后，修改对应的s信息，如果s为已确定类别的源 ，则将这两条s记录合并成1条记录
    """
    print(f"ra,dec:{ra},{dec}")
    identified_srcs = data_querier_factor('identified_source').query(float(ra),float(dec),POS_ERR_IN_SEC/3600.0)
    
    if identified_srcs is not None: #已知源中匹配到
        src_id = identified_srcs['id'][0]
        return Source.query.get(int(src_id))
    
    unidentified_srcs = data_querier_factor('unidentified_source').query(float(ra),float(dec),POS_ERR_IN_SEC/3600.0)
    if unidentified_srcs is not None: #未知源中匹配到
        src_id = unidentified_srcs['id'][0]
        return Source.query.get(int(src_id))

    # 已知源、未知源中都没有匹配到，创建一个新的
    source = Source(source_name=name, ra=ra, dec=dec, pos_err=pos_err)
    add_obj_to_db(source)
    print(f"insert src {source.id}")

    return source


def add_src_obs(source:Source,source_row,wxt_detection:WXTDetection):
    source_id = source.id
    number = source_row['NUMBER']
    obs_id = wxt_detection.obs_id
    x = source_row['X']
    y = source_row['Y']
    x_err = source_row['X_ERR']
    y_err = source_row['Y_ERR']
    npix_source = source_row['NPIXSOU']
    net_counts = source_row['NET_COUNTS']
    bkg_counts = source_row['BKG_COUNTS']
    net_rate = source_row['NET_RATE']
    exp_time = source_row['EXPTIME']
    src_significance = source_row['SRC_SIGNIFICANCE']
    class_star = source_row['CLASS_STAR']
    elongation = source_row['ELONGATION']
    source_name = f"ep{obs_id}wxt{wxt_detection.detnam[4:]}s{number}"
    image = os.path.join(obs_id,source_name+'.img')
    light_curve = os.path.join(obs_id,source_name+'.lc')
    spectrum = os.path.join(obs_id,source_name+'.pha')
    ra = source_row['RA']
    dec = source_row['DEC']
    pos_err = source_row['POS_ERR']
    print(f"type of net_counts:{type(net_counts)}")
    source_observation = SourceObservation(source_id=source_id,
                                            wxt_detection_id= wxt_detection.id, 
                                            x=x,
                                            y=y,
                                            x_err=x_err,
                                            y_err=y_err,
                                            npix_source=npix_source,
                                            detnam=wxt_detection.detnam,
                                            index_in_det=number,
                                            net_counts=net_counts,
                                            bkg_counts =bkg_counts,
                                            net_rate=net_rate,
                                            exp_time=exp_time,
                                            src_significance=src_significance,
                                            elongation=elongation,
                                            class_star=class_star,
                                            image=image,
                                            light_curve=light_curve,
                                            spectrum=spectrum,
                                            ra=ra,
                                            dec =dec,
                                            pos_err=pos_err,
                                            version=wxt_detection.version
    )
    source.latest_net_rate = source_observation.net_rate
    try:
        
        add_obj_to_db(source_observation)
        is_known_source = check_knownsource(source_observation)
        # 已知源表里没有找到，在ep_ref表中查找
        if not is_known_source:
            check_transient(source_observation)
        source.xray_counterpart = source_observation.xray_counterpart
        source.other_counterpart = source_observation.other_counterpart
        db.session.commit()
        print(f"add obs_src {wxt_detection.obs_id},{wxt_detection.detnam},{number} success")
    except Exception as e:
        print(f"add obs_src {wxt_detection.obs_id},{wxt_detection.detnam},{number} fail")
        print(e)
    return source_observation

def read_hdu(catfile_path):
    """从catfile读取hdu，并返回"""
    try:
        hdul = fits.open(catfile_path)
        return hdul
    except IOError as e:
        print("open file error")
        print(e)

def get_wxt_det(obs_id,cmos_index)->WXTDetection:
    """
    根据观测id和cmosid得到wxtdet对象
    """
    version:WXTDataVersion = WXTDataVersion.query.filter_by(obs_id = obs_id, detnam=f'CMOS{cmos_index}').first()
    return version.detection if version else None

def get_bd_det(obs_id,cmos_index)->BeidouDetection:
    """
    根据观测id和cmosid得到北斗wxtdet对象
    """
    return BeidouDetection.query.filter_by(obs_id = obs_id, detnam=f'CMOS{cmos_index}').first()

def add_obj_to_db(obj):
    db.session.add(obj)
    db.session.commit()

def record_multi_src(ra,dec):
    """将含有多源的坐标记录到文件"""
    with open("MultiSrcPos.txt","a",encoding='utf-8')as f:
                        f.write(f"{ra},{dec}\n")


def check_transient(src:SourceObservation)->bool:
    # resp = requests.get(f"https://ep.bao.ac.cn/leia/data_center/transient_api?ra={src.ra}&dec={src.dec}&radius=600&scale=2&prob_threshold=0.01").text
    # xray_json = json.loads(resp)
    # # is_transient = all([len(srcs)==0 for srcs in xray_json.values()])
    # is_transient = len(xray_json['xray_epref'])==0
    # src.transient_candidate = is_transient
    radius = POS_ERR_IN_SEC # arcsec
    match_ep_ref = match_dao.cross_match(src.ra,src.dec,radius/3600,tc_flux=src.net_rate*2e-9,cats=['xray_epref'])
    is_transient = ((match_ep_ref is  None) or (match_ep_ref.shape[0]==0))
    src.transient_candidate = is_transient
    if is_transient:
        src.xray_counterpart  =""
        # 证认光学
        resp=""
        # TODO: 算法需要修改，不然字段太大
        # resp = requests.get(f"https://nadc.china-vo.org/ep/mwr/jsonapi?cats=optical:optical_gaiadr3&cats=infrared:infrared_allwise_cat&cats=optical:optical_des&ra={src.ra}&dec={src.dec}&radius=180&scale=2&prob_threshold=0.7").text
        src.other_counterpart = resp
    else:
        # counter_part = nearest_counterpart(xray_json,src.ra,src.dec)
        counter_part,epos = get_max_prob(match_ep_ref)
        resp=""
        resp = requests.get(f"https://nadc.china-vo.org/ep/mwr/jsonapi?cats=xray:xray_epref&ra={counter_part.ra.deg}&dec={counter_part.dec.deg}&radius={epos}&scale=2&prob_threshold=0.01").text
        src.xray_counterpart = resp
        resp=""
        # TODO: 算法需要修改，不然字段太大
        # resp = requests.get(f"https://nadc.china-vo.org/ep/mwr/jsonapi?cats=optical:optical_gaiadr3&cats=infrared:infrared_allwise_cat&cats=optical:optical_des&ra={counter_part.ra.deg}&dec={counter_part.dec.deg}&radius={epos}&scale=2&prob_threshold=0.01").text
        src.other_counterpart = resp
        
        id = match_ep_ref.iloc[0]['xray_epref']
        matched_detail = data_querier_factor('xray_epref').get_detail(id,show_position=True).iloc[0]
        pipeline_ta:User = User.query.filter(User.name=='SY01Pipeline').first()
        if pipeline_ta:
            ta_comment = {}
            ta_comment.update(ref_flux=matched_detail['ref_flux'])
            ta_comment.update(src_id=src.id)
            ta_comment.update(instrument=src.detection.instrument)
            service.ta_comment(pipeline_ta.id,ta_comment)
        src.ref_ra = matched_detail['ra']
        src.ref_dec = matched_detail['dec']
        # src.ref_flux = matched_detail['ref_flux']
        src.ref_sep = SkyCoord.separation(SkyCoord(src.ra*u.deg,src.dec*u.deg),SkyCoord(src.ref_ra*u.deg,src.ref_dec*u.deg)).degree*3600
        
    
    return is_transient

def check_knownsource(src:SourceObservation)->bool:
    radius = POS_ERR_IN_SEC # arcsec
    match_known_src = match_dao.cross_match(src.ra,src.dec,radius/3600,tc_flux=src.net_rate*2e-9,cats=['tdic.source'])
    if (match_known_src is not None) and (match_known_src.shape[0]!=0) :
        match_known_src = match_known_src.sort_values(by='prob_this_match',ascending=False)
        id = match_known_src.iloc[0]['tdic.source']
        matched_detail = data_querier_factor('tdic.source').get_detail(id,show_position=True).iloc[0]
        
        # 记录到证认记录中
        pipeline_ta:User = User.query.filter(User.name=='SY01Pipeline').first()
        if pipeline_ta:
            ta_comment = matched_detail.to_dict()
            ta_comment.update(src_id=src.id,type=matched_detail['src_type'])
            ta_comment.update(instrument=src.detection.instrument,comments="")
            service.ta_comment(pipeline_ta.id,ta_comment)
        src.ref_ra = matched_detail['ra']
        src.ref_dec = matched_detail['dec']
        # src.ref_flux = matched_detail['ref_flux']
        src.ref_sep = SkyCoord.separation(SkyCoord(src.ra*u.deg,src.dec*u.deg),SkyCoord(src.ref_ra*u.deg,src.ref_dec*u.deg)).degree*3600
        
        return True
    return False


    
def get_max_prob(match_result:DataFrame)->Tuple[SkyCoord,float]:
    """获取可能性最大的源信息

    Args:
        match_result (DataFrame): 证认结果

    Returns:
        Tuple[SkyCoord,float]: 坐标和位置误差（角秒）
    """
    sorted_result = match_result.sort_values(by='prob_this_match',ascending=False)
    src_id = sorted_result.iloc[0]['xray_epref']
    src = data_querier_factor('xray_epref').get_detail(src_id,True)
    ra = src.iloc[0]['ra']
    dec = src.iloc[0]['dec']
    pos_err = src.iloc[0]['epos'] * 3600
    return SkyCoord(ra=ra*u.degree,dec=dec*u.degree),pos_err

def nearest_counterpart(counter_parts:Dict,ra,dec)->SkyCoord:
    """返回最近的counter part坐标

    Args:
        counter_parts (_type_): API结果

    Returns:
        SkyCoord: _description_
    """
    coords:List[SkyCoord] = []
    # for catalogue in counter_parts.values():
    #     for src in catalogue:
    #         coords.append(SkyCoord(
    #             ra=src['ra']*u.degree,
    #             dec=src['dec']*u.degree
    #         ))
    for src in counter_parts['xray_epref']:
        coords.append(SkyCoord(
            ra=src['ra']*u.degree,
            dec=src['dec']*u.degree
        ))
    p0 = SkyCoord(ra=ra*u.degree,dec=dec*u.degree)
    coords.sort(key=lambda x:p0.separation(x))
    return coords[0]

def get_ai_class(file_path:str,src_name:str)->Tuple[str,float]:
    """获取AI分类结果

    Args:
        file_path (str): 
        src_name (str): _description_
    Returns: (分类，概率)

    """
    if not os.path.exists(file_path):
        return None,0
    df = pandas.read_csv(file_path)

    id_class_dict = dict(zip(df['ID'],df['predicted_class']))
    id_prob_dict = dict(zip(df['ID'],df['predicted_probability']))
    return id_class_dict.get(src_name,''),id_prob_dict.get(src_name,0)

def make_wxt_det_copy(det:AbstractDetection):
    wxt_det = WXTDetection.query.filter(
        WXTDetection.obs_id==det.obs_id,
        WXTDetection.detnam==det.detnam,
        WXTDetection.version==det.version,
        WXTDetection.trigger==det.TRIGGER
    ).first()
    if wxt_det:
        return wxt_det
    wxt_det = WXTDetection(
        obs_id=det.obs_id, 
        detnam=det.detnam, 
        version=det.version,
        trigger=det.TRIGGER,
        instrument = "WXT",
        pnt_ra=det.pnt_ra,
        pnt_dec=det.pnt_dec

    )
    
    db.session.add(wxt_det)
    db.session.commit()
    if det.TRIGGER!=ObsTrigger.ihep:  # FXT有内建版本号
        version = addDataVersion(det)
        wxt_det.version = version.version
        db.session.commit()
    return wxt_det
    
def make_wxt_src_copy(so:AbstractSourceObservation,wxt_det):
    
    logging.info(f"make_wxt_src_copy: {so.source_id},{wxt_det.id}")
    wxt_so = SourceObservation(
        ra=so.ra,
        dec=so.dec,
        source_id = so.source_id, 
        detnam=so.detnam,
        index_in_det=so.index_in_det,
        wxt_detection_id=wxt_det.id,
        net_rate=so.flux/CF_FLUX_RATE,
        version=str(so.version)
    )
    db.session.add(wxt_so)
    db.session.commit()
    
    check_knownsource(wxt_so)
    return so

def _remove_old_version(old_det:WXTDetection):
    # 发送剔除旧数据的消息
    for so in old_det.sources:
        msg :AddSoArg = {
            "src_id":so.source.id,
            "so_id":so.id,
            "obs_time":so.detection.obs_start.strftime("%Y-%m-%d %H:%M:%S"),
        }
        mq.mqtt_send("TDIC/SO/Delet",msg)
    detected_sources = [so.source for so in old_det.sources]
    for s in service.search_src_by_fov(old_det.fov_new) :
        # 已检测到该源，跳过
        print(s)
        if s in detected_sources:
            continue
        msg :AddSoArg = {
            "src_id":s.id,
            "so_id":old_det.id,
            "upperlimit_flag":True,
            "obs_time":old_det.obs_start.strftime("%Y-%m-%d %H:%M:%S")
        }
        mq.mqtt_send("TDIC/SO/Delet",msg)
if __name__=="__main__":
    pass
