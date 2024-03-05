from flask_login import login_required, current_user
from app.data_center import bp
from app.data_center.forms import SourceSearchForm, ObservationSearchForm
from app.data_center.routes import  ta_single_check
from app.decorators import permission_required
from flask import request, render_template
import flask
from . import service
from app.data_center.models import FXTDetection, FXTDetNam, FXTDataVersion, FXTSourceObservation, ObsTrigger, Observation, SourceObsListCommentsEncoder, WXTDetection,SourceObservation,FXTAlertDetection, FXTAlertSourceObservation, Source,SourceEncoder, IdentifiedSourceEncoder
from app.fxtmetadata import add_source
from app import csdb
from io import BytesIO
from datetime import datetime,timedelta
from app.utils import zip_filestreams
from app.extensions import db
import math
from typing import List,Dict
from sqlalchemy.sql.expression import or_
from sqlalchemy import desc, text,and_
import os,json
from app.operation_log.models import OperationLog

@bp.route('/update_detection_so')
@login_required
def update_detection_so():
    fxt_dets = FXTDetection.query.filter().all()
    for fxt_det in fxt_dets:
        wxt_det = WXTDetection(
            obs_id=fxt_det.obs_id, 
            detnam=fxt_det.detnam, 
            version=fxt_det.version,
            trigger=ObsTrigger.ihep.value,
            instrument = "FXT",
            pnt_ra=fxt_det.pnt_ra,
            pnt_dec=fxt_det.pnt_dec
        )
        db.session.add(wxt_det)
        db.session.flush()
        wxt_det_id = wxt_det.id
        if wxt_det_id==186798:
            pass
        fxt_sos = FXTSourceObservation.query.filter(FXTSourceObservation.fxt_detection_id==fxt_det.id).all()
        for fxt_so in fxt_sos:
            pos_err =  math.sqrt(fxt_so.ra_err ** 2 + fxt_so.dec_err ** 2)
            source =  add_source(fxt_so.ra, fxt_so.dec, pos_err, fxt_so.target_name)
            so = SourceObservation(source_id = source.id, detnam=fxt_so.detnam,
                                   index_in_det=fxt_so.index_in_det,
                                   wxt_detection_id=wxt_det_id,
                                   version=str(fxt_so.version))
            db.session.add(so)
            db.session.flush()
    db.session.commit()
    return "ok"
@bp.route('/fxt_known_source_list/', methods=['GET'])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW'])
def fxt_known_source_list():

    sources:List[Source] = Source.query.join(Source._wxt_detections).filter(and_(or_(Source.src_type=='known_source',Source.src_type=='burst'),Source.fxt_name!=None)).all()
    form = SourceSearchForm()
    # for source in sources:
    #     if source.wxt_detections is None:
    #         sources.remove(source)

    sources_json:List[Dict] = [IdentifiedSourceEncoder().default(source) for source in sources]

    return render_template(
        'app/data_center/identified_source_list.html',
        sources=json.dumps(sources_json), 
        form = form, 
        title="FXT Known Source List"
    )  

@bp.route('/fxt_transient_list/', methods=['GET'])
@login_required
@permission_required(['SY01_ACCESS','SY01_LIMITED_ACCESS','SY01_VIEW'])
def fxy_transient_list():
    sources:List[Source] = Source.query.join(Source._wxt_detections).filter(and_(or_(Source.src_type=='transient'),Source.fxt_name!=None)).all()
    form = SourceSearchForm()

    sources_json:List[Dict] = [IdentifiedSourceEncoder().default(source) for source in sources]

    return render_template(
        'app/data_center/identified_source_list.html',
        sources=json.dumps(sources_json), 
        form = form, 
        title="FXT Transient List"
    )      

@bp.route('/fxt_obs/')
@login_required
@permission_required('FXT_ACCESS')
# @permission_required('SYSTEM_ADMIN')
def fxt_obs_list():
    return flask.render_template("app/data_center/fxt_obs_list.html",form=ObservationSearchForm())

