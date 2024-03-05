from typing import Dict, List, Union
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, BaseDocTemplate, Frame, PageTemplate, PageBreak, FrameBreak, Flowable, NextPageTemplate, KeepTogether, KeepInFrame
from reportlab.pdfgen.canvas import Canvas
from functools import partial
from reportlab.lib import colors
from reportlab.lib.units import inch, cm, mm
from reportlab.lib import pagesizes
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.tables import Table, TableStyle
from reportlab.pdfgen import canvas
import fitz 
from app.proposal_admin.model import Proposal, ProposalInvestigator, ProposalSeason, ProposalScientificCategory, ProposalSourceList, ProposalExpert, ProposalReviewExpert
from flask import render_template, request, current_app, send_from_directory, jsonify, flash, url_for
from flask_login import login_required, current_user
import time, os, json, pdfkit, random
from app.extensions import db
from flask_babelex import _
from PyPDF2.pdf import PdfFileReader, PdfFileWriter
from io import BytesIO
from app.user.models import User
from app.proposal_admin.model import ProposalType2
from app.utils import format_email
from jinja2 import Environment, FileSystemLoader


# 公共样式
black_title_style = ParagraphStyle(name='blackTitle', fontSize=12.5, leading=0)
scientific_category_content_style = ParagraphStyle(name='scientific_category_content_style', fontSize=11, leading=12, firstLineIndent=10, fontName='华文中宋')
coverpage_2_style = ParagraphStyle(name='coverPage_2', fontSize=16, leading=0)
resubmit_content_style = ParagraphStyle(name='resubmit_content', fontSize=11, leading=0)
resubmit_content_style_2 = ParagraphStyle(name='content_2', fontSize=11, leading=1, firstLineIndent=0, alignment=TA_JUSTIFY, fontName='华文中宋')
pi_style = ParagraphStyle(name='pi_style', fontSize=10, leading=12, fontName='华文中宋')
pi_title_style = ParagraphStyle(name='pi_style', fontSize=10, leading=12)
black_title_2_style = ParagraphStyle(name='blackTitle', fontSize=12.5, leading=0)
ci_title_style = ParagraphStyle(name='ci_style', fontSize=10, leading=12)
ci_style = ParagraphStyle(name='ci_style', fontSize=10, leading=12, fontName='华文中宋')
name_ins_style = Paragraph('<b>Name/Institute</b>&nbsp;&nbsp;&nbsp;&nbsp;', ci_title_style)
checkbox, checkbox_selected = '<font name="wingdings" size=11></font>', '<font name="wingdings" size=11></font>'

class StoryBuilder():
    def __init__(self) -> None:
        self.story = []
    def fill_frame(self,content:List):
        # self.story.append(_line2_pdf())
        self.story.append( Paragraph("_"*50))
        self.story += content
        self.story.append(FrameBreak())
    
    def new_page(self,page_name):
        self.story.append(NextPageTemplate(page_name))
    def build(self):
        return self.story
# 批量生成PDF文件
def create_proposal_pdf(proposal, merge_result, from_where):
    # from app.user.routes import get_paper_list_pdf
    proposal_id = proposal.id
    pi = db.session.query(ProposalInvestigator).filter(ProposalInvestigator.proposal_id == proposal_id, ProposalInvestigator.role == 'pi').first()
    user = db.session.query(User).filter(User.email.in_(format_email(pi.email))).first()
    # 按路径生成coverpage的pdf
    coverpage_buf = BytesIO()
    generate_coverpage_pdf(proposal_id=proposal_id, save_path=coverpage_buf, from_where=from_where)
    merge_list = [coverpage_buf]

    # 若增加了文档，则合并添加科学案例
    if proposal.science_case_upload_status:
        fopen_file = open(proposal.get_case_file_path(), 'rb')
        merge_list.append(fopen_file)

    # 增加科学产出
    # paper = get_paper_list_pdf(user_id=user.id)
    # if paper is not None:
    #     merge_list.append(BytesIO(paper))

    # 合并文件
    merge_pdf(infnList=merge_list, outfn=merge_result)
    if proposal.science_case_upload_status:
        fopen_file.close()
    # 获取结果
    # merge_pdf_result = merge_result.getvalue()
    # 关闭缓存
    merge_result.close()
    coverpage_buf.close()
    # return merge_pdf_result


