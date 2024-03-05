from flask import Blueprint

bp = Blueprint('proposal_submit', __name__)

from app.proposal_submit import routes
