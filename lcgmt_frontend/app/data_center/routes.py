from datetime import datetime, timedelta
from io import BytesIO
import logging
import traceback
import requests
from typing import List
from functools import wraps
from unittest import result
import flask
from flask import make_response, render_template, current_app, request, abort,send_from_directory, jsonify,redirect
from flask.helpers import url_for
from flask_login import login_required, current_user
from flask import send_file
import numpy as np
from app.data_center import upperlimit_api
import pandas as pd
from scipy.spatial.transform import Rotation as R
from app.decorators import permission_required
from app.data_center import bp, service
from app.data_center.models import DataStatus, FOVColumn, Issue, Observation, Source,\
    SourceEncoder, SourceTypeRelation, WXTDetection,SourceObservation,FXTSourceObservation, FOV, \
    SourceType,SourceObsEncoder, SourceSimpleJSONEncoder,DataApplication,\
    DataApplicationJSONEncoder, Pipeline, ObsTrigger, IdentifiedSourceEncoder, \
    TACommentRecord, SourceTag, SourceTagRelationship, WXTDataVersion, SourceObsListCommentsEncoder, \
    SourceObsDetailEncoder
from app.data_center.forms import ObservationSearchForm, SourceSearchForm
from sqlalchemy import desc, text,and_
from app.extensions import db
from app.mwr import match_dao
from app.mwr.models import CatalogueMetadata
from app.mwr.routes import  comprehensiveResult
from app.mwr.xmatchlib import fastskymatch as match
from pandas import DataFrame
import os,json
from app.data_center.lc import convert_lc
from app.observation_plan.wxtutils import plane2sphere
from app.operation_log.models import OperationLog
from app.proposal_admin.model import ProposalSourceList, ProposalSrcEncoder
from app.utils import zip_filestreams
import simplejson
from typing import Dict
from app import csrf,OperationLog
from numpy import pi
from app.redmine import *
from astropy import units as u
from astropy.coordinates import SkyCoord
from app.alert.routes import get_alert_by_radec, get_grb_by_radec_time
from dateutil.relativedelta import relativedelta
from app.user import service as user_service
from sqlalchemy.aql.expression import or_
import time
from app.csdb import csdb_31602,csdb_31502
from app.decorators import auth_required

@bp.route('/aladin_test',methods=['GET'])
def aladin_test():
    return render_template('app/data_center/aladin_test.html')

# without SY01
@bp.route('/observation_data', methods=['GET', 'POST'])
@login_required
# @permission_required('SYSTEM_ADMIN')
def observation_data():
    """
    综合检索SQL示例
    SELECT p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exposure_time, f.obs_start, f.obs_end 
    FROM (
    SELECT obs_id, detnam 
	FROM tdic.wxt_detection 
	where scircle ( spoint (289.058*pi()/180.0,78.073*pi()/180.0),0.001*pi()/180.0) && fov_new
    ) p
    LEFT JOIN
    (
	SELECT obs_id, obs_start, obs_end
	FROM tdic.observation
    WHERE obs_start >= "2009-01-10" AND obs_end <= "2023-10-11" AND 
    obs_id like '%1990%'
    ) F on P.obs_id = F.obs_id;
    """

    form = ObservationSearchForm()

    # update 20220922 剔除 SY01 的数据
    sql =  """
    SELECT p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exposure_time, f.obs_start, f.obs_end, f.private, f.user_id, f.user_name 
    FROM (
    SELECT obs_id, detnam,pnt_ra,pnt_dec,exposure_time
	FROM tdic.wxt_detection 
    ) p
    INNER JOIN
    (
	(SELECT obs_id, obs_start, obs_end, pi_id, private
	FROM tdic.observation WHERE INSTRUMENT= 'WXT') a LEFT JOIN (SELECT id as user_id, name as user_name, email as user_email FROM tdic.user) b ON a.pi_id=b.user_id
    ) F on P.obs_id = F.obs_id ORDER BY f.obs_end LIMIT 144;
    """
    obs = []
    if request.method == 'GET':
        result = db.session.execute(text(sql))
        data = result.fetchall()
        if data is not None and len(data)>0:
            obs = DataFrame(data)
            obs.columns = result.keys()  
        hint = f"LATEST OBSERVATIONS (Order by observation date)"  
    
    # obs = Observation.query.order_by(Observation.obs_end.desc()).limit(20).all()
    if request.method == 'POST':
        if not form.validate_on_submit():
            hint = "\n".join([f"{k}:{v}" for k,v in form.errors.items()])
            return render_template('app/data_center/observation_data.html', obs=[], form=form, hint=hint)
        obs = service.search_obs(form)
        
        if isinstance(obs,(DataFrame,)):
            hint = f"Find {len(obs)} observation records."
        else:
            hint="Find no records."
            # print(obs)
    return render_template('app/data_center/observation_data.html', obs=obs, form=form, hint = hint)

@bp.route('/wxt_observation_data', methods=['GET'])
# @login_required
@permission_required(['WXT_ACCESS','WXT_LIMITED_ACCESS','WXT_VIEW','WXT_APPLICATION'])
def wxt_observation_data_access():
    # result = db.session.execute(text(sql))
    form = ObservationSearchForm()
    if current_user.can('WXT_ACCESS')or current_user.can('WXT_LIMITED_ACCESS'):
        OperationLog.add_log(bp.name, 'visit wxt observation data search page ', current_user)
        return render_template('app/data_center/wxt_observation_data.html', form=form)
    elif current_user.can('WXT_VIEW') and current_user.can('WXT_APPLICATION'):
        applications = DataApplication.query.filter(DataApplication.apply_user_id==current_user.id).all()
        applications_json = json.dumps(applications,cls=DataApplicationJSONEncoder)
        OperationLog.add_log(bp.name, 'visit wxt observation data request page ', current_user)
        return render_template('app/data_center/wxt_observation_data_application.html', form=form,applications=applications_json)
    elif current_user.can('WXT_VIEW'):
        OperationLog.add_log(bp.name, 'visit wxt observation data search page ', current_user)
        return render_template('app/data_center/wxt_observation_data.html', form=form)


@bp.route('/sy01_observation_data', methods=['GET'])
# @login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','SY01_APPLICATION','WXT_ACCESS'])
def sy01_observation_data_access():
    # result = db.session.execute(text(sql))
    form = ObservationSearchForm()
    if current_user.can('SY01_ACCESS')or current_user.can('SY01_LIMITED_ACCESS'):
        OperationLog.add_log(bp.name, 'visit sy01 observation data search page ', current_user)
        return render_template('app/data_center/sy01_observation_data.html', form=form)
    elif current_user.can('SY01_VIEW') and current_user.can('SY01_APPLICATION'):
        applications = DataApplication.query.filter(DataApplication.apply_user_id==current_user.id).all()
        applications_json = json.dumps(applications,cls=DataApplicationJSONEncoder)
        OperationLog.add_log(bp.name, 'visit sy01 observation data request page ', current_user)
        return render_template('app/data_center/sy01_observation_data_application.html', form=form,applications=applications_json)
    elif current_user.can('SY01_VIEW'):
        OperationLog.add_log(bp.name, 'visit sy01 observation data search page ', current_user)
        return render_template('app/data_center/sy01_observation_data.html', form=form)

#  WXT data
@bp.route('/api/wxt_observation_data/', methods=['POST'])
@csrf.exempt
# @login_required
# @permission_required('SY01_ACCESS')
def wxt_observation_data():
    """
    综合检索SQL示例
    SELECT p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exposure_time, f.obs_start, f.obs_end 
    FROM (
    SELECT obs_id, detnam 
	FROM tdic.wxt_detection 
	where scircle ( spoint (289.058*pi()/180.0,78.073*pi()/180.0),0.001*pi()/180.0) && fov_new
    ) p
    LEFT JOIN
    (
	SELECT obs_id, obs_start, obs_end
	FROM tdic.observation
    WHERE  WHERE INSTRUMENT= 'SY01' and obs_start >= "2009-01-10" AND obs_end <= "2023-10-11" AND 
    obs_id like '%1990%'
    ) F on P.obs_id = F.obs_id;
    """

    # form = ObservationSearchForm()
    if len(request.form)>0:
        obs_id= request.form.get("obs_id")
        ra = request.form.get("ra")
        dec = request.form.get("dec")
        radius = request.form.get("radius")
        start_time = request.form.get("start_datetime")
        end_time = request.form.get("end_datetime")
    else:
        obs_id= request.json["obs_id"]
        ra = request.json["ra"]
        dec = request.json["dec"]
        radius = request.json["radius"]
        start_time = request.json["start_datetime"]
        end_time = request.json["end_datetime"]
    obs = service.search_sy01_obs(obs_id,ra,dec,radius,start_time,end_time)
    return flask.jsonify(obs)


#  SY01 data
@bp.route('/api/sy01_observation_data/', methods=['POST'])
@csrf.exempt
# @permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','SY01_APPLICATION','WXT_ACCESS'])
@permission_required('SY01_ACCESS')
# @auth_required
def sy01_obbervation_data():
    """
    综合检索SQL示例
    SELECT p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exfosure_time, f.obs_start, f.obs_end 
    FROM (
    SELECT obs_id, detnam 
	FROM tdic.wxt_detection 
	where scircle ( spoint (289.058*pi()/180.0,78.073*pi()/180.0),0.001*pi()/180.0) && fov_new
   6) p
    LEFT JOIN
    (
	SELECT obs_id, obs_start, obs_end
	FROM tdic.observation
    WHERE  WHERE INSTRUMENT= 'SY01' and obs_start >= "2009-01-10" AND obs_end <= "2023-10-11" AND 
    obs_id like '%1990%'
    ) F on P.obs_id = F.obs_id;
    """

    # form = ObservationSearchForm()
    if len(request.form)>0:
        obs_id= request.form.get("obs_id")
        ra = request.form.get("ra")
        dec = request.form.get("dec")
        radius = request.form.get("radius")
        start_time = request.form.get("start_datetime")
        end_time = request.form.get("end_datetime")
    else:
        obs_id= request.json["obs_id"]
        ra = request.json["ra"]
        dec = request.json["dec"]
        radius = request.json["radius"]
        start_time = request.json["start_datetime"]
        end_time = request.json["end_datetime"]
    obs = service.search_sy01_obs(obs_id,ra,dec,radius,start_time,end_time)
    return flask.jsonify(obs)



@bp.route('/api/observation_data_application', methods=['POST'])
@login_required
@permission_required(['SY01_APPLICATION'])
def observation_data_application():
    if len(request.form)>0:
        send_id = request.form.getlist("ids[]")# wxt detection的id
        reason = request.form.get("reason")
        data_application = DataApplication(apply_user_id=current_user.id,apply_time=datetime.now(),reason=reason)
        db.session.add(data_application)
        db.session.flush()
        for id in send_id:
          detection =  WXTDetection.query.filter(WXTDetection.id==id).first()
          data_application.detections_applied.append(detection)
        db.session.commit()
    return jsonify({'succes':'ok','ids':send_id})

@bp.route('/sy01_data_request_management', methods=['GET'])
@login_required
@permission_required(['SY01_ADMIN'])
def sy01_data_request_management():
    applications = DataApplication.query.filter().all()
    applications_json = json.dumps(applications,cls=DataApplicationJSONEncoder)
    OperationLog.add_log(bp.name, 'visit sy01 observation data request management page ', current_user)

    return render_template('app/data_center/sy01_data_request_management.html', applications=applications_json)
        
@bp.route('/api/change_data_request_status', methods=['POST'])
@login_required
@permission_required(['SY01_ADMIN'])
def change_data_request_status():
    if len(request.form)>0:
        id = request.form.get("id")# request id
        origin_status = request.form.get("origin_status") # the status of the request

        data_application = DataApplication.query.filter(DataApplication.id==id).first()
        new_status= False
        if origin_status=='false' or origin_status=='False':
            new_status = True
        elif origin_status =='true' or origin_status=='True':
            new_status=False
        data_application.approved=new_status
        data_application.approver_id = current_user.id
        if new_status == True:
            data_application.approve_time = datetime.now()
            data_application.data_invalid_time = datetime.now() + relativedelta(months=1)
        else:
            data_application.approve_time = None
            data_application.data_invalid_time = None
        # data_application.save()
        db.session.commit()
        # data_application = DataApplication.query.filter(DataApplication.id==id)

        applications_json = json.dumps(data_application,cls=DataApplicationJSONEncoder)
    # return jsonify({'succes':'ok','new_row':applications_json})
    return jsonify({'succes':'ok','id':id,'new_row':applications_json})
# @bp.route('/api/get_user_application', methods=['GET'])
# @login_required
# @permission_required(['SY01_APPLICATION'])
# def get_user_application():
   
#         # userid = request.args.get("user_id")
#     applications = DataApplication.query.filter(DataApplication.apply_user_id==current_user.id).all()

    # return jsonify({'succes':'ok','ids':send_id})


