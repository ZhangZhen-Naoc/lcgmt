import abc
import json
import os
from typing import Callable, Dict
from unicodedata import name
from flask import Blueprint, Response, abort, current_aep, render_template, request, url_for
import flask
from flask_login import current_user, login_required
import flask_login
import requests
from flask import make_response
from functools import partial

from sqlalchemy import false

from app.long_task import SqlAlchemyTask
from app.mwr.models import TaskNotFoundException
from app.user.models import User
from app.user.service import get_current_user
from . import service
from app.extensions import db
bp = Blueprint('simulator', __name__)

class Result:
    gen_url: Callable[[str],str]
    def __init__(self,id:int) -> None:
        self.id = id
        self.gen_url = partial(flask.url_for,'.resource',id=id)
        
    def get_input(self):
        input_file =  os.path.join(current_app.config['SIMULATE_CACHE'],f"{self.id}/input.json")
        with open(input_file) as f:
            data = json.load(f)
        return data
    
    @abc.abstractmethod
    def get_output_data(self)->Dict:
        return self.data
class SingleObsResult(Result):
    """各个属性返回相应资源的路径
    """
    def __init__(self,id:int) -> None:
        super().__init__(id)
        gen_url = partial(flask.url_for,'.resource',id=id)
        
        self.images = [gen_url(name=f"image{i}.png") for i in range(1,4)]
        self.spec= [gen_url(name=f"spec{i}.png") for i in range(1,4)]
        self.lc= [gen_url(name=f"lc{i}.png") for i in range(1,4)]
        self.quick_look = {
            "Detector Image one CMOS chip, 9.38°x9.38°":self.images,
            "Spectrum":self.spec,
            "Light Curve":self.lc
        }
        
    
    def get_output_data(self):
        data_file = os.path.join(current_app.config['SIMULATE_CACHE'],f"{self.id}/data.json")
        with open(data_file) as f:
            data = json.load(f)
        # on-axis, medium off-axis angle和large off-axis angle
        return {
            "Signal Noise Ratio":["{:.2f}".format(sn) for sn in data['sn']],
            "Average Net Photon Count Rate (counts/s)":["%.2f"%v + " ± " + "%.2f"%e for v,e in  zip(data['apcr'],data['apcr_err'])],
            "Background Photon Count Rate (counts/s)":["{:.2e}".format(v) + " ± " + "{:.2e}".format(e) for v,e in  zip(data['bias'],data['bias_err'])]
        }

    
    
class MonitoringResult(Result):
    def __init__(self,id:int) -> None:
        super().__init__(id)
        self.resource_types = ["lc","image","spec"]
        with open(os.path.join(current_app.config['SIMULATE_CACHE'],f"{self.id}/data.json")) as f:
            data = json.load(f)
            self.sn = data["sn"]
        with open(os.path.join(current_app.config['SIMULATE_CACHE'],f"{self.id}/input.json")) as f:
            data = json.load(f)
            self.orbit = data["orbit"]

    def resource_url(self,resource_type:str,orb_num:int=0):
        """获取资源路径

        Args:
            resource_type (str): 资源类型，可选"lc","image","spec","lc_stacked"
            orb_num (int, optional): 轨道号，默认值0获取stacked. Defaults to 0.

        Returns:
            _type_: _description_
        """
        if orb_num == 0:
            return self.gen_url(name=f"{resource_type}_stacked.png")
        else :
            return self.gen_url(name=f"{resource_type}{orb_num}.png")
  
    
class FXTResult(Result):
    def __init__(self,id:int) -> None:
        super().__init__(id) 
        self.resource_types = ["lc","image","spec"]
        with open(os.path.join(current_app.config['SIMULATE_CACHE'],f"{self.id}/data.json")) as f:
            data = json.load(f)
            self.warnings = data.get("warnings",[])
            if data.get("has_src",False):
                self.snr = data["snr"]
                self.src_rate = data['src_rate']
                self.src_rate_err = data['src_rate_err']
                self.bkg_rate = data['bkg_rate']
                self.bkg_rate_err = data['bkg_rate_err']
                self.pileup_frac = data['pileup_frac']
                self.has_src = True
            else:
                self.has_src = False
    
    def resource_url(self,resource_type:str,orb_num:int=0):
        return self.gen_url(name=f"{resource_type}_fxt.png")
 

@bp.route("/",methods=["GET"])
def index():
    return render_template("app/simulator/single_form.html")

    
@bp.route("/monitoring",methods=["GET"])
def monitoring_form():
    return render_template("app/simulator/monitoring_form.html")

@bp.route("/fxt",methods=["GET"])
def fxt_form():
    return render_template("app/simulator/fxt_form.html")

