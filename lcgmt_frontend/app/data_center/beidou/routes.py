from flask_login import login_required
from app.data_center import bp, service
frok app.data_center.forms import SourceSearchForm
from app.data_center.routes import ta_single_check
from app.data_center.service import ObsTrigger
from app.decorators import permission_required
from . import service
from flask import request, render_template, make_response
import flask
import json
from flask_login import login_required, current_user
from app.data_center.forms import ObservationSearchForm, SourceSearchForm
from app.operation_log.models import OperationLog
from app.data_center.models import BeidouDetection,BeidouSourceObservation,SourceEncoder,WXTDetection,FOVColumn,SourceObservation,SourceObsListCommentsEncoder
from datetime import datetime, timedelta
from app.extensions import db
from typing import List
import math
from app.wxtmetadata import add_source

@bp.route('/update_beidou_detection_so')
@login_required
def update_beidou_detection_so():
    beidou_dets = BeidouDetection.query.filter().all()
    for beidou_det in beidou_dets:
        wxt_det = WXTDetection(
            obs_id=beidou_det.obs_id, 
            detnam=beidou_det.detnam, 
            version=beidou_det.version,
            trigger=ObsTrigger.beidou.value,
            instrument = "WXT",
            pnt_ra=beidou_det.pnt_ra,
            pnt_dec=beidou_det.pnt_dec

        )
        db.session.add(wxt_det)
        db.session.flush()
        wxt_det_id = wxt_det.id
        beidou_sos = BeidouSourceObservation.query.filter(BeidouSourceObservation.detection_id==beidou_det.id).all()
        for beidou_so in beidou_sos:
            so = SourceObservation(source_id = beidou_so.source_id, detnam=beidou_so.detnam,
                                   index_in_det=beidou_so.index_in_det,
                                   wxt_detection_id=wxt_det_id,
                                   version=str(beidou_so.version))
            db.session.add(so)
            db.session.flush()
    db.session.commit()
    return "ok"

