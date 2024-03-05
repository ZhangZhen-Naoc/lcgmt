from flask_babelex import _, lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import StringField, FloatField, SubmitField, SelectField, BooleanField, TextAreaField, DateTimeField, FileField
from wtforms.validators import DataRequired, Optional,Length
from app.extensions import db
from app.proposal_admin.model import Proposal
from flask_wtf.file import FileField, FileAllowed, FileRequired


ScienceType = [('Life-cycle of Stars and Interstellar Medium', 'Life-cycle of Stars and Interstellar Medium'),
              ('Isolated and Binary Compact Objects', 'Isolated and Binary Compact Objects'),
              ('Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters', 'Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters'),
              ('Active Galactic Nuclei and Tidal Disruption Events', 'Active Galactic Nuclei and Tidal Disruption Events'),
              ('Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas', 'Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas'),
              ('Solar System Objects, Stars and Exoplanets','Solar System Objects, Stars and Exoplanets'),
              ('Gravitational Wave Electromagnetic Counterpart', 'Gravitational Wave Electromagnetic Counterpart'),
              ('Other', 'Other'),
              ]



class ProposalSeasonForm(FlaskForm):
    season = StringField('Name', validators=[Optional(strip_whitespace=True)], render_kw={'autocomplete': 'off'})
    open_date = StringField('Start for Proposal', validators=[Optional(strip_whitespace=True)], render_kw={'autocomplete': 'off', 'placeholder': 'e.g. 2020-03-04 00:00:00'})
    expiration = StringField('Expiration for Proposal', validators=[Optional(strip_whitespace=True)], render_kw={'autocomplete': 'off', 'placeholder': 'e.g. 2020-07-08 00:00:00' })
    review_deadline = StringField('Expiration for Review', validators=[Optional(strip_whitespace=True)], render_kw={'autocomplete': 'off', 'placeholder': 'e.g. 2021-03-24 12:00:00'})
    # project_expiration = StringField('Expiration for project', validators=[Optional(strip_whitespace=True)], render_kw={'autocomplete': 'off', 'placeholder': 'e.g. 2021-07-08 16:00:00', 'class':'datetimepicker'})
    create_season = SubmitField('Create Season')


class SeasonLinkForm(FlaskForm):
    ulink = StringField(_l('Announcement Link'), render_kw={'autocomplete': 'off'})
    plink = StringField(_l('Telescope Performance Parameter Link'), render_kw={'autocomplete': 'off'})
    hlink = StringField(_l('Help Link'), render_kw={'autocomplete': 'off'})
    save = SubmitField('Save')


class ProposalReviewerForm(FlaskForm):
    name = StringField(_w('Reviewer Name'), render_kw={'autocomplete': 'off'})
    email = StringField(_('Reviewer Email'), render_kw={'autocomplete': 'off'})
    reviewer_type = SelectField(_l('Reviewer Type'), choices=ScienceType)
    submit = SubmitField('Search')

    def __init__(self, *args, **kwargs):
        super(ProposalReviewerForm, self).__init__(*args, **kwargs)
        if kwargs['reviewer_type'] is None:
            self.reviewer_type.default = 'All'
        else:
            self.reviewer_type.default = kwargs['reviewer_type']
        self.name.default = kwargs['name']
        self.email.default = kwargs['email']


class ProposalExpertWeight(FlaskForm):
    outer_expert_weight = FloatField('outer', validators=[DataRequired()])
    inner_expert_weight = FloatField('inner', validators=[DataRequired()])
    modify_weight = SubmitField('modify weight')


class ProposalReviewResult(FlaskForm):
    priority = SelectField(_l('Grade'), choices=[('-', '--'),('P1', 'P1'), ('P2', 'P2'), ('P3', 'P3'), ('P4', 'P4'), ('P5', 'P5'), ('P6', 'P6'), ('P7', 'P7'), ('P8', 'P8'), ('P9', 'P9') , ('P10', 'P10'), ('X', 'Other')],validators=[DataRequired()])
    assigned = FloatField('Assigned Seconds', validators=[DataRequired()])
    upload_type = SelectField(_l('Upload Type'), choices=[('-', '--'),('ToO-EX', 'ToO-EX'), ('ToO-NOM-AT', 'ToO-NOM-AT'), ('ToO-MM','ToO-MM'), ('ToO-NOM-ACAL','ToO-NOM-ACAL'),('Not-Upload','Not Upload')],validators=[DataRequired()])
    urgency = SelectField(_l('Urgency'), choices=[('-', '--'),('Urgent', 'Urgent'), ('Normal', 'Normal'),('Not-Upload','Not Upload')],validators=[DataRequired()])
    # pid = StringField(_l('PID'), render_kw={'autocomplete': 'off'},validators=[DataRequired()])
    add_result = SubmitField('Add Result')


class ProposalCreateProject(FlaskForm):
    import_source = SelectField('Source', choices=[('YES', 'YES'), ('NO', 'NO')])
    create_project = SubmitField('create_project')


