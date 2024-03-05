# 该文件用于进行celery测试，不含业务逻辑
import matplotlib
matplotlib.use("agg")
from flask import current_app
from celery import Celery
from app.settings import ZhangzhenConfig
celery = Celery('noflask')
celery.config_from_object(ZhangzhenConfig)
@celery.task
def celer_task_without_flask_context():
    # return "abc"
    return current_app.url_map