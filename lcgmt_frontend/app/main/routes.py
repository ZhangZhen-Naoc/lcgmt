from datetime import datetime, timedelta

from flask import g, render_template, flash, current_app, request, send_from_directory, make_response, jsonify, session, \
    url_for, send_file
from flask_babelex import get_locale, _
from flask_login import current_user
from sqlalchemy import and_, or_
from werkzeug.utils import redirect

from app.cms.models import CMSArticle
from app.extensions import db
from app.main import bp
import time

@bp.before_app_request
def before_request():
    g.locale = str(get_locale())


@bp.route('/static/js/aladinv3/fd8a3beaf6c9e11e9ba2.module.wasm')
def wasm():
    return send_file('./static/js/aladinv3/fd8a3beaf6c9e11e9ba2.module.wasm', mimetype = 'application/wasm')

@bp.route('/')
def index():
    recommended = CMSArticle.query.filter_by(published=True).filter_by(recommended=True).order_by(CMSArticle.order).limit(4)
    # start = time.process_time()
    ontop = CMSArticle.query.filter_by(published=True).filter_by(ontop=True).order_by(CMSArticle.order).limit(4)
    upcomingevent = CMSArticle.query.filter(CMSArticle.published==True).filter(CMSArticle.category_id==28).order_by(CMSArticle.order).limit(2)

    # upcomingevent =  CMSArticle.query.filter_by(published=True).filter_by(upcoming_event=True).order_by(CMSArticle.order).limit(2)
    # elapsed = time.process_time() - start   
    # print("Query finished. Time consumed: " + str(elapsed))
    return render_template('app/main/index.html',recommended=recommended,ontop=ontop,upcomingevent=upcomingevent)
    # return render_template('app/main/index.html',recommended=None,ontop=None)
# 
@bp.route('/ep_progress')    
def ep_progress():
    page = request.args.get('page', 1, type=int)
    page_size = current_app.config['APP_DEFAULT_PAGE_ROWS']
    ep_progress = CMSArticle.query.filter_by(published=True).filter_by(ontop=True).order_by(CMSArticle.order)
    pagination=ep_progress.paginate(page, page_size)
    return render_template('app/cms/ep_progress_view.html', category=ep_progress, pagination=pagination,
                           articles=pagination.items)


@bp.route('/set-locale/<locale>')
def set_locale(locale):
    if locale not in current_app.config['LANGUAGES']:
        locale = current_app.config['LANGUAGES'][0]

    response = make_response(jsonify(message=_('Setting updated.')))
    if current_user.is_authenticated:
        current_user.locale = locale
        db.session.commit()
    else:
        response.set_cookie('locale', locale, max_age=60 * 60 * 24 * 30)
    return response


@bp.route('/avatars/<path:filename>')
def get_avatar(filename):
    return send_from_directory(current_app.config['AVATARS_SAVE_PATH'], filename)


@bp.route('/uploads/<path:filename>')
def get_uploads(filename):
    return send_from_directory(current_app.config['APP_UPLOAD_PATH'], filename)


@bp.route('/search')
def search():
    q = request.args.get('q', '').strip()
    if q == '':
        flash(_('Input some words.'), 'warning')
        return render_template('app/main/search.html', warning=True)

    if 'last-search-time' in session and 'last-search-word' in session:
        now = datetime.now()
        last = session['last-search-time']
        if session['last-search-word'] != q and last + timedelta(seconds=current_app.config['SEARCH_INTERVAL_SECONDS']) > now:
            flash(_('Search too frequently, please wait for {0} seconds.'.format(current_app.config['SEARCH_INTERVAL_SECONDS'])), 'warning')
            return render_template('app/main/search.html', q=q, warning=True)

    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_SEARCH_RESULT_PER_PAGE']

    count_dict={}
    article_query = CMSArticle.query.filter(and_(CMSArticle.published == True,
                                              or_(CMSArticle.title.ilike('%' + q + '%'), CMSArticle.content.ilike('%' + q + '%'))
                                              ))
    count_dict['article'] = article_query.count()
    pagination = article_query.order_by(CMSArticle.created.desc()).paginate(page, per_page)

    results = pagination.items
    session['last-search-time'] = datetime.now()
    session['last-search-word'] = q
    return render_template('app/main/search.html', q=q, results=results, count_dict=count_dict, pagination=pagination, warning=False)
