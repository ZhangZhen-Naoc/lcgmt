import mq
from app.lc import *
from app.data_center.models import Source
from sqlalchemy import or_
from wsgi import application
with application.app_context():
    for src in Source.query.filter(
        or_(Source.src_type=='known_source',Source.src_type=='burst')
    ):
        msg: AddSrcArg = {
            "src_id": src.id
        }
        mq.mqtt_send("TDIC/Src/Added",msg)

msg: AddSrcArg = {
    "src_id": 21811
}
mq.mqtt_send("TDIC/Src/Added",msg)

# with application.app_context():
#     resp = service.search_sy01_obs('06800006478',None,None,None,None,None)
#     print(resp[0]['obs_start'])
#     d2: WXTDetection = WXTDetection.query.filter(WXTDetection.obs_id=='06800006478').first()
#     print(d2.obs_start.strftime("%Y-%m-%d %H:%M:%S%z"))
 