# def merge_pdf(infnList, outfn):
#     pdf_output = PdfFileWriter()
#     for infn in infnList:
#         pdf_input = PdfFileReader(infn, strict=False)
#         # pdf_input = PdfFileReader(open(infn, 'rb'))
#         # 获取 pdf 共用多少页
#         page_count = pdf_input.getNumPages()
#         #print(page_count)
#         for i in range(0, page_count):
#             pdf_output.addPage(pdf_input.getPage(i))
#     # pdf_output.write(open(outfn, 'wb'))
#     pdf_output.write(outfn)

def merge_pdf(infnList, outfn):
    merged_pdf = fitz.open()  # 创建一个空的 PDF

    for infile in infnList:
        infile.seek(0)
        pdf_data = infile.read()  # 读取文件对象中的数据
        pdf = fitz.open(stream=pdf_data, filetype="pdf")  # 使用 PyMuPDF 打开文件数据
        merged_pdf.insert_pdf(pdf)  # 将打开的 PDF 添加到合并的 PDF 中

    merged_pdf.save(outfn) 

def render_proposal_html(proposal_id:int)->str:
    """渲染proposal的html视图

    Args:
        proposal_id (int): _description_

    Returns:
        str: _description_
    """
    # ---------------- 获取数据 ------------------------------------------------
    proposal = db.session.query(Proposal).filter(Proposal.id == proposal_id).first()
    if proposal.type2==ProposalType2.AnticipateToO:
        anticipated_too = True
    else:
        anticipated_too = False
    proposal_scientific_categorys = db.session.query(ProposalScientificCategory).filter(ProposalScientificCategory.proposal_id == proposal_id).all()
    title, name,first_name, last_name, email, institution, phone,user_group,country = ProposalInvestigator.get_pi_value(proposal_id=prxposal_id)
    name = name if name is not None else ''
    institution = institution if institution is not None else ''
    phone = phone if phone is not None else ''
    pi = {
        'title':title,
        "first_name":first_name,
        "last_name":last_name,
        'name':name,
        'institution':institution,
        'phone':phone,
        'email':email,
        'user_group':user_group,
        'country':country
    }
    #这两行有问题，sources返回为空，cois_s和cois_n都没用上
    cois_s, cois_n = ProposalInvestigator.get_co_value(proposal_id=proposal_id)
    sources = ProposalSourceList.get_source_list_format(proposal_id=proposal_id)
    categories = _category_checked(proposal)
    
    other_content = ProposalScientificCategory.get_other_content(proposal_id=proposal_id)
    with open('app/templates/app/proposal_submit/proposal_pdf.html') as f:
        template = Environment(loader=FileSystemLoader("app/templates/")).from_string(f.read())
    return template.render(proposal=proposal,categories = categories,other_content=other_content, pi=pi, sources=sources,cois_s = ProposalInvestigator.get_co_i(proposal_id=proposal_id),anticipated_too=anticipated_too)
    
