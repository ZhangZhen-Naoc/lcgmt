from flask import Blueprint

bp = Blueprint('sysadmin', __name__)

from app.sysadmin import routes