class ProposalTechnicalReviewForm(FlaskForm):
    technical_result = SelectField('Technical Feasibility', choices=[('YES', 'YES'), ('NO', 'NO'), ('Partial', 'Partial')])
    technical_content = TextAreaField('Review Comment',render_kw={'rows':'5'})
    create_content = SubmitField('Submit')


class ProposalOverReviewForm(FlaskForm):
    overall_content = TextAreaField('Content',render_kw={'rows':'5'},validators=[Length(0, 200)])
    create_overall_content = SubmitField('Submit')


class ProposalPrioritySelectForm(FlaskForm):
    priority_select = SelectField(_l('priority'), choices=[('All', 'All'), ('P1', '1'), ('P2', '2'), ('P3', '3'), ('P4', '4'), ('P5', '5'), ('P6', '6'), ('P7', '7'), ('P8', '8'), ('P9', '9') , ('P10', '10'), ('X', 'Other')])
    science_type = SelectField(_l('Proposal Type'), choices=ScienceType)
    def __init__(self, *args, **kwargs):
        super(ProposalPrioritySelectForm, self).__init__(*args, **kwargs)
        self.priority_select.default = kwargs['priority']
        self.science_type.default = kwargs['science_type']


class ProposalSearchForm(FlaskForm):
    search_value = StringField('nsm', render_kw={'autocomplete': 'off'})
    search = SubmitField('Search')

    def __init__(self, *args, **kwargs):
        super(ProposalSearchForm, self).__init__(*args, **kwargs)
        self.search_value.default = kwargs['search_value']


class ModifyExpertExpirationDate(FlaskForm):
    review_deadline = DateTimeField('inner', validators=[DataRequired()])
    modify_time = SubmitField('modifytime')


class OpenReviewForm(FlaskForm):
    open_to_pi_final_review_comment = SelectField('Review_f', choices=[('YES', 'YES'), ('NO', 'NO')])
    open_to_pi_technical_review_comment = SelectField('Review_t', choices=[('YES', 'YES'), ('NO', 'NO')])
    open_to_pi_scientific_review_comment = SelectField('Review_s', choices=[('YES', 'YES'), ('NO', 'NO')])
    open_review = SubmitField()


class FileDownloadForm(FlaskForm):
    priority_select = SelectField(_l('priority'), choices=[('All', 'All'), ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    science_type = SelectField(_l('Proposal Type'), choices=SciencnType)
    international_scale = SelectField(_l('Domestic_Foreign'), choices=[('All', 'All'), ('Domestic', 'Domestic'), ('Foreign', 'Foreign')])


class ModifyInvestigatorInfo(FlaskForm):
    investigator_name = StringField('用户名字', validators=[DataRequired()])
    investigator_institution = StringField('用户单位', validators=[DataRequired()])
    modify_info = SubmitField('modifyinfo')

# class ExcelFileDownloadForm(FlaskForm):
#     priority_select = SelectField(_l('priority'), choices=[('All', 'All'), ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D'), ('Z', 'Other')])
#     science_type = SelectField(_l('Proposal Type'), choices=[('All', 'All'),
#                                                              ('Pulsar Timing', 'Pulsar Timing'),
#                                                              ('Pulsar Search', 'Pulsar Search'),
#                                                              ('Single Pulse', 'Single Pulse'),
#                                                              ('Galactic Spec-line', 'Galactic Spec-line'),
#                                                              ('Masers', 'Masers'),
#                                                              ('FRB', 'FRB'),
#                                                              ('Continuum', 'Continuum'),
#                                                              ('Extragalactic Spec-line', 'Extragalactic Spec-line'),
#                                                              ('Other', 'Other')
#                                                              ])
#     international_scale = SelectField(_l('Domestic_Foreign'), choices=[('All', 'All'), ('Domestic', 'Domestic'), ('Foreign', 'Foreign')])
#     excel_download = SubmitField()
#
#
# class PidFileDownloadForm(FlaskForm):
#     priority_select = SelectField(_l('priority'), choices=[('All', 'All'), ('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D'), ('Z', 'Other')])
#     science_type = SelectField(_l('Proposal Type'), choices=[('All', 'All'),
#                                        7                     ('Pulsar Timing', 'Pulsar Timing'),
#                                                              ('Pulsar Search', 'Pulsar Search'),
#                                                              ('Single Pulse', 'Single Pulse'),
#                                                              ('Galactic Spec-line', 'Galactic Spec-line'),
#                                                              ('Masers', 'Masers'),
#                                                              ('FRB', 'FRB'),
#                                                              ('Continuum', 'Continuum'),
#                                                              ('Extragalactic Spec-line', 'Extragalactic Spec-line'),
#                                                              ('Other', 'Other')
#                                                              ])
#     international_scale = SelectField(_l('Domestic_Foreign'), choices=[('All', 'All'), ('Domestic', 'Domestic'), ('Foreign', 'Foreign')])
#     pid_download = SubmitField()
