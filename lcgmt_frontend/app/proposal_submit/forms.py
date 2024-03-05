from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed, FileRequired
from wtforms import StringField, IntegerField, RadioField, BooleanField, TextAreaField, FloatField, SubmitField, SelectField, FileField, validators
from wtforms.validators import DataRequired, Optional,InputRequired,NumberRange
from app.proposal_admin.model import ProposalSeason, Proposal, ProposalScientificCategory,FXTObservationMode, FXTFilterType,FXTWindowMode
from app.extensions import db
import datetime, time
from wtforms.fields import DateTimeField

"""
ScienceType = [('lifeCycleStars', 'Life-cycle of Stars and Interstellar Medium'),
              ('binaryCompactObject', 'Isolated and Binary Compact Objects'),
              ('galaxies_groupGalaxies_clusterGalaxies', 'Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters'),
              ('agn_quasars_blLacObjects_tde', 'Active Galactic Nuclei and Tidal Disruption Events'),
              ('cosmology_egDeepFileds_largeEgAreas', 'Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas'),
              ('gwec', 'Gravitational Wave Electromagnetic Counterpart'),
              ('other', 'Other'),
              ]
"""


class ScienceOverviewForm(FlaskForm):
    proposal_title = StringField('Proposal Title', validators=[DataRequired()])
    # 分类
    lifeCycleStars = BooleanField('Life-cycle of Stars and Interstellar Medium', validators=[Optional(strip_whitespace=True)])
    binaryCompactObject = BooleanField('Isolated and Binary Compact Objects', validators=[Optional(strip_whitespace=True)])
    galaxies_groupGalaxies_clusterGalaxies = BooleanField('Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters', validators=[Optional(strip_whitespace=True)])
    agn_quasars_blLacObjects_tde = BooleanField('Active Galactic Nuclei and Tidal Disruption Events', validators=[Optional(strip_whitespace=True)])
    sso_se = BooleanField('Solar System Objects, Stars and Exoplanets', validators=[Optional(strip_whitespace=True)])
    cosmology_egDeepFileds_largeEgAreas= BooleanField('Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas', validators=[Optional(strip_whitespace=True)])
    # cosmology= BooleanField('Cosmology', validators=[Optional(strip_whitespace=True)])
    gwec= BooleanField('Gravitational Wave Electromagnetic Counterpart', validators=[Optional(strip_whitespace=True)])
    other = BooleanField('Other (please specify)', validators=[Optional(strip_whitespace=True)])
    other_research = StringField('Other Research', validators=[Optional(strip_whitespace=True)])
   7#
    proposal_abstract = TextAreaField('Proposal Abstract', validators=[DataRequired()])
    #
    # resubmit_continuation = RadioField('Resubmit or Continuation', choices=[('NO', 'NO'), ('YES', 'YES-proposal number(s)')], validators=[DataRequired()])
    # proposal_number = StringField('Proposal Number', validators=[Optional(strip_whitespace=True)])
    #FSTO type的proposal 只能是STP用户申请，对于其他用户只能申请Guest Observation Proposal
    # proposal_type1 = RadioField('User Type', choices=[('GO', 'Guest Observer'), ('STP', 'Science Topical Panel')], validators=[DataRequired()])
    proposal_type2 = RadioField('Proposal Type', choices=[('NonToo', 'FXT Survey-mode Target Observation'), ('AnticipateToO', 'Anticipated ToO')],default='NonToo', validators=[DataRequired()])
    anticipated_too_no = StringField('Anticipated ToO NO', validators=[Optional(strip_whitespace=True)])
    urgency = RadioField('Urgency', choices=[('Highest', 'Highest'), ('High', 'High'),('Medium', 'Medium'),('Low', 'Low')], validators=[DataRequired()])

    obs_type = RadioField('Observation Type', choices=[('SingleObs', 'Single Observation'), ('MonitoringObs', 'Monitoring Observations'),  ('TileObs', 'Tiling Observations')], validators=[DataRequired()])
    stp = RadioField('STP',[validators.optional()], choices=[('1', '1'), ('2', '2'),  ('3', '3'),  ('4', '4'),  ('5', '5')])
    ant_too_trig_criteria = TextAreaField('Trigger criteria, reaction, time and observing strategy (no less than 5 words)',  [validators.optional(),validators.length(max=1000)], render_kw={'autocomplete': 'off', 'rows':5})
    other_remarks = TextAreaField('other_remarks',  [validators.optional(),validators.length(max=1000)], render_kw={'autocomplete': 'off', 'rows':5})
    submit = SubmitField('Save Changes')

    def __init__(self, *args, **kwargs):
        super(ScienceOverviewForm, self).__init__(*args, **kwargs)
        psc = db.session.query(Proposal).filter(Proposal.id == kwargs['proposal_id']).first()
        self.proposal_title.default = psc.proposal_title
        self.proposal_abstract.default = psc.proposal_abstract
        self.proposal_type2.default = psc.type2.name
        self.obs_type.default = psc.obs_type
        # self.stp.default = psc.stp
        self.ant_too_trig_criteria.default = psc.ant_too_trig_criteria
        
        self.urgency.default = psc.urgency
        self.anticipated_too_no.default = psc.preset_too_no
        self.other_remarks.default = psc.other_remarks
        # self.ant_too_trig_criteria = psc.ant_too_trig_criteria
        #
        # if psc.resubmission:
        #     self.resubmit_continuation.default = 'YES'
        #     self.proposal_number.default = psc.resubmission_numbers
        # else:
        #     self.resubmit_continuation.default = 'NO'
        # 总时间改为自动计算得到
        # self.hours_requested.default = psc.total_time_request
        #
        scs = db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == kwargs['proposal_id']).all()
        category_value, content = [], ''
        for sc in scs:
            category_value.append(sc.category)
            if sc.category == 'Other':
                content = sc.category_content
        #
        if 'Life-cycle of Stars and Interstellar Medium' in category_value:
            self.lifeCycleStars.default = True
        if 'Isolated and Binary Compact Objects' in category_value:
            self.binaryCompactObject.default = True
        if 'Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters' in category_value:
            self.galaxies_groupGalaxies_clusterGalaxies.default = True
        if 'Active Galactic Nuclei and Tidal Disruption Events' in category_value:
            self.agn_quasars_blLacObjects_tde.default = True
        if 'Solar System Objects, Stars and Exoplanets' in category_value:
            self.sso_se.default = True
        if 'Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas' in category_value:
            self.cosmology_egDeepFileds_largeEgAreas.default = True
        if 'Gravitational Wave Electromagnetic Counterpart' in category_value:
            self.gwec.default = True
        if 'Other' in category_value:
            self.other.default = True
            self.other_research.default = content