@bp.route("/simulate/<mode>",methods=["POST"])
def simulate(mode):
    """_summary_Simulator包不具体处理请求，仅仅把请求转发到simulator服务

    Args:
        mode (str): 模式，包括single_observation, monitoring, fxt

    Returns:
        _type_: _description_
    """
    files = {}
    for name,storage in request.files.items():
        files[name] =(storage.filename, storage.stream.read().decode())
    pid = service.registered_simulate(request.form.to_dict(),files,mode=mode).parent.id
    taskid = SqlAlchemyTask.find_by_celery_id(pid).id
    return flask.redirect(url_for(".simulate_result",id=taskid))




@bp.route("/tasks")
def simulate_tasks():
    user = get_current_user()
    user_id = user.id if user.is_authenticated else None
    tasks = SqlAlchemyTask.query.filter(SqlAlchemyTask.user_id==user_id) \
        .filter(SqlAlchemyTask.task_type=="Simulate") \
        .order_by(SqlAlchemyTask.submit_time.desc()).limit(10) \
        .all()
    return render_template("app/simulator/tasks.html",tasks=tasks)

name_dict = {
    'ra':'RA(J2000)',
    'dec':'DEC(J2000)',
    'spec_model':'Spectral Model',
    'temp':'Temperature(kT)',
    'index':'Photon Index',
    'emin':'Energy Range Low',
    'emax':'Energy Range High',
    'absp':'Absorbed'
} # 用于显示在页面上的名字
unit_dict = {
    'nh':'cm⁻²',
    'exposure':'s',
    'temp':'eV',
    'flux':'erg/s/cm²',
    'emin':'keV',
    'emax':'keV'
} # 单位

@bp.route("/result/<int:id>",methods=["GET"])
def simulate_result(id:int):
    result_path = os.path.join(current_app.config['SIMULATE_CACHE'],f"{id}/data.json")
    if os.path.exists(result_path):
        if is_fxt(result_path): # fxt的情况的渲染
            unit_dict_fxt = unit_dict.copy()
            unit_dict_fxt['nh'] = 'e+22 cm⁻²'
            return flask.render_template("app/simulator/fxt_result.html",result=FXTResult(id),name=name_dict,unit=unit_dict_fxt)
        if is_monitoring(result_path): # monitor的情况的渲染
            return flask.render_template("app/simulator/monitoring_result.html",result=MonitoringResult(id),name=name_dict,unit=unit_dict)
        else: # 单次观测情况的渲染
            
            return render_template("app/simulator/result.html",result = SingleObsResult(id),name=name_dict,unit=unit_dict)
    
    # 文件不存在
    task :SqlAlchemyTask= SqlAlchemyTask.find_by_id(id)
    try:
        if task.status == "SUCCESS":
            return "Sorry, Task has been cleaned, please resubmit"
        elif task.status == "PENDING":
            return render_template("app/simulator/result_uncomplete.html")
        elif task.status == "FAILURE":
            result:str = json.loads(task.result)['err']
            if result[0]=='"':
                result = result[1:]
            if result[-1]=='"':
                result = result[:-1]
            result = result.replace(r"\n",'\n')
            return render_template("app/simulator/failure.html",result = result)
            
            
       
    except TaskNotFoundException:
        return "找不到任务，尚未开始或已清理"
    
@bp.route("/result/status/<int:id>",methods=["GET"])
def result_status(id:int):
    task :SqlAlchemyTask= SqlAlchemyTask.find_by_id(id)
    return {
        "status":task.status,
        "description":task.description
    }


@bp.route("/result/<int:id>/<name>")
def resource(id:int, name:str):
    """获取某次模拟的单个文件

    Args:
        id (int): 模拟任务id
        name (str): 文件名

    Returns:
        _type_: 
    """
    file_path  = os.path.join(current_app.config['SIMULATE_CACHE'],f"{id}/{name}")
    return flask.send_file(file_path)

@bp.route("/result/download/<int:id>")
def download(id:int):
    """根据id下载文件

    Args:
        id (int): 任务id

    Returns:
        _type_: _description_
    """
    file_path  = os.path.join(current_app.config['SIMULATE_CACHE'],f"{id}/")
    return flask.send_file(service.zip_dir(file_path),download_name=f"{id}.zip")


def convert_resp(resp:requests.Response)->flask.Response:
    if resp.status_code != 200:
        abort(400,resp.content)
    
    flask_resp = make_response(resp.content,resp.status_code)
    for k,v in resp.headers.items():
        flask_resp.headers[k] =v 
    return flask_resp

@bp.route("/anonymous")
def anonymous():
    flask_login.login_user(User.query.get(current_app.config.get("ANONYMOUS_ID")))
    return flask.redirect(flask.url_for(".index"))

def is_monitoring(result_path):
    with open(result_path) as f:
        data = json.load(f)
    return data['type']=="monitoring"

def is_fxt(result_path):
    with open(result_path) as f:
        data = json.load(f)
    return data['type']=="fxt"