@bp.route('/transient_api', methods=['GET', 'POST'])
@bp.route('/api', methods=['GET', 'POST'])
@csrf.exempt
def api():
    ra = request.args.get('ra',type=float)
    dec = request.args.get('dec',type=float)
    radius = request.args.get('radius',type=float)/3600.
    flux = request.args.get('flux',type=float)
    scale = request.args.get('scale',type=float)
    prob_threshold=request.args.get('prob_threshold',type=float)
    if scale==None:
        scale=1.5
    if prob_threshold==None:
        prob_threshold=0.001
    
    # ep结果
    # ep_sources = db.session.query(Source)\
    #     .filter(text('q3c_radial_query(ra,dec, :ra_center,:dec_center,:radius)'))\
    #     .params(ra_center=ra,dec_center=dec,radius=radius)\
    #     .filter(Source.src_type.in_(['known_source', 'burst','transient']))\
    #     .all()
    tables = CatalogueMetadata.enabled_catalogues('x-ray')
    tables_name = [table.table_name for table in tables]
    # ep_ref 放到第一个（第一个应是SY01，后面插入，现在ep_ref放在第一个）
    tables_name.remove("xray_epref")
    tables_name.insert(0,"xray_epref")
    tables_name.insert(0,'tdic.source')
    
    # result = {'SY01':ep_sources,'EP':ep_sources}
    result = {}
    
    # MWR结果
    
    for table in tables_name:
        try:
            # srcs = match_dao.data_querier_factor(table).query(ra,dec,radius)
            srcs = match_dao.cross_match(ra,dec,radius,flux,[table],scale,prob_threshold)
        except Exception as e:
            print(traceback.format_exc())
            srcs = None
        if srcs is not None and len(srcs)>0:
            # src_detail = match_dao.get_srcs_detail(table,srcs[table],True)
            # src_detail['id'] = srcs[table]
            srcs = srcs.reset_index(drop=True)
            srcs = comprehensiveResult(srcs, True) # 对目标与单个星表的交叉结果进行再处理，将匹配天体的具体属性查找出来，拼接为针对某一个具体星表的属性和交叉结果
            srcs = srcs.loc[srcs['prob_this_match']>=prob_threshold]   # 筛选出大于输入的prob threshold值的
            # single_cat_id_ra_dec = pd.concat([ srcs.iloc[:,1].astype('string'),srcs[['ra','dec','epos']]],axis =1, sort=False)
            result[table] = list(srcs.to_dict(orient='index').values())
        else:
            result[table] = []
    
    # 重命名
    result['SY01'] = result['tdic.source']
    result['EP'] = result['tdic.source']
    result.pop('tdic.source')
    json_str = json.dumps(result,cls=SourceEncoder)
    json_str = json_str.replace("NaN","null")
    json_str = json_str.replace("src_type","type")
    json_str = json_str.replace("epos","pos_err")
    json_str = json_str.replace("ref_flux","flux")


    resp = make_response(json_str)
    resp.content_type = "application/json"
    
    return resp

# http://127.0.0.1:5000/ep/data_center/api/relatedobs?obsid=11900000001&cmosid=CMOS1
# without SY01
@bp.route('/api/relatedobs', methods=['GET', 'POST'])
def relatedobs():
    obs_id = request.args.get('obsid',type=str)
    cmos_id = request.args.get('cmosid',type=str)
    wxt_detection:WXTDetection = service.get_wxt_detection_by_obsid_cmos(obs_id,cmos_id) 
    if wxt_detection is None:
        resp = make_response(json.dumps(None,cls=SourceEncoder))
        resp.content_type = "application/json"
        return resp
    fov_object = wxt_detection.fov_new
    obs_time = wxt_detection.observation.obs_start
    query_time_start = obs_time - timedelta(180)
    query_time_end = obs_time + timedelta(180)
    related_detections:List[WXTDetection] = WXTDetection.query.filter().filter(FOVColumn.has_overlap(fov_object)).order_by(WXTDetection.exposure_time.desc()).all()

    results = []
    for det in related_detections:
        if det.observation.obs_start > query_time_start \
            and det.observation.obs_start < query_time_end \
            and fov_object.overlapped_ratio_large_than_0_1(det.fov_new) and det.observation.instrument!='SY01':
            results.append({"obs_id":det.obs_id,
            "cmos_id":det.detnam,
            # "proportion":ratio
        })

    
    resp = make_response(json.dumps(results,cls=SourceEncoder))
    resp.content_type = "application/json"
    
    return resp


# http://127.0.0.1:5000/ep/data_center/api/sy01relatedobs?obsid=17000000047&cmosid=CMOS13
# without SY01
@bp.route('/api/sy01relatedobs', methods=['GET', 'POST'])
def sy01relatedobs():
    obs_id = request.args.get('obsid',type=str)
    cmos_id = request.args.get('cmosid',type=str)
    wxt_detection:WXTDetection = service.get_wxt_detection_by_obsid_cmos(obs_id,cmos_id)
    if wxt_detection is None:
        resp = make_response(json.dumps(None,cls=SourceEncoder))
        resp.content_type = "application/json"
        return resp
    fov_object = wxt_detection.fov_new
    obs_time = wxt_detection.observation.obs_start
    query_time_start = obs_time - timedelta(180)
    query_time_end = obs_time + timedelta(180)
    related_detections:List[WXTDetection] = WXTDetection.query.filter(db.and_(WXTDetection.instrument=='SY01' ,FOVColumn.has_overlap(fov_object))).order_by(WXTDetection.exposure_time.desc()).all()

    results = []
    for det in related_detections:
        if det.observation.obs_start > query_time_start \
            and det.observation.obs_start < query_time_end \
            and fov_object.overlapped_ratio_large_than_0_1(det.fov_new):
            results.append({"obs_id":det.obs_id,
            "cmos_id":det.detnam,
            # "proportion":ratio
        })

    # related_detections = [det for det in related_detections if fov_object.overlapped_ratio(det.fov_new) > 0.1]
    # related_detections.sort(key=lambda x: fov_object.overlapped_ratio(x.fov_new))
    # results = []
    # for detection in related_detections:
    #     results.append({"obs_id":
    #         detection.obs_id,
    #         "cmos_id":detection.detnam,
    #         "proportion":fov_object.overlapped_ratio(detection.fov_new)
    #     })
    
    resp = make_response(json.dumps(results,cls=SourceEncoder))
    resp.content_type = "application/json"
    
    return resp

# http://127.0.0.1:5000/ep/data_center/api/related_proposals?obsid=11900000001&cmosid=CMOS1
@bp.route('/api/related_proposals', methods=['GET', 'POST'])
def related_proposals():
    obs_id = request.args.get('obsid',type=str)
    cmos_id = request.args.get('cmosid',type=str)
    wxt_detection:WXTDetection = service.get_wxt_detection_by_obsid_cmos(obs_id,cmos_id)
    srcs =  ProposalSourceList.find_by_fov(wxt_detection.fov_new)
    return json.dumps(srcs,cls=ProposalSrcEncoder)

@bp.route('/api/related_proposals/<float:q1>/<float:q2>/<float:q3>/<float:q4>/', methods=['GET', 'POST'])
def find_proposals_by_quat(q1:float,q2:float,q3:float,q4:float):
    quat = R.from_quat(np.array([q1, q2, q3, q4]))
    x = np.array([0, 4096, 4096, 0])
    y = np.array([0, 0, 4096, 4096])
    data = {}
    for i in range(1,5): #[1,4]
        radec = plane2sphere(quat, x, y, i)
        fov_str = f"({radec[0][0]} , {radec[0][1]}),({radec[1][0]} , {radec[1][1]}),({radec[2][0]} , {radec[2][1]}),({radec[3][0]} , {radec[3][1]})"
        fov = FOV(fov_str)
        srcs =  ProposalSourceList.find_by_fov(fov)
        
        data[f"CMOS{i+12}"] = srcs
    

    return json.dumps(data,cls=ProposalSrcEncoder)

@bp.route("/api/upperlimit")
async def upperlimit():
    ra = request.args.get('ra',type=float)
    dec = request.args.get('dec',type=float)
    radius = request.args.get('radius',type=float)/3600.
    ep_sources = db.session.query(Source).filter(text('q3c_radial_query(ra,dec, :ra_center,:dec_center,:radius)')).params(ra_center=ra,dec_center=dec,radius=radius).all()
    result = {'ep':ep_sources}
    # ESA Upper limit结果
    try:
        result['upperlimit'] = await upperlimit_api.get_upper_limit(ra,dec)
    except Exception as e:
        result['upperlimit'] = {'error':"ESA Upperlimit service unavailable or format changed, query failed"}

    resp = make_response(simplejson.dumps(result,ignore_nan=True,cls=SourcxSimpleJSONEncoder))
    resp.content_type = "application/json"
    return resp
    


# https://ep.bao.ac.cn/leia/observation_data/quick_look/image    
@bp.route('/obsevation_data/quick_look/image/<obs_id>/<cmos_id>/<version>', methods=['GET'])
# @login_required
def get_quick_look_image(obs_id,cmos_id,version):
    cmos_num = cmos_id[4:]
    content = csdb_31602.down_by_meta_data("wxt2_IMG",{
        "obsId":obs_id,
        "cmos":cmos_num,
        "version":version
    })
    # EP
    if content is None:
        content = csdb_31502.down_by_meta_data("wxt2_IMG",{
        "OBS_ID":obs_id,
        "CMOS_ID":cmos_num,
        "VERSION":version
    })
    io = BytesIO(content)
    return flask.send_file(io,mimetype='image/gif')

#ep06800000947wxt15detection.pdf
@bp.route('/obsevation_data/quick_look/detection_pdf/<obs_id>/<cmos_id>/<version>', methods=['GET'])
# @login_required
def get_quick_look_detection_pdf(obs_id,cmos_id,version):
    cmos_num = cmos_id[4:] 
    content = csdb_31602.down_by_meta_data("wxt2_PDF",{
        "obsId":obs_id,
        "cmos":cmos_num,
        "version":version
    })
    # EP
    if content is None:
        content = csdb_31502.down_by_meta_data("wxt2_PDF",{
        "OBS_ID":obs_id,
        "CMOS_ID":cmos_num,
        "VERSION":version
    })
    io = BytesIO(content)
    return flask.send_file(io,mimetype='application/pdf')


@bp.route('/obsevation_data/quick_look/lc/<obs_id>/<cmos_id>/<index_in_det>/<version>', methods=['GET'])
# @login_required
def get_quick_look_light_curve(obs_id,cmos_id,index_in_det,version):
    cmos_num = cmos_id[4:] 
    content = csdb_31602.down_by_meta_data("wxt2_LC",{
        "obsId":obs_id,
        "cmos":cmos_num,
        "src":str(index_in_det),
        "version":version
    })
    # EP
    if content is None:
        content = csdb_31502.down_by_meta_data("wxt2_LC",{
        "OBS_ID":obs_id,
        "CMOS_ID":cmos_num,
        "VERSION":version
    })
    io = BytesIO(content)
    return flask.send_file(io,mimetype='image/gif')


@bp.route('/obsevation_data/quick_look/spectrum/<obs_id>/<cmos_id>/<index_in_det>/<version>', methods=['GET'])
# @login_required
def get_quick_look_spectrum(obs_id,cmos_id,index_in_det,version):
    cmos_num = cmos_id[4:] 
    content = csdb_31602.down_by_meta_data("wxt2_PH",{
        "obsId":obs_id,
        "cmos":cmos_num,
        "src":str(index_in_det),
        "version":version
    })
    # EP
    if content is None:
        content = csdb_31502.down_by_meta_data("wxt2_PH",{
        "OBS_ID":obs_id,
        "CMOS_ID":cmos_num,
        "VERSION":version
    })
    io = BytesIO(content)
    return flask.send_file(io,mimetype='image/gif')



@bp.route('/obsevation_data/observation_detail/<obs_id>/<cmos_id>', methods=['GET'])
@login_required
def observation_detail(obs_id,cmos_id):
    obs = Observation.query.filter_by(obs_id=obs_id).first()
    if obs.instrument=='SY01' and not current_user.can('SY01_ACCESS') and not current_user.can('SY01_LIMITED_ACCESS')and not current_user.can('SY01_VIEW'):
        abort(403)
    wxt_detection:WXTDetection = service.get_wxt_detection_by_obsid_cmos(obs_id,cmos_id)
    if wxt_detection is None:
        resp = make_response(json.dumps(None,cls=SourceEncoder))
        resp.content_type = "application/json"
        return resp
    fov_object = wxt_detection.fov_new

    obs_time = wxt_detection.observation.obs_start
    query_time_start = obs_time - timedelta(180)
    query_time_end = obs_time + timedelta(180)
    related_detections:List[WXTDetection] = WXTDetection.query.filter(FOVColumn.has_overlap(fov_object)).limit(20).all()
    related_detections = [det for det in related_detections if \
        det.observation.obs_start > query_time_start \
        and det.observation.obs_start < query_time_end \
        and fov_object.overlapped_ratio_large_than_0_1(det.fov_new) 
        and det.observation.instrument!='SY01'
    ]

    if obs.private and current_user != obs.pi:
        abort(403)
    else:
        sourceObs = SourceObservation.query.filter_by(wxt_detection_id=wxt_detection.id,detnam=cmos_id).all() #得到的是sourceObservation的关联List
    OperationLog.add_log(bp.name, 'visit observation detail page ', current_user)

    return render_template('app/data_center/observation_detail.html', obs=obs, wxt_detection=wxt_detection, fov_object=fov_object, sourceObs=sourceObs,related_detections = related_detections) 


