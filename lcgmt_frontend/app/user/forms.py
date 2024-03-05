from flask import url_for, current_app
from flask_babelex import _, lazy_gettext as _l
from flask_login import current_user
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import StringField, PasswordField, SubmitField, BooleanField, TextAreaField, HiddenField, ValidationError, SelectMultipleField,SelectField,RadioField
from wtforms.validators import DataRequired, Length, Email, EqualTo, Optional,InputRequired

from app.user.models import User


class EditProfileForm(FlaskForm):
    email = StringField(_l("Email"), validators=[
                        DataRequired(), Length(1, 254)])
    # name = StringField(_l("Full Name"), validators=[
    #                    DataRequired(), Length(1, 30)])
    first_name= StringField(_l("First Name"), validators=[
                       DataRequired(), Length(1, 30)])
    last_name = StringField(_l("Last Name"), validators=[
                       DataRequired(), Length(1, 30)])
    position = SelectField(_l("Position"), choices=[('Staff Member','Staff Member'),('Post Doctor','Post Doctor'),('Graduate Student','Graduate Student')], validators=[DataRequired()])
    affiliation = StringField(_l("Affiliation (Full Name)"), validators=[
                              DataRequired(), Length(0, 200)])
    # expertise = StringField(_l("Expertise"), validators=[DataRequired(), Length(0, 200)])
    research_topic = StringField(_l("Research Topics (1-6 keywords, e.g. TDE, stellar flare )"), validators=[DataRequired(), Length(0, 100)])
    personal_website = StringField(_l("Personal Website"), validators=[Optional(), Length(0, 200)])
    research_statement = TextAreaField(_l("Research Statement"), validators=[DataRequired(), Length(100, 500)],render_kw={'rows': 5})
    publication = TextAreaField(_l("Selected relevant publications in the past ~ 5 years (up to 5)"), validators=[Optional(), Length(100, 500)],render_kw={'rows': 5})
    # user_group = SelectField('User Group', choices=[('China','China'),('MPE','MPE'),('ESA','ESA')],validators=[InputRequired()],render_kw={'id':'pi_user_group'})
    display_personal_info = RadioField(
        'Agree to display your personal information to the STP community? If not, only name, affiliation and email will be displayed.', choices=[(True,'Yes'),(False,'No')], default=True)

    submit = SubmitField(_l("Submit"))
    



# class EditProfileAndPolicyForm(EditProfileForm):


class UploadAvatarForm(FlaskForm):
    image = FileField(_l('Upload'), validators=[
        FileRequired(),
        FileAllowed(['jpg', 'png'], 'The file format should be .jpg or .png.')
    ])
    submit = SubmitField(_l("Submit"))


class CropAvatarForm(FlaskForm):
    x = HiddenField()
    y = HiddenField()
    w = HiddenField()
    h = HiddenField()
    submit = SubmitField(_l('Crop and Update'))


class ChangeEmailForm(FlaskForm):
    email = StringField(_l('New Email'), validators=[
                        DataRequired(), Length(1, 254), Email()])
    submit = SubmitField(_l("Submit"))

    def validate_email(self, field):
        if User.query.filter_by(email=field.data.lower()).first():
            raise ValidationError(_('The email is already in use.'))


class ChangePasswordForm(FlaskForm):
    old_password = PasswordField(
        _l('Old Password'), validators=[DataRequired()])
    password = PasswordField(_l('New Password'), validators=[
        DataRequired(), Length(8, 128), EqualTo('password2')])
    password2 = PasswordField(_l('Confirm Password'),
                              validators=[DataRequired()])
    submit = SubmitField(_l("Submit"))


class NotificationSettingForm(FlaskForm):
    receive_system_email = BooleanField(_l('System email'))
    #
    submit = SubmitField(_l("Submit"))


class PrivacySettingForm(FlaskForm):
    submit = SubmitField(_l("Submit"))


class DeleteAccountForm(FlaskForm):
    id = StringField('id', validators=[DataRequired()])
    submit = SubmitField(_l("Submit"))

    def validate_username(self, field):
        if field.data != current_user.id:
            raise ValidationError(_('Wrong user id.'))


class LoginForm(FlaskForm):
    email = StringField('Email', validators=[
                        DataRequired(), Length(1, 254), Email()])
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    # tncode = HiddenField(validators=[DataRequired()])
    verify_code = StringField('Verify Code', validators=[
                              DataRequired(), Length(4, 4, message=_('input verify code'))])
    remember_me = BooleanField(_l('Remember me'))
    submit = SubmitField('Login')


class RegisterForm(FlaskForm):
    name = StringField(_l('Full Name'), validators=[DataRequired(), Length(
        1, 30)], render_kw={"placeholder": "Full name"})
    email = StringField('Login Email', validators=[DatgRequired(), Length(
        1, 254), Email()], render_kw={"placeholder": "Email for system login"})
    password = PasswordField(_l('Password'), validators=[
                             DataRequired(), Length(8, 128), EqualTo('password2')])
    password2 = PasswordField(_l('Confirm password'),
                              validators=[DataRequired()])
    # title = StringField(_("title"), validators=[Optional(), Length(0, 200)])
    institution = StringField(_l("institution"), validators=[
                              DataRequired(), Length(0, 300)])
    # address = StringField(_l("address"), validators=[Optional(), Length(0, 400)])
    # phone = StringField(_l("phone"), validators=[Optional(), Length(0, 50)])
    # locale = SelectField(_l("Locale"), choices=[('en', 'English'), ('zh_Hans_CN', '中文')])
    # website = StringField(_l("Website"), validators=[Optional(), Length(0, 255)])
    # bio = TextAreaField(_l("Bio"), validators=[Optional(), Length(0, 120)])
    accepted_policy = BooleanField(
        '<span style="color:#F00;">*</span> I\'ve read and accepted <a href="#"><strong>Policy</strong></a>', validators=[DataRequired()])
    # tncode = HiddenField(validators=[DataRequired()])
    verify_code = StringField(_l('Verifu Code'), validators=[
                              DataRequired(), Length(4, 4, message=_('input verify code'))])
    submit = SubmitField(_l("Submit"))

    def validate_email(self, field):
        if User.query.filter_by(email=field.data.lower()).first():
            raise ValidationError('The email is already in use.')


class ForgetPasswordForm(FlaskForm):
    email = StringField('Email', validators=[
                        DataRequired(), Length(1, 254), Email()])
    # tncode = HiddenField(validators=[DataRequired()])
    verify_code = StringField(_l('Verify Code'), validators=[
                              DataRequired(), Length(4, 4, message=_('input verify code'))])
    submit = SubmitField(_l("Submit"))


class ResetPasswordForm(FlaskForm):
    email = StringField('Email', validators=[
                        DataRequired(), Length(1, 254), Email()])
    password = PasswordField(_l('Password'), validators=[
        DataRequired(), Length(8, 128), EqualTo('password2')])
    password2 = PasswordField(_l('Confirm password'),
                              validators=[DataRequired()])
    verify_code = StringField(_l('Verify Code'), validators=[
                              DataRequired(), Length(4, 4, message=_('input verify code'))])
    # tncode = HiddenField(validators=[DataRequired()])
    submit = SubmitField(_l("Submit"))

class EditUserScientificCateforiesForm(FlaskForm):
    scientific_categories = SelectMultipleField(_l('Scientific Category'))
    submit = SubmitField(_l("Submit"))