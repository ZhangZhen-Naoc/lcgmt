import math
from flask import Blueprint
import os
from typing import TypedDict
import flask
import pandas
import taosrest
from flask import request
# from wsgi import application
bp = 	Blueprint('lc', __name__)

class AddSrcArg(TypedDict):
    src_id:int
    
class AddSoArg(TypedDict):
    src_id:int
    so_id:int # 有SO则SOid，无则detid
    name:str
    obs_time:str
    flux:str # 为保证精度，使用str
    flux_err:str
    upperlimit_flag:bool
    median_flag:bool
    exposure: float
    
    
@bp.route("/")
def lc():
    return flask.render_template("app/lc/index.html")
