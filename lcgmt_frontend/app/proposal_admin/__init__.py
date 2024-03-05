from flask import Blueprint

bp = Blueprint('proposal_admin', __name__)

from app.proposal_admin import routes
