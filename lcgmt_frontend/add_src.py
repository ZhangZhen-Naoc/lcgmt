from app.data_center.models import *
from app.data_center.service import *
import csv
from zz_launch import application
with application.app_context():
    vrcs = csv.DictReader(open("srcs.csv"))
    for src in srcs:
        s = Source()
        s.src_type = "source"
        s.simbad_name = src['Common Name']
        s.source_name = src['Common Name']
        s.category = src['Category']
        s.classification = src['Classification']
        s.ra = float(src['RA'])
        s.dec = float(src['Dec'])
        s.pos_err=0
        flux = float(src['R_Flux']) if src['R_Flux'] else None
        s.latest_net_rate = flux/CF_FLUX_RATE if flux else None
        s.ref_flux = flux
        
        s.comments = src['Comments']
        db.session.add(s)
        db.session.commit()
        if src['Tag'] == 'Known Source':
            s.set_tags([SourceTagEnum.known_source])
        elif src['Tag'] == 'Transient':
            s.set_tags([SourceTagEnum.transient])
        else:
            print("Error tag")
