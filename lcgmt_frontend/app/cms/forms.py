from email.policy import default
# from msilib.schema import RadioButton
from flask_babelex import lazy_gettext as _l
from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, SubmitField, IntegerField, DateField,TextAreaField,SelectMultipleField,BooleanField,EmailField,RadioField,widgets,ValidationError, FieldList
from wtforms.validators import DataRequired, Length, Optional,InputRequired,Email
# from wtforms.fields.html5 import EmailField
from app.cktools import CKTextAreaField

def validate_at_least_one(form, field):
    if not any(field.data):
        raise ValidationError('至少需要选择一项。')
    
# class MultiCheckboxForm(FlaskForm):
    # 使用 FieldList 和 BooleanField 来创建多个复选框
    
    # 其他字段...

# class MultiCheckboxField(SelectMultipleField):
#     widget = widgets.ListWidget(prefix_label=False)
#     option_widget = widgets.CheckboxInput()

class CategoryForm(FlaskForm):
    id = StringField(_l("ID"))
    # path = StringField(_l("Path"), validators=[DataRequired(), Length(1, 100)])
    name = StringField(_l("Article Category Name"), validators=[DataRequired(), Length(1, 255)])
    description = CKTextAreaField(_l("Article Category Description"), validators=[Optional(), Length(1, 2000)])
    #
    category_type = SelectField(_l('Article Type'),coerce=int)
    submit = SubmitField(_l("Submit"))


class ArticleForm(FlaskForm):
    id = StringField(_l("ID"))
    # path = StringField(_l("Path"), validators=[DataRequired(), Length(1, 200)])
    title = StringField(_l("Title"), validators=[DataRequired(), Length(1, 300)])
    category = SelectField(_l('Article Category'), coerce=int)
    article_type = SelectField(_l('Article Type'),coerce=int)
    content = CKTextAreaField(_l("Content"), validators=[Optional()])
    thumbnail_path = StringField(_l("Thumbnail URL"), validators=[Optional(), Length(0, 255)])
    created = DateField('Create Date', format='%Y-%m-%d', validators=[Optional()])
    order = IntegerField(_l("Sort Number"))
    
    # top_image_path = StringField(_l("Top Image URL"), validators=[Optional(), Length(0, 255)]) #暂时不知道干啥的，先不用
    # published = BooleanField(_l('Published'), validators=[Optional()])
    # ontop = BooleanField(_l('On top'), validators=[Optional()])
    # recommended = BooleanField(_l('Recommended'), validators=[Optional()])
    #
    submit = SubmitField(_l("Submit"))


class CarouselForm(FlaskForm):
    id = StringField(_l("ID"))
    category = SelectField(_l('Article Category'), coerce=int)
    title = StringField(_l("Carousel Title"), validators=[Length(0, 300)])
    content = StringField(_l("Content"), validators=[Length(0, 1000)])
    link = StringField(_l("Link"), validators=[Length(0, 300)])
    image_url = StringField(_l("Image URL"),render_kw={}, validators=[Length(0, 300)])
    order = IntegerField(_l("Sort Number"))
    #
    submit = SubmitField(_l("Submit"))