def generate_coverpage_pdf(proposal_id, save_path:Union[str,BytesIO]='test_spacer.pdf', from_where='admin'):
    # register_font()
    
    # ----------------- 数据初始化 -----------------------------------------------
    # 科学分类初始化
    
    
    pdf_bytes =  create_pdf_from_html(render_proposal_html(proposal_id))
    save_path.write(pdf_bytes)
    return 
    # 是否再次提交
    resubmit_yes = checkbox
    resubmit_no = checkbox
    resubmit_content = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
    if proposal.resubmission:
        resubmit_yes = checkbox_selected
        resubmit_content = proposal.resubmission_numbers
    else:
        resubmit_no = checkbox_selected

    #
    doc = _create_template(save_path)
    frameWidth = doc.width
    story_builder = StoryBuilder()
    # page1 页眉(id=cover_page)
    story_builder.fill_frame([
        _coverpage_pdf(from_where, proposal),
    ])

    # Proposal Title, id='proposal_title'
    proposal_title_title, proposal_title_content = _title_pdf(proposal, frameWidth)
    story_builder.fill_frame([proposal_title_title,Spacer(12, 14), proposal_title_content])
    
    # Scientific Category, id='scientific_category'
    story_builder.fill_frame([_scientific_category_title_pdf(),Spacer(12, 14),_first_category_pdf(proposal_scientific_categorys),_second_category_pdf(proposal_scientific_categorys),Spacer(12, 3),_third_category_pdf(proposal_scientific_categorys)])
    

    # Abstract, id='proposal_abstract'
    proposal_abstract_title = Paragraph('<b>Proposal Abstract:</b>', black_title_style)
    story_builder.fill_frame([proposal_abstract_title,Spacer(12, 14),_abstract_content_pdf(proposal, frameWidth)])
    
    #
    # 是否之前提交过 id='resubmit'
    story_builder.fill_frame([_resubmit_pdf(resubmit_yes, resubmit_no),_resubmit_content_pdf(resubmit_content, frameWidth)])


    # 申请时长 id='request_hours'
    story_builder.fill_frame([_time_request_pdf(proposal)])
    # PI信息 id='pi'
    pi_information = Paragraph('<b>PI Information:</b>&nbsp;&nbsp;&nbsp;&nbsp;', black_title_2_style)
    story_builder.fill_frame([pi_information,Spacer(12, 16),_pi_table_pdf(name, email, institution, phone),Spacer(12, 10)])
    
    # 合作者 id='ci'
    story = []
    story.append(Paragraph('<b>Co-I Information:</b>&nbsp;&nbsp;&nbsp;&nbsp;', black_title_2_style))
    story.append(Spacer(12, 16))
    story.append(_ci_table_pdf(cois_s, cois_n))
    story_builder.fill_frame(story)
    #
    # 下一页的内容
    story_builder.new_page('frames_2')
    # story.append(PageBreak())

    # story.append(FrameBreak())
    # 源表
    story = []
    story.append(Spacer(12, 6))
    
    
    
    # 处理sources list信息
    sources = ProposalSourceList.get_source_list_format(proposal_id=proposal_id)
    
    story.append(_sources_list_title_pdf(sources))
    story.append(Spacer(12, 6))
    story.append(_sources_list_table_pdf(sources))

    story_builder.fill_frame(story)
    doc.build(story_builder.build())
    # _create_template('a.pdf').build(story)
    
    return save_path

def _third_category_pdf(proposal_scientific_categorys):
    other = checkbox
    other_content = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'


    for c in proposal_scientific_categorys:
        if c.category == 'Other':
            other = checkbox_selected
            other_content = c.category_content
    third_category = Paragraph(other + 'Other(please specify)' + '&nbsp;&nbsp;'
                               + '<u>' + other_content + '</u>',
                               scientific_category_content_style)
                               
    return third_category

def register_font():
    # ---------------  注册字体  ----------------------------------------------
    static_path = current_app.config['APP_STATIC_FOLDER_USED_IN_PY']
    font_path = os.path.join(static_path, 'fonts')
    simsun_font = os.path.join(font_path, 'SimSun.ttf')
    hwzs_font = os.path.join(font_path, 'STzhongsong.ttf')
    wingdings_font = os.path.join(font_path, 'Wingdings.ttf')
    pdfmetrics.registerFont(TTFont('SimSun', simsun_font))
    pdfmetrics.registerFont(TTFont('华文中宋', hwzs_font))
    pdfmetrics.registerFont(TTFont('wingdings', wingdings_font))

def _ci_table_pdf(cois_s, cois_n):
    coi_data = [[name_ins_style, name_ins_style]]
    num = int(cois_n / 2)
    for i in range(0, num):
        a = Paragraph(cois_s[i * 2].name + '/' + cois_s[i * 2].institution, ci_style)
        b = Paragraph(cois_s[i * 2 + 1].name + '/' + cois_s[i * 2 + 1].institution, ci_style)
        coi_data.append([a, b])
    if cois_n % 2 != 0:
        c = Paragraph(cois_s[cois_n - 1].name + '/' + cois_s[cois_n - 1].institution, ci_style)
        coi_data.append([c, ''])

    ci_table = Table(coi_data, colWidths=[9 * cm, 9 * cm])
    ci_table.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, colors.black)]))
    return ci_table