class UploadFileFrom(FlaskForm):
    choose_button = FileField('Choose Your File', validators=[FileRequired(message='Choose Your Science-Case file'), FileAllowed(['pdf'], 'only .pdf')], render_kw={'value': 'Choose file'})
    submit_button = SubmitField('Upload File')


class ProposalInvestigatorForm(FlaskForm):
    title = SelectField('Title', choices=[('Dr','Dr'),('Prof','Prof'),('Mr','Mr'),('Mrs','Mrs'),('Ms','Ms')],validators=[InputRequired()],render_kw={'id':'last_name'})
    first_name = StringField('First Name', validators=[InputRequired()], render_kw={'autocomplete': 'off','id':'first_name'})
    last_name = StringField('Last Name', validators=[InputRequired()], render_kw={'autocomplete': 'off','id':'last_name'})
    email = StringField('Email', validators=[InputRequired()], render_kw={'autocomplete': 'off','id':'email'})
    institute = StringField('Institute', validators=[InputRequired()], render_kw={'autocomplete': 'off','id':'institute'})
    phone = StringField('Phone', validators=[Optional(strip_whitespace=False)], render_kw={'autocomplete': 'off','id':'phone'})
    country = StringField('Country', validators=[InputRequired()], render_kw={'autocomplete': 'off','id':'country'})
    user_group = SelectField('User Group', choices=[('CAS Team','CAS Team'),('MPE Team','MPE Team'),('ESA Team','ESA Team'),('CNES Team','CNES Team'),('Other','Other')],validators=[InputRequired()],render_kw={'id':'user_group'})
  
    add_investigator = SubmitField('Add Investigator',render_kw={'value':'Save'})
