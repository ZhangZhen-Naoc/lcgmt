from flask import Blueprint

bp = Blueprint('science_management_committee', __name__)

from app.science_management_committee import routes
