from flask import Blueprint

bp = Blueprint('data_center', __name__, template_folder='templates')

from app.data_center import routes
from app.data_center.beidou import routes as beidou_routes
from app.data_center.fxt import routes as fxt_routes
from app.data_center.vhf import routes as vhf_routes
