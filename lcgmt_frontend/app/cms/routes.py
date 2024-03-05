from ast import If
from datetime import datetime
from os import error

from flask import render_template, flash, redirect, current_app, request, jsonify, send_from_directory, url_for, abort
from flask_babelex import _
from flask_login import login_required, current_user

from app import db, csrf, OperationLog
from app.cktools import CkFinder
from app.cms import bp
from app.cms.forms import CategoryForm, ArticleForm, CarouselForm, ScienceTeamSurveyForm, ScienceTeamApplyForm,AssociateScienceTeamApplyForm,TAApplyForm
from app.cms.models import CMSCategory, CMSArticle, CMSCarousel, ArticleType,ScienceTeamSurvey, ScienceTeamApplication, AssociateScienceTeamApplication,TAApplication
from app.user.models import AssoSTPUser, User, STPUser
from app.decorators import permission_required
from app.utils import redirect_back
from app.sysadmin.models import SystemMenu
import time,os
from werkzeug.utils import secure_filename
from PyPDF2.pdf import PdfFileReader
from app.email_utils import send_epsm_application_confirm_email, send_epasm_application_confirm_email,send_ta_application_confirm_email
from app.indenpendent_password import check_independent_password
import flask
import json
from typing import Any
# from flask_cors import cross_origin

bp.ckfinder=None


@bp.route('/')
@login_required
@permission_required('CMS_EDIT')
def index():
    catid = request.args.get('catid', -1, type=int)
    recommended = request.args.get('recommended', 0, type=int)
    ontop = request.args.get('ontop', 0, type=int)

    cats = CMSCategory.query.all()
    page = request.args.get('page', 1, type=int)
    page_size = current_app.config['APP_DEFAULT_PAGE_ROWS']
    query=CMSArticle.query
    if catid>0:
        query = query.filter_by(category_id=catid)
    if recommended==1:
        query = query.filter_by(recommended=True)
    if ontop==1:
        query = query.filter_by(ontop=True)
    query=query.order_by(CMSArticle.id.desc())
    pagination = query.paginate(page, page_size)
    return render_template('app/cms/index.html', catid=catid, recommended=recommended, ontop=ontop, cats=cats, pagination=pagination, articles=pagination.items)


@bp.route('/category/')
@login_required
@permission_required('CMS_ADMIN')
def list_category():
    page = request.args.get('page', 1, type=int)
    page_size = current_app.config['APP_DEFAULT_PAGE_ROWS']
    pagination = CMSCategory.query.paginate(page, page_size)
    return render_template('app/cms/category_list.html', pagination=pagination, cats=pagination.items)


