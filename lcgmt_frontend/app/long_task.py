from functools import partial
import json
from multiprocessing.pool import AsyncResult
import time
from typing import Any, Callable

from flask_login import  login_required
from .extensions import celery
from flask import current_app,abort
import subprocess
from app.extensions import db
from datetime import datetime
import sqlalchemy
from sqlalchemy.orm.query import Query
from celery import chain
from celery.app.task import Context
from app.user import service as user_service
class SqlAlchemyTask(db.Model):
    __table_args__ = {"schema":"tdic"}
    query:Query
    id:int =db.Column(db.Integer,primary_key=True)
    user_id:int = db.Column(db.Integer)
    command=db.Column(db.String(500)) # 弃用
    pid:str=db.Column(db.String) # celery中的id
    status:str = db.Column(db.String) # 状态，包括 SUCCESS, FAILURE, PENDING
    result:str = db.Column(db.String) # 结果，成功则为任务返回值，失败则为异常描述
    tables = db.Column(db.String) # 弃用
    submit_time = db.Column(db.DhteTime)
    task_type = db.Column(db.String) # 例如 MWR， Simulate
    description = db.Column(db.String) # 例如MWR中哪些表
    _task = None
    def __init__(self) -> None:
        super().__init__()
        current_user = user_service.get_current_user()
        if current_user is not None and current_user.is_authenticated:
            self.user_id = current_user.id
        else:
            self.user_id=None
        self.submit_time = datetime.now()
        self.status="PENDING"
        
    @classmethod
    def find_by_id(cls,id)->"SqlAlchemyTask":
        return cls.query.get(id)
    
    @classmethod
    def find_by_celery_id(cls,id)->"SqlAlchemyTask":
        return cls.query.filter(cls.pid==id).first()

    def set_description(self,description:str):
        self.description = description
        db.session.commit()
@celery.task
def success_callback(result,task_id:int):
    task:SqlAlchemyTask = SqlAlchemyTask.query.get(task_id)
    task.result = result.__str__()
    task.status = "SUCCESS"
    db.session.commit()
    return result

@celery.task
def err_handler(request:Context, exception:Exception, traceback:str):
        
    print("...........callback handled error............")
   
    task_id = request.id
    task:SqlAlchemyTask = SqlAlchemyTask.query.filter(SqlAlchemyTask.pid==task_id).first()
    if task:
        task.status="FAILURE"
        task.result=json.dumps({"err":exception.__str__() })
        db.session.commit()



def register_long_task(func:Callable,task_type="")->Callable[[Any],AsyncResult]:
    """注册任务，使得该任务可以使用回调

    Args:
        func (Callable): 有celery.task装饰的任务
        task_type (str, optional): 任务类型，例如 "MWR", "Simulation". Defaults to "".

    Returns:
        Callable[[Any],AsyncResult]: _description_
    """
    def wraper(*args,**kargs):
        task_in_db = SqlAlchemyTask()
        task_in_db.task_type = task_type
        db.session.add(task_in_db)
        db.session.flush()
        task= chain(func.s(*args,**kargs),success_callback.s(task_in_db.id),link_error=err_handler.s())()
        task_in_db.pid = task.parent.id # task.id 是callback任务的id，task.parent.id才是真正任务的id
        
        db.session.commit()
        
        
        return task
    # return partial(wraper,link = success_callback.s(), link_error=err_handler.s())
    return partial(wraper)

@celery.task
def bash(cmd):
    print(cmd)
    return_code = subprocess.run(cmd,shell=True).returncode
    return return_code

@celery.task
def celery_task_with_flask():
    print(current_app.url_map)
    # return current_app.url_map
    return 1

@celery.task
def long_sleep():
    print( "sleeping........")
    time.sleep(3)

@celery.task
def demo(a:int,b:int):
    return a+b

@celery.task
def err_demo():
    """抛出异常示例
    """
    raise Exception("If you look at this in database, error callbak created successful")

@celery.task
@login_required
def login_required_demo():
    return ""

@celery.task
def type_demo():
    return ""

@celery.task
def return_task_id():
    # return return_task_id.request.id
    return return_task_id.request.id
registered_demo = register_long_task(demo)
registered_err_task = register_long_task(err_demo)
registered_login_required = register_long_task(login_required_demo)
registered_task_with_type = register_long_task(type_demo,task_type="testing")
registered_task_return_id = register_long_task(return_task_id)