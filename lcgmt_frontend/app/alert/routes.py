from app.alert import bp
from app.alert.models import AlertCoordinates, AlertName, AlertFullcontent, AlertCoordinatesEncoder, AlertNameEncoder, AlertFullcontentEncoder, GRBAlert
from flask import request, make_response
import json
from app.extensions import db
from sqlalchemy import text
from datetime import datetime
from dateutil.relativedelta import relativedelta
from typing import List

def get_alert_by_radec(ra, dec, radius, start_time, end_time)->List[AlertCoordinates]:  
    alerts = db.session.query(AlertCoordinates)\
                .join(AlertFullcontent, AlertCoordinates.atel_id == AlertFullcontent.atel_id)\
                .filter(AlertFullcontent.datepublished >= start_time, AlertFullcontent.datepublished <= end_time)\
                .filter(text('q3c_radial_query(radeg,decdeg, :ra_center,:dec_center,:radius)'))\
                .params(ra_center=ra,dec_center=dec,radius=radius)\
                .order_by(AlertCoordinates.atel_id.desc())\
                .all()
    return alerts
def get_alert_by_time(start_time, end_time):
    alerts = db.session.query(AlertFullcontent)\
                .filter(AlertFullcontent.datepublished >= start_time, AlertFullcontent.datepublished <= end_time)\
                .order_by(AlertFullcontent.atel_id.desc())\
                .all()
    return alerts

def get_grb_by_radec_time(ra, dec, radius, start_time, end_time)->List[GRBAlert]:
    return GRBAlert.query \
        .filter(text('q3c_radial_query("RA","DEC", :ra_center,:dec_center,:radius)'))\
        .params(ra_center=ra,dec_center=dec,radius=radius) \
        .all()
@bp.route('/queryalert', methods=['GET'])
def query_alert():
    ra = request.args.get("ra")
    dec = request.args.get("dec")
    radius = request.args.get("radius")
    start_time = request.args.get("start_time")
    end_time = request.args.get("end_time")
    if radius == "" or radius is None or radius == 0:
        radius = 0.16666666666666666
    
    if end_time == "" or end_time is None:
        end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if start_time == "" or start_time is None or start_time >= end_time:
        start_time = (datetime.now() - relativedelta(months=1)).strftime("%Y-%m-%d %H:%M:%S")
        end_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if ra == "" or dec == "" or ra is None or dec is None:
        alerts = get_alert_by_time(start_time, end_time)
        resp = make_response(json.dumps(alerts, cls=AlertFullcontentEncoder))
        resp.content_type = "application/json"
        return resp
    alerts = get_alert_by_radec(ra, dec, radius, start_time, end_time)
    resp = make_response(json.dumps(alerts, cls=AlertCoordinatesEncoder))
    resp.content_type = "application/json"
    return resp