# class ProposalTileTargetFrom(FlaskForm):
#     source_name = StringField('Source Name', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
#     source_type = StringField('Source Type', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
#     ra = StringField('RA', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
#     dec = StringField('Dec', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    # duration = IntegerField('Duration', [validators.optional()], render_kw={'autocomplete': 'off'})
    # duration_unit = SelectField('Duration Unit', choices=[ ('second', 'Second'),('orbit','Orbit')], validators=[DataRequired()])
#     time_critical_param = TextAreaField('Time Critical Parameters',  [validators.optional()], render_kw={'autocomplete': 'off', 'rows':5})
 
#     monitoring_cadence = IntegerField('Monitoring Cadence', [validators.optional()], render_kw={'autocomplete': 'off'})
#     precision = FloatField('Precision', [validators.optional()], render_kw={'autocomplete': 'off'})
#     completeness =  FloatField('Completeness',  validators=[DataRequired()], render_kw={'autocomplete': 'off'})
#     fxt1_obs_mode = SelectField('FXT1 Observation Mode', choices=[ ('SCIENCE', 'Science'),('DIAGNOSTIC','Diagnostic'),('OFFSET', 'Offset')], validators=[DataRequired()])
#     fxt1_window_mode = SelectField('FXT1 Observation Mode', choices=[('FULLFRAME', 'Full Frame'), ('PARTIALWINDOW', 'Partial Window'), ('TIMING', 'Timing')], validators=[DataRequired()])
#     # fxt1_window_mode = RadioField('FXT1 Observation Mode', choices=[(member.value,name) for name, member in FXTWindowMode.__members__.items()], validators=[DataRequired()])
#     fxt1_filter = SelectField('FXT1 Filter', choices=[('CLOSEDPOSITION', 'Closed Position'), ('CALIBRATIONPOSITION', 'Calibration Position'), ('OPENPOSITION', 'Open Position'),('MEDIUMFILTER','Medium Filter'), ('THINFILTER','Thin Filter'),  ('HOLE POSITION','Hole Position')], validators=[DataRequired()])

