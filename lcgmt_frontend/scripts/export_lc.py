import csv
import pandas as pd
from app import create_app
from app.extensions import db
from app.data_center.models import *
from app.data_center import service
import math
app = create_app("xuyunfei")
with app.app_context():
    srcs:List[Source] = Source.query.filter(
        Source.src_type.in_(["known_source","burst","transient"])
    ).all()
    
    for src in srcs:
        # 探测到的源
        src_ids = []
        start_times =[]
        exp_times = []
        flux = []
        flux_err = []
        so_ids = []
        upperlimit_flgs = []
        median_flags = []
        names = []
        for det in src.wxt_detections:
            src_ids.append(src.id)
            start_times.append(f"'{det.detection.observation.obs_start}'")
            exp_times.append(det.detection.exposure_time)
            flux.append(det.flux)
            flux_err.append(det.flux_err)
            so_ids.append(det.id)
            names.append("'"+det.name+"'")
            upperlimit_flgs.append(False)
            median_flags.append(True)
        # 没有探测到的源
        for det in service.search_sy01_obs(obs_id=None,ra=str(src.ra),dec = str(src.dec),radius = str(10/60),start_time=None,end_time=None):
            if det['upperlimit']=='nan':
                continue
            det:service.SearchSy01ObsResult
            src_ids.append(src.id)
            start_times.append(f"'{det['obs_start']}'")
            exp_times.append(det['exposure_time'])
            flux.append(det['upperlimit'])
            flux_err.append(0)
            so_ids.append(det['id'])
            names.append(f'\'ep{det["obs_id"]}wxt{det["detnam"][4:]}\'')
            upperlimit_flgs.append(True)
            median_flags.append(True)
        df = pd.DataFrame.from_dict({
            # "src_id":src_ids,
            "start_time":start_times,
            "exp_time":exp_times,
            "flux":flux,
            "flux_err":flux_err,
            "so_id":so_ids,
            "name":names,
            "upperlimit_flg":upperlimit_flgs,
            "median_flg":median_flags
        })
                
        df.to_csv(f"/tmp/lc/{src.id}",index=False,header=False, quoting=csv.QUOTE_NONE, quotechar="", escapechar="\\")
    