
import json
from app.extensions import db
from sqlalchemy.orm import Query

class AlertCoordinates(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'atel_coordinates'
    id = db.Column(db.Integer, primary_key=True)
    atel_id = db.Column(db.Integer, db.ForeignKey('tdic.atel_fullcontent.atel_id'))
    radeg = db.Column(db.Float)
    decdeg = db.Column(db.Float)
    radius = db.Column(db.Float)
    singleclassification = db.Column(db.String(45))
    supernovatag = db.Column(db.Integer)
    atelname = db.Column(db.String(45))
    atelurl = db.Column(db.String(200))
    survey = db.Column(db.String(45))

    fullcontent:'AlertFullcontent' = db.relationship('AlertFullcontent', back_populates='coordinates')
    
class AlertCoordinatesEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, AlertCoordinates):
            return {
                'atel_id': o.atel_id,
                'authors': o.fullcontent.authors,
                'email': o.fullcontent.email,
                'tags': o.fullcontent.tags,
                'title': o.fullcontent.title,
                'ateltype': o.fullcontent.ateltype,
                'datepublished': o.fullcontent.datepublished.isoformat(),
                'usertext': o.fullcontent.usertext,
                'source_name': [name.source_name for name in o.fullcontent.names],
                'ra_dec': [[o.radeg, o.decdeg]],
            }
        return super().default(o)

class AlertName(db.Model):
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'atel_names'
    id = db.Column(db.Integer, primary_key=True)
    atel_id = db.Column(db.Integer, db.ForeignKey('tdic.atel_fullcontent.atel_id'))
    atelname = db.Column(db.String(45))
    atelurl = db.Column(db.String(200))
    source_name = db.Column(db.String(200))

    fullcontent = db.relationship('AlertFullcontent', back_populates='names')

class AlertNameEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, AlertName):
            return {
                'atel_id': o.atel_id,
                'source_name': o.source_name,
            }
        return super().default(o)

class AlertFullcontent(db.Model):
    query:Query
    __table_args__ = {"schema":"tdic"}
    __tablename__ = 'atel_fullcontent'
    id = db.Column(db.Integer, primary_key=True)
    atel_id = db.Column(db.Integer, unique=True)
    authors = db.Column(db.Text)
    backreflist = db.Column(db.String(2000))
    email = db.Column(db.String(450))
    reflist = db.Column(db.String(450))
    tags = db.Column(db.String(450))
    title = db.Column(db.String(450))
    ateltype = db.Column(db.String(500))
    datepublished = db.Column(db.DateTime)
    usertext = db.Column(db.Text)
    dateparsed = db.Column(db.DateTime)

    coordinates = db.relationship('AlertCoordinates', back_populates='fullcontent')
    names = db.relationship('AlertName', back_populates='fullcontent')

class AlertFullcontentEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, AlertFullcontent):
            return {
                'atel_id': o.atel_id,
                'authors': o.authors,
                'email': o.email,
                'tags': o.tags,
                'title': o.title,
                'ateltype': o.ateltype,
                'datepublished': o.datepublished.isoformat(),
                'usertext': o.usertext,
                'source_name': [name.source_name for name in o.names],
                'ra_dec': [(coord.radeg, coord.decdeg) for coord in o.coordinates],
            }
        return super().default(o)

class GWAlert(db.Model):

    __tablename__ = 'GWAlert'

    id = db.Column(db.Integer, primary_key=True)
    Packet_Type = db.Column(db.Integer)
    internal = db.Column(db.Integer)
    Pkt_Ser_Num = db.Column(db.Integer)
    GraceID = db.Column(db.String(45))
    AlertType = db.Column(db.String(45))
    HardwareInj = db.Column(db.Integer)
    OpenAlert = db.Column(db.Integer)
    EventPage = db.Column(db.String(200))
    Instruments = db.Column(db.String(50))
    FAR = db.Column(db.Float)
    Group = db.Column(db.String(45))
    Pipeline = db.Column(db.String(45))
    Search = db.Column(db.String(45))
    skymap_fits = db.Column(db.String(200))
    BNS = db.Column(db.Float)
    NSBH = db.Column(db.Float)
    BBH = db.Column(db.Float)
    Terrestrial = db.Column(db.Float)
    HasNS = db.Column(db.Float)
    HasRemnant = db.Column(db.Float)
    HasMassGap = db.Column(db.Float)

    TimeInstant = db.Column(db.DateTime)

    External_GCN_Notice_Id = db.Column(db.String(200))
    External_Ivorn = db.Column(db.String(200))
    External_Observatory = db.Column(db.Strpng(200))
    External_Search = db.Column(db.String(45))
    Time_Difference = db.Column(db.Float)
    Time_Coincidence_FAR = db.Column(db.Float)
    Time_Sky_Position_Coincidence_FAR = db.Column(db.Float)

class SNAlert(db.Model):

    __tablename__ = 'SNAlert'
    
    id = db.Column(db.Integer, primary_key=True)
    Packet_Type = db.Column(db.Integer)
    Pkt_Ser_Num = db.Column(db.Integer)
    Trigger_Number = db.Column(db.Integer)
    Pkt_TJD = db.Column(db.Integer)
    Pkt_SOD = db.Column(db.Float)
    Energy_Limit = db.Column(db.Float)
    Duration = db.Column(db.Float)
    Src_Error68 = db.Column(db.Float)
    Src_Error90 = db.Column(db.Float)
    Src_Error95 = db.Column(db.Float)
    N_Events = db.Column(db.Integer)
    Min_Distance = db.Column(db.Float)
    Max_Distance = db.Column(db.Float)
    Discovery_date = db.Column(db.Integer)
    Discovery_time = db.Column(db.Integer)

    RA = db.Column(db.Float)
    DEC = db.Column(db.Float)

    TimeInstant = db.Column(db.DateTime)

class GRBAlert(db.Model):
1    __tablename__ = 'GRBAlert'
    query: Query
    
    id = db.Column(db.Integer, primary_key=True)
    RA = db.Column(db.Float)
    DEC = db.Column(db.Float)
    TimeInstant = db.Column(db.DateTime)
    FullContents = db.Column(db.Text)