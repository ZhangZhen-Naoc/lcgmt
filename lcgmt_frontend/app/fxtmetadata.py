from app.data_center.models import *
from typing import *
import datetime
from astropy.io import fits
import pathlib
import re
import csv
import os
import glob
from app.csdb import csdb_31502
from app.mwr.querier import data_querier_factor
from app.data_center.FovGenerator import getFovCornerPoints
from app.wxtmetadata import check_knownsource,make_wxt_det_copy, make_wxt_src_copy
from dateutil import parser 

def parse_float(s:str):
    return float(s) if s else 0
def addMeta(urn:str):
    connector = csdb_31502
    data_path = connector.fxt_path(urn)
    data_dir = os.path.dirname(data_path)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    resp = connector.down_from_csdb(urn)
    with open(data_path,"bw") as f:
        f.write(resp)
        print(f"download to {data_path}")
    obs_id = extract_obs_id(data_dir)
    if urn.find("IMG")!=-1: # HL文件
        print(data_dir)
        det = get_fxt_detection(data_path)
        add_fxt_detection(det)
        
        # 设置fov
        try:
            corners = getFovCornerPoints(data_path)
            sql_str_update_fov= f'UPDATE tdic.fxt_detection set fov_new = spoly \'{{({corners[0].ra.degree}d, {corners[0].dec.degree}d),({corners[1].ra.degree}d, {corners[1].dec.degree}d),({corners[2].ra.degree}d, {corners[2].dec.degree}d),({corners[3].ra.degree}d, {corners[3].dec.degree}d)}}\' where id={det.id};'
            db.session.execute(sql_str_update_fov)
            db.session.commit()
        except Exception as e:
            print("get fov error, ", e, "skip update fov")

    elif urn.find("INFOTXT") !=-1: # QL文件
        ql_file=data_path
        sos = get_fxt_src_obs(ql_file)
        detnam = FXTDetNam.A if ql_file.find('fxt_a')!=-1 else FXTDetNam.B
        for so in sos:
            add_fxt_source_obs(so,obs_id,detnam)
    elif urn.find("ALERT") !=-1: # Alert
        det,sos = get_fxt_alert(data_path)
        add_fxt_alert(det,sos)
    db.engine.dispose()
   
def  add_fxt_detection(det:FXTDetection): 
    obs = Observation.query.filter(Observation.obs_id==det.obs_id).first()
    if not obs:
        obs = Observation.fake()
        obs.instrument = 'FXT'
        obs.obs_id = det.obs_id
        obs.obj_ra = det.obj_ra
        obs.obj_dec = det.obj_dec
        obs.pnt_ra = det.pnt_ra
        obs.pnt_dec = det.pnt_dec
        obs.obs_start = det.obs_start
        obs.obs_end = det.obs_end
        db.session.commit()
    
    exist_det = FXTDetection.query.filter(
      FXTDetection.obs_id == det.obs_id,
      FXTDetection.detnam == det.detnam,
      FXTDetection.version == det.version
    ).first()
    if exist_det:
        
        exist_det.obs_mode = det.obs_mode
        exist_det.object_name = det.object_name
        exist_det.obj_ra = det.obj_ra
        exist_det.obj_dec = det.obj_dec
        exist_det.pnt_ra = det.pnt_ra
        exist_det.pnt_dec = det.pnt_dec
        exist_det.exposure_time = det.exposure_time
        exist_det.instrument = det.instrument
        exist_det.obs_start = det.obs_start
        exist_det.obs_end = det.obs_end
        exist_det.data_mode = det.data_mode
        exist_det.observer = det.observer
        exist_det.latest = det.latest
        exist_det.status = DataStatus.available
        return exist_det
    else:
        db.session.add(det)
        make_wxt_det_copy(det)
    
    
        version = det.latest_version
        if not version:
            version = FXTDataVersion(
                obs_id=det.obs_id,
                detnam=det.detnam,
                fxtdetection_id=det.id,
                hl_latest_version=version
                )
            db.session.add(version)
        version.hl_latest_version = det.version
        db.session.commit()
        return det
    
    # 更新旧的det关联的src
    # exist_dets:List[FXTDetection] = FXTDetection.query.filter(FXTDetection.obs_id==det.obs_id,FXTDetection.detnam==det.detnam).all()
    # for exist_det in exist_dets:
    #     for so in exist_det.sources:
    #         so.fxt_detection_id = det.id
    #     db.session.commit()