class ScienceTeamSurveyForm(FlaskForm):
    #  id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    name = StringField("姓名", validators=[InputRequired(),Length(0, 100)]9

    title = SelectField('职称', choices=[('研究员/教授（正高）', '研究员/教授（正高）'), ('副研究员/副教授（副高）', '副研究员/副教授（副高）'), ('助理研究员/助理教授（中级）', '助理研究员/助理教授（中级）')],validators=[InputRequired()])
    institute = StringField("单位", validators=[InputRequired(),Length(0, 30)])
    # address = StringField("Address", validators=[InputRequired(),Length(0, 100)])
    email = EmailField("Email", validators=[InputRequired(),Email(),Length(0, 254)])
    # telephone = StringField("Telephone", validators=[InputRequired(),Length(0, 15)])
    #您的研究类型：
    reseach_type = SelectField('您的研究类型', choices=[('观测研究为主', '观测研究为主'), ('理论研究为主', '理论研究为主'), ('观测及理论', '观测及理论')],validators=[InputRequired()])
    #观测研究：您所用主要设备的观测波段 （可多选）：X 射线，伽马射线，光学/红外/紫外，射电/亚毫米
    observation_research = SelectMultipleField("观测研究",choices=[('X射线', 'X射线'), ('光学/红外/紫外', '光学/红外/紫外'), ('射电/亚毫米', '射电/亚毫米'),('伽马射线','伽马射线'),('多信使','多信使'),('无（理论研究）','无（理论研究）')],validators=[InputRequired()])

    #您准备如何处理分析 EP 卫星数据？
    how_to_analyze_data = SelectMultipleField("您和您的团队计划将由谁处理分析EP卫星数据？",choices=[('您本人', '您本人'), ('博士后和博士生', '博士后和博士生'), ('其他合作者', '其他合作者'), ('无', '无')],validators=[InputRequired()])    
    #预期将参与 EP 相关科学研究的博士生和博士后人数（您本人作为导师）：
    #
    # expected_joint_doctoral_candidate=IntegerField("博士生",validators=[InputRequired()],default=0)
    expected_joint_doctoral_candidate=SelectField("博士生",choices=[('0', '0'), ('1', '1'), ('2', '2'), ('更多', '更多')],validators=[InputRequired()])    
    expected_joint_postdoctoral=SelectField("博士后",choices=[('0', '0'), ('1', '1'), ('2', '2'), ('更多', '更多')],validators=[InputRequired()])  

    #1.Active Galactic Nuclei & Tidal Disruption Events
    
    agntde = BooleanField("Active Galactic Nuclei & Tidal Disruption Events", validators=[Optional()],render_kw={"id":"agntde","data-toggle":"collapse","data-target":"#collapse_agntde","aria-expanded":"false","aria-controls":"collapse_agntde",'autocomplete': 'off'})
    agntde_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p1_title"})
    agntde_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p1_journal"})
    agntde_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p1_year"})
    agntde_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"agntde_p1_rank"})
    agntde_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"agntde_p1_ca"})

    agntde_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p2_title"})
    agntde_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p2_journal"})
    agntde_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p2_year"})
    agntde_p2_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"agntde_p2_rank"})
    agntde_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"agntde_p2_ca"})

    agntde_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p3_title"})
    agntde_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p3_journal"})
    agntde_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p3_year"})
    agntde_p3_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"agntde_p3_rank"})
    agntde_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"agntde_p3_ca"})


    #2.Fast Extragalactic Transients
    fet = BooleanField("Fast Extragalactic Transients", validators=[Optional()],render_kw={"id":"fet","data-toggle":"collapse","data-target":"#collapse_fet","aria-expanded":"false","aria-controls":"collapse_fet",'autocomplete': 'off'})
    fet_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p1_title"})
    fet_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p1_journal"})
    fet_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p1_year"})
    fet_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fet_p1_rank"})
    fet_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fet_p1_ca"})

    fet_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p2_title"})
    fet_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p2_journal"})
    fet_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p2_year"})
    fet_p2_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fet_p2_rank"})
    fet_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fet_p2_ca"})

    fet_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p3_title"})
    fet_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p3_journal"})
    fet_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p3_year"})
    fet_p3_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fet_p3_rank"})
    fet_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fet_p3_ca"})

    #3.Multi-messenger Astronomy
    mma = BooleanField("Multi-messenger Astronomy", validators=[Optional()],render_kw={"id":"mma","data-toggle":"collapse","data-target":"#collapse_mma","aria-expanded":"false","aria-controls":"collapse_mma",'autocomplete': 'off'})
    mma_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p1_title"})
    mma_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p1_journal"})
    mma_p1_year= StringField("发表年份",validators=[Length(0, 100),Optiontl()],render_kw={"id":"mma_p1_year"})
    mma_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"mma_p1_rank"})
    mma_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"mma_p1_ca"})

    mma_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p2_title"})
    mma_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p2_journal"})
    mma_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p2_year"})
    mma_p2_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"mma_p2_rank"})
    mma_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"mma_p2_ca"})

    mma_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p3_title"})
    mma_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p3_journal"})
    mma_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p3_year"})
    mma_p3_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"mma_p3_rank"})
    mma_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"mma_p3_ca"})
    #4.Compact Stellar Objects
    cso = BooleanField("Compact Stellar Objects", validators=[Optional()],render_kw={"id":"cso","data-toggle":"collapse","data-target":"#collapse_cso","aria-expanded":"false","aria-controls":"collapse_cso",'autocomplete': 'off'})
    cso_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p1_title"})
    cso_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p1_journal"})
    cso_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p1_year"})
    cso_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"cso_p1_rank"})
    cso_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"cso_p1_ca"})

    cso_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p2_title"})
    cso_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p2_journal"})
    cso_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p2_year"})
    cso_p2_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"cso_p2_rank"})
    cso_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"cso_p2_ca"})

    cso_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p3_title"})
    cso_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p3_journal"})
    cso_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p3_year"})
    cso_p3_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"cso_p3_rank"})
    cso_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"cso_p3_ca"})
    #5.Observatory Science
    os = BooleanField("Observatory Science", validators=[Optional()],render_kw={"id":"os","data-toggle":"collapse","data-target":"#collapse_os","aria-expanded":"false","aria-controls":"collapse_os",'autocomplete': 'off'})
    os_type = StringField("具体研究方向",validators=[Length(0, 100),Optional()],render_kw={"id":"os_type"})

    os_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p1_title"})
    os_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p1_journal"})
    os_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p1_year"})
    os_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"os_p1_rank"})
    os_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"os_p1_ca"})

    os_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p2_title"})
    os_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p2_journal"})
    os_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p2_year"})
    os_p2_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"os_p2_rank"})
    os_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"os_p2_ca"})

    os_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p3_title"})
    os_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p3_journal"})
    os_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p3_year"})
    os_p3_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"os_p3_rank"})
    os_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"os_p3_ca"})

    #6.Follow-up Observation Activities
    fuoa = BooleanField("Follow-up Observation Activities", validators=[Optional()],render_kw={"id":"fuoa","data-toggle":"collapse","data-target":"#collapse_fuoa","aria-expanded":"false","aria-controls":"collapse_fuoa",'autocomplete': 'off'})
    fuoa_intro = TextAreaField("能够获取哪些设备的时间观测设备或资源，可配合EP开展观测", validators=[Length(0, 500)])

    fuoa_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p1_title"})
    fuoa_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p1_journal"})
    fuoa_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p1_year"})
    fuoa_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fuoa_p1_rank"})
    fuoa_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fuoa_p1_ca"})

    fuoa_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p2_title"})
    fuoa_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p2_journal"})
    fuoa_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p2_year"})
    fuoa_p2_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fuoa_p2_rank"})
    fuoa_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fuoa_p2_ca"})

    fuoa_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p3_title"})
    fuoa_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p3_journal"})
    fuoa_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p3_year"})
    fuoa_p3_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fuoa_p3_rank"})
    fuoa_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fuoa_p3_ca"})


     # 对EP科学团队的意见和建议
    comment = TextAreaField("对EP科学团队的意见和建议", validators=[Length(0, 100)])

    submit = SubmitField("提交",render_kw={"id":"submit"})