@bp.route('/fxt_obs/api/',methods=['POST'])
@login_required
@permission_required('FXT_ACCESS')
def fxt_obs_list_api():
    result = []

    if len(request.form)>0:
        obs_id= request.form.get("obs_id")
        ra = None
        dec = None
        radius = None
        start_datetime = request.form.get("start_datetime")
        end_datetime = request.form.get("end_datetime")
    else:
        obs_id= request.json["obs_id"]
        ra = None
        dec = None
        radius = None
        start_datetime = request.json["start_datetime"]
        end_datetime = request.json["end_datetime"]

    if obs_id is not None and len(obs_id)>0:
        dets =  service.queryObsByObsID(obs_id)
    else:
        dets = service.queryObsByTimeSpan(start_datetime, end_datetime,ra,dec,radius)
        
    for det in dets:
        so_dict = det.to_dict()
        so_dict.setdefault('instrument','FXT')
        so_dict.setdefault('obs_detail',flask.url_for('.fxt_obs_detail',obs_id=det.obs_id, detnam=det.detnam, version=det.version))
        so_dict.setdefault('quick_look',fxt_obs_resource(det))
        result.append(so_dict)    
    return flask.jsonify(result)

def generateFXTSourceIndetificationInfo(fxtSourceObs:List[FXTSourceObservation],sourceObs:List[SourceObservation]):
    """ep_ref_ra等实际上完全可以直接读属性，但因为页面上都用到了IndetificationInfo变量，所以就在这里改了

    Args:
        sourceObs (List[SourceObservation]): _description_

    Returns:
        _type_: _description_
    """
    infoList ={} #
    radius = 10/60.0 #检索半径为10角分
    for index, fxtSourceDetection in enumerate(fxtSourceObs):
        info = {}
        # infos['id']=str(sourceDetection.source_id)+'_'+sourceDetection.detname
        
        # info['observed_num'] = len(sourceDetection.source.wxt_detections)
        info['observed_num'] = 'please check in details'
        # obs = service.search_sy01_obs("",str(sourceDetection.ra),str(sourceDetection.dec),str(radius),'','')
        # obs_json = json.loads(obs)
        info['obs_num_sor_loc'] = 'please check in details'
        epref={}
        info['ep_ref_ra']=fxtSourceDetection.ra_match
        info['ep_ref_dec']=fxtSourceDetection.dec_match
        info['ep_ref_sep']=None
        info['ref_flux']=fxtSourceDetection.flux_match
        info['flux']=fxtSourceDetection.flux
        info['so_id']=sourceObs[index].id
        
        # infoList[str(sourceDetection.source_id)+'_'+str(sourceDetection.wxt_detection.id)] = info
        infoList[str(fxtSourceDetection.id)] = info

    return infoList

def fxt_obs_resource(det:FXTDetection):
    obs_id = det.obs_id
    module = det.detnam
    result = {}
    for file_type in service.FXTHLDataType:
        if file_type.value.endswith("PNG"):
            result[file_type] = flask.url_for(".fxt_obs_quicklook",file_type=file_type.value,obs_id=obs_id,module=module)
    return result

@bp.route('/fxt_obs_data_downloads/<obs_id>/<detnam>/<version>')
@login_required
@permission_required('FXT_ACCESS')
def fxt_obs_data_downloads(obs_id, detnam, version):
    det: FXTDetection = FXTDetection.query.filter(FXTDetection.obs_id==obs_id, FXTDetection.detnam==detnam, FXTDetection.version==version).first_or_404()
    obs_id = det.obs_id
    module = det.detnam    
    datas = []
    for file_type in service.FXTHLDataType:
        version:FXTDataVersion = FXTDataVersion.query.filter(FXTDataVersion.obs_id==obs_id).first()
        content = service.get_fxt_hl_resource(file_type,obs_id,FXTDetNam.from_str(module),version.hl_latest_version)
        if content is None:
            continue
        io = BytesIO(content)
        ext_name = "png" if file_type.value.endswith("PNG") else "fits"
        datas.append((io.getvalue(), f"ep{obs_id}_{FXTDetNam.from_str(module)}_{version.hl_latest_version}_{file_type.value}.{ext_name}"))
    if len(datas)==0:
        flask.flash("No data found", "warning")
    zip_io = zip_filestreams(datas)
    return flask.send_file(zip_io,mimetype='application/zip', download_name=f"ep{obs_id}_{FXTDetNam.from_str(module)}_{version.hl_latest_version}.zip")

def fxt_src_resource(so:FXTSourceObservation):
    obs_id = so.detection.obs_id
    module = so.detnam
    result = {}
    for file_type in service.FXTQLDataType:
        result[file_type] = flask.url_for(".fxt_src_quicklook",file_type=file_type.value,obs_id=obs_id,module=module,index_in_det=so.index_in_det)
    return result

