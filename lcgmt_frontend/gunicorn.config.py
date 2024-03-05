# config.py

bind = "0.0.0.0:5000"
# bind = "unix:/home/sock/ep.sock"
pidfile = "log/gunicorn.pid"
accesslog = 'log/access.log'
errorlog = "log/error.log"
debuglog = "log/debug.log"
loglevel='error'
timeout = 120
raw_env = [
    # "SCRIPT_NAME=/ep",
    "FORCE_NADC_LOGIN=True",
    "FORCE_NADC_LOGOUT=True",

]
daemon = False
capture_output = True
workers = 4 
# 由于任务信息暂时存在内存中，多worker会导致任务列表为空

# ssl 配置
certfile = "/etc/nginx/cert/mmdcs.crt"
keyfile = "/etc/nginx/cert/mmdcs.key"
