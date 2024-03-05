from flask_login import login_required
from app.data_center import bp, service
from app.data_center.forms import SourceSearchForm
from app.data_center.routes import ta_single_check, generateSourceIndetificationInfo
from app.data_center.service import ObsTrigger
from app.decorators import permission_required
from . import service
from flask import request, render_template, make_response
import flask
import json
from flask_login import login_required, current_user
from app.data_center.forms import ObservationSearchForm, SourceSearchForm
from app.operation_log.models import OperationLog
from app.data_center.models import VHFDetection,VHFSourceObservation,SourceEncoder,WXTDetection,FOVColumn,SourceObsListCommentsEncoder,SourceObservation

from datetime import datetime, timedelta
from app.extensions import db
from typing import List

@bp.route('/vhf_source_candidate_list/api/')
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def vhf_source_candidate_list_api():

    start_datetime = request.args['start_datetime']
    end_datetime = request.args['end_datetime']
    sourceObses = [sourceObs.to_dict() for sourceObs in service.querySourceObsByTimeSpan(start_datetime, end_datetime)]
    for src_obs in  sourceObses:
        src_obs.setdefault('instrument','vhf')
        src_obs.setdefault('records',flask.url_for('.ta_vhf_records',src_id=src_obs['id'])) # 证认记录链接
        src_obs.setdefault('src_detail',flask.url_for('.vhf_detection_detail',obs_id=src_obs['obs_id'],cmos_id=src_obs['detnam']))
    return flask.jsonify(sourceObses)
    # infoList = generateSourceIndetificationInfo(sourceObs)
    # hint = f"Find {len(sourceObs)} Source Candidates."
        

@bp.route('/vhf_source_candidate_list_ta', methods=['GET'])
@login_required
@permission_required('TA_TOOLS')
@ta_single_check(channel=ObsTrigger.vhf)
# @permission_required('SYSTEM_ADMIN')
def vhf_source_candidate_list():

    dt= datetime.combine(datetime.today(), datetime.min.time())
    start_time = dt - timedelta(1)

    # 获取VHF Alert
    vhfSourceObs = service.queryVHFAlertSourceObsByTimeSpan(start_time, datetime.now())
    # 获取到对应的SourceObservation
    so = service.queryVHFAlertSourceObs(vhfSourceObs)
    infoList = generateVHFAlertSourceIndetificationInfo(vhfSourceObs,so)
    comments = SourceObsListCommentsEncoder.encode(so)
    form = SourceSearchForm()
    hint = f"VHF Alert in Last Day" 

    # 获取VHF数据
    vhfDataObs = service.queryVHFDataSourceObsByTimeSpan(start_time, datetime.now())
    vhfDataInfoList = generateSourceIndetificationInfo(vhfDataObs)
    vhfDataComments = SourceObsListCommentsEncoder.encode(vhfDataInfoList)

    return flask.render_template('app/data_center/vhf_source_candidate_list_ta.html',sources=vhfSourceObs, form = form, infoList=infoList, hint= hint,comments=comments,vhfDataObs=vhfDataObs, vhfDataInfoList=vhfDataInfoList, vhfDataComments=vhfDataComments)