def fxt_alert_resource(so:FXTSourceObservation):
    obs_id = so.detection.obs_id
    module = so.detection.detnam
    result = {}
    for file_type in ['EP_FXT_IMGPNG_ALERT','EP_FXT_SRCBBPHAPNG_ALERT','EP_FXT_SRCPLPHAPNG_ALERT',]:
        result[file_type] = flask.url_for(".fxt_src_quicklook",file_type=file_type,obs_id=obs_id,module=module,index_in_det=so.index_in_det)
    return result

@bp.route('/fxt_obs_quicklook/<file_type>/<obs_id>/<module>')
@login_required
@permission_required('FXT_ACCESS')
def fxt_obs_quicklook(file_type,obs_id,module):
    version:FXTDataVersion = FXTDataVersion.query.filter(FXTDataVersion.obs_id==obs_id).first()
    content = service.get_fxt_hl_resource(file_type,obs_id,FXTDetNam.from_str(module),version.hl_latest_version)
    io = BytesIO(content)
    return flask.send_file(io,mimetype='image/png')

@bp.route('/fxt_src_quicklook/<file_type>/<obs_id>/<module>/<index_in_det>')
@login_required
@permission_required('FXT_ACCESS')
def fxt_src_quicklook(file_type,obs_id,module,index_in_det):
    version:FXTDataVersion = FXTDataVersion.query.filter(FXTDataVersion.obs_id==obs_id).first()
    content = service.get_fxt_ql_resource(file_type,obs_id,FXTDetNam.from_str(module),version.ql_latest_version,index_in_det)
    io = BytesIO(content)
    return flask.send_file(io,mimetype='image/png')

@bp.route('/fxt_src_list/')
@login_required
@permission_required('FXT_ACCESS')
@ta_single_check(channel=ObsTrigger.ihep)
def fxt_src_list():
    return flask.render_template("app/data_center/fxt_src_list.html",form=SourceSearchForm())

@bp.route('/fxt_transient_candidate_list_ta', methods=['GET'])
@login_required
@permission_required('TA_TOOLS')
@ta_single_check(channel=ObsTrigger.ihep)
def fxt_transient_candidate_list_ta_get():
    """TA看到的页面

    Returns:
        _type_: _description_
    """
    dt= datetime.combine(datetime.today(), datetime.min.time())
    start_time = dt - timedelta(1)
    fxtSourceObs = service.queryFXTSourceObsByTimeSpan(start_time,datetime.now())
    # 获取到对应的SourceObservation
    so = service.querySourceObs(fxtSourceObs)
    infoList = generateFXTSourceIndetificationInfo(fxtSourceObs,so)
    comments = SourceObsListCommentsEncoder.encode(so)
    form = SourceSearchForm()
    hint = f"Transient Candidates in Last Day" 
    return flask.render_template('app/data_center/fxt_transient_candidate_list_ta.html',sources=fxtSourceObs, form = form, infoList=infoList,hint= hint,comments=comments)