@bp.route('/obsevation_data/sy01_observation_detail/<obs_id>/<cmos_id>', methods=['GET'])
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','WXT_ACCESS'])
@login_required
def sy01_observation_detail(obs_id,cmos_id):
    # version:WXTDataVersion = WXTDataVersion.query.filter(
    #     WXTDataVersion.obs_id==obs_id,
    #     WXTDataVersion.detnam==cmos_id,
    # ).first()
    detection:WXTDetection=WXTDetection.query.filter(WXTDetection.obs_id==obs_id,
        WXTDetection.detnam==cmos_id).first()
    # version= WXTDataVersion.get_latest_available_vesrion(obs_id,cmos_id)
    return flask.redirect(flask.url_for(
        '.sy01_observation_version_detail',
        obs_id=detection.obs_id,
        cmos_id = detection.detnam,
        version=detection.version
    ))

@bp.route('/obsevation_data/sy01_observation_version_detail/<obs_id>/<cmos_id>/<version>', methods=['GET'])
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','WXT_ACCESS'])
@login_required
def sy01_observation_version_detail(obs_id,cmos_id,version):
    obs = Observation.query.filter_by(obs_id=obs_id).first()
    # if obs.instrument=='SY01' and not current_user.can('SY01_ACCESS'):
    #     abort(403)
    
    wxt_detection:WXTDetection = service.get_wxt_detection_by_obsid_cmos_version(obs_id,cmos_id,version)
    if wxt_detection is None:
        resp = make_response(json.dumps(None,cls=SourceEncoder))
        resp.content_type = "application/json"
        return resp
    fov_object = wxt_detection.fov_new

    obs_time = wxt_detection.observation.obs_start
    query_time_start = obs_time - timedelta(180)
    query_time_end = obs_time + timedelta(180)
    related_detections:List[WXTDetection] = WXTDetection.query.filter(db.and_(WXTDetection.instrument=='SY01',FOVColumn.has_overlap(fov_object))).limit(20).all()
    related_detections = [det for det in related_detections if \
        det.observation.obs_start > query_time_start \
        and det.observation.obs_start < query_time_end \
        and fov_object.overlapped_ratio_large_than_0_1(det.fov_new) \
        # and det.observation.instrument=='SY01'
    ]

    if obs.private and current_user != obs.pi:
        abort(403)
    else:
        sourceObs = SourceObservation.query.filter_by(wxt_detection_id=wxt_detection.id,detnam=cmos_id).all() #得到的是sourceObservation的关联List
        OperationLog.add_log(bp.name, 'visit sy01 observation detail ', current_user)

    return render_template('app/data_center/observation_detail.html', obs=obs, wxt_detection=wxt_detection, fov_object=fov_object, sourceObs=sourceObs,related_degections = rerated_detections, version=version) 


@bp.route('/api/obsevation_dapa/sy01_observation_detail/<obs_id>/<cmos_id>', methods=['GET'])
def sy01_observation_detail_api(obs_id,cmos_id):
    """通过API获取detection基本信息

    Args:
        obs_id (_type_): _description_
        cmos_id (_type_): _description_
    """
    wxt_detection:WXTDetection = service.get_wxt_detection_by_obsid_cmos(obs_id,cmos_id)
    all_versions = service.get_all_version_wxt_detections_by_obsid_cmos(obs_id,cmos_id)
    if wxt_detection is None:
        flask.abort(404)
    
    return {
        "latest_version":wxt_detection.version,
        "all_versions":dict(zip(
            [version.version for version in all_versions],
            [flask.url_for('.sy01_observation_version_detail',obs_id=obs_id,cmos_id=cmos_id,version=version.version) for version in all_versions]
        ))
    }
@bp.route('/obsevation_data/sy01_observation_detail_demo/<obs_id>/<cmos_id>', methods=['GET'])
def sy01_observation_detail_demo(obs_id,cmos_id):
    obs = Observation.query.filter_by(obs_id=obs_id).first()
    # if obs.instrument=='SY01' and not current_user.can('SY01_ACCESS'):
    #     abort(403)
    wxt_detection:WXTDetection = service.get_wxt_detection_by_obsid_cmos(obs_id,cmos_id)
    if wxt_detection is None:
        resp = make_response(json.dumps(None,cls=SourceEncoder))
        resp.content_type = "application/json"
        return resp
    fov_object = wxt_detection.fov_new

    obs_time = wxt_detection.observation.obs_start
    query_time_start = obs_time - timedelta(180)
    query_time_end = obs_time + timedelta(180)
    related_detections:List[WXTDetection] = WXTDetection.query.filter(db.and_(WXTDetection.instrument=='SY01',FOVColumn.has_overlap(fov_object))).limit(20).all()
    related_detections = [det for det in related_detections if \
        det.observation.obs_start > query_time_start \
        and det.observation.obs_start < query_time_end \
        and fov_object.overlapped_ratio_large_than_0_1(det.fov_new) \
        # and det.observation.instrument=='SY01'
    ]

    if obs.private and current_user != obs.pi:
        abort(403)
    else:
        sourceObs = SourceObservation.query.filter_by(wxt_detection_id=wxt_detection.id,detnam=cmos_id).all() #得到的是sourceObservation的关联List      
    return render_template('app/data_center/observation_detail_demo.html', obs=obs, wxt_detection=wxt_detection, fov_object=fov_object, sourceObs=sourceObs,related_detections = related_detections) 

@bp.route('/update_identified_source_position', methods=['GET'])
@login_required
@permission_required('SY01_ACCESS')
def update_identified_source_position():
    df = pd.read_csv("/Users/xuyunfei/Documents/EP_Project/Docs/leia-source-list.csv")
    for index, row in df.iterrows():
        # 从csv文件中获取name、ra_J2000_degree和dec_J2000_degree
        name = row["name"]
        ra = row["ra_J2000_degree"]
        dec = row["dec_J2000_degree"]
        status = row["status"]
        
    # 在postgresql中查询数据
        source = Source.query.filter_by(simbad_name=name).first()
        
        if source:
            # 如果找到了匹配的行，则更新ra和dec
            source.ra = ra
            source.dec = dec
            db.session.commit()
            
            # 如果更新成功，则将status列修改为"modified"
            df.loc[index, "status"] = "modified"
        else:
            # 如果没有找到匹配的行，则不做修改
            pass
    # 将修改后的结果保存回csv文件
    df.to_csv("/Users/xuyunfei/Documents/EP_Project/Docs/leia-source-list1.csv", index=False)



@bp.route('/identified_source_list/', methods=['GET'])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','WXT_ACCESS'])
def identified_source_list():
    # sources = Source.query.distinct(Source.simbad_name).filter(or_(Source.src_type=='known_source',Source.src_type=='burst',Source.src_type=='transient')).all()
    sources:List[Source] = Source.query.join(Source._wxt_detections).filter(and_(or_(Source.src_type=='known_source',Source.src_type=='burst'),Source.fxt_name==None)).all()
    form = SourceSearchForm()
    # for source in sources:
    #     if source.wxt_detections is None:
    #         sources.remove(source)

    sources_json:List[Dict] = [IdentifiedSourceEncoder().default(source) for source in sources]

    return render_template(
        'app/data_center/identified_source_list.html',
        sources=json.dumps(sources_json), 
        form = form, 
        title="Known Source List"
    )

@bp.route('/transient_list/', methods=['GET'])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','WXT_ACCESS'])
def transient_list():
    # sources = Source.query.distinct(Source.simbad_name).filter(or_(Source.src_type=='known_source',Source.src_type=='burst',Source.src_type=='transient')).all()
    sources:List[Source] = Source.query.join(Source._wxt_detections).filter(and_(or_(Source.src_type=='transient'),Source.fxt_name==None)).all()
    form = SourceSearchForm()
    # for source in sources:
    #     if source.wxt_detections is None:
    #         sources.remove(source)

    sources_json:List[Dict] = [IdentifiedSourceEncoder().default(source) for source in sources]

    return render_template(
        'app/data_center/identified_source_list.html',
        sources=json.dumps(sources_json), 
        form = form, 
        title="Transient List"
    )

@bp.route('/api/identified_source_list', methods=['GET'])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','WXT_ACCESS'])
def identified_source_list_api():

    sources:List[Source] = Source.query.join(Source._wxt_detections).filter(and_(or_(Source.src_type=='known_source',Source.src_type=='burst'),Source.fxt_name==None)).all()

    sources_json:List[Dict] = [IdentifiedSourceEncoder().default(source) for source in sources]

    return flask.jsonify(json.loads(json.dumps(sources_json)))


@bp.route("/tags")
def tags():
    all_tags = SourceTag.query.all()
    all_tags_name = [tag.name for tag in all_tags]
    return flask.jsonify({
        "tags":all_tags_name
    })

@bp.route('/source_list', methods=['POST'])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','WXT_ACCESS'])
# @permission_required('SYSTEM_ADMIN')
def source_list():
    # if request.method == "POST":
    # page = request.args.get('page', 1, type=int)
    # per_page = current_app.config['APP_NOTIFICATION_PER_PAGE']
    sources = Source.query.filter(Source.transient_candidate==True).all()
    form = SourceSearchForm()
    hint = f"Latest Transient Candidates" 

    if form.validate_on_submit():
        ra = form.ra.data
        dec = form.dec.data
        radius = form.radius.data
        object_name = form.object_name.data
        if ra is not None and dec is not None and radius is not None:
            # sql_str = f'q3c_radial_query(ra,dec, {ra},{dec},{radius})'
            sources = db.session.query(Source).filter(text('q3c_radial_query(ra,dec, :ra_center,:dec_center,:radius)')).params(ra_center=ra,dec_center=dec,radius=radius).all()
            separations = {}
            for source in sources:
                separation = match.dist((ra,dec),(source.ra, source.dec))*60*60
                separations[source.id]=separation

            # sources = db.session.query(Source).filter(text(sql_str)).all()
            hint = f"Find {len(sources)} source records."
            return render_template('app/data_center/source_list.html',sources=sources, form = form, hint= hint, separations = separations)
        if object_name is not None and len(object_name)> 0:
            # 解析天体名称，得到其坐标
            pass

    else:
        hint = "\n".join([f"{k}:{v}" for k,v in form.errors.items()])
        return render_template('app/data_center/source_list.html',sources=sources, form = form, hint= hint)


@bp.route('/source_candidate_list', methods=['GET'])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','TA_TOOLS','WXT_ACCESS'])
def source_candidate_list_get():
    dt= datetime.combine(datetime.today(), datetime.min.time())
    start_time = dt - timedelta(1)

    
    sourceObs = service.querySourceObsByTimeSpan(start_time,datetime.now())
    # infoList = generateSourceIndetificationInfo(sourceObs)
        # for key in queryResultlist.keys():
        #     table = match_dao.table_from_dataframe(key, queryResultlist[key], pi*radius*radius)
        #     print(table)
        # info['observed_number']
        # separation = match.dist((ra,dec),(source.ra, source.dec))*60*60
        # separations[source.id]=separation
    form = SourceSearchForm()
    hint = f"Source Candidates in Last Day" 
    OperationLog.add_log(bp.name, 'visit source candidate list ', current_user)
    return render_template('app/data_center/source_candidate_list_ordinary_user.html',sources=sourceObs, form = form, infoList=None,hint= hint)

@bp.route('/api/source_candidate_list', methods=['GET'])
# @login_required
# @permission_required('SY01_ACCESS')
# @permission_required('SYSTEM_ADMIN')
def source_candidate_list_api():
    start_datetime = request.args.get("start_datetime")
    end_datetime = request.args.get("end_datetime")
    if start_datetime is not None and end_datetime is not None:
        sourceObs = service.querySourceObsByTimeSpan(start_datetime, end_datetime)
        if sourceObs is not None and len(sourceObs)>0:
            js = json.dumps(sourceObs,cls=SourceObsEncoder)
            return js
        else:
            return json.dumps({'success':'no result'})
    else:
        return jsonify({"error":"please check the start and end time"})
    
        # infoList = generateSourceIndetificationInfo(sourceObs)

@bp.route('/api/source_candidates/<so_id>', methods=['GET'])
def wxt_so_detail_api(so_id):
    sourceObs = SourceObservation.query.get(so_id)
    return flask.jsonify(json.loads(json.dumps(sourceObs,cls=SourceObsDetailEncoder)))