@bp.route('/vhf_source_candidate_list_ta', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
@ta_single_check(channel=ObsTrigger.vhf)
# @permission_required('SYSTEM_ADMIN')
def vhf_source_candidate_list_post():
    form = SourceSearchForm()
    hint = f"Latest VHF Alert and Data" 

    if form.validate_on_submit():
        start_datetime = form.start_datetime.data
        end_datetime = form.end_datetime.data
        # radius = form.radius.data
        # object_name = form.object_name.data
        
        if start_datetime is not None and end_datetime is not None:

            # 获取VHF Alert
            vhfSourceObs = service.queryVHFAlertSourceObsByTimeSpan(start_datetime, end_datetime)
            # 获取到对应的SourceObservation
            so = service.queryVHFAlertSourceObs(vhfSourceObs)
            infoList = generateVHFAlertSourceIndetificationInfo(vhfSourceObs,so)
            comments = SourceObsListCommentsEncoder.encode(so)
            form = SourceSearchForm()
            hint = f"VHF Alert in Last Day" 

            # 获取VHF数据
            vhfDataObs = service.queryVHFDataSourceObsByTimeSpan(start_datetime, end_datetime)
            vhfDataInfoList = generateSourceIndetificationInfo(vhfDataObs)
            vhfDataComments = SourceObsListCommentsEncoder.encode(vhfDataObs)

            return flask.render_template('app/data_center/vhf_source_candidate_list_ta.html',sources=vhfSourceObs, form = form, infoList=infoList, hint= hint,comments=comments,vhfDataObs=vhfDataObs, vhfDataInfoList=vhfDataInfoList, vhfDataComments=vhfDataComments)

def generateVHFAlertSourceIndetificationInfo(vhfSourceObs:List[VHFSourceObservation],sourceObs:List[SourceObservation]):
    """ep_ref_ra等实际上完全可以直接读属性，但因为页面上都用到了IndetificationInfo变量，所以就在这里改了

    Args:
        sourceObs (List[SourceObservation]): _description_

    Returns:
        _type_: _description_
    """
    infoList ={} #
    radius = 10/60.0 #检索半径为10角分
    for index, vhfSourceDetection in enumerate(vhfSourceObs):
        info = {}
        info['observed_num'] = 'please check in details'
        info['obs_num_sor_loc'] = 'please check in details'
        epref={}
        info['so_id']=sourceObs[index].id
        infoList[str(vhfSourceDetection.id)] = info
    return infoList


@bp.route('/vhf_detection_list', methods=['GET'])
# @login_required
@permission_required(['WXT_ACCESS','WXT_LIMITED_ACCESS','WXT_APPLICATION'])
def vhf_detection_list_access():
    # result = db.session.execute(text(sql))
    form = ObservationSearchForm()
    if current_user.can('WXT_ACCESS')or current_user.can('SY01_LIMITED_ACCESS'):
        OperationLog.add_log(bp.name, 'visit vhf detection data search page ', current_user)
        return render_template('app/data_center/vhf_detection_list.html', form=form)
 
    elif current_user.can('WXT_VIEW'):
        OperationLog.add_log(bp.name, 'visit vhf detection data search page ', current_user)
        return render_template('app/data_center/vhf_detection_list.html', form=form)

@bp.route('/vhf_detection_list/api/', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def vhf_detection_list_api():

    if len(request.form)>0:
        obs_id= request.form.get("obs_id")
        ra = None
        dec = None
        radius = None
        start_time = request.form.get("start_datetime")
        end_time = request.form.get("end_datetime")
    else:
        obs_id= request.json["obs_id"]
        ra = None
        dec = None
        radius = None
        start_time = request.json["start_datetime"]
        end_time = request.json["end_datetime"]
    obs = service.search_VHF_obs(obs_id,ra,dec,radius,start_time,end_time)
    return flask.jsonify(obs)

@bp.route('/obsevation_data/vhf_detection_detail/<obs_id>/<cmos_id>', methods=['GET'])
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS'])
@login_required
def vhf_detection_detail(obs_id,cmos_id):
    vhf_detection = VHFDetection.query.filter_by(obs_id=obs_id,detnam=cmos_id).first()
    # if obs.instrument=='SY01' and not current_user.can('SY01_ACCESS'):
    #     abort(403)
    
    vhf_source_observation:VHFSourceObservation = service.get_vhf_sourceobs_by_id(vhf_detection.id)
    if vhf_source_observation is None:
        resp = make_response(json.dumps(None,cls=SourceEncoder))
        resp.content_type = "application/json"
        return resp
    wxt_detection = WXTDetection.query.filter(WXTDetection.obs_id == vhf_detection.obs_id, WXTDetection.detnam ==vhf_detection.detnam, WXTDetection.instrument=='WXT').first()
    if wxt_detection is not None:
        so = SourceObservation.query.filter(SourceObservation.wxt_detection_id==wxt_detection.id,SourceObservation.detnam==vhf_source_observation.detnam,SourceObservation.index_in_det==vhf_source_observation.index_in_det).first()
    else:
        so =None
    # fov_object = wxt_detection.fov_new

    obs_time = vhf_detection.obs_start
    query_time_start = obs_time - timedelta(180)
    query_time_end = obs_time + timedelta(180)
    tele_related_detections:List[WXTDetection] = WXTDetection.query.filter(db.and_(WXTDetection.instrument=='SY01',FOVColumn.has_circle_overlap(vhf_source_observation.ra,vhf_source_observation.dec, vhf_source_observation.pos_err))).all()
    tele_related_detections = [det for det in tele_related_detections if \
        det.observation.obs_start > query_time_start \
        and det.observation.obs_start < query_time_end \
        # and fov_object.overlapped_ratio_large_than_0_1(det.fov_new) \
        # and det.observation.instrument=='SY01'
    ]

    # if obs.private and current_user != obs.pi:
    #     abort(403)
    # else:
    # sourceObs = SourceObservation.query.filter_by(wxt_detection_id=wxt_detection.id,detnam=cmos_id).all() #得到的是sourceObservation的关联List
    OperationLog.add_log(bp.name, 'visit vhf observation detail ', current_user)

    return render_template('app/data_center/vhf_detection_detail.html', vhf_detection=vhf_detection, vhf_source_observation=vhf_source_observation,tele_related_detections = tele_related_detections,so=so) 