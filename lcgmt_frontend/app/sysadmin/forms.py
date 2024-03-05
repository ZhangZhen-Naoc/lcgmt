from flask_wtf import FlaskForm
from flask_babelex import _, lazy_gettext as _l
from wtforms import SelectMultipleField, SelectField,BooleanField, SubmitField, StringField
from wtforms import ValidationError
from wtforms.validators import DataRequired, Length, Email, Optional
from app.user.forms import EditProfileForm,RadioField,TextAreaField
from app.user.models import User, Role


class EditProfileAdminForm(FlaskForm):
    email = StringField(_l("Email"), validators=[
                        DataRequired(), Length(1, 254)])
    # name = StringField(_l("Full Name"), validators=[
    #                    DataRequired(), Length(1, 30)])
    first_name= StringField(_l("First Name"), validators=[
                       Optional(), Length(1, 30)])
    last_name = StringField(_l("Last Name"), validators=[
                       Optional(), Length(1, 30)])
    position = SelectField(_l("Position"), choices=[('Staff Member','Staff Member'),('Post Doctor','Post Doctor'),('Graduate Student','Graduate Student')], validators=[Optional()])
    affiliation = StringField(_l("Affiliation (Full Name)"), validators=[
                              Optional(), Length(0, 200)])
    # expertise = StringField(_l("Expertise"), validators=[DataRequired(), Length(0, 200)])
    research_topic = StringField(_l("Research Topics (1-6 keywords, e.g. TDE, stellar flare )"), validators=[Optional(), Length(0, 100)])
    personal_website = StringField(_l("Personal Website"), validators=[Optional(), Length(0, 200)])
    research_statement = TextAreaField(_l("Research Statement"), validators=[Optional(), Length(100, 500)],render_kw={'rows': 5})
    publication = TextAreaField(_l("Selected relevant publications in the past ~ 5 years (up to 5)"), validators=[Optional(), Length(100, 500)],render_kw={'rows': 5})

    # user_group = SelectField('User Group', choices=[('China','China'),('MPE','MPE'),('ESA','ESA')],validators=[InputRequired()],render_kw={'id':'pi_user_group'})
    # display_personal_info = RadioField(
    #     'Agree to display your personal information to the STP community? If not, only name, affiliation and email will be displayed.', choices=[(True,'Yes'),(False,'No')], default=True)

    roles = SelectMultipleField(_l('Role'), coerce=int)

    # expert_type = SelectField(_l('Expert Type'))
    scientific_categories = SelectMultipleField(_l('Scientific Category'))
    email_confirmed = BooleanField(_l('User email confirmed'))
    # is_domestic = BooleanField(_l('Is Domestic'))

    # allowed_api = BooleanField(_l('Allowed to use API'))
    submit = SubmitField()

    def __init__(self, user, *args, **kwargs):
        super(EditProfileAdminForm, self).__init__(*args, **kwargs)
        self.roles.choices = [(role.id, role.name) for role in Role.query.order_by(Role.name).all()]
        self.user = user

    def validate_email(self, field):
        if field.data != self.user.email and User.query.filter_by(email=field.data.lower()).first():
            raise ValidationError(_('The email is already in use.'))

class RegisterExpertForm(FlaskForm):
    first_name = StringField(_l('First Name (must be actual name)'), validators=[DataRequired(), Length(1, 30)])
    last_name = StringField(_l('Last Name (must be actual name)'), validators=[DataRequired(), Length(1, 30)])
    email = StringField('Email', validators=[DataRequired(), Length(1, 254), Email()])
    title = StringField(_l("User Title"), validators=[Optional(), Length(0, 200)])
    institution = StringField(_l("Institution"))
    expert_type = SelectField(_l('Expert Type'))
    scientific_categories = SelectMultipleField(_l('Scientific Category'))
    submit = SubmitField(_l("Submit"))

    def validate_email(self, field):
        if User.query.filter_by(email=field.data.lower()).first():
            raise ValidationError('The email is already in use.')