def add_source(ra,dec,pos_err,name="")->Source:
    """
    - so先和已确定类型的s匹配
    - 如果没有找到匹配的s，则和其他没有类型的匹配
    - 如果也没有，则插入一条s，不设置其类别
    - TA对该so确定类别后，修改对应的s信息，如果s为已确定类别的源 ，则将这两条s记录合并成1条记录
    """
    print(f"ra,dec:{ra},{dec}")
    POS_ERR_IN_SEC=15
    identified_srcs = data_querier_factor('identified_source').query(float(ra),float(dec),POS_ERR_IN_SEC/3600.0)
    
    if identified_srcs is not None: #已知源中匹配到
        src_id = identified_srcs['id'][0]
        return Source.query.get(int(src_id))
    
    unidentified_srcs = data_querier_factor('unidentified_source_with_fxt').query(float(ra),float(dec),POS_ERR_IN_SEC/3600.0)
    if unidentified_srcs is not None: #未知源中匹配到
        src_id = unidentified_srcs['id'][0]
        return Source.query.get(int(src_id))

    # 已知源、未知源中都没有匹配到，创建一个新的
    source = Source(source_name=name, ra=ra, dec=dec, pos_err=pos_err)
    source.src_type='fxt'
    db.session.add(source)
    db.session.commit()
    print(f"insert src {source.id}")

    return source

def add_fxt_source_obs(so:FXTSourceObservation,obs_id:str,detnam:FXTDetNam):
  
    add_source(so.ra,so.dec,so.ra_err,so.target_name)
    det_version = so.version[0:2] # 前两位标识det版本号
    det = FXTDetection.query.filter(FXTDetection.obs_id==obs_id,FXTDetection.detnam== detnam,FXTDetection.version==det_version).first()
    if not det: # 如果还没有添加det（源信息先到）
        obs = Observation.query.filter(Observation.obs_id==obs_id).first()
        if not obs:
            obs = Observation.fake()
            obs.instrument = 'FXT'
            obs.obs_id = obs_id
            db.session.commit()
        det = FXTDetection.fake(obs)
        wxt_det = WXTDetection.fake(obs)
        det.version = det_version
        wxt_det.version = det.version
        
        det.detnam = detnam
        wxt_det.detnam=det.detnam
        
        wxt_det.trigger = ObsTrigger.ihep
        wxt_det.instrument="FXT"
        wxt_det.version=det.version
        
        db.session.add(det,wxt_det)
        db.session.commit()
    so.fxt_detection_id=det.id
    
    db.session.add(so)
    db.session.commit()
    
    # 创建WXT中的副本
    wxt_det = make_wxt_det_copy(det)
    make_wxt_src_copy(so,wxt_det)

    
    fxt_data_version = so.detection.latest_version
    
    if not fxt_data_version:
        fxt_data_version = FXTDataVersion(
            obs_id=det.obs_id,
            detnam=det.detnam,
            fxtdetection_id=det.id,
        )
        db.session.add(fxt_data_version)
    fxt_data_version.ql_latest_version = so.version
    db.session.commit()
