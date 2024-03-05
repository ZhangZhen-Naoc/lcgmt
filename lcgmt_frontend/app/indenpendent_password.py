from flask import request, current_app, Blueprint
bp = Blueprint('independent_password',__name__)
def check_independent_password(pwd_key):
    
    pwds = current_app.config['INDEPENDENT_PWDS']
    return request.cookies.get("PWD_"+pwd_key) == pwds.get(pwd_key)

