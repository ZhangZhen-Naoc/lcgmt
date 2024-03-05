from flask_babelex import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import StringField, HiddenField, FloatField, RadioField,DateField,widgets, SelectMultipleField, SubmitField, DateTimeField
# from wtforms.fields.html5 import DateField
from wtforms.validators import DataRequired, Length, NumberRange,Optional

from app.cktools import CKTextAreaField


class MultiCheckboxField(SelectMultipleField):
    widget = widgets.ListWidget(prefix_label=False)
    option_widget = widgets.CheckboxInput()

class ObservationSearchForm(FlaskForm):
    ra = FloatField(_l('RA'), validators=[NumberRange(0, 360),Optional()])
    dec = FloatField(_l('Dec'), validators=[NumberRange(-90,90),Optional()])
    radius = FloatField(_l('Radius'), validators=[NumberRange(0,90),Optional()])
    object_name = StringField(_l('Object Name'))
    # name_resolver = RadioField('Name Resolver',choices=[('Simbad','Simbad'),('NED','NED')])
    obs_id = StringField(_l('Observation ID'))
    start_datetime= DateTimeField('Start Date Time', format='%Y-%m-%d %H:%M:%S',validators=[Optional()])
    end_datetime = DateTimeField('End Date Time', format='%Y-%m-%d %H:%M:%S',validators=[Optional()])
    # instruments = MultiCheckboxField('Instrument',choices=[('WXT','WXT'),('FXT','FXT')])
    submit = SubmitField()

class SourceSearchForm(FlaskForm):
    ra = FloatField(_l('RA'), validators=[NumberRange(0, 360),Optional()])
    dec = FloatField(_l('Dec'), validators=[NumberRange(-90,90),Optional()])
    radius = FloatField(_l('Radius'), validators=[NumberRange(0,360),Optional()])
    object_name = StringField(_l('Object Name'), validators=[Optional()])
    # name_resolver = RadioField('Name Resolver',choices=[('Simbad','Simbad'),('NED','NED')])
    # obs_id = StringField(_l('Observation ID'))
    start_datetime= DateTimeField('Start Date Time', format='%Y-%m-%d %H:%M:%S',validators=[Optional()])
    end_datetime = DateTimeField('End Date Time', format='%Y-%m-%d %H:%M:%S',validators=[Optional()])
    # instruments = MultiCheckboxField('Instrument',choices=[('WXT','WXT'),('FXT','FXT')])
    submit = SubmitField()

