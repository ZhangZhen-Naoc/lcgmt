from flask import Blueprint

bp = Blueprint('cms', __name__)

from app.cms import routes