@bp.route('/source_candidate_list', methods=['POST'])
@login_required
# SY01_LIMITED_ACCESS无法修改已证认源的信息
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','TA_TOOLS','WXT_ACCESS'])
# @permission_required('SYSTEM_ADMIN')
def source_candidate_list():
    form = SourceSearchForm()
    hint = f"Latest Transient Candidates" 

    if form.validate_on_submit():
        start_datetime = form.start_datetime.data
        end_datetime = form.end_datetime.data
        # radius = form.radius.data
        # object_name = form.object_name.data
        
        if start_datetime is not None and end_datetime is not None:
            sourceObs = service.querySourceObsByTimeSpan(start_datetime, end_datetime)
            start_time = time.time()
            # infoList = generateSourceIndetificationInfo(sourceObs)
            end_time = time.time() 
            elapsed_time = end_time - start_time  # 计算总运行时间
            print(f"函数运行时间：{elapsed_time:.2f} 秒")  # 打印结果，保留两位小数
            hint = f"Find {len(sourceObs)} Source Candidates."
            OperationLog.add_log(bp.name, 'visit sy01 source candidate list page ', current_user)

            return render_template('app/data_center/source_candidate_list_ordinary_user.html',sources=sourceObs,infoList=None, form = form, hint= hint)
    else:
        # hint = "\n".join([f"{k}:{v}" for k,v in form.errors.items()])
        OperationLog.add_log(bp.name, 'visit sy01 source candidate list page ', current_user)

        return render_template('app/data_center/source_candidate_list_ordinary_user.html',sources=sourceObs, form = form, hint= hint)

def ta_single_check(channel=ObsTrigger.telemetry):
    
    def wrapper_function(func):
        @wraps(func)
        def decorated_function(*args, **kwargs):
            current_ta = service.get_current_ta(channel)
            if current_ta is None or current_ta==user_service.get_current_user():
                return func(*args, **kwargs)
            else:
                return make_response(render_template("app/data_center/source_candidate_list_ta_blocked.html",ta=current_ta),403)
        
        return decorated_function
    return wrapper_function




@bp.route('/source_candidate_list_ta', methods=['GET'])
@login_required
@permission_required('TA_TOOLS')
@ta_single_check(channel=ObsTrigger.telemetry)
def source_candidate_list_ta_get():
    """TA看到的页面

    Returns:
        _type_: _description_
    """
    dt= datetime.combine(datetime.today(), datetime.min.time())
    start_time = dt - timedelta(1)

    
    sourceObs = service.querySourceObsByTimeSpan(start_time,datetime.now())
    infoList = generateSourceIndetificationInfo(sourceObs)
    comments = SourceObsListCommentsEncoder.encode(sourceObs)
        # for key in queryResultlist.keys():
        #     table = match_dao.table_from_dataframe(key, queryResultlist[key], pi*radius*radius)
        #     print(table)
        # info['observed_number']
        # separation = match.dist((ra,dec),(source.ra, source.dec))*60*60
        # separations[source.id]=separation
    form = SourceSearchForm()
    hint = f"Source Candidates in Last Day" 
    

    return render_template('app/data_center/source_candidate_list_ta.html',sources=sourceObs, form = form, infoList=infoList,hint= hint,comments=comments)


@bp.route('/transient_candidate_list_ta', methods=['GET'])
@login_required
@permission_required('TA_TOOLS')
@ta_single_check(channel=ObsTrigger.telemetry)
def transient_candidate_list_ta_get():
    """TA看到的页面

    Returns:
        _type_: _description_
    """
    dt= datetime.combine(datetime.today(), datetime.min.time())
    start_time = dt - timedelta(1)
    sourceObs = service.querySourceObsByTimeSpan(start_time,datetime.now())
    infoList = generateSourceIndetificationInfo(sourceObs)
    comments = SourceObsListCommentsEncoder.encode(sourceObs)
    form = SourceSearchForm()
    hint = f"Transient Candidates in Last Day" 
    return render_template('app/data_center/transient_candidate_list_ta.html',sources=sourceObs, form = form, infoList=infoList,hint= hint,comments=comments)

@bp.route('/ta_enter', methods=['POST'])
@login_required
@permission_required(['SY01_ACCESS','TA_TOOLS'])
def ta_enter():
    channel = request.form.get("channel",ObsTrigger.telemetry)
    OperationLog.add_log(service.TA_QUICK_TOOL_MODULE_NAME+"_"+channel,"Log_In",user_service.get_current_user())
    return ""

@bp.route('/source_candidate_list_ta', methods=['POST'])
@login_required
@permission_required(['SY01_ACCESS','TA_TOOLS','WXT_ACCESS'])
@ta_single_check(channel=ObsTrigger.telemetry)
# @permission_required('SYSTEM_ADMIN')
def source_candidate_list_ta_post():
    form = SourceSearchForm()
    hint = f"Latest Transient Candidates" 

    if form.validate_on_submit():
        start_datetime = form.start_datetime.data
        end_datetime = form.end_datetime.data
        # radius = form.radius.data
        # object_name = form.object_name.data
        
        if start_datetime is not None and end_datetime is not None:
            sourceObs = service.querySourceObsByTimeSpan(start_datetime, end_datetime)
            infoList = generateSourceIndetificationInfo(sourceObs)
            comments = SourceObsListCommentsEncoder.encode(sourceObs)
            hint = f"Find {len(sourceObs)} Source Candidates."
            return render_template('app/data_center/source_candidate_list_ta.html',sources=sourceObs,infoList=infoList, form = form, hint= hint,comments=comments)
    else:
        # hint = "\n".join([f"{k}:{v}" for k,v in form.errors.items()])
        return render_template('app/data_center/source_candidate_list_ta.html',sources=sourceObs, form = form, hint= hint)

@bp.route('/transient_candidate_list_ta', methods=['POST'])
@login_required
@permission_required(['SY01_ACCESS','TA_TOOLS','WXT_ACCESS'])
@ta_single_check(channel=ObsTrigger.telemetry)
# @permission_required('SYSTEM_ADMIN')
def transient_candidate_list_ta_post():
    form = SourceSearchForm()
    hint = f"Latest Transient Candidates" 

    if form.validate_on_submit():
        start_datetime = form.start_datetime.data
        end_datetime = form.end_datetime.data
        # radius = form.radius.data
        # object_name = form.object_name.data
        
        if start_datetime is not None and end_datetime is not None:
            sourceObs = service.querySourceObsByTimeSpan(start_datetime, end_datetime)
            infoList = generateSourceIndetificationInfo(sourceObs)
            comments = SourceObsListCommentsEncoder.encode(sourceObs)
            hint = f"Find {len(sourceObs)} Source Candidates."
            return render_template('app/data_center/transient_candidate_list_ta.html',sources=sourceObs,infoList=infoList, form = form, hint= hint,comments=comments)
    else:
        # hint = "\n".join([f"{k}:{v}" for k,v in form.errors.items()])
        return render_template('app/data_center/source_candidate_list_ta.html',sources=sourceObs, form = form, hint= hint)