class AssociateScienceTeamApplyForm(FlaskForm):
    referer_name = StringField("正式成员（推荐人）姓名", validators=[InputRequired(),Length(0, 100)])
    referer_given_name = StringField("常用英文名", validators=[InputRequired(),Length(0, 100)])
    referer_family_name = StringField("常用英文姓", validators=[InputRequired(),Length(0, 100)])

    name1 = StringField("姓名", validators=[InputRequired(),Length(0, 100)])
    given_name1 = StringField("常用英文名", validators=[InputRequired(),Length(0, 100)])
    family_name1 = StringField("常用英文姓", validators=[InputRequired(),Length(0, 100)])
    title1 = SelectField('职称', choices=[('', ''),('博士生','博士生'),('博士后','博士后'),('助理研究员/助理教授（中级）', '助理研究员/助理教授（中级）'), ('副研究员/副教授（副高）', '副研究员/副教授（副高）'),('研究员/教授（正高）', '研究员/教授（正高）') ],validators=[InputRequired()])
    institute1 = StringField("单位", validators=[InputRequired(),Length(0, 30)])
    email1 = EmailField("Email", validators=[InputRequired(),Email(),Length(0, 254)])
    agntde1 = StringField("Active Galactic Nuclei & Tidal Disruption Events", validators=[Optional()],render_kw={"id":"agntde1",'autocomplete': 'off'})
    fet1 = BooleanField("Fast Extragalactic Transients", validators=[Optional()],render_kw={"id":"fet1",'autocomplete': 'off'})
    mma1 = BooleanField("Multi-messenger Astronomy", validators=[Optional()],render_kw={"id":"mma1",'autocomplete': 'off'})
    cso1 = BooleanField("Compact Stellar Objects", validators=[Optional()],render_kw={"id":"cso1",'autocomplete': 'off'})
    os1 = BooleanField("Observatory Science", validators=[Optional()],render_kw={"id":"os1",'autocomplete': 'off'})
    fuoa1 = BooleanField("Follow-up Observation Activities", validators=[Optional()],render_kw={"id":"fuoa1",'autocomplete': 'off'})
    intro1 = TextAreaField("不超过300字，简述被推荐成员的背景和预期参与的EP相关工作内容", validators=[InputRequired(1,Length(0, 500)])

    name2 = StringField("姓名", validators=[Optional(),Length(0, 100)])
    given_name2 = StringField("常用英文名", validators=[Optional(),Length(0, 100)])
    family_name2 = StringField("常用英文姓", validators=[Optional(),Length(0, 100)])
    # 博士生、硕士生、博士后、助研/助理教授、副研/副教授、正研/正教授
    title2 = SelectField('职称', choices=[('', ''),('博士生','博士生'),('博士后','博士后'),('助理研究员/助理教授（中级）', '助理研究员/助理教授（中级）'), ('副研究员/副教授（副高）', '副研究员/副教授（副高）'),('研究员/教授（正高）', '研究员/教授（正高）') ],validators=[Optional()])
    institute2 = StringField("单位", validators=[Optional(),Length(0, 30)])
    email2 = EmailField("Email", validators=[Optional(),Email(),Length(0, 254)])
    agntde2 = BooleanField("Active Galactic Nuclei & Tidal Disruption Events", validators=[Optional()],render_kw={"id":"agntde2",'autocomplete': 'off'})
    fet2 = BooleanField("Fast Extragalactic Transients", validators=[Optional()],render_kw={"id":"fet2",'autocomplete': 'off'})
    mma2 = BooleanField("Multi-messenger Astronomy", validators=[Optional()],render_kw={"id":"mma2",'autocomplete': 'off'})
    cso2 = BooleanField("Compact Stellar Objects", validators=[Optional()],render_kw={"id":"cso2",'autocomplete': 'off'})
    os2 = BooleanField("Observatory Science", validators=[Optional()],render_kw={"id":"os2",'autocomplete': 'off'})
    fuoa2 = BooleanField("Follow-up Observation Activities", validators=[Optional()],render_kw={"id":"fuoa2",'autocomplete': 'off'})
    intro2 = TextAreaField("不超过300字，简述被推荐成员的背景和预期参与的EP相关工作内容", validators=[Optional(),Length(0, 500)])

    name3 = StringField("姓名", validators=[Optional(),Length(0, 100)])
    given_name3 = StringField("常用英文名", validators=[Optional(),Length(0, 100)])
    family_name3 = StringField("常用英文姓", validators=[Optional(),Length(0, 100)])
    # 博士生、硕士生、博士后、助研/助理教授、副研/副教授、正研/正教授
    title3 = SelectField('职称', choices=[('', ''),('博士生','博士生'),('博士后','博士后'),('助理研究员/助理教授（中级）', '助理研究员/助理教授（中级）'), ('副研究员/副教授（副高）', '副研究员/副教授（副高）'),('研究员/教授（正高）', '研究员/教授（正高）') ],validators=[Optional()])
    institute3 = StringField("单位", validators=[Optional(),Length(0, 30)])
    email3 = EmailField("Email", validators=[Optional(),Email(),Length(0, 254)])
    agntde3 = BooleanField("Active Galactic Nuclei & Tidal Disruption Events", validators=[Optional()],render_kw={"id":"agntde3",'autocomplete': 'off'})
    fet3 = BooleanField("Fast Extragalactic Transients", validators=[Optional()],render_kw={"id":"fet3",'autocomplete': 'off'})
    mma3 = BooleanField("Multi-messenger Astronomy", validators=[Optional()],render_kw={"id":"mma3",'autocomplete': 'off'})
    cso3 = BooleanField("Compact Stellar Objects", validators=[Optional()],render_kw={"id":"cso3",'autocomplete': 'off'})
    os3 = BooleanField("Observatory Science", validators=[Optional()],render_kw={"id":"os3",'autocomplete': 'off'})
    fuoa3 = BooleanField("Follow-up Observation Activities", validators=[Optional()],render_kw={"id":"fuoa3",'autocomplete': 'off'})
    intro3 = TextAreaField("不超过300字，简述被推荐成员的背景和预期参与的EP相关工作内容", validators=[Optional(),Length(0, 500)])

    submit = SubmitField("提交",render_kw={"id":"submit"})



class ScienceTeamApplyForm(FlaskForm):
    #  id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    name = StringField("姓名", validators=[InputRequired(),Length(0, 100)])

    title = SelectField('职称', choices=[('', ''),('研究员/教授（正高）', '研究员/教授（正高）'), ('副研究员/副教授（副高）', '副研究员/副教授（副高）'), ('助理研究员/助理教授（中级）', '助理研究员/助理教授（中级）')],validators=[InputRequired()])
    institute = StringField("单位", validators=[InputRequired(),Length(0, 30)])
    # address = StringField("Address", validators=[InputRequired(),Length(0, 100)])
    email = EmailField("Email", validators=[InputRequired(),Email(),Length(0, 254)])
    # telephone = StringField("Telephone", validators=[InputRequired(),Length(0, 15)])
    #您的研究类型：
    reseach_type = SelectField('您的研究类型', choices=[('', ''),('观测研究为主', '观测研究为主'), ('理论研究为主', '理论研究为主'), ('观测及理论', '观测及理论')],validators=[InputRequired()])
    #观测研究：您所用主要设备的观测波段 （可多选）：X 射线，伽马射线，光学/红外/紫外，射电/亚毫米
    observation_research = SelectMultipleField("观测研究",choices=[('X射线', 'X射线'), ('光学/红外/紫外', '光学/红外/紫外'), ('射电/亚毫米', '射电/亚毫米'),('伽马射线','伽马射线'),('多信使','多信使'),('无（理论研究）','无（理论研究）')],validators=[InputRequired()])

    #您准备如何处理分析 EP 卫星数据？
    # how_to_analyze_data = SelectMultipleField("您和您的团队计划将由谁处理分析EP卫星数据？",choices=[('您本人', '您本人'), ('博士后和博士生', '博士后和博士生'), ('其他合作者', '其他合作者'), ('无', '无')],validators=[InputRequired()])    
    #预期将参与 EP 相关科学研究的博士生和博士后人数（您本人作为导师）：
    #
    # expected_joint_doctoral_candidate=IntegerField("博士生",validators=[InputRequired()],default=0)
    # expected_joint_doctoral_candidate=SelectField("博士生",choices=[('0', '0'), ('1', '1'), ('2', '2'), ('更多', '更多')],validators=[InputRequired()])    
    # expected_joint_postdoctoral=SelectField("博士后",choices=[('0', '0'), ('1', '1'), ('2', '2'), ('更多', '更多')],validators=[InputRequired()])  

    #1.Active Galactic Nuclei & Tidal Disruption Events
    
    agntde = BooleanField("Active Galactic Nuclei & Tidal Disruption Events", validators=[Optional()],render_kw={"id":"agntde","data-toggle":"collapse","data-target":"#collapse_agntde","aria-expanded":"false","aria-controls":"collapse_agntde",'autocomplete': 'off'})
    agntde_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p1_title"})
    agntde_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p1_journal"})
    agntde_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p1_year"})
    agntde_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"agntde_p1_rank"})
    agntde_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"agntde_p1_ca"})

    agntde_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p2_title"})
    agntde_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p2_journal"})
    agntde_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p2_year"})
    agntde_p2_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"agntde_p2_rank"})
    agntde_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"agntde_p2_ca"})

    agntde_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p3_title"})
    agntde_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p3_journal"})
    agntde_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"agntde_p3_year"})
    agntde_p3_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"agntde_p3_rank"})
    agntde_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"agntde_p3_ca"})


    #2.Fast Extragalactic Transients
    fet = BooleanField("Fast Extragalactic Transients", validators=[Optional()],render_kw={"id":"fet","data-toggle":"collapse","data-target":"#collapse_fet","aria-expanded":"false","aria-controls":"collapse_fet",'autocomplete': 'off'})
    fet_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p1_title"})
    fet_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p1_journal"})
    fet_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p1_year"})
    fet_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fet_p1_rank"})
    fet_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fet_p1_ca"})

    fet_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p2_title"})
    fet_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p2_journal"})
    fet_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p2_year"})
    fet_p2_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fet_p2_rank"})
    fet_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fet_p2_ca"})

    fet_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p3_title"})
    fet_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p3_journal"})
    fet_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fet_p3_year"})
    fet_p3_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fet_p3_rank"})
    fet_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fet_p3_ca"})

    #3.Multi-messenger Astronomy
    mma = BooleanField("Multi-messenger Astronomy", validators=[Optional()],render_kw={"id":"mma","data-toggle":"collapse","data-target":"#collapse_mma","aria-expanded":"false","aria-controls":"collapse_mma",'autocomplete': 'off'})
    mma_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p1_title"})
    mma_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p1_journal"})
    mma_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p1_year"})
    mma_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"mma_p1_rank"})
    mma_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"mma_p1_ca"})

    mma_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p2_title"})
    mma_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p2_journal"})
    mma_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p2_year"})
    mma_p2_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"mma_p2_rank"})
    mma_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"mma_p2_ca"})

    mma_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p3_title"})
    mma_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p3_journal"})
    mma_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"mma_p3_year"})
    mma_p3_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"mma_p3_rank"})
    mma_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"mma_p3_ca"})
    #4.Compact Stellar Objects
    cso = BooleanField("Compact Stellar Objects", validators=[Optional()],render_kw={"id":"cso","data-toggle":"collapse","data-target":"#collapse_cso","aria-expanded":"false","aria-controls":"collapse_cso",'autocomplete': 'off'})
    cso_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p1_title"})
    cso_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p1_journal"})
    cso_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p1_year"})
    cso_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"cso_p1_rank"})
    cso_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"cso_p1_ca"})

    cso_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p2_title"})
    cso_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p2_journal"})
    cso_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p2_year"})
    cso_p2_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"cso_p2_rank"})
    cso_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"cso_p2_ca"})

    cso_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p3_title"})
    cso_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p3_journal"})
    cso_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"cso_p3_year"})
    cso_p3_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"cso_p3_rank"})
    cso_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"cso_p3_ca"})
    #5.Observatory Science
    os = BooleanField("Observatory Science", validators=[Optional()],render_kw={"id":"os","data-toggle":"collapse","data-target":"#collapse_os","aria-expanded":"false","aria-controls":"collapse_os",'autocomplete': 'off'})
    os_type = StringField("具体研究方向",validators=[Length(0, 100),Optional()],render_kw={"id":"os_type"})

    os_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p1_title"})
    os_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p1_journal"})
    os_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p1_year"})
    os_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"os_p1_rank"})
    os_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"os_p1_ca"})

    os_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p2_title"})
    os_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p2_journal"})
    os_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p2_year"})
    os_p2_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"os_p2_rank"})
    os_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"os_p2_ca"})

    os_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p3_title"})
    os_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p3_journal"})
    os_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"os_p3_year"})
    os_p3_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"os_p3_rank"})
    os_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"os_p3_ca"})

    #6.Follow-up Observation Activities
    fuoa = BooleanField("Follow-up Observation Activities", validators=[Optional()],render_kw={"id":"fuoa","data-toggle":"collapse","data-target":"#collapse_fuoa","aria-expanded":"false","aria-controls":"collapse_fuoa",'autocomplete': 'off'})
    fuoa_intro = TextAreaField("能够获取哪些设备的时间观测设备或资源，可配合EP开展观测", validators=[Length(0, 500)])

    fuoa_p1_title= StringField("论文1：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p1_title"})
    fuoa_p1_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p1_journal"})
    fuoa_p1_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p1_year"})
    fuoa_p1_rank= StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fuoa_p1_rank"})
    fuoa_p1_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fuoa_p1_ca"})

    fuoa_p2_title= StringField("论文2：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p2_title"})
    fuoa_p2_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p2_journal"})
    fuoa_p2_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p2_year"})
    fuoa_p2_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fuoa_p2_rank"})
    fuoa_p2_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fuoa_p2_ca"})

    fuoa_p3_title= StringField("论文3：题目",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p3_title"})
    fuoa_p3_journal= StringField("发表期刊",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p3_journal"})
    fuoa_p3_year= StringField("发表年份",validators=[Length(0, 100),Optional()],render_kw={"id":"fuoa_p3_year"})
    fuoa_p3_rank=StringField("作者排名",validators=[Length(0, 10),Optional()],render_kw={"id":"fuoa_p3_rank"})
    fuoa_p3_ca= BooleanField("是否通讯作者",validators=[Optional()],render_kw={"id":"fuoa_p3_ca"})


     # 对EP科学团队的意见和建议
    # comment = TextAreaField("对EP科学团队的意见和建议", validators=[Length(0, 100)])
    # be_chair= BooleanField("是否愿意成为工作组负责人",validators=[Optional()],render_kw={"id":"be_chair"})
    be_chair = RadioField('是否愿意成为工作组负责人', choices=[(True,'是'),(False,'否')], default=False)
    
    submit = SubmitField("提交",render_kw={"id":"submit"})


   
class TAApplyForm(FlaskForm):
    #  id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    name = StringField("Name", validators=[InputRequired(),Length(0, 100)])

    position = SelectField('Postion', choices=[('',''),('Student', 'Student'), ('PostDoc', 'PostDoc'), ('Assistant Professor', 'Assistant Professor'),('Associate Professor','Associate Professor'),('Professor','Professor')],validators=[InputRequired()])
    institute = StringField("Institute", validators=[InputRequired(),Length(0, 100)])
    telephone = StringField("Phone", validators=[InputRequired(),Length(0, 15)])
    # stp = FieldList(BooleanField('6'), min_entries=1, validators=[validate_at_least_one])
    stp = StringField("STP", validators=[InputRequired(),Length(0, 6)])

   
    # stp = MultiCheckboxField('STP',validators=[InputRequired()], choices=[('1', '1'), ('2', '2'),  ('3', '3'),  ('4', '4'),  ('5', '5')])
    co_stp_name = StringField("co-STP Member Name", validators=[Optional(),Length(0, 100)])
    # address = StringField("Address", validators=[InputRequired(),Length(0, 100)])
    email = EmailField("Email", validators=[InputRequired(),Email(),Length(0, 254)])
    remark = TextAreaField('Remark',  validators =[Optional(),Length(max=500)], render_kw={'autocomplete': 'off', 'rows':5})

    submit = SubmitField("Submit",render_kw={"id":"submit"})

