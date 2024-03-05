from flask import Blueprint

bp = Blueprint('ajax', __name__)

from app.ajax import routes