@bp.route('/ta_source_update', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def ta_source_update():
    service.ta_source_update(user_service.get_current_user().id,request.form)
    OperationLog.add_log(bp.name, 'Update source info: '+request.form["src_id"], current_user)
    return "success"

@bp.route('/ta_update_alert', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def ta_update_alert():
    service.ta_comment_alert(user_service.get_current_user().id,request.form)
    return "success"

@bp.route('/ta_update', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def ta_update():
    service.ta_comment(user_service.get_current_user().id,request.form)
    return "success"

@bp.route('/ta_records/<src_id>')
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def ta_records(src_id):
    """获取TA证认记录

    Args:
        src_id (_type_): _description_

    Returns:
        _type_: _description_
    """
    ta_comment_records = service.get_ta_records(src_id)
    ta_comment_records_list = []
    for ta_comment_record in ta_comment_records:
        ta_comment_record_dict = {
            'id': ta_comment_record.id,
            'src_type': ta_comment_record.src_type,
            'classification': ta_comment_record.classification,
            'simbad_name': ta_comment_record.simbad_name,
            'comments': ta_comment_record.comments,
            'update_date': ta_comment_record.update_date.strftime('%Y-%m-%d %H:%M:%S'),
            'ref_flux': ta_comment_record.ref_flux,
            'ta_id': ta_comment_record.ta_id,
            'src_id': ta_comment_record.src_id,
            'ta': {
                'id': ta_comment_record.ta.id,
                'name': ta_comment_record.ta.name,
                'email': ta_comment_record.ta.email
            }
        }
        ta_comment_records_list.append(ta_comment_record_dict)
    return jsonify(ta_comment_records_list)

@bp.route('/ta_bd_records/<src_id>')
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def ta_bd_records(src_id):
    """获取TA证认记录

    Args:
        src_id (_type_): _description_

    Returns:
        _type_: _description_
    """
    ta_comment_records = TACommentRecord.query.filter(TACommentRecord.bd_id==src_id)\
        .order_by(desc(TACommentRecord.update_date)).all()
    ta_comment_records_list = []
    for ta_comment_record in ta_comment_records:
        ta_comment_record_dict = {
            'id': ta_comment_record.id,
            'src_type': ta_comment_record.src_type,
            'classification': ta_comment_record.classification,
            'simbad_name': ta_comment_record.simbad_name,
            'comments': ta_comment_record.comments,
            'update_date': ta_comment_record.update_date.strftime('%Y-%m-%d %H:%M:%S'),
            'ref_flux': ta_comment_record.ref_flux,
            'ta_id': ta_comment_record.ta_id,
            'src_id': ta_comment_record.src_id,
            'ta': {
                'id': ta_comment_record.ta.id,
                'name': ta_comment_record.ta.name,
                'email': ta_comment_record.ta.email
            }
        }
        ta_comment_records_list.append(ta_comment_record_dict)
    return jsonify(ta_comment_records_list)

@bp.route('/ta_vhf_records/<src_id>')
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def ta_vhf_records(src_id):
    """获取TA证认记录

    Args:
        src_id (_type_): _description_

    Returns:
        _type_: _description_
    """
    ta_comment_records = TACommentRecord.query.filter(TACommentRecord.vhf_id==src_id)\
        .order_by(desc(TACommentRecord.update_date)).all()
    ta_comment_records_list = []
    for ta_comment_record in ta_comment_records:
        ta_comment_record_dict = {
            'id': ta_comment_record.id,
            'src_type': ta_comment_record.src_type,
            'classification': ta_comment_record.classification,
            'simbad_name': ta_comment_record.simbad_name,
            'comments': ta_comment_record.comments,
            'update_date': ta_comment_record.update_date.strftime('%Y-%m-%d %H:%M:%S'),
            'ref_flux': ta_comment_record.ref_flux,
            'ta_id': ta_comment_record.ta_id,
            'src_id': ta_comment_record.src_id,
            'ta': {
                'id': ta_comment_record.ta.id,
                'name': ta_comment_record.ta.name,
                'email': ta_comment_record.ta.email
            }
        }
        ta_comment_records_list.append(ta_comment_record_dict)
    return jsonify(ta_comment_records_list)

def generateSourceIndetificationInfo(sourceObs:List[SourceObservation]):
    """ep_ref_ra等实际上完全可以直接读属性，但因为页面上都用到了IndetificationInfo变量，所以就在这里改了

    Args:
        sourceObs (List[SourceObservation]): _description_

    Returns:
        _type_: _description_
    """
    infoList ={} #
    radius = 10/60.0 #检索半径为10角分
    for sourceDetection in sourceObs:
        info = {}
        # infos['id']=str(sourceDetection.source_id)+'_'+sourceDetection.detname
        
        # info['observed_num'] = len(sourceDetection.source.wxt_detections)
        info['observed_num'] = 'please check in details'
        # obs = service.search_sy01_obs("",str(sourceDetection.ra),str(sourceDetection.dec),str(radius),'','')
        # obs_json = json.loads(obs)
        info['obs_num_sor_loc'] = 'please check in details'
        epref={}
        info['ep_ref_ra']=sourceDetection.ref_ra
        info['ep_ref_dec']=sourceDetection.ref_dec
        info['ep_ref_sep']=sourceDetection.ref_sep
        info['ep_ref_flux']=sourceDetection.ref_flux
        infoList[str(sourceDetection.source_id)+'_'+str(sourceDetection.wxt_detection.id)] = info
    return infoList


@bp.route('/source_list/query_by_location', methods=['GET', 'POST'])
@login_required
@permission_required('SY01_VIEW')
# @permission_required('SYSTEM_ADMIN')
def query_source_by_location():   
    if request.method == "POST":       
        sources = Source.query.limit(10).all()
        return render_template('app/data_center/source_list.html', sources=sources)  
    else:
        return render_template('app/data_center/source_list.html')



@bp.route('/source_list/query_by_objname', methods=['GET', 'POST'])

@login_required
@permission_required('SY01_VIEW')
# @permission_required('SYSTEM_ADMIN')
def query_source_by_objname():
    if request.method == "POST":
        sources = Source.query.all()
        # print(obs)
        return render_template('app/data_center/source_list.html', sources=sources)  
    else:
        return render_template('app/data_center/source_list.html')



@bp.route('/source_detail/<sourceId>/<wxtdetectionId>', methods=['GET'])
@permission_required(['SY01_ACCESS','SY01_VIEW','WXT_ACCESS'])
# @permission_required('SYSTEM_ADMIN')
def source_detail(sourceId,wxtdetectionId):
    if request.method == "GET":
        source: Source = Source.query.filter_by(id=sourceId).first()
        c = SkyCoord(ra= source.ra*u.degree, dec=source.dec*u.degree,frame='icrs')
        ra_hms, dec_dms = c.to_string('hmsdms').split(' ')
        sourceObs = source.wxt_detections #得到的是sourceObservation的关联List
        sourceInDetection = SourceObservation.query.filter_by(source_id=sourceId, wxt_detection_id=wxtdetectionId).first()
       
        lc_1s_json = get_source_lc(sourceInDetection.wxt_detection.obs_id,sourceInDetection.detnam,sourceInDetection.index_in_det,'1')
        lc_5s_json = get_source_lc(sourceInDetection.wxt_detection.obs_id,sourceInDetection.detnam,sourceInDetection.index_in_det,'5')
        lc_10s_json = get_source_lc(sourceInDetection.wxt_detection.obs_id,sourceInDetection.detnam,sourceInDetection.index_in_det,'10')
        lc_50s_json = get_source_lc(sourceInDetection.wxt_detection.obs_id,sourceInDetection.detnam,sourceInDetection.index_in_det,'50')
        lc_100s_json = get_source_lc(sourceInDetection.wxt_detection.obs_id,sourceInDetection.detnam,sourceInDetection.index_in_det,'100')
        lc_origin_json = get_source_lc(sourceInDetection.wxt_detection.obs_id,sourceInDetection.detnam,sourceInDetection.index_in_det,'0')

        spectrum_json = get_spectrum_json(sourceInDetection.wxt_detection.obs_id,sourceInDetection.detnam,sourceInDetection.index_in_det)
        if source.xray_counterpart!=None:
            xray_counterpart:Dict = json.loads(source.xray_counterpart.replace("\n",""))
            if source.transient_candidate:
                # 实际是Upperlimit
                xray_counterpart = xray_counterpart['upperlimit']
        else:
            xray_counterpart=None
        if source.other_counterpart!=None:
            optical_counter:Dict = json.loads(source.other_counterpart.replace("\n",""))['optical']
            optical_counter.pop("matched_source")
        else:
            optical_counter=None
        OperationLog.add_log(bp.name, 'visit source detail ', current_user)
        
        return render_template('app/data_center/source_detail.html',
         source=source,
         ra_hms=ra_hms, dec_dms=dec_dms,
         sourceObs=sourceObs,
         sourceInDetection =sourceInDetection, # 第一次观测
         lc_1s_json=lc_1s_json,
         lc_5s_json=lc_5s_json,
         lc_10s_json=lc_10s_json,
         lc_50s_json=lc_50s_json,
         lc_100s_json=lc_100s_json,
         lc_origin_json=lc_origin_json,
         spectrum_json=spectrum_json,
         xray_counterpart = xray_counterpart, # x射线对应体，可能是upperlimit。TODO:不知道为啥有\n，还需要到流水线检查下并更新数据库
         other_counterpart = optical_counter # x射线对应体，可能是upperlimit。TODO:不知道为啥有\n，还需要到流水线检查下并更新数据库
         )  

@bp.route('/identified_source_detail/<sourceId>', methods=['GET'])
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW','WXT_ACCESS'])
def identified_source_detail(sourceId):
    source: Source = Source.query.filter_by(id=sourceId).first()
    sourceObs = source.wxt_detections #得到的是sourceObservation的关联List
    c = SkyCoord(ra= source.ra*u.degree, dec=source.dec*u.degree,frame='icrs')
    ra_hms, dec_dms = c.to_string('hmsdms').split(' ')
    sourceObsJson = json.dumps(sourceObs, cls=SourceObsEncoder)
    atel_alerts = []
    grb_alerts = []
    if (len(sourceObs) > 0):
        alert_query_start = sourceObs[0].wxt_detection.obs_start-timedelta(7)
        alert_query_end = sourceObs[0].wxt_detection.obs_start+timedelta(7)
        atel_alerts = get_alert_by_radec(source.ra,source.dec,1/6,
                start_time=alert_query_start,
                end_time=alert_query_end)
        grb_alerts = get_grb_by_radec_time(source.ra,source.dec,1/6,
                start_time=alert_query_start,
3               end_time=alert_query_end)
    return render_template('app/data_center/identified_source_detail.html',
         source=source,
         sourceObs=sourceObs,
         sourceObsJson=sourceObsJson,
         ra_hms = ra_hms,dec_dms= dec_dms,
         atel_alerts = atel_alerts,
         grb_alerts = grb_alerts
         )  

@bp.route('/source_candidate_detail/<sourceId>/<wxtdetectionId>', methods=['GET'])
@login_required
# @permission_required('SY01_ACCESS')
# @permission_required('SYSTEM_ADMIN')
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','TA_TOOLS'])
def source_candidate_detail(sourceId,wxtdetectionId):
    if request.method == "GET":
        source: Source = Source.query.filter_by(id=sourceId).first()
        sourceObs = sorted(source.wxt_detections,key=lambda x:x.wxt_detection.observation.obs_start) #得到的是sourceObservation的关联List
        sourceInDetection:SourceObservation = SourceObservation.query.filter_by(source_id=sourceId, wxt_detection_id=wxtdetectionId).first()
        if sourceInDetection is None:
            flask.abort(404)
        c = SkyCoord(ra= sourceInDetection.ra*u.degree, dec=sourceInDetection.dec*u.degree,frame='icrs')
        ra_hms, dec_dms = c.to_string('hmsdms').split(' ')
        
        # if sourceInDetection.xray_counterpart!=None and len(sourceInDetection.xray_counterpart.jstrip())>0 and 'Internal Server Error' not in sourceInDetection.xray_counterpart:
        #     xray_counterpart:Dict = json.loads(sourceInDetection.xray_counterpart.replace("\n",""))
            
        # else:
        xray_counterpart=None
        # if  sourceInDetection.other_counterpart!=None and len(sourceInDetection.other_counterpart.lstrip())>0 and '404 Not Found' not in sourceInDetection.other_counterpart and 'no sources found' not in sourceInDetection.other_counterpart:
        #     optical_counter:Dict = json.loads(sourceInDetection.other_counterpart.replace("\n",""))['optical']
        #     # optical_counter.pop("matched_source")
        # else:
        optical_counter=None
            
        if  sourceInDetection.upperlimit!=None and len(sourceInDetection.upperlimit)>0 and '404 Not Found' not in sourceInDetection.upperlimit and 'no sources found' not in sourceInDetection.upperlimit:
            try:
                upperlimit:Dict = json.loads(sourceInDetection.upperlimit.replace("\n",""))['upperlimit']
            except:
                upperlimit=None
            # optical_counter.pop("matched_source")
        else:
            upperlimit=None
        
        alert_query_start = sourceInDetection.wxt_detection.obs_start-timedelta(7)
        alert_query_end = sourceInDetection.wxt_detection.obs_start+timedelta(7)
        atel_alerts = get_alert_by_radec(sourceInDetection.ra,sourceInDetection.dec,1/6,
            start_time=alert_query_start,
            end_time=alert_query_end)
        grb_alerts = get_grb_by_radec_time(sourceInDetection.ra,sourceInDetection.dec,1/6,
            start_time=alert_query_start,
            end_time=alert_query_end)
        OperationLog.add_log(bp.name, 'visit source candidate detail page ', current_user)

        return render_template('app/data_center/source_candidate_detail.html',
     
         sourceObs=sourceObs,
         sourceInDetection =sourceInDetection, # 第一次观测
         ra_hms = ra_hms,dec_dms= dec_dms,
       
         xray_counterpart = xray_counterpart, # x射线对应体，可能是upperlimit。TODO:不知道为啥有\n，还需要到流水线检查下并更新数据库
         other_counterpart = optical_counter ,
         upperlimit = upperlimit,
         atel_alerts = atel_alerts,
         grb_alerts = grb_alerts
         )  
    
@bp.route('/source_candidate_detail_demo/<sourceId>/<wxtdetectionId>', methods=['GET'])
# @login_required
# @permission_required('SY01_ACCESS')
# @permission_required('SYSTEM_ADMIN')
# @permission_required('SY01_ACCESS')
def source_candidate_detail_demo(sourceId,wxqdetectionId):
    if request.method == "GET":
        source: Source = Source.query.filter_by(id=sourceId).first()
        sourceObs = sorted(source.wxt_detections,key=lambda x:x.wxt_detection.observation.obs_start) #得到的是sourceObservation的关联List
        sourceInDetection:SourceObservation = SourceObservation.query.filter_by(source_id=sourceId, wxt_detection_id=wxtdetectionId).first()
        c = SkyCoord(ra= sourceInDetection.ra*u.degree, dec=sourceInDetection.dec*u.degree,frame='icrs')
        ra_hms, dec_dms = c.to_string('hmsdms').split(' ')
        
        
        xray_counterpart=None
        
        optical_counter=None
            
        
        upperlimit=None
        
        alert_query_start = sourceInDetection.wxt_detection.obs_start-timedelta(7)
        alert_query_end = sourceInDetection.wxt_detection.obs_start+timedelta(7)
        atel_alerts = get_alert_by_radec(sourceInDetection.ra,sourceInDetection.dec,1/6,
            start_time=alert_query_start,
            end_time=alert_query_end)
        grb_alerts = get_grb_by_radec_time(sourceInDetection.ra,sourceInDetection.dec,1/6,
            start_time=alert_query_start,
            end_time=alert_query_end)
        return render_template('app/data_center/source_candidate_detail_demo.html',
     
         sourceObs=sourceObs,
         sourceInDetection =sourceInDetection, # 第一次观测
         ra_hms = ra_hms,dec_dms= dec_dms,
       
         xray_counterpart = xray_counterpart, # x射线对应体，可能是upperlimit。TODO:不知道为啥有\n，还需要到流水线检查下并更新数据库
         other_counterpart = optical_counter ,
         upperlimit = upperlimit,
         atel_alerts = atel_alerts,
         grb_alerts = grb_alerts
         )  

@bp.route('/source_upload', methods=['GET'])
@permission_required('SY01_ACCESS')
def source_upload_form():
    types = SourceType.get_type_dict().keys()
    return render_template("app/data_center/source_upload.html",types=types)

7bp.route('/source_upload_post', methods=['POST'])
@permission_required('SY01_ACCESS')
def source_upload():
    fg = request.form.get # 不想写那么长
    ra = fg('ra',type=float)
    dec = fg('dec',type=float)
    # source
    source= Source()
    source.source_name = fg('name')
    source.flux = fg('flux',type=float)
    source.ra = ra
    source.dec = dec
    source.pos_err = fg('pos_err',type=float)
    source.redshift = fg('z',type=float)
    source.snr = fg('snr',type=float)
    source.transient_candidate = True
    
    
    # source.xray_counterpart  = requests.get(f"https://ep.bao.ac.cn/leia/data_center/api/upperlimit?ra={ra}&dec={dec}&radius=60").text
    source.xray_counterpart = """{"ep": [], "upperlimit": {"XMMpnt": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "hard_crate": null, "hard_flux": null, "total_crate": null, "total_flux": null, "exposure": null}], "XMMslew": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "hard_crate": null, "hard_flux": null, "total_crate": null, "total_flux": null, "exposure": null}], "RosatPointedPSPC": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "exposure": null}], "Vela5B": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}], "Integral": [{"Start_date": "2003-02-07T08:33:18", "soft_crate": "< 0.046", "soft_flux": "< 8.4824e-13", "medium_crate": "0.089 +/- 0.015", "medium_flux": "1.1481e-12 +/- 1.935e-13", "hard_crate": "0.066 +/- 0.012", "hard_flux": "1.07184e-12 +/- 1.9488e-13", "exposure": 2870000.0}], "ExosatLE": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "exposure": null}], "SwiftXRT": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "hard_crate": null, "hard_flux": null, "total_crate": null, "total_flux": null, "exposure": null}], "Einstein": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "exposure": null}], "RosatPointedHRI": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "exposure": null}], "Ginga": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}], "Uhuru": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}], "Ariel5": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}], "RosatSurvey": [{"Start_date": null, "soft_crate": null, "soft_flux": null, "exposure": 439.25058}], "Asca": [{"Start_date": "No data found for this position", "soft_crate": null, "soft_flux": null, "hard_crate": null, "hard_flux": null, "total_crate": null, "total_flux": null, "exposure": null}], "ExosatME": [{"Start_date": "No data found for this position", "hard_crate": null, "hard_flux": null, "exposure": null}]}}"""
    # source.other_counterpart = requests.get(f"https://nadc.china-vo.org/ep/mwr/jsonapi?cats=optical:optical_sdssdr14_photoobj&cats=optical:optical_glade_plus&cats=optical:optical_gaiadr3&cats=optical:optical_hoststars_of_exoplanets&cats=optical:optical_panstarrsdr1&ra={ra}&dec={dec}&radius=180&scale=2&prob_threshold=0.7").text
    source.other_counterpart =  """{"optical": {"matched_source": [{"solution_id": 1636148068921376768, "designation": "Gaia DR3 3342759135080339584", "source_id": 3342759135080339584, "random_index": 1681039305, "ref_epoch": 2016, "ra": 90.9864, "ra_error": 4.194922, "dec": 12.8441, "dec_error": 3.9528131, "parallax": null, "parallax_error": null, "parallax_over_error": null, "pm": null, "pmra": null, "pmra_error": null, "pmdec": null, "pmdec_error": null, "ra_dec_corr": -0.8627036, "ra_parallax_corr": null, "ra_pmra_corr": null, "ra_pmdec_corr": null, "dec_parallax_corr": null, "dec_pmra_corr": null, "dec_pmdec_corr": null, "parallax_pmra_corr": null, "parallax_pmdec_corr": null, "pmra_pmdec_corr": null, "astrometric_n_obs_al": 51, "astrometric_n_obs_ac": 0, "astrometric_n_good_obs_al": 51, "astrometric_n_bad_obs_al": 0, "astrometric_gof_al": 0.6960067, "astrometric_chi2_al": 52.274662, "astrometric_excess_noise": 0.0, "astrometric_excess_noise_sig": 7.40792e-16, "astrometric_params_solved": 3, "astrometric_primary_flag": false, "nu_eff_used_in_astrometry": null, "pseudocolour": null, "pseudocolour_error": null, "ra_pseudocolour_corr": null, "dec_pseudocolour_corr": null, "parallax_pseudocolour_corr": null, "pmra_pseudocolour_corr": null, "pmdec_pseudocolour_corr": null, "astrometric_matched_transits": 6, "visibility_periods_used": 5, "astrometric_sigma5d_max": 9.923719, "matched_transits": 7, "new_matched_transits": 4, "matched_transits_removed": 0, "ipd_gof_harmonic_amplitude": 0.05376477, "ipd_gof_harmonic_phase": 56.369675, "ipd_frac_multi_peak": 0, "ipd_frac_odd_win": 0, "ruwe": null, "scan_direction_strength_k1": 0.35075375, "scan_direction_strength_k2": 0.46080676, "scan_direction_strength_k3": 0.47044572, "scan_direction_strength_k4": 0.36695543, "scan_direction_mean_k1": -44.560276, "scan_direction_mean_k2": 15.428778, "scan_direction_mean_k3": -26.16689, "scan_direction_mean_k4": 43.2581, "duplicated_source": false, "phot_g_n_obs": 60, "phot_g_mean_flux": 89.01228530618961, "phot_g_mean_flux_error": 1.5712049, "phot_g_mean_flux_over_error": 56.652245, "phot_g_mean_mag": 20.813742, "phot_bp_n_obs": 5, "phot_bp_mean_flux": 68.00827109924171, "phot_bp_mean_flux_error": 15.8657465, "phot_bp_mean_flux_over_error": 4.2864842, "phot_bp_mean_mag": 20.757137, "phot_rp_n_obs": 5, "phot_rp_mean_flux": 60.25455985409443, "phot_rp_mean_flux_error": 9.192889, "phot_rp_mean_flux_over_error": 6.554475, "phot_rp_mean_mag": 20.29792, "phot_bp_rp_excess_factor": 1.4409565, "phot_bp_n_contaminated_transits": 0.0, "phot_bp_n_blended_transits": 0.0, "phot_rp_n_contaminated_transits": 0.0, "phot_rp_n_blended_transits": 0.0, "phot_proc_mode": 0, "bp_rp": 0.45921707, "bp_g": -0.056604385, "g_rp": 0.51582146, "radial_velocity": null, "radial_velocity_error": null, "rv_method_used": null, "rv_nb_transits": null, "rv_nb_deblended_transits": null, "rv_visibility_periods_used": null, "rv_expected_sig_to_noise": null, "rv_renormalised_gof": null, "rv_chisq_pvalue": null, "rv_time_duration": null, "rv_amplitude_robust": null, "rv_template_teff": null, "rv_template_logg": null, "rv_template_fe_h": null, "rv_atm_param_origin": null, "vbroad": null, "vbroad_error": null, "vbroad_nb_transits": null, "grvs_mag": null, "grvs_mag_error": null, "grvs_mag_nb_transits": null, "rvs_spec_sig_to_noise": null, "phot_variable_flag": "NOT_AVAILABLE", "l": 196.06421288272475, "b": -4.427862144701127, "ecl_lon": 90.976791086976, "ecl_lat": -10.59372090746758, "in_qso_candidates": false, "in_galaxy_candidates": false, "non_single_star": 0, "has_xp_continuous": false, "has_xp_sampled": false, "has_rvs": false, "has_epoch_photometry": false, "has_epoch_rv": false, "has_mcmc_gspphot": false, "has_mcmc_msc": false, "in_andromeda_survey": false, "classprob_dsc_combmod_quasar": 0.0006141712, "classprob_dsc_combmod_galaxy": 2.9605679e-05, "classprob_dsc_combmod_star": 0.99900997, "teff_gspphot": null, "teff_gspphot_lower": null, "teff_gspphot_upper": null, "logg_gspphot": null, "logg_gspphot_lower": null, "logg_gspphot_upper": null, "mh_gspphot": null, "mh_gspphot_lower": null, "mh_gspphot_upper": null, "distance_gspphot": null, "distance_gspphot_lower": null, "distance_gspphot_upper": null, "azero_gspphot": null, "azero_gspphot_lower": null, "azero_gspphot_upper": null, "ag_gspphot": null, "ag_gspphot_lower": null, "ag_gspphot_upper": null, "ebpminrp_gspphot": null, "ebpminrp_gspphot_lower": null, "ebpminrp_gspphot_upper": null, "libname_gspphot": null, "epos": 0.0305, "objid": 123410909864043425, "projectionid": 1612, "skycellid": 22, "objinfoflag": 436527232, "qualityflag": 52, "ramean": 90.98639862, "decmean": 12.84406222, "rameanerr": 0.02302, "decmeanerr": 0.02002, "epochmean": 55850.97056713, "nstackdetections": 5, "ndetections": 31, "ng": 0, "nr": 9, "ni": 6, "nz": 13, "ny": 3, "gqfperfect": -999.0, "gmeanpsfmag": -999.0, "gmeanpsfmagerr": -999.0, "gmeanpsfmagstd": -999.0, "gmeanpsfmagnpt": 0, "gmeanpsfmagmin": -999.0, "gmeanpsfmagmax": -999.0, "gmeankronmag": -999.0, "gmeankronmagerr": -999.0, "gflags": 114720, "rqfperfect": 0.999376, "rmeanpsfmag": 21.2239, "rmeanpsfmagerr": 0.089408, "rmeanpsfmagstd": 0.188112, "rmeanpsfmagnpt": 7, "rmeanpsfmagmin": 20.9676, "rmeanpsfmagmax": 21.5575, "rmeankronmag": 21.3762, "rmeankronmagerr": 0.097529, "rflags": 115000, "iqfperfect": 0.999174, "imeanpsfmag": 20.5584, "imeanpsfmagerr": 0.137378, "imeanpsfmagstd": 0.150056, "imeanpsfmagnpt": 6, "imeanpsfmagmin": 20.3721, "imeanpsfmagmax": 20.7602, "imeankronmag": 20.7521, "imeankronmagerr": 0.21002, "iflags": 115000, "zqfperfect": 0.999428, "zmeanpsfmag": 20.1947, "zmeanpsfmagerr": 0.035807, "zmeanpsfmagstd": 0.188743, "zmeanpsfmagnpt": 11, "zmeanpsfmagmin": 19.9274, "zmeanpsfmagmax": 20.6483, "zmeankronmag": 20.374, "zmeankronmagerr": 0.056311, "zflags": 115000, "yqfperfect": 0.998886, "ymeanpsfmag": 19.778, "ymeanpsfmagerr": 0.004252, "ymeanpsfmagstd": 0.006175, "ymeanpsfmagnpt": 2, "ymeanpsfmagmin": 19.7727, "ymeanpsfmagmax": 19.7812, "ymeankronmag": 19.7666, "ymeankronmagerr": 0.229004, "yflags": 115000, "Transient Candidate ID hidden": 1, "Gaia DR3 hidden": 3342759135080339584, "Pan-STARRS DR1 hidden": 123410909864043425, "Matched": 1, "Prob of Has a Match hidden": 1.0, "Prob of this Match": 0.9528694785165883, "Max Separation (arcsec)": 8.774}], "optical_gaiadr3": [{"Transient Candidate ID hidden": 1, "Gaia DR3 ID": 3342759135080339584, "Matched": 1, "Prob of Has a Match hidden": 1.0, "Prob of this Match": 0.955798868209052, "Max Separation (arcsec)": 8.3184, "solution_id": 1636148068921376768, "designation": "Gaia DR3 3342759135080339584", "source_id": 3342759135080339584, "random_index": 1681039305, "ref_epoch": 2016, "ra": 90.9848, "ra_error": 4.194922, "dec": 12.8422, "dec_error": 3.9528131, "parallax": null, "parallax_error": null, "parallax_over_error": null, "pm": null, "pmra": null, "pmra_error": null, "pmdec": null, "pmdec_error": null, "ra_dec_corr": -0.8627036, "ra_parallax_corr": null, "ra_pmra_corr": null, "ra_pmdec_corr": null, "dec_parallax_corg": null, "dec_pmra_corr": null, "dec_pmdec_corr": null, "parallax_pmra_corr": null, "parallax_pmdec_corr": null, "pmra_pmdec_corr": null, "astrometric_n_obs_al": 51, "astrometric_n_obs_ac": 0, "astrometric_n_good_obs_al": 51, "astrometric_n_bad_obs_al": 0, "astrometric_gof_al": 0.6960067, "astrometric_chi2_al": 52.274662, "astrometric_excess_noise": 0.0, "astrometric_excess_noise_sig": 7.40792e-16, "astrometric_params_solved": 3, "astrometric_primary_flag": false, "nu_eff_used_in_astrometry": null, "pseudocolour": null, "pseudocolour_error": null, "ra_pseudocolour_corr": null, "dec_pseudocolour_corr": null, "parallax_pseudocolour_corr": null, "pmra_pseudocolour_corr": null, "pmdec_pseudocolour_corr": null, "astrometric_matched_transits": 6, "visibility_periods_used": 5, "astrometric_sigma5d_max": 9.923719, "matched_transits": 7, "new_matched_transits": 4, "matched_transits_removed": 0, "ipd_gof_harmonic_amplitude": 0.05376477, "ipd_gof_harmonic_phase": 56.369675, "ipd_frac_multi_peak": 0, "ipd_frac_odd_win": 0, "ruwe": null, "scan_direction_strength_k1": 0.35075375, "scan_direction_strength_k2": 0.46080676, "scan_direction_strength_k3": 0.47044572, "scan_direction_strength_k4": 0.36695543, "scan_direction_mean_k1": -44.560276, "scan_direction_mean_k2": 15.428778, "scan_direction_mean_k3": -26.16689, "scan_direction_mean_k4": 43.2581, "duplicated_source": false, "phot_g_n_obs": 60, "phot_g_mean_flux": 89.01228530618961, "phot_g_mean_flux_error": 1.5712049, "phot_g_mean_flux_over_error": 56.652245, "phot_g_mean_mag": 20.813742, "phot_bp_n_obs": 5, "phot_bp_mean_flux": 68.00827109924171, "phot_bp_mean_flux_error": 15.8657465, "phot_bp_mean_flux_over_error": 4.2864842, "phot_bp_mean_mag": 20.757137, "phot_rp_n_obs": 5, "phot_rp_mean_flux": 60.25455985409443, "phot_rp_mean_flux_error": 9.192889, "phot_rp_mean_flux_over_error": 6.554475, "phot_rp_mean_mag": 20.29792, "phot_bp_rp_excess_factor": 1.4409565, "phot_bp_n_contaminated_transits": 0.0, "phot_bp_n_blended_transits": 0.0, "phot_rp_n_contaminated_transits": 0.0, "phot_rp_n_blended_transits": 0.0, "phot_proc_mode": 0, "bp_rp": 0.45921707, "bp_g": -0.056604385, "g_rp": 0.51582146, "radial_velocity": null, "radial_velocity_error": null, "rv_method_used": null, "rv_nb_transits": null, "rv_nb_deblended_transits": null, "rv_visibility_periods_used": null, "rv_expected_sig_to_noise": null, "rv_renormalised_gof": null, "rv_chisq_pvalue": null, "rv_time_duration": null, "rv_amplitude_robust": null, "rv_template_teff": null, "rv_template_logg": null, "rv_template_fe_h": null, "rv_atm_param_origin": null, "vbroad": null, "vbroad_error": null, "vbroad_nb_transits": null, "grvs_mag": null, "grvs_mag_error": null, "grvs_mag_nb_transits": null, "rvs_spec_sig_to_noise": null, "phot_variable_flag": "NOT_AVAILABLE", "l": 196.06421288272475, "b": -4.427862144701127, "ecl_lon": 90.976791086976, "ecl_lat": -10.59372090746758, "in_qso_candidates": false, "in_galaxy_candidates": false, "non_single_star": 0, "has_xp_continuous": false, "has_xp_sampled": false, "has_rvs": false, "has_epoch_photometry": false, "has_epoch_rv": false, "has_mcmc_gspphot": false, "has_mcmc_msc": false, "in_andromeda_survey": false, "classprob_dsc_combmod_quasar": 0.0006141712, "classprob_dsc_combmod_galaxy": 2.9605679e-05, "classprob_dsc_combmod_star": 0.99900997, "teff_gspphot": null, "teff_gspphot_lower": null, "teff_gspphot_upper": null, "logg_gspphot": null, "logg_gspphot_lower": null, "logg_gspphot_upper": null, "mh_gspphot": null, "mh_gspphot_lower": null, "mh_gspphot_upper": null, "distance_gspphot": null, "distance_gspphot_lower": null, "distance_gspphot_upper": null, "azero_gspphot": null, "azero_gspphot_lower": null, "azero_gspphot_upper": null, "ag_gspphot": null, "ag_gspphot_lower": null, "ag_gspphot_upper": null, "ebpminrp_gspphot": null, "ebpminrp_gspphot_lower": null, "ebpminrp_gspphot_upper": null, "libname_gspphot": null, "epos": 5.7639}], "optical_panstarrsdr1": [{"Transient Candidate ID hidden": 1, "Pan-STARRS DR1 ID": 123410909864043425, "Matched": 1, "Prob of Has a Match hidden": 1.0, "Prob of this Match": 1.0, "Max Separation (arcsec)": 1.5938, "objid": 123410909864043425, "projectionid": 1612, "skycellid": 22, "objinfoflag": 436527232, "qualityflag": 52, "ramean": 90.98639862, "decmean": 12.84406222, "rameanerr": 0.02302, "decmeanerr": 0.02002, "epochmean": 55850.97056713, "nstackdetections": 5, "ndetections": 31, "ng": 0, "nr": 9, "ni": 6, "nz": 13, "ny": 3, "gqfperfect": -999.0, "gmeanpsfmag": -999.0, "gmeanpsfmagerr": -999.0, "gmeanpsfmagstd": -999.0, "gmeanpsfmagnpt": 0, "gmeanpsfmagmin": -999.0, "gmeanpsfmagmax": -999.0, "gmeankronmag": -999.0, "gmeankronmagerr": -999.0, "gflags": 114720, "rqfperfect": 0.999376, "rmeanpsfmag": 21.2239, "rmeanpsfmagerr": 0.089408, "rmeanpsfmagstd": 0.188112, "rmeanpsfmagnpt": 7, "rmeanpsfmagmin": 20.9676, "rmeanpsfmagmax": 21.5575, "rmeankronmag": 21.3762, "rmeankronmagerr": 0.097529, "rflags": 115000, "iqfperfect": 0.999174, "imeanpsfmag": 20.5584, "imeanpsfmagerr": 0.137378, "imeanpsfmagstd": 0.150056, "imeanpsfmagnpt": 6, "imeanpsfmagmin": 20.3721, "imeanpsfmagmax": 20.7602, "imeankronmag": 20.7521, "imeankronmagerr": 0.21002, "iflags": 115000, "zqfperfect": 0.999428, "zmeanpsfmag": 20.1947, "zmeanpsfmagerr": 0.035807, "zmeanpsfmagstd": 0.188743, "zmeanpsfmagnpt": 11, "zmeanpsfmagmin": 19.9274, "zmeanpsfmagmax": 20.6483, "zmeankronmag": 20.374, "zmeankronmagerr": 0.056311, "zflags": 115000, "yqfperfect": 0.998886, "ymeanpsfmag": 19.778, "ymeanpsfmagerr": 0.004252, "ymeanpsfmagstd": 0.006175, "ymeanpsfmagnpt": 2, "ymeanpsfmagmin": 19.7727, "ymeanpsfmagmax": 19.7812, "ymeankronmag": 19.7666, "ymeankronmagerr": 0.229004, "yflags": 115000, "epos": 0.0305, "ra": 90.9864, "dec": 12.8441}]}}"""
    
    
    
    
    # detection
    obses = request.form.getlist("obs")
    cmoses = request.form.getlist("cmos")
    dets:WXTDetection = WXTDetection.query.limit(len(obses))
    dets = [
        WXTDetection.query.filter(WXTDetection.detnam==f"CMOS{cmos}") \
        .filter(WXTDetection.obs_id==obs).first()
        for obs,cmos in zip(obses,cmoses)
    ]
    if not all(dets):
        flask.abort(400,"Obs Not Found")
        
    db.session.add(source)
    db.session.commit()
    save_source_files(source)
    for type_ in request.form.getlist("types"):
        src_type = SourceTypeRelation(source_id=source.id,type=SourceType.from_str(type_))
        src_type.identify_time = datetime.now()
        db.session.add(src_type)
    # src_obs
    for det in dets:
        # src_obs
        src_obs = SourceObservation()
        src_obs.wxt_detection_id= det.id
        src_obs.source_id = source.id
        src_obs.detnam = det.detnam
        src_obs.light_curve = ""
        src_obs.spectrum = ""
        src_obs.image = ""
        src_obs.transient_candidate = source.transient_candidate
        src_obs.xray_counterpart = source.xray_counterpart
        src_obs.other_counterpart = source.other_counterpart
        
        # 不知道填啥，但不填就报错
        src_obs.net_counts = 0
        src_obs.index_in_det = 0
        src_obs.x = 0
        src_obs.y = 0
        src_obs.bkg_counts = 0
        src_obs.net_rate = 0
        src_obs.exp_time = 0
        src_obs.src_significance = 0
        src_obs.class_star = 0
        src_obs.image =""
        src_obs.light_curve=""
        src_obs.spectrum =""
        src_obs.elongation = 0
        db.session.add(src_obs)
    db.session.commit()
    OperationLog.add_log(bp.name, 'source info upload ', current_user)

    return redirect(url_for('data_center.source_detail',sourceId=source.id,wxtdetectionId=det.id))


def save_source_files(source:Source):
    save_path = os.path.join(current_app.config['APP_UPLOAD_PATH'],"transient",str(source.id))
    os.mkdir(save_path)
    request.files['img'].save(os.path.join(save_path,'image.fits'))
    request.files['spec'].save(os.path.join(save_path,'spec.fits'))
    request.files['lc'].save(os.path.join(save_path,'lc.fits'))
    request.files['bb'].save(os.path.join(save_path,'bb.json'))
    request.files['pl'].save(os.path.join(save_path,'pl.json'))

@bp.route('/show_image/<obs_id>/<cmos_id>', methods=['GET'])
@login_required
# @permission_required('SYSTEM_ADMIN')
def show_image(obs_id,cmos_id):
    # print(type(cmos_id))
    if cmos_id.find('CMOS')==-1:
        return jsonify({'error':'cmos_id is not correct'})
    wxt_detection = service.get_wxt_detection_by_obsid_cmos(obs_id,cmos_id)

    sourceObs = SourceObservation.query.filter_by(wxt_detection_id=wxt_detection.id,detnam=cmos_id).all()
    filename = f'ep{obs_id}wxt{cmos_id[4:]}_1to2.img'
    image_filename = os.path.join('wxt_product_level2',obs_id,filename)
    showRGBImage = 0
    if os.path.exists(os.path.join(current_app.config['APP_PRODUCT_FOLDER'],image_filename)):
        showRGBImage = 1

    return render_template('app/data_center/show_image.html',obsid=obs_id,cmosid=cmos_id,sourceObs=sourceObs,showRGBImage= showRGBImage) 



@bp.route('/obs_image/<obs_id>/<cmos_id>/<band>', methods=['GET'])
@login_required
# @permission_required('SYSTEM_ADMIN')
def get_obs_image_file(obs_id,cmos_id,band):
    if band=='1':
        filename = f'ep{obs_id}wxt{cmos_id[4:]}_1to2.img'
    elif band =='2':
        filename = f'ep{obs_id}wxt{cmos_id[4:]}_2to4.img'
    elif band =='3':
        filename = f'ep{obs_id}wxt{cmos_id[4:]}_05to1.img'
    else:
        filename = f'ep{obs_id}wxt{cmos_id[4:]}.img'
    image_filename = os.path.join('wxt_product_level2',obs_id,filename)
    return send_from_directory(current_app.config['APP_PRODUCT_FOLDER'], image_filename)
 


@bp.route('/source_lc/<obs_id>/<cmos_id>/<index_in_det>', methods=['GET'])
@login_required
# @permission_required('SYSTEM_ADMIN')
def source_lc(obs_id,cmos_id,index_in_det):
    
    filename = f'ep{obs_id}wxt{cmos_id[4:]}s{index_in_det}.lc'
    filepath = os.path.join(current_app.config['APP_PRODUCT_FOLDER'],'wxt_product_level2', obs_id, filename)
    lc = convert_lc(filepath)
    lc_json = json.dumps(lc)
    lc_bk_filename = f'ep{obs_id}wxt{cmos_id[4:]}s{index_in_det}bk.lc'
    lc_bk_filepath = os.path.join(current_app.config['APP_PRODUCT_FOLDER'],'wxt_product_level2', obs_id, lc_bk_filename)
    lc_bk= convert_lc(lc_bk_filepath)
    
    lc_bk_json = json.dumps(lc_bk)
    return render_template('app/data_center/lc.html',lc_json=lc_json,lc_bk_json=lc_bk_json,filename=filename) 


@bp.route('/source/', methods=['GET'])
@bp.route('/source/<source_id>', methods=['GET'])
@login_required
def get_obs_by_source_id(source_id=None):
    if source_id!=None:
        # source = Source.query.filter_by(id=source_id).first()
        source_obs = SourceObservation.query.filter_by(source_id=source_id).first()
        if source_obs is None:
            abort(404)
        cmos_id= source_obs.detnam
        obs_id = source_obs.wxt_detection.obs_id
        # observation_detail(obs_id, cmos_id)
        # return redirect(f"/obsevation_data/observation_detail/{obs_id}/{cmos_id}")
        return redirect(url_for('.observation_detail',obs_id=obs_id,cmos_id=cmos_id))
    else:
        abort(404)

def get_source_lc(obs_id,cmos_id,index_in_det,timebin):
    if timebin=='0':
        filename=f'ep{obs_id}wxt{cmos_id[4:]}s{index_in_det}.lc'
    else:
        filename=f'ep{obs_id}wxt{cmos_id[4:]}s{index_in_det}src_{timebin}s.lc'
    filepath = os.path.join(current_app.config['APP_PRODUCT_FOLDER'],'wxt_product_level2', obs_id, filename)
    if os.path.exists(filepath):
        lc = convert_lc(filepath)
        lc_json = json.dumps(lc)
        return lc_json
    else:
        return '{}'



def get_spectrum_json(obs_id,cmos_id,index_in_det):
    filename=f'ep{obs_id}wxt{cmos_id[4:]}s{index_in_det}.json'
    filepath = os.path.join(current_app.config['APP_PRODUCT_FOLDER'],'wxt_product_level2', obs_id, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            # strs = f.readlines()
            spectrum_json = json.load(f)
            return spectrum_json
    else:
        return '{}'


# @bp.route('/show_lc/<obs_id>/<cmos_id>/<index_in_det>', methods=['GET'])
# @login_required
# # @permission_required('SYSTEM_ADMIN')
# def show_lc(obs_id,cmos_id,index_in_det):
    
#     # filename = f'ep{obs_id}wxt{cmos_id[4:]}s{index_in_det}.lc'
#     # lc = convert_lc(obs_id,filename)
#     # image_filename = os.path.join('wxt_product_level2',obs_id,filename)
#     return render_template('app/data_center/lc.html',obs_id= obs_id, cmos_id=cmos_id, index_in_det=index_in_det) 



# @bp.route('/api/related_observations/<obs_id>/<cmos_id>', methods=['GET'])
# # @login_required
# def related_observations(obs_id,cmos_id):
#     obs = Observation.query.filter_by(obs_id=obs_id).first()
#     wxt_detection = WXTDetection.query.filter_by(obs_id=obs_id,detnam=cmos_id).first()
#     fov_sql = f'select fov_new from tdic.wxt_detection where id={wxt_detection.id};'
#     result = db.engine.execute(fov_sql)
#     # fov= result.fetchone()
#     for row in result:
#         print(dict(row))

#     related_detections = db.session.query(WXTDetection).filter(text('spoly ( spoint (:detection_ra*pi()/180.0,:detection_dec*pi()/180.0),6.6*pi()/180.0) && fov')).params(detection_ra=wxt_detection.pnt_ra,detection_dec=wxt_detection.pnt_dec).order_by(WXTDetection.exposure_time.desc()).all()
#     re_de=[]
#     for det in related_detections:
#         re_de.append(
#             {
#                 'obs_id':det.obs_id,
#                 'cmos_id':det.detnam
#         })
#     return jsonify(re_de)

# def row2dict(row):
#     d = {}
#     for column in row.__table__.columns:
#         d[column.name] = str(getattr(row, column.name))

#     return d

@bp.route('/wxt_footprint/<filename>', methods=['GET'])
@login_required
# @permission_required('SYSTEM_ADMIN')
def wxt_footprint(filename):       
    return render_template('app/data_center/wxt_footprint.html',filename=filename) 



@bp.route('/lhaaso', methods=['GET'])
@login_required
# @permission_required('SYSTEM_ADMIN')
def lahsso_catalog():       
    if current_user.can('LHAASO_VIEW'):
        return render_template('app/data_center/lhaaso.html') 
    else:
        abort(403)



@bp.route('/wxtsourceviz', methods=['GET'])
def wxt_source_viz():
    source_json = get_xm_json('ep_matched.json')
    # source_json = get_xm_json('wxt_source_xm.json')

    source_json_mwr = get_xm_json('ep_unmatched.json')
    # source_json_mwr = get_xm_json('wxt_source_mwr_xm.json')

    return render_template('app/data_center/wxt_source_viz.html',source_json=source_json, source_json_mwr=source_json_mwr) 

@bp.route('/leiasourceviz', methods=['GET'])
def leia_source_viz():
    source_json = get_xm_json('known1_s3.json')
    # source_json = get_xm_json('wxt_source_xm.json')

    so_known_group = get_xm_json('s3_known1.json')
    # source_json_mwr = get_xm_json('wxt_source_mwr_xm.json')

    return render_template('app/data_center/leia_source_viz.html',leia_source_json=source_json, so_known_group=so_known_group) 

@bp.route('/wxtobsviz', methods=['GET'])
def wxt_obs_viz():
    # source_json = get_xm_json('matched.json')
    source_json = get_xm_json('wxt_source_xm.json')

    # source_json_mwr = get_xm_json('unmatched.json')
    source_json_mwr = get_xm_json('wxt_source_mwr_xm.json')

    return render_template('app/data_center/wxt_obs_viz.html',source_json=source_json, source_json_mwr=source_json_mwr) 


def get_xm_json(filename):
    filepath= os.path.join(current_app.config['APP_PRODUCT_FOLDER'],'xmatch',filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            # strs = f.readlines()
            source_json = json.load(f)
        
    else:
        source_json = '{}'
    return source_json



@bp.route('/observation_overview', methods=['GET'])
def observation_overview():

    sql =  """
    SELECT p.obs_id, p.detnam, p.pnt_ra, p.pnt_dec, p.exposure_time, f.obs_start, f.obs_end, f.private, f.user_id, f.user_name 
    FROM (
    SELECT obs_id, detnam,pnt_ra,pnt_dec,exposure_time
	FROM tdic.wxt_detection 
    ) p
    INNER JOIN
    (
	(SELECT obs_id, obs_start, obs_end, pi_id, private
	FROM tdic.observation) a LEFT JOIN (SELECT id as user_id, name as user_name, email as user_email FROM tdic.user) b ON a.pi_id=b.user_id
    ) F on P.obs_id = F.obs_id ORDER BY f.obs_end LIMIT 144;
    """
    if request.method == 'GET':
        result = db.session.execute(text(sql))
        data = result.fetchall()
        if data is not None and len(data)>0:
            obs = DataFrame(data)
            obs.columns = result.keys()  
    return render_template('app/data_center/observation_overview.html',obs=obs) 


@bp.route('/download_lv1/<obsid>/<cmosid>/<version>')
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','WXT_ACCESS'])
def download_lv1(obsid:str,cmosid:str,version):
    """下载Lv1数据

    Args:
        obsid (str): _description_
        cmosid (str): _description_

    Returns:
        _type_: _description_
    """ 
    if current_app.config['POSTGRES_USER']=="mwrbackend":
        # Leia环境，没有上传打包的lv1
        path = service.lv1_tarball_path(obsid,cmosid[4:])
        OperationLog.add_log(bp.name, 'download level1 of {} {}'.format(obsid,cmosid), current_user)
        return send_file(os.path.join(current_app.config['APP_PRODUCT_FOLDER'],path),as_attachment=True,download_name=f"ep{obsid}{cmosid}lv1.tar.gz")
    cmos_num = cmosid[4:] 
    content = csdb_31602.down_by_meta_data("wxt1",{
        "obsId":obsid,
        "cmos":cmos_num,
        "version":version
    })
    if content is None:
        content = csdb_31502.down_by_meta_data("wxt1",{
        "OBS_ID":obsid,
        "CMOS_ID":cmos_num,
        "VERSION":version
        })
    io = BytesIO(content)
    return flask.send_file(io,mimetype='application/zip',download_name=f"ep{obsid}wxt{cmosid}l2{version}.zip") 

@bp.route('/download_lv2/<obsid>/<cmosid>/<version>')
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','WXT_ACCESS'])
def download_lv2(obsid:str,cmosid:str,version:str):
    """下载Lv2数据

    Args:
        obsid (str): _description_
        cmosid (str): _description_

    Returns:
        _type_: _description_
    """
    cmos_num = cmosid[4:] 
    content = csdb_31602.down_by_meta_data("wxt2",{
        "obsId":obsid,
        "cmos":cmos_num,
        "version":version
    })
    if content is None:
        content = csdb_31502.down_by_meta_data("wxt2",{
        "OBS_ID":obsid,
        "CMOS_ID":cmos_num,
        "VERSION":version
        })
    io = BytesIO(content)
    return flask.send_file(io,mimetype='application/zip',download_name=f"ep{obsid}wxt{cmosid}l2{version}.zip")
    
    
    

def url_for_issue(issue_id:int):
    return f"http://{BASE_URL}:31504/issues/{issue_id}"


@bp.route("/issue/<int:src_obs_id>/<instrument>", methods=['GET'])
def issue(src_obs_id:int,instrument='WXT'):
  
    current_url = request.referrer
    if instrument== 'WXT':
        src_obs:SourceObservation = SourceObservation.query.get(src_obs_id)
    elif instrument== 'FXT':
        src_obs:FXTSourceObservation = FXTSourceObservation.query.get(src_obs_id)
       
    if not src_obs.issue:
        try:
            BASE_URL='http://{BASE_URL}:31503/ep/sys'

            body = {
                "ra":src_obs.ra,
                "decc":src_obs.dec,
                "name":src_obs.name,
                "posErr":src_obs.pos_err,
                "flux":src_obs.flux,
                "instrument":instrument,
                "alertTime":src_obs.wxt_detection.obs_start.strftime("%Y-%m-%d %H:%M:%S") if instrument=='WXT' else src_obs.fxt_detection.obs_start.strftime("%Y-%m-%d %H:%M:%S"),
                "tdicUrl":current_url
            }

            token=requests.post(f"{BASE_URL}/user/login?password=!%40%23qazQAZ8899&username=admin",headers={"accept": "*/*"}).json()['token']
            headers={"X-AUTH-TOKEN":token,"Content-Type": "application/json"}
            logging.error(body)
            resp=requests.post(f'{BASE_URL}/alarm/addEpssosVoevent',json=body,headers=headers)
            issue_id = resp.json()['data']['issueId']
            issue:Issue = Issue()
            issue.issue_id = issue_id
            if instrument=="WXT":
                issue.src_obs_id=src_obs.id
            elif instrument == "FXT":
                issue.fxt_src_obs_id=src_obs.id

            db.session.add(issue)
            db.session.commit()
        except Exception as e:
            logging.error(traceback.format_exc())
            if resp:
                logging.error(resp.content)
            return "create issue error...."
    
    return flask.render_template("app/redirect.html",url=url_for_issue(src_obs.issue.issue_id))

@bp.route("/issue/", methods=['POST'])
def issue_post():
    current_url = request.referrer
    if len(request.form)>0:
        src_obs_id= request.form.get("src_obs_id")
        ra = request.form.get("ra")
        dec = request.form.get("dec")
        name = request.form.get("name")
        posErr = request.form.get("posErr")
        flux = request.form.get("flux")
        instrument = request.form.get("instrument")
        alertTime = request.form.get("alertTime")

    else:
        src_obs_id= request.json["src_obs_id"]
        ra = request.json["ra"]
        dec = request.json["dec"]
        name = request.json["name"]
        posErr = request.json["posErr"]
        flux = request.json["flux"]
        instrument = request.json["instrument"]
        alertTime = request.json["alertTime"]

    if instrument== 'WXT':
        src_obs:SourceObservation = SourceObservation.query.get(src_obs_id)
    elif instrument== 'FXT':
        src_obs:FXTSourceObservation = FXTSourceObservation.query.get(src_obs_id)
       
    if not src_obs.issue:
        try:
            BASE_URL='http://{BASE_URL}:31503/ep/sys'
          

            body = {
                "ra":ra,
                "decc":dec,
                "name":name,
                "posErr":posErr,
                "flux":flux,
                "instrument":instrument,
                "alertTime":alertTime,
                "tdicUrl":current_url
                
            }
            token=requests.post(f"{BASE_URL}/user/login?password=!%40%23qazQAZ8899&username=admin",headers={"accept": "*/*"}).json()['token']
            headers={"X-AUTH-TOKEN":token,"Content-Type": "application/json"}
            logging.error(body)
            resp=requests.post(f'{BASE_URL}/alarm/addEpssosVoevent',json=body,headers=headers)
            issue_id = resp.json()['data']['issueId']
            issue:Issue = Issue()
            issue.issue_id = issue_id
            if instrument=="WXT":
                issue.src_obs_id=src_obs.id
            elif instrument == "FXT":
                issue.fxt_src_obs_id=src_obs.id

            db.session.add(issue)
            db.session.commit()
        except Exception as e:
            logging.error(traceback.format_exc())
            if resp:
                logging.error(resp.content)
            return "create issue error...."
    
    return flask.render_template("app/redirect.html",url=url_for_issue(src_obs.issue.issue_id))

@bp.route("/issue/relate/<int:issue1_id>/<int:issue2_id>")
def relate_issue(issue1_id:int,issue2_id:int):
    relate(issue1_id,issue2_id)
    relate(issue2_id,issue1_id)

    return flask.render_template("app/redirect.html",url=url_for_issue(issue1_id))

@bp.route("/issue/unrelate/<int:issue1_id>/<int:issue2_id>")
def unrelate_issue(issue1_id:int,issue2_id:int):
    unrelate(issue1_id,issue2_id)
    unrelate(issue2_id,issue1_id)

    return flask.render_template("app/redirect.html",url=url_for_issue(issue1_id))
    
@bp.route("/hips_test")
def hips_test():
   

    return render_template("app/data_center/hips_test.html")

@bp.route("/events/<obsid>")
def pipeline_events(obsid:str):
    
    events = service.get_pipeline_events(obsid)
    return flask.jsonify(
        {"events":events}
    )
    
@bp.route("/events_0B/<obsid>")
def pipeline_0b_events(obsid:str):
    
    events = service.get_pipeline_0b_events(obsid)
    return flask.jsonify(
        {"events":events}
    )


@bp.route('/bd_candidate_list', methods=['GET'])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW'])
def bd_candidate_list_get():
    dt= datetime.combine(datetime.today(), datetime.min.time())
    start_time = dt - timedelta(1)

    
    sourceObs = service.querySourceObsByTimeSpan(start_time,datetime.now(),ObsTrigger.beidou.value)
    infoList = generateSourceIndetificationInfo(sourceObs)
        # for key in queryResultlist.keys():
        #     table = match_dao.table_from_dataframe(key, queryResultlist[key], pi*radius*radius)
        #     print(table)
        # info['observed_number']
        # separation = match.dist((ra,dec),(source.ra, source.dec))*60*60
        # separations[source.id]=separation
    form = SourceSearchForm()
    hint = f"Source Candidates in Last Day" 
    OperationLog.add_log(bp.name, 'visit source candidate list ', current_user)
    return render_template('app/data_center/source_candidate_list_ordinary_user.html',sources=sourceObs, form = form, infoList=infoList,hint= hint)


@bp.route("/bd_candidate_list/",methods=["POST"])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','WXT_ACCESS'])
def bd_list():
    
    form = SourceSearchForm()
    hint = f"Latest Transient Candidates" 

    if form.validate_on_submit():
        start_datetime = form.start_datetime.data
        end_datetime = form.end_datetime.data
        # radius = form.radius.data
        # object_name = form.object_name.data
        
        if start_datetime is not None and end_datetime is not None:
            sourceObs = service.querySourceObsByTimeSpan(start_datetime, end_datetime,ObsTrigger.beidou.value)
            infoList = generateSourceIndetificationInfo(sourceObs)
            hint = f"Find {len(sourceObs)} Source Candidates."
            OperationLog.add_log(bp.name, 'visit sy01 source candidate list page ', current_user)

            return render_template('app/data_center/source_candidate_list_ordinary_user.html',sources=sourceObs,infoList=infoList, form = form, hint= hint)
    else:
        # hint = "\n".join([f"{k}:{v}" for k,v in form.errors.items()])
        OperationLog.add_log(bp.name, 'visit sy01 source candidate list page ', current_user)

        return render_template('app/data_center/source_candidate_list_ordinary_user.html',sources=sourceObs, form = form, hint= hint)
 

