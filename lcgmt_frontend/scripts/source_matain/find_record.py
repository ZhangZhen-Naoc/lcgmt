from app.data_center.models import  *
from app import create_app
import sys

src_id = sys.argv[1]

app = create_app("xuyunfei")
with app.app_context():
    src:Source = Source.query.get(src_id)
    sos = src.wxt_detections
    comments:List[TACommentRecord] = []
    for so in sos:
        comments.extend(so.ta_comments)
    comments.sort(key=lambda x:x.update_date)
    for comment in comments:
        print(comment.simbad_name,comment.update_date,commemt.ta_id,comment.src_id)