def get_fxt_detection(data_path)->FXTDetection:
    """获取FXTDetection元数据
    # TODO: Version, FOV
    """
    obs_id = extract_obs_id(data_path)
    # fits_path = pathlib.Path(data_path) / pathlib.Path(f"fxt/products/HL05/fxt_a_{obs_id}_ff_01_po_cl_1aa.fits")
    fits_file = fits.open(data_path)
    fits_header = fits_file[0].header

    # 将 header 数据保存为字典
    fxt_header = {
        'detnam': fits_header['DETNAM'].strip(),
        'obs_mode': fits_header['OBS_MODE'].strip(),
        'object_name': fits_header['OBJECT'].strip(),
        'obj_ra': float(fits_header['RA_OBJ']),
        'obj_dec': float(fits_header['DEC_OBJ']),
        'pnt_ra': float(fits_header['RA_PNT']),
        'pnt_dec': float(fits_header['DEC_PNT']),
        'exposure_time': float(fits_header['EXPOSURE']),
        'instrument': fits_header['INSTRUME'].strip(),
        'obs_start': datetime.datetime.fromisoformat(fits_header['DATE-OBS'].replace('T', ' ')),
        'obs_end': datetime.datetime.fromisoformat(fits_header['DATE-END'].replace('T', ' ')),
        'data_mode': fits_header['DATAMODE'].strip(),
        'observer': fits_header['OBSERVER'].strip(),
        'version': '',
        'latest': True,  # 这个属性需要根据具体情况确定
    }

    # 创建 FXTDetection 对象
    
    fxt_detection = FXTDetection()
    fxt_detection.obs_id = obs_id
    fxt_detection.detnam = fxt_header['detnam']
    fxt_detection.obs_mode = fxt_header['obs_mode']
    fxt_detection.object_name = fxt_header['object_name']
    fxt_detection.obj_ra = fxt_header['obj_ra']
    fxt_detection.obj_dec = fxt_header['obj_dec']
    fxt_detection.pnt_ra = fxt_header['pnt_ra']
    fxt_detection.pnt_dec = fxt_header['pnt_dec']
    fxt_detection.exposure_time = fxt_header['exposure_time']
    fxt_detection.instrument = fxt_header['instrument']
    fxt_detection.obs_start = fxt_header['obs_start']
    fxt_detection.obs_end = fxt_header['obs_end']
    fxt_detection.data_mode = fxt_header['data_mode']
    fxt_detection.observer = fxt_header['observer']
    fxt_detection.version = extract_hl_version(data_path)
    fxt_detection.latest = fxt_header['latest']
    fxt_detection.status = DataStatus.available

    # 关闭 FITS 文件
    fits_file.close()
    
    return fxt_detection

def get_fxt_src_obs(data_path)->List[FXTSourceObservation]:
    data:List[FXTSourceObservation] = []
    with open(data_path) as csvfile:
        reader = csv.reader(csvfile)
        for idx,row in enumerate(reader):
            
            detnam = FXTDetNam.from_str(row[0])
            obs_mode = row[1].upper() or None
            target_name = row[2] or None
            ra_target, dec_target, offset_target, ra, ra_err, dec, dec_err = [float(field) if (field is not None and field != '') else None for field in row[3:10]]
            ra_match, dec_match= [float(field) if (field is not None and field != '') else None for field in row[10:12]]
            name_match = row[12]
            ep_name = row[13]
            flux_match, rate, rate_err, flux, flux_err, snr, flux_delta, flux_delta_err, hardness = [float(field) if (field is not None and field != '') else 0 for field in row[14:23]]

            fxt_so = FXTSourceObservation(
                detnam=detnam, 
                obs_mode=obs_mode,
                target_name=target_name,ra_target =ra_target,dec_target =dec_target,
                offset_target= offset_target,ra=ra,dec = dec,ra_err=ra_err,
                dec_err= dec_err, name_match=name_match,
                ep_name = ep_name,
                ra_match =ra_match,
                dec_match =dec_match, flux_match=flux_match, rate = rate,
                rate_err= rate_err, flux = flux
                ,flux_err= flux_err, snr=snr,flux_delta=flux_delta,
                flux_delta_err = flux_delta_err,
                hardness=hardness, version=extract_ql_version(data_path)
            )
            fxt_so.index_in_det = idx+1
            data.append(fxt_so) 
        return data


