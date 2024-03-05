from io import BytesIO
from operator import mod
from urllib import request
from werkzeug.datastructures import FileStorage
import os
from typing import Dict, List
from app.extensions import celery
import requests
from flask import current_app,abort
import zipfile

from app.long_task import SqlAlchemyTask, register_long_task

class SimulatorException(Exception):
    pass
@celery.task
def simulate(args:Dict,files:Dict,mode="normal"):
    try:
        # files_encoded = {}
        # for name,content in files.items():
        #     files_encoded[name] = content.encode()
        
        if mode=="monitoring":
            resp = requests.post(current_app.config['SIMULATE_SERVICE_URL']+"/monitoring",
                             data=args,
                             files = files
                             )
        elif mode=="fxt":
            resp = requests.post(current_app.config['FXT_SIMULATE_SERVICE_URL'],
                             data=args,
                             files = files
                             )
        else:
            resp = requests.post(current_app.config['SIMULATE_SERVICE_URL'],
                             data=args,
                             files = files
                             )
    except requests.exceptions.ConnectionError:
        abort(503,"Simuator Service Error, Try Later")
    
    task = SqlAlchemyTask.find_by_celery_id(simulate.request.id)
    id = task.id
    SqlAlchemyTask.find_by_id(id).set_description(f"user:{args.get('username')},taskname:{args.get('taskname')},type:{mode}")
    if resp.status_code == 200:
        _write(id,resp.content)
    else:
        raise SimulatorException(resp.content.decode())
registered_simulate = register_long_task(simulate,"Simulate")

def _write(id:int,file_io:bytes):
    """模拟结果写入硬盘并解压

    Args:
        id (int): _description_
        file_io (_type_): _description_
    """
    target  = os.path.join(current_app.config['SIMULATE_CACHE'],f"{id}/all.zip")
    target_dir = os.path.dirname(target) 
    os.mkdir(target_dir)
    
    with open(target,"wb") as f:
        f.write(file_io)
    with zipfile.ZipFile(target) as zip_file:
        for name in zip_file.namelist():
            zip_file.extract(name,target_dir)
    
    
def zip_dir(dir:str)->BytesIO:
    buffer = BytesIO()
    readme = ""
    with open(os.path.join(dir,"readme.txt")) as readme_file:
        readme = readme_file.read()
    filelist = extract_filelist_from_readme(readme)
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED, allowZip64=False) as zfile:
        for filename in os.listdir(dir):
            file_path = os.path.join(dir,filename)
            if os.path.isfile(file_path) and filename in filelist:
                zfile.write(file_path, os.path.basename(filename))

    buffer.seek(0)
    return buffer

def extract_filelist_from_readme(readme_content:str)->List[str]:
    """从readme文件返回文件列表

    Args:
        readme_content (str): 文件名，每行内容遵循“ 文件名：描述”的格式

    Returns:
        List[str]: _description_
    """
    lines = readme_content.split("\n")
    filelist = []
    for line in lines:
        valid =  line.find(":") !=-1
        if valid:
            filelist.append(line.split(":")[0])
    filelist.append("readme.txt")
    return filelist
        
    