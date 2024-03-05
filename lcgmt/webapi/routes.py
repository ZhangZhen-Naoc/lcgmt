from datetime import datetime
import json
from typing import Any, Iterable, Tuple
from flask import Blueprint,current_app,request

from lcgmt.ReferenceTable.ReferenceTable import IInstruTable, ISourceTable
from lcgmt.engine.base_engine import BaseEngine
from lcgmt.model import Instrument, Source
from config import source_table
api = Blueprint("api",__name__)

def get_data_accessor()->Tuple[ISourceTable,IInstruTable,BaseEngine]:
    return current_app.config['source_table'] ,current_app.config['instru_table'] ,current_app.config['engine'] 

class SourceEncoder(json.encoder.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,Source):
            return {
                "name":o.name,
                "ra":o.ra,
                "dec":o.dec,
                "id":o.id,
                "mission":o.mission
            }
        return super().default(o)

class InstrumentEncoder(json.encoder.JSONEncoder):
    def default(self,o:Any)->Any:
        if isinstance(o,Instrument):
            return {
                "id":o.id,
                "mission":o.mission,
                "energy_start":o.energy_start,
                "energy_end":o.energy_end
            }
        return super().default(o)

class EncoderDispatcher(json.encoder.JSONEncoder):
    def default(self,o):
        if isinstance(o,Source):
            return SourceEncoder().default(o)
        if isinstance(o,InstrumentEncoder):
            return InstrumentEncoder().default(o)
        return super().default(o)

def query(src:Source):
    src_table,instru_table,engine = get_data_accessor()
    energy = request.json.get("energy")
    instrus = instru_table.find_by_energy_band(energy[0],energy[1])
    obses_groupd = {}
    for instru in instrus:
        obses =  engine.get_obs_by_timerange_timebin(
            src,
            instru=instru,
            time_range=(
                datetime.strptime(request.json.get("start_time"),"%Y-%m-%d %H:%M:%S"),
                datetime.strptime(request.json.get("end_time"),"%Y-%m-%d %H:%M:%S")
            ),
            timebin=request.json.get("timebin")
        )
        if len(obses) != 0:
            obses_groupd[instru.id] = {
                "times":[],
                "flux":[],
                "flux_err":[]
            }
        
        for obs in obses:
            obses_groupd[instru.id]["times"].append(obs.start_time.strftime("%Y-%m-%d %H:%M:%S"))
            obses_groupd[instru.id]["flux"].append(obs.flux)
            obses_groupd[instru.id]["flux_err"].append(obs.flux_err)


    instru_dict = {}
    for instru in instrus:
        instru_dict[instru.id] = instru
        
    return {
        "srcid":src.id,
        "energy":energy,
        "obses":obses_groupd,
        "instrus":instru_dict
    }

@api.route("/")
def index():
    return "Hello, World!"

@api.route("/lc",methods=["POST"])
def lc():
    """生成光变。
    输入（POST）：srcid, energy, start_time, end_time, timebin
    输出：json :{
        srcid:1,
        energy:5
        "time":["2020-1-1 00:00:00" , ·······],
        "flux":[0,0,0,····],
        "flux_err":[0,0,0,······],
        instru_id:[1,2,3·····]
    }
    """
    src_table,instru_table,engine = get_data_accessor()
    srcid = request.json.get("srcid")
    energy = request.json.get("energy")
    return query(Source(id=srcid))

@api.route("/conesearch/")
def conesearch():
    ra = request.args.get("ra",type=float)
    dec = request.args.get("dec",type=float)
    radius = request.args.get("radius",type=float)
    srcs = source_table.cone_search(ra,dec,radius/3600)
    return json.dumps(srcs,cls=SourceEncoder)

@api.route("/lc/<float:ra>/<float:dec>",methods=["POST"])
def get_lc_by_ra_dec(ra:float,dec:float):
        
    src_table,instru_table,engine = get_data_accessor()
    src = src_table.find_closet_src(Source(ra=ra,dec=dec))
    return json.dumps(query(src),cls=EncoderDispatcher)
            

@api.route("/instruments")
def get_instrus():
    ids = request.args.getlist("id")
    for id in ids:
        pass