class ProposalSourceForm(FlaskForm):
    source_name = StringField('Source Name', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    # source_type = StringField('Source Type', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    ra = StringField('RA', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    dec = StringField('Dec', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    duration = IntegerField('Duration', validators=[DataRequired()], render_kw={'autocomplete': 'off'},default=1000)
    old_exposure_time = IntegerField('Old Exposure Time', [validators.optional()], render_kw={'autocomplete': 'off'}, default=0)
    exposure_time_unit = SelectField('Duration Unit', choices=[ ('second', 'Second'),('orbit','Orbit')], validators=[DataRequired()])
    continous_exposure = SelectField('Continous Exposure',[validators.optional()], choices=[ ('not_necessary', 'Not Necessary'),('required','Required'),('preferred','Preferred')],default='not_necessary')
    # exposure_time = FloatField('Exposure Time', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    # multiple_observation = BooleanField('Multiple Observations?', [validators.optional()], render_kw={'autocomplete': 'off',"data-toggle":"collapse","data-target":"#collapse_multiple","aria-expanded":"false","aria-controls":"collapse_multiple"})
    visit_number = IntegerField('Visit Number', validators=[Optional(), NumberRange(min=1)], render_kw={'autocomplete': 'off'})
    min_con_obs_duration= IntegerField('Min Continue Obs Duration', [validators.optional()], render_kw={'autocomplete': 'off'})
    # min con obs duration unit与exposure_time_unit一致
    max_con_obs_duration= IntegerField('Max Continue Obs Duration', [validators.optional()], render_kw={'autocomplete': 'off'})
    # max con obs duration unit与exposure_time_unit一致

    cadence = IntegerField('Cadence', [validators.optional()], render_kw={'autocomplete': 'off'})
    cadence_unit = SelectField('Cadence Unit', choices=[ ('orbit','Orbit'),('day', 'Day')], validators=[validators.optional()])
    precision = FloatField('Precision', [validators.optional()], render_kw={'autocomplete': 'off'})
    precision_unit = SelectField('Precision Unit', choices=[ ('orbit', 'Orbit'),('day','Day')], validators=[validators.optional()])
    completeness =  FloatField('Completeness',  [validators.optional()], render_kw={'autocomplete': 'off'})
    # time_critical = BooleanField('Time Critical?', [validators.optional()], render_kw={'autocomplete': 'off',"data-toggle":"collapse","data-target":"#collapse_time_critical","aria-expanded":"false"})
    start_time = StringField('Start Time',  [validators.optional()], render_kw={'autocomplete': 'off'})
    end_time = StringField('End Time',  [validators.optional()], render_kw={'autocomplete': 'off'})
    time_critical_remark = TextAreaField('Time Critical Remark',  [validators.optional(),validators.Length(max=1000)], render_kw={'autocomplete': 'off','rows':5})      
    trigger_probability = FloatField('Trigger Probability', [validators.optional()], render_kw={'autocomplete': 'off'})
    fxt1_window_mode = SelectField('FXT1 Window Mode', choices=[('FULLFRAME', 'Full Frame'), ('PARTIALWINDOW', 'Partial Window'), ('TIMING', 'Timing')],default='FULLFRAME', validators=[DataRequired()])
    fxt1_filter = SelectField('FXT1 Filter', choices=[('MEDIUMFILTER','Medium Filter'), ('THINFILTER','Thin Filter')],default='THINFILTER', validators=[DataRequired()])
    fxt2_window_mode = SelectField('FXT2 Window Mode', choices=[('FULLFRAME', 'Full Frame'), ('PARTIALWINDOW', 'Partial Window'), ('TIMING', 'Timing')],default='FULLFRAME', validators=[DataRequired()])
    fxt2_filter = SelectField('FXT2 Filter',  choices=[('MEDIUMFILTER','Medium Filter'), ('THINFILTER','Thin Filter')],default='THINFILTER', validators=[DataRequired()])
    
    fxt_flux = FloatField('FXT 0.3-10keV Flux', [validators.optional()], render_kw={'autocomplete': 'off'})
    flux_pl_index = FloatField('Flux Powerlaw Photon Index', [validators.optional()], render_kw={'autocomplete': 'off'})
    v_mag = FloatField('V band Magnitude', [validators.optional()], render_kw={'autocomplete': 'off'})
    variable_source = BooleanField('Variable Source?', [validators.optional()], render_kw={'autocomplete': 'off'})
    extend_source = BooleanField('Extend Source?', [validators.optional()], render_kw={'autocomplete': 'off'})

    # source_priority = SelectField('Source Priority', choices=[('A', 'A'), ('B', 'B'), ('C', 'C'),('D','D')], validators=[validators.optional()])
    add_source = SubmitField('Add Target')
    update_source = SubmitField('Update Target')
     # wxt_cmos = StringField('WXT CMOS ID', [validators.optional()],  render_kw={'autocomplete': 'off'}) 
    # wxt_x = FloatField('WXT X',  [validators.optional()], render_kw={'autocomplete': 'off'}) 
    # wxt_y = FloatField('WXT Y',  [validators.optional()], render_kw={'autocomplete': 'off'}) 
    # fxt1_x = FloatField('FXT1 X',  [validators.optional()], render_kw={'autocomplete': 'off'})
    # fxt1_y = FloatField('FXT1 Y',  [validators.optional()], render_kw={'autocomplete': 'off'})
    # fxt2_x = FloatField('FXT2 X', [validators.optional()],  render_kw={'autocomplete': 'off'}) 
    # fxt2_y = FloatField('FXT2 Y',  [validators.optional()], render_kw={'autocomplete': 'off'})
    # #仅限用户的ToO观测任务请求
    # fxt_data_realtime_trans = BooleanField('Whether real-time transmission of FXT data is required?', [validators.optional()])
    # wxt_config_param_switch = StringField('WXT Config Parameter Switch',  [validators.optional()], render_kw={'autocomplete': 'off'}) 
    # wxt_config_force_switch = StringField('WXT Config Force Switch', [validators.optional()],  render_kw={'autocomplete': 'off'}) 
    # wxt_operation_code_3 = StringField('WXT Operation Code 3', [validators.optional()],  render_kw={'autocomplete': 'off'}) 
    # wxt_minnsigma_dim = StringField('WXT Minnsigma Dim',  [validators.optional()], render_kw={'autocomplete': 'off'})
    # wxt_sn_dim = StringField('WXT SN Dim', [validators.optional()],  render_kw={'autocomplete': 'off'})
    # wxt_sn_windows = StringField('WXT SN Windows', [validators.optional()],  render_kw={'autocomplete': 'off'})

    # def InnerProposalSetting(self, innerUser=False):
        
    #     if not innerUser:
           
    #         self.fxt1_obs_mode.choices=[ ('SCIENCE', 'Science')]
    #         self.fxt2_obs_mode.choices=[ ('SCIENCE', 'Science')]
    #         self.fxt1_filter.choices=[('MEDIUMFILTER','Medium Filter'), ('THINFILTER','Thin Filter')]
    #         self.fxt2_filter.choices=[('MEDIUMFILTER','Medium Filter'), ('THINFILTER','Thin Filter')]

class TargetVisilibityForm(FlaskForm):
    ra = StringField('RA', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    dec = StringField('Dec', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    start_time = StringField('Start Time', validators= [DataRequired()], render_kw={'autocomplete': 'off'})
    end_time = StringField('End Time', validators= [DataRequired()], render_kw={'autocomplete': 'off'})
    calculate = SubmitField('Calculate')


class ProposalExpertForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    institute = StringField('Institute', validators=[DataRequired()], render_kw={'autocomplete': 'off'})
    add_expert = SubmitField('Add Expert')


class CreateProposalForm(FlaskForm):
    seasons = SelectField('Seasons', choices=[], validators=[Optional(strip_whitespace=True)])
    add_proposal = SubmitField('Add Proposal')

    def __init__(self, *args, **kwargs):
        super(CreateProposalForm, self).__init__(*args, **kwargs)
        seasons = db.session.query(ProposalSeason).filter(ProposalSeason.expiration > datetime.datetime.fromtimestamp(time.mktime(time.localtime()))).all()
        for s in seasons:
            self.seasons.choices.append((s.id, s.season))


# 提交文件导入
class UploadSourceTemplateForm(FlaskForm):
    choose_button = FileField('Choose file', validators=[FileRequired(), FileAllowed(['txt'], '.txt Only!')])
    submit_button = SubmitField('Submit file')


class ProposalEquipment(FlaskForm):
    receiver_all = BooleanField('All', validators=[Optional(strip_whitespace=True)])
    # receiver_center = BooleanField('Center', validators=[Optional(strip_whitespace=True)])
    receiver = SelectField('Receiver', choices=[('FXT', 'FXT'), ('WXT', 'WXT')])
   
    #
    submit = SubmitField('Submit')

    def __init__(self, *args, **kwargs):
        super(ProposalEquipment, self).__init__(*args, **kwargs)
        