def extract_hl_version(datapath:str)->str:
    """从路径提取出hl 版本号，例如 'tests/resources/fxtmetadata/11900002778/fxt/products/HL01/fxt_a_11900002778_ff_01_po_cl_1aa.fits' 提取出 01

    Args:
        datapath (str): _description_

    Returns:
        str: _description_
    """
    match = re.search(r'/HL(\d+)/', datapath)

    if match:
        # get the matched content using group
        version = match.group(1)
        return version
    else:
        return "00"
    
def extract_ql_version(datapath:str)->str:
    """从路径提取出ql 版本号，例如 'tests/resources/fxtmetadata/11900002778/fxt/products/HL01/fxt_a_11900002778_ff_01_po_cl_1aa.fits' 提取出 01

    Args:
        datapath (str): _description_

    Returns:
        str: _description_
    """
    match = re.search(r'/QL(\d+)/', datapath)

    if match:
        # get the matched content using group
        version = match.group(1)
        return version
    else:
        return "00"
def extract_obs_id(datapath:str)->str:
    
    """
    从数据文件夹中提取 ObsID 字符串
    """

    # 使用正则表达式提取观测号
    pattern = r'\d{11}'
    match = re.search(pattern, datapath)

    if match:
        obs_id = match.group(0)
        return obs_id
    else:
        print("未找到观测号")
    
def get_fxt_alert(datapath:str)->Tuple[FXTAlertDetection,List[FXTAlertSourceObservation]]:
    """
    从数据文件夹中提取 FXT 警报信息
    """
    # 读取数据文件
    rows:List[Dict] = []
    srcs:List[FXTAlertSourceObservation] = []
    with open(datapath, 'r') as f:
        rows = [row for row in csv.DictReader(f)]
    if rows.__len__() == 0:
        logging.error(f"{datapath} 文件为空")
        exit()
        
    det = FXTAlertDetection()
    det.object_name = rows[0]['srcname']
    det.obj_ra = rows[0]['ra(o)']
    det.obj_dec = rows[0]['dec(o)']
    det.pnt_ra = rows[0]['ra(o)']
    det.pnt_dec = rows[0]['dec(o)']
    det.obs_start = parser.parse(rows[0]['obsTime'])
    if det.obs_start is None:
        logging.error(f"{datapath} 文件中观测开始时间解析错误")
        logging.error(rows[0]['obsTime'])
    
    det.obs_id = rows[0]['obsID']
    det.detnam = FXTDetNam.from_str(rows[0]['module'])
    if not det.detnam:
        logging.error(f"{rows[0]['module']}")
    for idx,row in enumerate(rows):
        src = FXTAlertSourceObservation()
        src.ep_name = row['srcname']
        src.target_name = row['srcname']
        src.ra = parse_float(row['ra(o)'])
        src.dec = parse_float(row['dec(o)'])
        src.offset_target = parse_float(row['offset(")'])
        src.ra_match = parse_float(row['ra(o)'])
        src.dec_match = parse_float(row['dec(o)'])
        src.name_match = row['name_match']
        src.flux_match = parse_float(row['flux_match(erg/s/cm2)'])
        src.net_rate = parse_float(row['rate(cts/s)'])
        src.flux = parse_float(row['flux(erg/s/cm2)'])
        src.flux_err = parse_float(row['flux_err(erg/s/cm2)'])
        src.flux_delta = parse_float(row['flux_delta'])
        src.flux_delta_err = parse_float(row['flux_delta_err'])
        src.snr = parse_float(row['SNR'])
        src.index_in_det = idx+1
        
        srcs.append(src)
    return det, srcs

def add_fxt_alert(det, srcs:List[FXTAlertSourceObservation]):
    obs = Observation.query.filter(Observation.obs_id==det.obs_id).first()
    if not obs:
        obs = Observation.fake()
        obs.instrument = 'FXT'
        obs.obs_id = det.obs_id
        db.session.commit()
    
    db.session.add(det)
    wxt_det = make_wxt_det_copy(det)
    for so in srcs:
        so.detection_id=det.id
        db.session.add(so)
        make_wxt_src_copy(so,wxt_det)
        add_source(so.ra,so.dec,0,"")
        db.session.commit()