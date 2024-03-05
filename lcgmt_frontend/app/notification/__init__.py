from flask import Blueprint

bp = Blueprint('notification', __name__, template_folder='templates')

from app.notification import routes
