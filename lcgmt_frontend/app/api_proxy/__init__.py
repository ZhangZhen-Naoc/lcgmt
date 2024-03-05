# 代理到nadc，解决本地跨域问题
from flask import  request,Blueprint
import requests
proxy = Blueprint('proxy',__name__)

@proxy.route("/data/nss/solve")
def solve():
    obj_name = request.args.get("obj")
    return requests.get(f"https://nadc.china-vo.org/data/nss/solve?obj={obj_name}").content