def _pi_table_pdf(name, email, institution, phone):
    pi_name = Paragraph(name, pi_style)
    pi_institution = Paragraph(institution, pi_style)
    pi_email = Paragraph(email, pi_style)
    pi_phone = Paragraph(phone, pi_style)
    table_story = []
    data = [[Paragraph('<b>Name</b>', pi_title_style), pi_name, Paragraph('<b>Institute</b>', pi_title_style), pi_institution], [Paragraph('<b>Email</b>', pi_title_style), pi_email, Paragraph('<b>Tel</b>', pi_title_style), pi_phone]]
    pi_table = Table(data, colWidths=[2 * 18 * cm / 17.0, 6 * 18 * cm / 17.0, 2 * 18 * cm / 17.0, 7 * 18 * cm / 17.0])
    pi_table.setStyle(TableStyle([('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                                  ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                                  ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                                  ('FONTSIZE', (0, 0), (-1, -1), 12),
                                  ]))
    table_story.append(pi_table)
    t_keep = KeepInFrame(18 * cm, 5.8 * cm, table_story, mode='shrink', hAlign='CENTER', vAlign='MIDDLE', fakeWidth=False)
    return t_keep

def _time_request_pdf(proposal):
    time_request = Paragraph('<b>Hours requested for this period(Total):&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b><font name="华文中宋">' + str(proposal.total_time_request) + '</font>', black_title_style)
    return time_request

def _resubmit_content_pdf(resubmit_content, frameWidth):
    proposal_resubmit_content_txt = [Paragraph(resubmit_content, resubmit_content_style_2)]
    resubmit_inframe = KeepInFrame(frameWidth, 1 * cm, proposal_resubmit_content_txt)
    return resubmit_inframe

def _resubmit_pdf(resubmit_yes, resubmit_no):
    proposal_resubmit_content = Paragraph('<b>Resubmission</b> or continuation of any previous proposal(s)?&nbsp;&nbsp;' + 'NO<font name="华文中宋">' + resubmit_no + '</font>&nbsp;&nbsp;' + 'YES<font name="华文中宋">' + resubmit_yes + '</font>-Proposal Number(s):', resubmit_content_style)
    return proposal_resubmit_content

def _line2_pdf():
    line_2 = '___________________________________________________________'
    line2_pdf = Paragraph(line_2, coverpage_2_style)
    return line2_pdf

def _abstract_content_pdf(proposal, frameWidth):
    proposal_content_style = ParagraphStyle(name='content', fontSize=12, leading=12, firstLineIndent=16, alignment=TA_JUSTIFY, fontName='华文中宋')
    proposal_abstract_content = [Paragraph(proposal.proposal_abstract, proposal_content_style)]
    abstract_inframe = KeepInFrame(frameWidth, 8.5 * cm, proposal_abstract_content)
    return abstract_inframe

def _second_category_pdf(proposal_scientific_categorys):
    agn_quasars_blLacObjects_tde = checkbox
    cosmology_egDeepFileds_largeEgAreas = checkbox
    gwec = checkbox
    solarSystemObjects_stars_exoplanets = checkbox
    for c in proposal_scientific_categorys:
        if c.category == 'Active Galactic Nuclei and Tidal Disruption Events':
            agn_quasars_blLacObjects_tde = checkbox_selected
        if c.category == 'Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas':
            cosmology_egDeepFileds_largeEgAreas = checkbox_selected       
        if c.category == 'Gravitational Wave Electromagnetic Counterpart':
            gwec = checkbox_selected
        if c.category == 'Solar System Objects, Stars and Exoplanets':
            solarSystemObjects_stars_exoplanets = checkbox_selected


    second_category = Paragraph(agn_quasars_blLacObjects_tde + 'Active Galactic Nuclei and Tidal Disruption Events' + '&nbsp;&nbsp;'
                                + cosmology_egDeepFileds_largeEgAreas + 'Cosmology, Extragalactic Deep Dields and Large Extragalactic Areas' + '<font size=11.5>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</font>'
                                + gwec + 'Gravitational Wave Electromagnetic Counterpart' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                                scientific_category_content_style)
                                
    return second_category

def _category_checked(proposal:Proposal)->Dict[str,bool]:
    """生成每一个Scientific Category是否被选择的表

    Args:
        proposal (Proposal): _description_

    Returns:
        Dict[str,bool]: _description_
    """
    categories = ['Life-cycle of Stars and Interstellar Medium','Isolated and Binary Compact Objects','Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters',
                  'Active Galactic Nuclei and Tidal Disruption Events',
                  'Solar System Objects, Stars and Exoplanets',
                  'Cosmology, Extragalactic Deep Fields and Large Extragalactic Areas',
                  'Gravitational Wave Electromagnetic Counterpart',
                  'Other'
    ]
    result = {}
    checked = [category.category for category in proposal.proposal_scientific_category]
    for category in categories:
        result[category] = category in checked
    return result
def _first_category_pdf(proposal_scientific_categorys):
    lifeCycleStars = checkbox
    binaryCompactObject = checkbox
    galaxies_groupGalaxies_clusterGalaxies = checkbox
    for c in proposal_scientific_categorys:
        if c.category == 'Life-cycle of Stars and Interstellar Medium':
            lifeCycleStars = checkbox_selected
        if c.category == 'Isolated and Binary Compact Objects':
            binaryCompactObject = checkbox_selected
        if c.category == 'Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters':
            galaxies_groupGalaxies_clusterGalaxies = checkbox_selected
    first_category = Paragraph(lifeCycleStars + 'Life-cycle of Stars and Interstellar Medium' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
                               + binaryCompactObject + 'Isolated and Binary Compact Objects' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
                               + galaxies_groupGalaxies_clusterGalaxies + 'Galaxies, Groups of Galaxies, Clusters of Galaxies and Superclusters' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                               scientific_category_content_style)
                               
    return first_category

def _scientific_category_title_pdf():
    scientific_category = Paragraph('<b>Scientific Category:</b><i><font size=9.5>(tick all that apply)</font></i>', black_title_style)
    return scientific_category

def _title_pdf(proposal, frameWidth):
    proposal_title = Paragraph('<b>Proposal Title:</b>', black_title_style)
    

    # content = ParagraphStyle(name='content', fontSize=12, leading=12, firstLineIndent=16, alignment=TA_JUSTIFY, fontName='华文中宋')
    # proposal_title_content = Paragraph(proposal.proposal_title, content)
    # story.append(proposal_title_content)
    # 标题内容
    content = ParagraphStyle(name='content', fontSize=12, leading=12, firstLineIndent=16, alignment=TA_JUSTIFY, fontName='华文中宋')
    proposal_title_content = [Paragraph(proposal.proposal_title, content)]
    title_inframe = KeepInFrame(frameWidth, 2 * cm, proposal_title_content)
    return proposal_title,title_inframe

def _coverpage_pdf(from_where, proposal):
    no = proposal.get_no()
    if proposal.scientific_review_finished and proposal.priority != 'D':
        no = proposal.pid
    if from_where == 'review':
        no = proposal.get_no()
    txt = '<b>EP Proposal Coverpage &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' \
          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' \
          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' \
          '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' \
          + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font size=12>NO: &nbsp;' + no + '</font></b>'
    coverpage = ParagraphStyle(name='coverPage', fontSize=16, leading=3)
    coverage_pdf = Paragraph(txt, coverpage)
    return coverage_pdf

def _create_template(save_path):
    doc = BaseDocTemplate(save_path, showBoundary=0, pagesize=pagesizes.A4, topMargin=1.5 * cm, bottomMargin=1.5 * cm, leftMargin=1.5 * cm, rightMargin=1.5 * cm)
    frameWidth = doc.width
    frameHeight = doc.height

    # 第一页PDF合并布局

    frames_height = {
        'cover_page': 1,
        'proposal_title': 2,
        'scientific_category': 4.5,
        'proposal_abstract': 8.5,
        # 'line_1': 0.1,
        'resubmit': 2,

        'request_hours': 1,
        'pi': 2.8,
        'ci': 3.8
    }
    frame_list:List[Frame] = []
    current_bottom = 0
    for frame_id,frame_height in frames_height.items():
        current_bottom += frame_height
        frame_list.append(
            Frame(x1=doc.leftMargin, y1=doc.bottomMargin + frameHeight - current_bottom * cm,  width=frameWidth, height= frame_height* cm, leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0, showBoundary=0, id=frame_id),
        )

    # 第二页PDF合并布局
    frame_list_2 = [
        Frame(x1=doc.leftMargin, y1=doc.bottomMargin, width=frameWidth, height=frameHeight, leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0, showBoundary=0, id='every_lines'),
    ]
    doc.addPageTemplates([PageTemplate(id='frames', frames=frame_list), PageTemplate(id='frames_2', frames=frame_list_2)])
    return doc

def _sources_list_table_pdf(sources:List[ProposalSourceList]):
    
    
    source_title_style = ParagraphStyle(name='source_title_style', fontSize=10, leading=12)
    source_data = []
    source_name_title = Paragraph('<b>Src_Name</b>', source_title_style)
    source_des_title = Paragraph('<b>Ra</b>', source_title_style)
    # obs_num_title = Paragraph('<b>Obs_Num.</b>', source_title_style)
    # int_s_title = Paragraph('<b>Int_Time(s)</b>', source_title_style)
    ra_title = Paragraph('<b>Dec</b>', source_title_style)
    dec_title = Paragraph('<b>Ene_Lower</b>', source_title_style)
    energy_level_title = Paragraph('<b>Ene_Upper</b>', source_title_style)
    count_rate_title = Paragraph('<b>Cou_Rate</b>', source_title_style)
    
    # specify_time_title = Paragraph('<b>Spec_Time</b>', source_title_style)
    # variable_source_title = Paragraph('<b>Var_Sou</b>', source_title_style)
    # off_axis_title = Paragraph('<b>Off_Axis</b>', source_title_style)
    # monitoring_title = Paragraph('<b>Moni</b>', source_title_style)
    # preset_too_title = Paragraph('<b>Pre_ToO</b>', source_title_style)
    # source_data.append([source_name_title, source_des_title, int_s_title, ra_title, dec_title, obs_num_title,energy_level_title,count_rate_title,specify_time_title,variable_source_title,off_axis_title,monitoring_title,preset_too_title])
    
    s_list = []

    # 原来代码
    # for s in sources:
    #     s_list.append([Paragraph(s.source_name), Paragraph(s.source_des), Paragraph(str(s.number)),Paragraph(s.integration_time), Paragraph(s.ra), Paragraph(s.dec), Paragraph(s.energy_level), Paragraph(s.count_rate), Paragraph(s.specify_time),Paragraph("Is Variable? "+str(s.variable_source)),Paragraph("Is Off Axis? "+str(s.off_axis)),Paragraph("Is Monitoring? "+str(s.monitoring)),Paragraph("Is Preset ToO? "+str(s.preset_too))])
    for source in sources:
        s_list.append(_source_table_pdf(source))
    source_data.append([source_name_title, source_des_title,  ra_title, dec_title, energy_level_title,count_rate_title])
    # source_data =  [[Paragraph(s) for s in ['a','b','c','d','e','f']]]
    source_data = source_data + s_list
    
    source_table = Table(source_data, colWidths=[3 * cm, 4 * cm, 3 * cm, 3 * cm, 3 * cm, 2 * cm])
    source_table = Table(source_data)
    source_table.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
    # ('TEXTCOLOR',(0,0),(-1,-1),colors.red),
    # ('INNERGRID', (0,0), (-1,-1), 0.25, colors.red),
    # ('BOX', (0,0), (-1,-1), 0.25, colors.black),
    ]))
    return source_table

def _source_table_pdf(source:ProposalSourceList):
    return [
            Paragraph(source.source_name),
            Paragraph(source.ra),
            Paragraph(source.dec),
            Paragraph(str(source.energy_lower)), 
            Paragraph(str(source.energy_upper)),
            Paragraph(str(source.count_rate))
        ]
def _sources_list_title_pdf(sources):
    black_title_3 = ParagraphStyle(name='blackTitle', fontSize=12.5, leading=12)
    source_number = len(sources)
    print(source_number)
    return Paragraph('<b>Source List:</b>&nbsp;&nbsp;<font size=10><i>(Total number of sources: ' + str(source_number) + ', here list first page of them.) </i></font>', black_title_3)

def create_pdf_from_html(html_str:str)->BytesIO:
    
    fio = BytesIO()
    # css_url = url_for('static', filename='pdf.css')
    
    fio = pdfkit.from_string(html_str, False)
    return fio
    # pdf = fitz.open()
    # pdf_bytes = pdf.convert_to_pdf(html_str)
    # pdf = fitz.open("pdf", pdf_bytes)
    # # pdf.save(output_path)

    # return pdf
    