@bp.route('/category/edit', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_ADMIN')
def edit_category():
    id = request.args.get('id', -1, type=int)
    form = CategoryForm()
    form.id.render_kw = {'readonly': True}
    form.category_type.choices=[(member.value,name) for name, member in ArticleType.__members__.items()]

    if form.is_submitted():
        if form.validate():
            if -1==id:
              4 cat=CMSCategory()
            else:
                cat=CMSCategory.query.filter_by(id=id).first()
            cat.name=form.name.data
            cat.category_type=ArticleType(form.category_type.data)

            # cat.path=form.path.data
            cat.description=form.description.data
            if -1 == id:
                db.session.add(cat)
                db.session.commit()
                flash(_('Category "{0}" Added.').format(cat.name), 'success')
                OperationLog.add_log(bp.name, 'edit_category, add category '+cat.name, current_user)
            else:
                db.session.commit()
                flash(_('Category "{0}" Updated.').format(cat.name), 'success')
                OperationLog.add_log(bp.name, 'edit_category, edit category ({0}) to {1}'.format(cat.id, cat.name), current_user)
            return redirect(url_for('.list_category'))
    else:
        if -1 != id:
            cat = CMSCategory.query.filter_by(id=id).first()
            form.id.data=cat.id
            form.name.data=cat.name
            form.category_type.data = ArticleType(cat.category_type).value

            # form.path.data=cat.path
            form.description.data=cat.description
    return render_template('app/cms/category_edit.html', form=form)


@bp.route('/category/view', methods=['GET', 'POST'])
def view_category():
    id = request.args.get('id', -1, type=int)
    page = request.args.get('page', 1, type=int)
    page_size = current_app.config['APP_DEFAULT_PAGE_ROWS']
    cat = CMSCategory.query.filter_by(id=id).first()
    q=CMSArticle.query.filter_by(category_id=id).filter_by(published=True).order_by(CMSArticle.order.asc())
    pagination=q.paginate(page, page_size)
    # 通过full path获取对应的menu和它的父id
    system_menu = SystemMenu.query.filter_by(url=request.full_path).first()
    if system_menu is not None:
        system_menu_parent_id = system_menu.parent_id
        # 如果父目录的id不为0，则其父目录为显示目录
        if system_menu_parent_id !=0:
            root_menu_id = system_menu_parent_id
            root_menu_name = SystemMenu.query.filter_by(id=system_menu_parent_id).first().title_en
            selected_menu_name=system_menu.title_en
        # 如果父目录的id为0，则以当前目录为显示目录
        else:
            root_menu_id = system_menu.id
            root_menu_name = system_menu.title_en
            selected_menu_name = ""
    else:
        root_menu_id=0
        root_menu_name = cat.name
        selected_menu_name = cat.name
    
    if cat.category_type == ArticleType.FLATPAGE:
        
        return render_template('app/cms/flatpage_category_view.html', category=cat, pagination=pagination,
                           articles=pagination.items, root_menu_id=root_menu_id,root_menu_name=root_menu_name, selected_menu_name=selected_menu_name)
    else:
        return render_template('app/cms/category_view.html', category=cat, pagination=pagination,
                           articles=pagination.items,root_menu_id=root_menu_id,root_menu_name=root_menu_name, selected_menu_name=selected_menu_name)


@bp.route('/category/del', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_ADMIN')
def delete_category():
    id = request.args.get('id', -1, type=int)
    cat = CMSCategory.query.filter_by(id=id).first_or_404()
    db.session.delete(cat)
    db.session.commit()
    OperationLog.add_log(bp.name, 'delete_category, delete category ({0}): {1}'.format(cat.id, cat.name), current_user)
    return redirect_back()


@bp.route('/article/edit', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_EDIT')
def edit_article():
    id = request.args.get('id', -1, type=int)
    form = ArticleForm()
    form.id.render_kw = {'readonly': True}
    form.category.choices=[(c.id, c.name) for c in CMSCategory.query.all()]
    form.article_type.choices=[(member.value,name) for name, member in ArticleType.__members__.items()]
    if form.is_submitted():
        if form.validate():
            if -1==id:
                art=CMSArticle()
            else:
                art=CMSArticle.query.filter_by(id=id).first()
            art.title=form.title.data
            # art.path=form.path.data
            art.category_id=form.category.data
            art.content=form.content.data
            art.content_text=form.content.data#这里需要将html标签去掉变成txt
            art.created=form.created.data
            # art.ontop=form.ontop.data
            art.thumbnail_path=form.thumbnail_path.data
            art.order= form.order.data
            # art.top_image_path=form.top_image_path.data
            # art.published=form.published.data
            # art.recommended=form.recommended.data
            art.article_type=ArticleType(form.article_type.data)
            art.last_modified=datetime.now()
            art.editor_id=current_user.id
            if -1 == id:
                db.session.add(art)
                db.session.commit()
                flash(_('Article "{0}" Added.').format(art.title), 'success')
                OperationLog.add_log(bp.name, 'edit_article, add article ' + art.title, current_user)
            else:
                db.session.commit()
                flash(_('Article "{0}" Updated.').format(art.title), 'success')
                OperationLog.add_log(bp.name, 'edit_article, edit article ({0}) to {1}'.format(art.id, art.title), current_user)
            return redirect(url_for('.index'))
    else:
        if -1 != id:
            art = CMSArticle.query.filter_by(id=id).first()
            form.id.data=id
            form.title.data=art.title
            # form.path.data=art.path
            form.category.data=art.category_id
            form.content.data=art.content
            # form.ontop.data=art.ontop
            form.created.data = art.created
            form.order.data = art.order
            form.article_type.data = ArticleType(art.article_type).value
            form.thumbnail_path.data=art.thumbnail_path
            # form.top_image_path.data=art.top_image_path
            # form.published.data=art.published
            # form.recommended.data=art.recommended
    return render_template('app/cms/article_edit.html', form=form)


@bp.route('/article/publish', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_ADMIN')
def publish_article():
    id = request.args.get('id', -1, type=int)
    publish = request.args.get('publish', 0, type=int)
    article=CMSArticle.query.filter_by(id=id).first()
    if article:
        if publish:
            article.published=True
            OperationLog.add_log(bp.name, 'publish_article, publish article ({0}): {1}'.format(article.id, article.title), current_user)
        else:
            article.published=False
            OperationLog.add_log(bp.name,'publish_article, withdraw publish article ({0}): {1}'.format(article.id, article.title), current_user)
        db.session.commit()
    return redirect_back()


@bp.route('/article/recommend', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_ADMIN')
def recommend_article():
    id = request.args.get('id', -1, type=int)
    recommended = request.args.get('recommended', 0, type=int)
    article=CMSArticle.query.filter_by(id=id).first()
    if article:
        if recommended:
            article.recommended=True
            OperationLog.add_log(bp.name,'recommend_article, recommend article ({0}): {1}'.format(article.id, article.title),current_user)
        else:
            article.recommended=False
            OperationLog.add_log(bp.name, 'recommend_article, withdraw recommend article ({0}): {1}'.format(article.id, article.title), current_user)
        db.session.commit()
    return redirect_back()


@bp.route('/article/setontop', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_ADMIN')
def setontop_article():
    id = request.args.get('id', -1, type=int)
    ontop = request.args.get('ontop', 0, type=int)
    article=CMSArticle.query.filter_by(id=id).first()
    
    if article:
        if ontop:
            article.ontop=True
            OperationLog.add_log(bp.name, 'setontop_article, set ontop article ({0}): {1}'.format(article.id,article.title),current_user)
        else:
            article.ontop=False
            OperationLog.add_log(bp.name,'setontop_article, withdraw set ontop article ({0}): {1}'.format(article.id, article.title),current_user)
        db.session.commit()
    return redirect_back()

@bp.route('/article/upcoming_event', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_ADMIN')
def setupcoming_event_article():
    id = request.args.get('id', -1, type=int)
    upcoming_event = request.args.get('upcoming_event', 0, type=int)
    article=CMSArticle.query.filter_by(id=id).first()
    if article:
        if upcoming_event:
            article.upcoming_event=True
            OperationLog.add_log(bp.name, 'setupcoming_event_article, set upcoming event article ({0}): {1}'.format(article.id,article.title),current_user)
        else:
            article.upcoming_event=False
            OperationLog.add_log(bp.name,'setupcoming_event_article, withdraw set upcoming event article ({0}): {1}'.format(article.id, article.title),current_user)
        db.session.commit()
    return redirect_back()


@bp.route('/article/view', methods=['GET', 'POST'])
def view_article():
    id = request.args.get('id', -1, type=int)
    # 是否需要独立密码
    if id==84 and not check_independent_password("ARTICLE_84"):
        return flask.render_template("app/indenpent_password/input.html",key="ARTICLE_84")
    if (id==107 or id==123) and not current_user.is_authenticated:
        return current_app.login_manager.unauthorized()
    if (id==107 or id==123)  and not (current_user.can('EPSMC_VIEW') or current_user.can('STP_VIEW')) :
        abort(403)

    preview = request.args.get('preview', 0)
    preview = bool(preview)
    cat = None
    if preview and current_user.can('CMS_EDIT'):
        article=CMSArticle.query.filter_by(id=id).first()
        
    else:
        article = CMSArticle.query.filter_by(id=id).filter_by(published=True).first_or_404()
    if article is not None and not preview:
        article.add_hits()
    

    system_menu = SystemMenu.query.filter_by(url=request.full_path).first()
    if system_menu is None:
        cat = CMSCategory.query.filter_by(id=article.category_id).first()
        system_menu =SystemMenu.query.filter_by(title_en=cat.name).first()
    # 如果 system menu不存在，那么就应该是EP Progress
    if system_menu is None:
        # root_menu_name = "EP Progress"
        # selected_menu_name = "EP Progress"
        root_menu_name = cat.name
        selected_menu_name = cat.name
        root_menu_id = 0
        system_menu_parent_id = None
    else:
4       system_menu_parent_id = system_menu.parent_id

    # 如果父目录的id不为0，则其父目录为显示目录
    if system_menu_parent_id!=None:
        if system_menu_parent_id!=0:
            root_menu_id = system_menu_parent_id
            root_menu_name = SystemMenu.query.filter_by(id=system_menu_parent_id).first().title_en
            selected_menu_name=system_menu.title_en
        # 如果父目录的id为0，则以当前目录为显示目录
        else:
            root_menu_id = system_menu.id
            root_menu_name = system_menu.title_en
            selected_menu_name = ""
    if cat is not None and ( cat.name == "EP Document" or cat.name=="Meeting Summary"):
        return flask.render_template('app/cms/smc_article_view.html', article=article, root_menu_id=root_menu_id,root_menu_name=root_menu_name,selected_menu_name=selected_menu_name)

    if article.article_type == ArticleType.FLATPAGE:
       
        return flask.render_template('app/cms/flatpage_view.html', article=article, root_menu_id=root_menu_id,root_menu_name=root_menu_name,selected_menu_name=selected_menu_name)

    else:
        return flask.render_template('app/cms/article_view.html', article=article, root_menu_id=root_menu_id,root_menu_name=root_menu_name,selected_menu_name=selected_menu_name)



@bp.route('/article/del', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_EDIT')
def delete_article():
    id = request.args.get('id', -1, type=int)
    art = CMSArticle.query.filter_by(id=id).first_or_404()
    db.session.delete(art)
    db.session.commit()
    OperationLog.add_log(bp.name, 'delete_article, delete article ({0}): {1}'.format(art.id, art.title), current_user)
    return redirect_back()


@bp.route('/files/<path:filename>')
def files(filename):
    if '.9/' in filename:
        return '{{ "status":"invalid {name}", "{name}":"{value} }}'.format(name='filename', value=filename)
    return send_from_directory(current_app.config['CMS_SAVE_PATH'], filename)


def valid_path(path):
    return path.startswith(current_app.config['CMS_RELATIVE_PATH']) and len(path)>0 and '../' not in path

@bp.route('/filemanager', methods=['POST','GET'])
@csrf.exempt
@login_required
@permission_required('CMS_EDIT')
def filemanager():
    if None == bp.ckfinder:
        bp.ckfinder = CkFinder(current_app.config['CMS_SAVE_PATH'], current_app.config['CMS_RELATIVE_PATH'])
    #
    if request.method == 'POST':
        # 修改了filemanager/scripts/jquery.filetree/jqueryFileTree.js，从$.post变成$.get。现在使用post的只有upload
        currentpath = request.values.get('currentpath', '')
        if not valid_path(currentpath):
            return '{{ "status":"invalid {name}", "{name}":"{value} }}'.format(name="currentpath", value=currentpath)
        file = request.files['upload']
        OperationLog.add_log(bp.name, 'filemanager, upload file {0} {1}'.format(currentpath, file.filename), current_user)
        return bp.ckfinder.upload(currentpath, file)
        #
    elif request.method == 'GET':
        action = request.args.get('mode', '')
        # for name in ('path', 'dir', 'old', 'name'): bug fix name is the file name ,should not been checked by path validation
        for name in ('path', 'dir', 'old'):
            if name in request.args:
                val = request.args.get(name)
                if not valid_path(val):
                    return '{{ "status":"invalid {name}", "{name}":"{value} }}'.format(name=name, value=val)
        #
        path = request.args.get("path", "")
        
        #
        if "listdir" == action:#给filetree提供数据
            request_dir = request.values.get('dir', '')
            return bp.ckfinder.list_dir(request_dir)

        elif "getinfo" == action:
            info = bp.ckfinder.get_info(path)
            return jsonify(info)

        elif "getfolder" == action:
            return jsonify(bp.ckfinder.get_dir_file(path))
        elif "rename" == action:
            old_name = request.args.get("old", "")
            new_name = request.args.get("new", "")
            if '/' in new_name:
                return '{{ "status":"invalid {name}", "{name}":"{value} }}'.format(name='new', value=val)
            OperationLog.add_log(bp.name, 'filemanager, rename file {0} to {1}'.format(old_name, new_name), current_user)
            return bp.ckfinder.rename(old_name, new_name)

        elif "delete" == action:
            OperationLog.add_log(bp.name, 'filemanager, delete file {0}'.format(path),current_user)
            return bp.ckfinder.delete(path)

        elif "addfolder" == action:
            name = request.args.get("name", "")
            OperationLog.add_log(bp.name, 'filemanager, addfolder {0} {1}'.format(path, name), current_user)
            return bp.ckfinder.addfolder(path, name)

        elif "thumbnail" == action:
            w = request.args.get("w","")
            h = request.args.get("h","")
            # if 64==w and 64==h:
            #     return path
            # else:
            return bp.ckfinder.resize_image(path, 64)
                # return jsonify(Code=0,Thumbnail=outfile)
        return '{"status":"error"}'


@bp.route('/carousel/')
@login_required
@permission_required('CMS_EDIT')
def list_carousel():
    catid = request.args.get('catid', -1, type=int)
    page = request.args.get('page', 1, type=int)
    page_size = current_app.config['APP_DEFAULT_PAGE_ROWS']
    query = CMSCarousel.query
    if catid > -1:
        query = query.filter_by(category_id=catid)
    query = query.order_by(CMSCarousel.category_id.asc(), CMSCarousel.order.asc())
    pagination = query.paginate(page, page_size)
    return render_template('app/cms/carousel_list.html', items=pagination.items, pagination=pagination)


@bp.route('/carousel/edit', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_EDIT')
def edit_carousel():
    id = request.args.get('id', -1, type=int)
    form = CarouselForm()
    form.id.render_kw = {'readonly': True}
    choices = [(0,_('Home'))]
    choices.extend([(c.id, c.name) for c in CMSCategory.query.all()])
    form.category.choices =choices
    if form.is_submitted():
        if form.validate():
            if -1==id:
                car=CMSCarousel()
            else:
                car=CMSCarousel.query.filter_by(id=id).first()
            car.category_id=form.category.data
            car.title=form.title.data
            car.content=form.content.data
            car.link=form.link.data
            car.image_url=form.image_url.data
            car.order=form.order.data
            if -1 == id:
                db.session.add(car)
                db.session.commit()
                flash(_('Carousel "{0}" Added.').format(car.title), 'success')
                OperationLog.add_log(bp.name, 'edit_carousel, add carousel '+car.title, current_user)
            else:
                db.session.commit()
                flash(_('Carousel "{0}" Updated.').format(car.title), 'success')
                OperationLog.add_log(bp.name, 'edit_carousel, edit carousel ({0}) to {1}'.format(car.id, car.title), current_user)
            return redirect(url_for('.list_carousel'))
    else:
        if -1 != id:
            car = CMSCarousel.query.filter_by(id=id).first()
            form.id.data=car.id
            form.title.data=car.title
            form.content.data=car.content
            form.category.data=car.category_id
            form.link.data=car.link
            form.image_url.data=car.image_url
            form.order.data=car.order
    return render_template('app/cms/carousel_edit.html', form=form)


@bp.route('/carousel/del', methods=['GET', 'POST'])
@login_required
@permission_required('CMS_EDIT')
def delete_carousel():
    id = request.args.get('id', -1, type=int)
    car = CMSCarousel.query.filter_by(id=id).first_or_404()
    db.session.delete(car)
    db.session.commit()
    OperationLog.add_log(bp.name, 'delete_carousel, delete carousel ({0}): {1}'.format(car.id, car.title), current_user)
    return redirect_back()

@bp.route('/science_team_list', methods=['GET'])
def science_team_list():
    article = CMSArticle.query.filter_by(id=104).first()
    return render_template('app/cms/science_team_list.html', article=article)

@bp.route('/stp_regular_members', methods=['GET'])
def stp_regular_members():
    article = CMSArticle.query.filter_by(id=106).first()
    return render_template('app/cms/science_team_list.html', article=article)

@bp.route('/science_topical_panels', methods=['GET'])
def science_topical_panels():
    if not current_user.can('EPSMC_VIEW'):
        abort(403)
    article = CMSArticle.query.filter_by(id=107).first()

    return render_template('app/cms/science_team_list.html', article=article)

@bp.route('/science_team_survey', methods=['GET', 'POST'])
def science_team_survey():
    form =ScienceTeamSurveyForm()
    # form.id.render_kw = {'readonly': True}
    # form.category_type.choices=[(member.value,name) for name, member in ArticleType.__members__.items()]

    if form.is_submitted():
        if form.validate():
            # if -1==id:
            #     cat=CMSCategory()
            # # else:
            #     cat=CMSCategory.query.filter_by(id=id).first()
            sta = ScienceTeamSurvey()
            sta.name = form.name.data
            sta.title = form.title.data
            sta.institute = form.institute.data
            # sta.address = form.address.data
            sta.email = form.email.data
            # sta.telephone = form.telephone.data
            sta.reseach_type = form.reseach_type.data
            sta.observation_research = form.observation_research.data
            sta.how_to_analyze_data = form.how_to_analyze_data.data
            sta.expected_joint_doctoral_candidate = form.expected_joint_doctoral_candidate.data
            sta.expected_joint_postdoctoral = form.expected_joint_postdoctoral.data
            #1.Active Galactic Nuclei & Tidal Disruption Events
            sta.agntde = form.agntde.data
            if sta.agntde == True:
                 # 题目,发表期刊,发表年份,作者排名,是否通讯作者
                agntde_paper1 = form.agntde_p1_title.data+","+form.agntde_p1_journal.data+","+form.agntde_p1_year.data+","+str(form.agntde_p1_rank.data)+","+str(form.agntde_p1_ca.data)
                agntde_paper2 = form.agntde_p2_title.data+","+form.agntde_p2_journal.data+","+form.agntde_p2_year.data+","+str(form.agntde_p2_rank.data)+","+str(form.agntde_p2_ca.data)
                agntde_paper3 = form.agntde_p3_title.data+","+form.agntde_p3_journal.data+","+form.agntde_p3_year.data+","+str(form.agntde_p3_rank.data)+","+str(form.agntde_p3_ca.data)
                agntde_paper =agntde_paper1+"\r\n"+agntde_paper2+"\r\n"+agntde_paper3
                sta.agntde_paper = agntde_paper
          
            #2.Fast Extragalactic Transients
            sta.fet = form.fet.data
            if sta.fet == True:
                 # 题目,发表期刊,发表年份,作者排名,是否通讯作者
                fet_paper1 = form.fet_p1_title.data+","+form.fet_p1_journal.data+","+form.fet_p1_year.data+","+str(form.fet_p1_rank.data)+","+str(form.fet_p1_ca.data)
                fet_paper2 = form.fet_p2_title.data+","+form.fet_p2_journal.data+","+form.fet_p2_year.data+","+str(form.fet_p2_rank.data)+","+str(form.fet_p2_ca.data)
                fet_paper3 = form.fet_p3_title.data+","+form.fet_p3_journal.data+","+form.fet_p3_year.data+","+str(form.fet_p3_rank.data)+","+str(form.fet_p3_ca.data)
                fet_paper =fet_paper1+"\r\n"+fet_paper2+"\r\n"+fet_paper3
                sta.fet_paper = fet_paper
          
            #3.Multi-messenger Astronomy
            sta.mma = form.mma.data
            if sta.mma == True:
                 # 题目,发表期刊,发表年份,作者排名,是否通讯作者
                mma_paper1 = form.mma_p1_title.data+","+form.mma_p1_journal.data+","+form.mma_p1_year.data+","+str(form.mma_p1_rank.data)+","+str(form.mma_p1_ca.data)
                mma_paper2 = form.mma_p2_title.data+","+form.mma_p2_journal.data+","+form.mma_p2_year.data+","+str(form.mma_p2_rank.data)+","+str(form.mma_p2_ca.data)
                mma_paper3 = form.mma_p3_title.data+","+form.mma_p3_journal.data+","+form.mma_p3_year.data+","+str(form.mma_p3_rank.data)+","+str(form.mma_p3_ca.data)
                mma_paper =mma_paper1+"\r\n"+mma_paper2+"\r\n"+mma_paper3
                sta.mma_paper = mma_paper

            #4.Compact Stellar Objects
            sta.cso = form.cso.data
            if sta.cso == True:
                 # 题目,发表期刊,发表年份,作者排名,是否通讯作者
                cso_paper1 = form.cso_p1_title.data+","+form.cso_p1_journal.data+","+form.cso_p1_year.data+","+str(form.cso_p1_rank.data)+","+str(form.cso_p1_ca.data)
                cso_paper2 = form.cso_p2_title.data+","+form.cso_p2_journal.data+","+form.cso_p2_year.data+","+str(form.cso_p2_rank.data)+","+str(form.cso_p2_ca.data)
                cso_paper3 = form.cso_p3_title.data+","+form.cso_p3_journal.data+","+form.cso_p3_year.data+","+str(form.cso_p3_rank.data)+","+str(form.cso_p3_ca.data)
                cso_paper =cso_paper1+"\r\n"+cso_paper2+"\r\n"+cso_paper3
                sta.cso_paper = cso_paper

            #5.Observatory Science
            sta.os = form.os.data
            if sta.os == True:
                sta.os_type = form.os_type.data
                os_paper1 = form.os_p1_title.data+","+form.os_p1_journal.data+","+form.os_p1_year.data+","+str(form.os_p1_rank.data)+","+str(form.os_p1_ca.data)
                os_paper2 = form.os_p2_title.data+","+form.os_p2_journal.data+","+form.os_p2_year.data+","+str(form.os_p2_rank.data)+","+str(form.os_p2_ca.data)
                os_paper3 = form.os_p3_title.data+","+form.os_p3_journal.data+","+form.os_p3_year.data+","+str(form.os_p3_rank.data)+","+str(form.os_p3_ca.data)
                os_paper =os_paper1+"\r\n"+os_paper2+"\r\n"+os_paper3
                sta.os_paper = os_paper

            #6.Follow-up Observation Activities
            sta.fuoa = form.fuoa.data
            if sta.fuoa == True:
                sta.fuoa_intro = form.fuoa_intro.data
                fuoa_paper1 = form.fuoa_p1_title.data+","+form.fuoa_p1_journal.data+","+form.fuoa_p1_year.data+","+str(form.fuoa_p1_rank.data)+","+str(form.fuoa_p1_ca.data)
                fuoa_paper2 = form.fuoa_p2_title.data+","+form.fuoa_p2_journal.data+","+form.fuoa_p2_year.data+","+str(form.fuoa_p2_rank.data)+","+str(form.fuoa_p2_ca.data)
                fuoa_paper3 = form.fuoa_p3_title.data+","+form.fuoa_p3_journal.data+","+form.fuoa_p3_year.data+","+str(form.fuoa_p3_rank.data)+","+str(form.fuoa_p3_ca.data)
                fuoa_paper =fuoa_paper1+"\r\n"+fuoa_paper2+"\r\n"+fuoa_paper3
                sta.fuoa_paper = fuoa_paper
            sta.comment = form.comment.data
            db.session.add(sta)
            db.session.commit()
            # flash(_('调查提交成功，感谢您的支持！').format(sta.name), 'success')
    0       # OperationLog.add_log(bp.name, '', add category '+sta.name, current_user)
            # return redirect(url_for('main.index'))
            # rethrn render_template('app/cms/science_team_user_view.html', form=form)
            return render_template('app/cms/survey_thanks.html')
        else:
            flash(_('提交失败，请检查以下错误：{0}').format(form.errors), 'success')
    return render_template('app/cms/science_team_survey.html', form=form)

@bp.route('/associate_science_team_apply', methods=['GET', 'POST'])
def associate_science_team_apply():
    form =AssociateScienceTeamApplyForm()
    if form.is_submitted():
        if form.validate():
            sta = AssociateScienceTeamApplication()
            sta.referer_name = form.referer_name.data
            sta.referer_family_name = form.referer_family_name.data
            sta.referer_given_name = form.referer_given_name.data
            sta.name1 = form.name1.data
            sta.family_name1= form.family_name1.data
            sta.given_name1 = form.given_name1.data
            sta.title1 = form.title1.data
            sta.institute1 = form.institute1.data
            sta.email1 = form.email1.data
            stp1 = request.form.get('stp').lower()
            if stp1=='agntde1':
                sta.agntde1 =True
            elif stp1=='fet1':
                sta.fet1 = True
            elif stp1=='mma1':
                sta.mma1 = True
            elif stp1=='cso1':
                sta.cso1 = True
            elif stp1=='os1':
                sta.os1 = True
            sta.fuoa1 = form.fuoa1.data
            sta.intro1 = form.intro1.data

            sta.name2 = form.name2.data
            sta.family_name2= form.family_name2.data
            sta.given_name2 = form.given_name2.data
            sta.title2 = form.title2.data
            sta.institute2 = form.institute2.data
            sta.email2 = form.email2.data
            stp2 = request.form.get('stp2')
            if stp2=='agntde2':
                sta.agntde2 =True
            elif stp2=='fet2':
                sta.fet2 = True
            elif stp2=='mma2':
                sta.mma2 = True
            elif stp2=='cso2':
                sta.cso2 = True
            elif stp2=='os2':
                sta.os2 = True
            sta.fuoa2 = form.fuoa2.data
            sta.intro2 = form.intro2.data

            sta.name3 = form.name3.data
            sta.family_name3= form.family_name3.data
            sta.given_name3 = form.given_name3.data
            sta.title3 = form.title3.data
            sta.institute3 = form.institute3.data
            sta.email3 = form.email3.data
            stp3 = request.form.get('stp3')
            if stp3=='agntde3':
                sta.agntde3 =True
            elif stp3=='fet3':
                sta.fet3 = True
            elif stp3=='mma3':
                sta.mma3 = True
            elif stp3=='cso3':
                sta.cso3 = True
            elif stp3=='os3':
                sta.os3 = True
            sta.fuoa3 = form.fuoa3.data
            sta.intro3 = form.intro3.data

            db.session.add(sta)
            db.session.commit()
            # send_epasm_application_confirm_email(sta.email)
            return render_template('app/cms/associate_member_thanks.html')
        else:
            flash(_('提交失败，请检查以下错误：{0}').format(form.errors), 'error')

    return render_template('app/cms/associate_science_team_apply.html', form=form)



@bp.route('/get_associate_scienece_team_csv', methods=['GET'])
@login_required
@permission_required('CMS_ADMIN')
def get_associate_scienece_team_csv():
    import csv
    rows = AssociateScienceTeamApplication.query.all()
    unique_rows = {}
    for row in rows:
        if row.referer_name in unique_rows:
            if row.submit_time > unique_rows[row.referer_name].submit_time:
                unique_rows[row.referer_name] = row
        else:
            unique_rows[row.referer_name] = row
     # Create a list to store the new rows
    new_rows = []
    # Split each row into three new rows based on name1, name2, name3
    for row in unique_rows.values():
        new_rows.append({'referer_name': row.referer_name, 'referer_given_name': row.referer_given_name, 'referer_family_name': row.referer_family_name, 'name': row.name1, 'given_name': row.given_name1, 'family_name': row.family_name1, 'title': row.title1, 'institute': row.institute1,'email': row.email1,'stp1': row.agntde1,'stp2': row.fet1,'stp3': row.mma1,'stp4': row.cso1,'stp5': row.os1,'stp6': row.fuoa1,'intro': row.intro1,'submit_time':row.submit_time})
        if row.name2 is not None and len(row.name2)>0:
            new_rows.append({'referer_name': row.referer_name, 'referer_given_name': row.referer_given_name, 'referer_family_name': row.referer_family_name, 'name': row.name2, 'given_name': row.given_name2, 'family_name': row.family_name2, 'title': row.title2, 'institute': row.institute2,'email': row.email2,'stp1': row.agntde2,'stp2': row.fet2,'stp3': row.mma2,'stp4': row.cso2,'stp5': row.os2,'stp6': row.fuoa2,'intro': row.intro2,'submit_time':row.submit_time})
        if row.name3 is not None and len(row.name3)>0:
            new_rows.append({'referer_name': row.referer_name, 'referer_given_name': row.referer_given_name, 'referer_family_name': row.referer_family_name, 'name': row.name3, 'given_name': row.given_name3, 'family_name': row.family_name3, 'title': row.title3, 'institute': row.institute3,'email': row.email3,'stp1': row.agntde3,'stp2': row.fet3,'stp3': row.mma3,'stp4': row.cso3,'stp5': row.os3,'stp6': row.fuoa3,'intro': row.intro3,'submit_time':row.submit_time})
    # Save the new rows to a CSV file
    with open('/Users/xuyunfei/tdic/data/associate_scienece_team5.csv', 'w', newline='') as csvfile:
        fieldnames = ['referer_name', 'referer_given_name', 'referer_family_name', 'name', 'given_name', 'family_name', 'title','institute','email','stp1','stp2','stp3','stp4','stp5','stp6','intro','submit_time']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in new_rows:
            writer.writerow(row)

    return 'File saved successfully'

@bp.route('/science_team_apply', methods=['GET', 'POST'])
def science_team_apply():
    form =ScienceTeamApplyForm()
    # form.id.render_kw = {'readonly': True}
    # form.category_type.choices=[(member.value,name) for name, member in ArticleType.__members__.items()]

    if form.is_submitted():
        if form.validate():
            # if -1==id:
            #     cat=CMSCategory()
            # # else:
            #     cat=CMSCategory.query.filter_by(id=id).first()
            sta = ScienceTeamApplication()
            sta.name = form.name.data
            sta.title = form.title.data
            sta.institute = form.institute.data
            # sta.address = form.address.data
            sta.email = form.email.data
            # sta.telephone = form.telephone.data
            sta.reseach_type = form.reseach_type.data
            sta.observation_research = form.observation_research.data
            # sta.how_to_analyze_data = form.how_to_analyze_data.data
            # sta.expected_joint_doctoral_candidate = form.expected_joint_doctoral_candidate.data
            # sta.expected_joint_postdoctoral = form.expected_joint_postdoctoral.data
            #1.Active Galactic Nuclei & Tidal Disruption Events
            sta.agntde = form.agntde.data
            if sta.agntde == True:
                 # 题目,发表期刊,发表年份,作者排名,是否通讯作者
                agntde_paper1 = form.agntde_p1_title.data+","+form.agntde_p1_journal.data+","+form.agntde_p1_year.data+","+str(form.agntde_p1_rank.data)+","+str(form.agntde_p1_ca.data)
                agntde_paper2 = form.agntde_p2_title.data+","+form.agntde_p2_journal.data+","+form.agntde_p2_year.data+","+str(form.agntde_p2_rank.data)+","+str(form.agntde_p2_ca.data)
                agntde_paper3 = form.agntde_p3_title.data+","+form.agntde_p3_journal.data+","+form.agntde_p3_year.data+","+str(form.agntde_p3_rank.data)+","+str(form.agntde_p3_ca.data)
                agntde_paper =agntde_paper1+"\r\n"+agntde_paper2+"\r\n"+agntde_paper3
                sta.agntde_paper = agntde_paper
          
            #2.Fast Extragalactic Transients
            sta.fet = form.fet.data
            if sta.fet == True:
                 # 题目,发表期刊,发表年份,作者排名,是否通讯作者
                fet_paper1 = form.fet_p1_title.data+","+form.fet_p1_journal.data+","+form.fet_p1_year.data+","+str(form.fet_p1_rank.data)+","+str(form.fet_p1_ca.data)
                fet_paper2 = form.fet_p2_title.data+","+form.fet_p2_journal.data+","+form.fet_p2_year.data+","+str(form.fet_p2_rank.data)+","+str(form.fet_p2_ca.data)
                fet_paper3 = form.fet_p3_title.data+","+form.fet_p3_journal.data+","+form.fet_p3_year.data+","+str(form.fet_p3_rank.data)+","+str(form.fet_p3_ca.data)
                fet_paper =fet_paper1+"\r\n"+fet_paper2+"\r\n"+fet_paper3
                sta.fet_paper = fet_paper
          
            #3.Multi-messenger Astronomy
            sta.mma = form.mma.data
            if sta.mma == True:
                 # 题目,发表期刊,发表年份,作者排名,是否通讯作者
                mma_paper1 = form.mma_p1_title.data+","+form.mma_p1_journal.data+","+form.mma_p1_year.data+","+str(form.mma_p1_rank.data)+","+str(form.mma_p1_ca.data)
                mma_paper2 = form.mma_p2_title.data+","+form.mma_p2_journal.data+","+form.mma_p2_year.data+","+str(form.mma_p2_rank.data)+","+str(form.mma_p2_ca.data)
                mma_paper3 = form.mma_p3_title.data+","+form.mma_p3_journal.data+","+form.mma_p3_year.data+","+str(form.mma_p3_rank.data)+","+str(form.mma_p3_ca.data)
                mma_paper =mma_paper1+"\r\n"+mma_paper2+"\r\n"+mma_paper3
                sta.mma_paper = mma_paper

            #4.Compact Stellar Objects
            sta.cso = form.cso.data
            if sta.cso == True:
                 # 题目,发表期刊,发表年份,作者排名,是否通讯作者
                cso_paper1 = form.cso_p1_title.data+","+form.cso_p1_journal.data+","+form.cso_p1_year.data+","+str(form.cso_p1_rank.data)+","+str(form.cso_p1_ca.data)
                cso_paper2 = form.cso_p2_title.data+","+form.cso_p2_journal.data+","+form.cso_p2_year.data+","+str(form.cso_p2_rank.data)+","+str(form.cso_p2_ca.data)
                cso_paper3 = form.cso_p3_title.data+","+form.cso_p3_journal.data+","+form.cso_p3_year.data+","+str(form.cso_p3_rank.data)+","+str(form.cso_p3_ca.data)
                cso_paper =cso_paper1+"\r\n"+cso_paper2+"\r\n"+cso_paper3
                sta.cso_paper = cso_paper

            #5.Observatory Science
            sta.os = form.os.data
            if sta.os == True:
                sta.os_type = form.os_type.data
                os_paper1 = form.os_p1_title.data+","+form.os_p1_journal.data+","+form.os_p1_year.data+","+str(form.os_p1_rank.data)+","+str(form.os_p1_ca.data)
                os_paper2 = form.os_p2_title.data+","+form.os_p2_journal.data+","+form.os_p2_year.data+","+str(form.os_p2_rank.data)+","+str(form.os_p2_ca.data)
                os_paper3 = form.os_p3_title.data+","+form.os_p3_journal.data+","+form.os_p3_year.data+","+str(form.os_p3_rank.data)+","+str(form.os_p3_ca.data)
                os_paper =os_paper1+"\r\n"+os_paper2+"\r\n"+os_paper3
                sta.os_paper = os_paper

            #6.Follow-up Observation Activities
            sta.fuoa = form.fuoa.data
            if sta.fuoa == True:
                sta.fuoa_intro = form.fuoa_intro.data
                fuoa_paper1 = form.fuoa_p1_title.data+","+form.fuoa_p1_journal.data+","+form.fuoa_p1_year.data+","+str(form.fuoa_p1_rank.data)+","+str(form.fuoa_p1_ca.data)
                fuoa_paper2 = form.fuoa_p2_title.data+","+form.fuoa_p2_journal.data+","+form.fuoa_p2_year.data+","+str(form.fuoa_p2_rank.data)+","+str(form.fuoa_p2_ca.data)
                fuoa_paper3 = form.fuoa_p3_title.data+","+form.fuoa_p3_journal.data+","+form.fuoa_p3_year.data+","+str(form.fuoa_p3_rank.data)+","+str(form.fuoa_p3_ca.data)
                fuoa_paper =fuoa_paper1+"\r\n"+fuoa_paper2+"\r\n"+fuoa_paper3
                sta.fuoa_paper = fuoa_paper
            # 申请表文件
            application_file = request.files.get('application_file')
            # 承诺书文件
            # commitement_file = request.files.get('commitment_file')

            sta.be_chair = form.be_chair.data == 'True'
            # 上传申请表文件
            application_file_path = upload_application_file(sta.email,application_file,'application' )
            # 上传承诺书文件
            # commitement_file_path =upload_application_file(sta.email,commitement_file,'commitment' )
            # if application_file_path !="file upload failed" and commitement_file_path!="file upload failed":
            if application_file_path !="file upload failed":  
                sta.application_file = application_file_path
                # sta.commitment_file = commitement_file_path
                db.session.add(sta)
                db.session.commit()
                send_epsm_application_confirm_email(sta.email)
                return render_template('app/cms/apply_thanks.html')
            else:
                flash('文件上传失败，请稍后再试','error')
            # flash(_('调查提交成功，感谢您的支持！').format(sta.name), 'success')
            # OperationLog.add_log(bp.name, '', add category '+sta.name, current_user)
            # return redirect(url_for('main.index'))
            # return render_template('app/cms/science_team_user_view.html', form=form)
            
        else:
            flash(_('提交失败，请检查以下错误：{0}').format(form.errors), 'error')

    
    return render_template('app/cms/science_team_apply.html', form=form)


@bp.route('/ta_apply', methods=['GET', 'POST'])
@login_required
def ta_apply():
    form =TAApplyForm()
    if request.method == 'GET':
        stp_user = AssoSTPUser.query.filter(AssoSTPUser.user_id==current_user.id).first()
        if stp_user is None:
            stp_user = STPUser.query.filter(STPUser.user_id==current_user.id).first()
            if stp_user is None:
                stp_user = current_user
        
        if hasattr(stp_user, 'chinese_name'):
            form.name.data = stp_user.chinese_name
        else:
            form.name.data = stp_user.name
        if hasattr(stp_user, 'affiliation'):
            form.institute.data = stp_user.affiliation
        form.email.data = stp_user.email
        if hasattr(stp_user, 'stp'):
            form.stp.data = stp_user.stp
        else:
            form.stp.data = 0
            form.stp.render_kw = {'readonly': True}
        if hasattr(stp_user, 'referer_id'):
            stp = STPUser.query.filter(STPUser.id==stp_user.referer_id).first()
            form.co_stp_name.data = stp.name
        return render_template('app/cms/ta_apply.html', form=form)
    else:

        if form.is_submitted():
            if form.validate():
            
                sta = TAApplication()
                sta.name = form.name.data
                sta.position = form.position.data
                # sta.stp = ("").join([option for selected, option in zip(form.stp.data, stp_option_list) if selected])
                sta.stp = form.stp.data
                sta.institute = form.institute.data
                sta.email = form.email.data
                sta.telephone = form.telephone.data
                sta.co_stp_name = form.co_stp_name.data
                sta.remark = form.remark.data
                db.session.add(sta)
                db.session.commit()
                send_ta_application_confirm_email(sta.email)
                return render_template('app/cms/apply_thanks.html')
                
                
            else:
                flash(_('Submit failed, please check the errors：{0}').format(form.errors), 'error')

        return render_template('app/cms/ta_apply.html', form=form)



def upload_application_file(email, file,filetype):
    application_display_name = file.filename
    application_storage_name = secure_filename(email+ '_'+filetype+'_' + time.strftime("%Y%m%d%H%M%S", time.localtime()) + '.pdf')
    file.filename = application_storage_name
    # 保存文件

    application_save_path = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'stapplication')

    filepath = os.path.join(application_save_path, application_storage_name)
    file.save(filepath)

    # 获取页数，格式等信息，是否保存成功
    #  保存文件的位置
    # application_save_path = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'stapplication')
    # season_path = os.path.join(s.get_this_season_dir(), 'case')
    # filepath = os.path.join(application_save_path, application_storage_name)
    # 是否可读，页数是否超出，删除数据
    try:
        file_open = open(filepath, 'rb')
        pdf_file = PdfFileReader(file_open, strict=False)
        # page_count = pdf_file.getNumPages()
        file_open.close()
        return application_storage_name
        # if page_count > 4:
        #     if os.path.exists(filepath):
        #         try:
        #             os.remove(filepath)
        #         except:
        #             pass
        #     return jsonify({'success': 'not_ok_pages'})
    except:
        if os.path.exists(filepath):
            try:
                file_open.close()
                os.remove(filepath)
            except:
                pass
        return "file upload failed"

    # 更新数据库
    # db.session.query(Proposal).filter(Proposal.id == proposal_id).update({'science_case_display_name': science_case_display_name, 'science_case_storage_name': science_case_storage_name, 'science_case_upload_status': True})
    # db.session.commit()
    # return jsonify({'display_name': science_case_display_name, 'success': 'ok'})

@bp.route('/stadmin', methods=['GET'])
@login_required
@permission_required('CMS_EDIT')
def science_team_apply_admin_access():
    return render_template('app/cms/stadmin.html')

@bp.route('/helpdesk', methods=['GET'])
# @login_required
# @permission_required('CMS_EDIT')
# @csrf.exempt
# @cross_origin()
def helpdesk():
    return render_template('app/cms/helpdesk.html')

@bp.route('/science_team_apply_admin', methods=['GET'])
@login_required
@permission_required('CMS_EDIT')
def science_team_apply_admin():
    sta = ScienceTeamApplication.query.all()
    js= json.dumps(sta, cls=STAEncoder)
    return js


@bp.route('/science_team_apply_detail', methods=['GET'])
@login_required
@permission_required('CMS_EDIT')
def sta_detail():
    id=request.args.get("id")
    form =ScienceTeamApplyForm()
    sta = ScienceTeamApplication.query.filter(ScienceTeamApplication.id==id).first()
    stapp_dir = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'stapplication')
    return render_template('app/cms/science_team_application_detail.html',sta=sta,form=form,stapp_dir=stapp_dir)


@bp.route('/get_stappfile/<path:filename>')
@login_required
@permission_required('CMS_EDIT')
def get_stappfile(filename):
    stapp_dir = os.path.join(current_app.config['APP_UPLOAD_PATH'], 'stapplication')
    return send_from_directory(stapp_dir, filename)

class STAEncoder(json.JSONEncoder):
    def default(self, o: Any) -> Any:
        if isinstance(o,ScienceTeamApplication):
            return {
                "id":o.id,
                "name":o.name,
                "title":o.title,
                "institute":o.institute,
                "email":o.email,
                "agntde":o.agntde,
                "fet":o.fet,
                "mma":o.mma,
                "cso":o.cso,
                "os":o.os,
                "fuoa":o.fuoa,
                "be_chair":o.be_chair
            }
        return super().default(o)