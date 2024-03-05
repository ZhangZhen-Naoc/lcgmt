from flask_babelex import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import StringField, HiddenField
from wtforms.validators import DataRequired, Length

from app.cktools import CKTextAreaField


class CommentForm(FlaskForm):
    ref_link = StringField(_l('Reference Link'), validators=[Length(0, 300)])
    comment = CKTextAreaField(_l('Comment'), validators=[DataRequired()])
    # verify_code = StringField('Verify Code', validators=[DataRequired(), Length(4, 4, message=_('input verify code'))])
    tncode = HiddenField(validators=[DataRequired()])
    # submit = SubmitField()

'''
class CommentResponseForm(FlaskForm):
    response_content=TextAreaField('response_content', validators=[DataRequired()])
    submit = SubmitField()
'''
