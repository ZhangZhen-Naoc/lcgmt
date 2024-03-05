from wsgi import application
from app.data_center.models import *
from app.data_center.service import *
from pytest import approx
import csv
category_classification_dict = {
    'AGN': ['AGN', 'Blazar', 'BL Lac', 'LINER', 'Quasar', 'Seyfert 1 Galaxy', 'Seyfert 2 Galaxy'],
    'Cluster of Galaxies': ['Cluster of Galaxies'],
    'Galaxy': ['Galaxy','Brightest Galaxy in a Cluster'],
    'X-ray Binary': ['X-ray Binary', 'HMXB', 'LMXB'],
    'CV': ['CV',],
    'SNR': ['SNR'],
    'Star': ['Star', 'Alpha2 CVn Variable', 'Asymptotic Giant Branch Star', 'Be Star',
        'Beta Cep Variable', 'Blue Straggler Star', 'BY Dra Variable', 'Cepheid variable Star', 
        'Delta Sct Variable', 'Double or Multiple Star', 'Eclipsing Binary', 'Eruptive Variable', 'Evolved supergiant star', 
        'Gamma Dor Variable', 'High Proper Motion Star', 'Horizontal Branch Star', 'Hot Subdwarf',
        'Low-mass Star', 'Orion Variable', 'Post-AGB Star',  "Red Giant Branch Star",
        "Rotating Variable",
        "RR Lyrae Variable",
        "RS CVn Variable",
        "RV Tau Variable",
        "Spectroscopic Binary",
        "SX Phe Variable",
        'Symbiotic Star',
        "T Tauri Star",
        "W Vir Variable",
        "Wolf-Rayet Star",
        "Young Stellar Object"
    ],
    'Star Cluster': ['Star Cluster', 'Globular Cluster', 'Open Cluster'],
    'Pulsar': ['Pulsar','Magnetar'],
    'FRB Counterpart':['FRB Counterpart'],
    'GW Counterpart':['GW Counterpart'],
    'GRB': ['GRB','GRB Afterglow'],
    'Supernovae': ['Supernovae'],
    'TDE': ['TDE'],
    'Nova':['Nova','Classical Nova','Recurrent Nova'],
    'Unverified': ['Unverified'],
    'Other Known Types': ['Other Known Types', 'Planet', 'Small body in Solar system','Sun','Moon'],
    'Unclassified': ['Unclassified']
}
categories = category_classification_dict.keys()
classifications = []
for category in categories:
    for classification in category_classification_dict[category]:
        classifications.append(classification)
        
with application.app_context():
    src1: Source = Source.query.filter(Source.simbad_name=='NGC 4051').first()
    assert src1.category == "AGN"
    assert src1.classification == "AGN"
    assert src1.ra == approx(180.79)
    assert src1.dec == approx(44.531)
    assert src1.flux == approx(0.0000000000796)
    assert src1.ref_flux == approx(0.0000000000796)
    assert src1.src_type == "source"
    assert src1.comments == ""
    assert src1.get_tags() == [SourceTagEnum.known_source]
    
    src2: Source = Source.query.filter(Source.simbad_name=='2MASS J19312434-2134226').first()
    assert src2.category == "Star"
    assert src2.classification == "High Proper Motion Star"
    assert src2.comments == "transient by TA"
    assert src2.get_tags() == [SourceTagEnum.known_source]
    
    src3: Source = Source.query.filter(Source.simbad_name=='LXT 221201A').first()
    assert src3.get_tags() == [SourceTagEnum.transient]

    
    srcs:List[Source] = Source.query.all()
    for src in srcs:
        assert src.category in category_classification_dict.keys()