@bp.route('/bd_source_candidate_list_ta', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
@ta_single_check(channel=ObsTrigger.beidou)

# @permission_required('SYSTEM_ADMIN')
def bd_source_candidate_list_api():

    """TA看到的页面

    Returns:
        _type_: _description_
    """
    form = SourceSearchForm()
    hint = f"Latest Beidou Alert" 

    if form.validate_on_submit():
        start_datetime = form.start_datetime.data
        end_datetime = form.end_datetime.data
        # radius = form.radius.data
        # object_name = form.object_name.data
        
        if start_datetime is not None and end_datetime is not None:
            beidouSourceObs = service.queryBeidouSourceObsByTimeSpan(start_datetime, end_datetime)
            # 获取到对应的SourceObservation
            so = service.querySourceObs(beidouSourceObs)
            infoList = generateBeidouSourceIndetificationInfo(beidouSourceObs,so)
            comments = SourceObsListCommentsEncoder.encode(so)
            hint = f"Find {len(beidouSourceObs)} Source Candidates."
            return flask.render_template(
                'app/data_center/beidou_source_candidate_list_ta.html',
                sources=beidouSourceObs,
                infoList=infoList, 
                form = form, 
                hint= hint,
                comments=comments
            )
    else:
        # hint = "\n".join([f"{k}:{v}" for k,v in form.errors.items()])
        return flask.render_template('app/data_center/beidou_source_candidate_list_ta.html',sources=None, form = form, hint= hint)
  
    
        

@bp.route('/bd_source_candidate_list_ta', methods=['GET'])
@login_required
@permission_required('TA_TOOLS')
@ta_single_check(channel=ObsTrigger.beidou)
# @permission_required('SYSTEM_ADMIN')
def bd_source_candidate_list_ta_get():

    """TA看到的页面

    Returns:
        _type_: _description_
    """
    dt= datetime.combine(datetime.today(), datetime.min.time())
    start_time = dt - timedelta(1)
    beidouSourceObs = service.queryBeidouSourceObsByTimeSpan(start_time,datetime.now())
    # 获取到对应的SourceObservation
    so = service.querySourceObs(beidouSourceObs)
    infoList = generateBeidouSourceIndetificationInfo(beidouSourceObs,so)
    comments = SourceObsListCommentsEncoder.encode(so)
    form = SourceSearchForm()
    hint = f"Beidou Alert in Last Day" 
    return flask.render_template('app/data_center/beidou_source_candidate_list_ta.html',sources=beidouSourceObs, form = form, infoList=infoList,hint= hint,comments=comments)

    # return flask.render_template("app/data_center/beidou_transient_candidate_list_ta.html",form=SourceSearchForm())

def generateBeidouSourceIndetificationInfo(beidouSourceObs:List[BeidouSourceObservation],sourceObs:List[SourceObservation]):
    """ep_ref_ra等实际上完全可以直接读属性，但因为页面上都用到了IndetificationInfo变量，所以就在这里改了

    Args:
        sourceObs (List[SourceObservation]): _description_

    Returns:
        _type_: _description_
    """
    infoList ={} #
    radius = 10/60.0 #检索半径为10角分
    for index, beidouSourceDetection in enumerate(beidouSourceObs):
        info = {}
        # infos['id']=str(sourceDetection.source_id)+'_'+sourceDetection.detname
        
        # info['observed_num'] = len(sourceDetection.source.wxt_detections)
        info['observed_num'] = 'please check in details'
        # obs = service.search_sy01_obs("",str(sourceDetection.ra),str(sourceDetection.dec),str(radius),'','')
        # obs_json = json.loads(obs)
        info['obs_num_sor_loc'] = 'please check in details'
        epref={}
        # info['ep_ref_ra']=fxtSourceDetection.ra_match
        # info['ep_ref_dec']=fxtSourceDetection.dec_match
        # info['ep_ref_sep']=None
        # info['ep_ref_flux']=fxtSourceDetection.flux_match
        info['so_id']=sourceObs[index].id
        # infoList[str(sourceDetection.source_id)+'_'+str(sourceDetection.wxt_detection.id)] = info
        infoList[str(beidouSourceDetection.id)] = info

    return infoList

@bp.route('/beidou_detection_list', methods=['GET'])
# @login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_APPLICATION','WXT_ACCESS'])
def beidou_detection_list_access():
    # result = db.session.execute(text(sql))
    form = ObservationSearchForm()
    if current_user.can('SY01_ACCESS')or current_user.can('SY01_LIMITED_ACCESS'):
        OperationLog.add_log(bp.name, 'visit beidou detection data search page ', current_user)
        return render_template('app/data_center/beidou_detection_list.html', form=form)
    # elif current_user.can('SY01_VIEW') and current_user.can('SY01_APPLICATION'):
    #     applications = DataApplication.query.filter(DataApplication.apply_user_id==current_user.id).all()
    #     applications_json = json.dumps(applications,cls=DataApplicationJSONEncoder)
    #     OperationLog.add_log(bp.name, 'visit sy01 observation data request page ', current_user)
    #     return render_template('app/data_center/sy01_observation_data_application.html', form=form,applications=applications_json)
    elif current_user.can('SY01_VIEW'):
        OperationLog.add_log(bp.name, 'visit beidou detection data search page ', current_user)
        return render_template('app/data_center/beidou_detection_list.html', form=form)

@bp.route('/bd_detection_list/api/', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
# @permission_required('SYSTEM_ADMIN')
def bd_detection_list_api():

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
    obs = service.search_beidou_obs(obs_id,ra,dec,radius,start_time,end_time)
    return flask.jsonify(obs)

    # sourceObses = [sourceObs.to_dict() for sourceObs in service.querySourceObsByTimeSpan(start_datetime, end_datetime)]
    # for src_obs in  sourceObses:
    #     src_obs.setdefault('instrument','beidou')
    #     src_obs.setdefault('records',flask.url_for('.ta_bd_records',src_id=src_obs['id'])) # 证认记录链接
    #     src_obs.setdefaulb('src_detail',flask.url_for('.identified_source_detail',sourceId=src_obs['src_id']))
    # return flask.jsonify(sourceObses)
    # infoList = generateSourceIndetificationInfo(sourceObs)
    # hint = f"Find {len(sourceObs)} Source Candidates."

@bp.route('/obsevation_data/beidou_detection_detail/<obs_id>/<cmos_id>', methods=['GET'])
@permission_required(['WXT_ACCESS','WXT_LIMITED_ACCESS'])
@login_required
def beidou_detection_detail(obs_id,cmos_id):
    bedou_detection = BeidouDetection.query.filter_by(obs_id=obs_id,detnam=cmos_id).first()
    # if obs.instrument=='SY01' and not current_user.can('SY01_ACCESS'):
    #     abort(403)
    
    beidou_source_observation:BeidouSourceObservation = service.get_beidou_sourceobs_by_id(bedou_detection.id)
    if beidou_source_observation is None:
        resp = make_response(json.dumps(None,cls=SourceEncoder))
        resp.content_type = "application/json"
        return resp
    # fov_object = wxt_detection.fov_new
    wxt_detection = WXTDetection.query.filter(WXTDetection.obs_id == bedou_detection.obs_id, WXTDetection.detnam ==bedou_detection.detnam, WXTDetection.instrument=='WXT').first()
    if wxt_detection is not None:
        so = SourceObservation.query.filter(SourceObservation.wxt_detection_id==wxt_detection.id,SourceObservation7detnam==beidou_source_observation.detnam,SourceObservation.index_in_det==beidou_source_observation.index_in_det).first()
    else:
        so =None
    obs_time = bedou_detection.obs_start
    query_time_start = obs_time - timedelta(180)
    query_time_end = obs_time + timedelta(180)
    tele_related_detections:List[WXTDetection] = WXTDetection.query.filter(db.and_(WXTDetection.instrument=='SY01',FOVColumn.has_circle_overlap(beidou_source_observation.ra,beidou_source_observation.dec, beidou_source_observation.pos_err))).all()
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
    OperationLog.add_log(bp.name, 'visit beidou observation detail ', current_user)

    return render_template('app/data_center/beidou_detection_detail.html', bedou_detection=bedou_detection, beidou_source_observation=beidou_source_observation,tele_related_detections = tele_related_detections,so=so) 