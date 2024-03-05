from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import StringField, IntegerField, RadioField, BooleanField, TextAreaField, FloatField, SubmitField, SelectField, FileField
from wtforms.validators import DataRequired, Optional
# from app.proposal_admin.model import Proposal, ProposalScientificCategory, ProposalEquipmentNoise, ProposalEquipmentBackend, ProposalEquipmentReceiver
from app.extensions import db
import datetime, time


class ReviewForm(FlaskForm):
    score = FloatField('Please enter a score: (0-10)', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    comment = TextAreaField('Please enter your comment:', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
  
    familiar = RadioField('Please specify how famillar you are with the scientific:', choices=[('expert', 'expert'), ('familiar', 'familiar'), ('basic', 'basic'), ('unfamiliar', 'unfamiliar')], default='expert')
    
