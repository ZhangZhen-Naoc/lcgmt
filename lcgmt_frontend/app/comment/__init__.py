from flask import Blueprint

bp = Blueprint('comment', __name__, template_folder='templates')

from app.comment import routes