@bp.route('/fxt_transient_candidate_list_ta', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
@ta_single_check(channel=ObsTrigger.ihep)
def fxt_transient_candidate_list_ta_post():
    """TA看到的页面

    Returns:
        _type_: _description_
    """
    form = SourceSearchForm()
    hint = f"Latest Transient Candidates" 

    if form.validate_on_submit():
        start_datetime = form.start_datetime.data
        end_datetime = form.end_datetime.data
        # radius = form.radius.data
        # object_name = form.object_name.data
        
        if start_datetime is not None and end_datetime is not None:
            fxtSourceObs = service.queryFXTSourceObsByTimeSpan(start_datetime, end_datetime)
            # 获取到对应的SourceObservation
            so = service.querySourceObs(fxtSourceObs)
            infoList = generateFXTSourceIndetificationInfo(fxtSourceObs,so)
            comments = SourceObsListCommentsEncoder.encode(so)
            # infoList = generateSourceIndetificationInfo(sourceObs)
            # comments = SourceObsListCommentsEncoder.encode(sourceObs)
            hint = f"Find {len(fxtSourceObs)} Source Candidates."
            return flask.render_template(
                'app/data_center/fxt_transient_candidate_list_ta.html',
                sources=fxtSourceObs,
                infoList=infoList, 
                form = form, 
                hint= hint,
                comments=comments
            )
    else:
        # hint = "\n".join([f"{k}:{v}" for k,v in form.errors.items()])
        return flask.render_template('app/data_center/fxt_transient_candidate_list_ta.html',sources=None, form = form, hint= hint)

@bp.route('/fxt_src/api/')
@login_required
@permission_required('FXT_ACCESS')
def fxt_src_list_api():
    result = []
    start_datetime = request.args['start_datetime']
    end_datetime = request.args['end_datetime']
    for so in service.queryFXTSourceObsByTimeSpan(start_datetime, end_datetime):
        so_dict = so.to_dict()
        so_dict.setdefault('instrument','FXT')
        so_dict.setdefault('src_detail',flask.url_for('.fxt_src_detail',src_id=so.id))
        so_dict.setdefault('quick_look',fxt_src_resource(so))
        
        result.append(so_dict)
    
    return flask.jsonify(result)

@bp.route('/fxt_src_detail/<src_id>')
@login_required
@permission_required('FXT_ACCESS')
def fxt_src_detail(src_id):
    sourceInDetection: FXTSourceObservation = FXTSourceObservation.query.get(src_id)
    sourceObs = [] # 相关观测
    return flask.render_template('app/data_center/fxt_source_detail.html',
        sourceObs=sourceObs,
        sourceInDetection=sourceInDetection,
        quicklooks = fxt_src_resource(sourceInDetection)
    )  

@bp.route('/fxt_obs_detail/<obs_id>/<detnam>/<version>')
@login_required
@permission_required('FXT_ACCESS')
def fxt_obs_detail(obs_id, detnam, version):
    det: FXTDetection = FXTDetection.query.filter(FXTDetection.obs_id==obs_id, FXTDetection.detnam==detnam, FXTDetection.version==version).first_or_404()
    latest_det = det.latest_version.fxtdetection
    obs = latest_det.observation
    related_sources = latest_det.sources
    return flask.render_template('app/data_center/fxt_obs_detail.html',
        fxt_detection=latest_det,
        obs = obs,
        sourceObs = related_sources,
    )

@bp.route('/fxt_expo/<obs_id>/<detnam>')
@login_required
@permission_required('FXT_ACCESS')
def fxt_expo(obs_id,detnam:str):
    det: FXTDetection = FXTDetection.query.filter(FXTDetection.obs_id==obs_id,FXTDetection.detnam==detnam).first_or_404()
    latest = det.latest_version.fxtdetection
    return csdb.csdb_31502.down_by_meta_data("EP_FXT_EXPOPNG",{
        "obsId":obs_id,
        "module":detnam[-1].lower(),
        "HLver":"01"
    })

@bp.route('fxt_classify_send_api', methods=['POST'])
@login_required
@permission_required('TA_TOOLS')
def fxt_classify_send_api():
    fxt_name: str = request.form.get('fxt_name')
    # 实际上是obs_id+FXTA\B+version(命名为version)
    version: str = request.form.get('version')
    identified_name: str = request.form.get('identified_name')
    types: str = request.form.get('types')
    classification: str = request.form.get('classification')
    comments: str = request.form.get('comments')
    ref_flux: str = request.form.get('ref_flux')
    wxt_name: str = request.form.get('wxt_name')
    ep_name: str = request.form.get('ep_name')
    message = service.send_fxt_classify_result(fxt_name, version, identified_name, types, classification, comments, ref_flux, wxt_name, ep_name)
    if message is None:
        return flask.jsonify({'succes':'ok'})
    return flask.jsonify({'error': message})


@bp.route('/fxt_alert', methods=['GET'])
# @login_required
@permission_required(['FXT_ACCESS'])
def fxt_alert():
    form = ObservationSearchForm()
    if current_user.can('FXT_ACCESS'):
        OperationLog.add_log(bp.name, 'visit fxt alert data search page ', current_user)
        return render_template('app/data_center/fxt_alert_list.html', form=form)

@bp.route('/fxt_alert_list/api/', methods=['POST'])
@login_required
@permission_required('FXT_ACCESS')
# @permission_required('SYSTEM_ADMIN')
def fxt_alert_list_api():

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
    obs = service.search_fxt_alert(obs_id,ra,dec,radius,start_time,end_time)
    return flask.jsonify(obs)

@bp.route('/fxt_alert_detail/<src_id>')
@login_required
@permission_required('FXT_ACCESS')
def fxt_alert_detail(src_id):
    sourceInDetection: FXTSourceObservation = FXTAlertSourceObservation.query.get(src_id)
    sourceObs = [] # 相关观测
    return flask.render_template('app/data_center/fxt_alert_detail.html',
        sourceObs=sourceObs,
        sourceInDetection=sourceInDetection,
        quicklooks = fxt_alert_resource(sourceInDetection)
    )  
