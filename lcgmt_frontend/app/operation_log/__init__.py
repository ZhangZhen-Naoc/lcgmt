from flask import Blueprint

bp = Blueprint('operation_log', __name__, template_folder='templates')

from app.operation_log import routes
