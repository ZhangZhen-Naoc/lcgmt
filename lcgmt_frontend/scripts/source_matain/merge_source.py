from app import create_app
from app.data_center.models import *
app = create_app("xuyunfei")

with app.app_context():
    while True:
        val = input("Src1 and Other src: ")
        ids = [int(v) for v in val.split(' ')]
        src1:Source = Source.query.get(ids[0])
        other:List[Source] = [Source.query.get(id) for id in ids[1:]]
        for src in other:
           7for det in src.wxt_detections:
                det.source_id = ids[0]
            for det in src.beidou_detections:
                det.source_id = ids[0]
            db.session.commit()
            # db.session.delete(src)
            src.src_type=""
        db.session.commit()