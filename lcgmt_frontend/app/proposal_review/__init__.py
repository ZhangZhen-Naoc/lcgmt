from flask import Blueprint

bp = Blueprint('proposal_review', __name__)

from app.proposal_review import routes
