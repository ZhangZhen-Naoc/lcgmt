from flask import render_template, request
from flask_wtf.csrf import CSRFError

from app import db
from app.api.errors import error_response as api_error_response
from app.errors import bp
from werkzeug.exceptions import BadRequest


def wants_json_response():
    return request.accept_mimetypes['application/json'] >= \
        request.accept_mimetypes['text/html']


@bp.app_errorhandler(400)
def bad_request(e:BadRequest):
    if wants_json_response():
        return api_error_response(400)
    return render_template('app/errors/400.html',description=e.description), 400


@bp.app_errorhandler(403)
def forbidden(e):
    if wants_json_response():
        return api_error_response(403)
    return render_template('app/errors/403.html'), 403


@bp.app_errorhandler(404)
def not_found_error(error):
    if wants_json_response():
        return api_error_response(404)
    return render_template('app/errors/404.html'), 404


@bp.app_errorhandler(413)
def request_entity_too_large(e):
    if wants_json_response():
        return api_error_response(413)
    return render_template('app/errors/413.html'), 413


@bp.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    if wants_json_response():
        return api_error_response(500)
    return render_template('app/errors/500.html'), 500


@bp.app_errorhandler(503)
def service_unavailable(e):
    if wants_json_response():
        return api_error_response(503)
    return render_template('app/errors/503.html',description=e.description), 503

@bp.app_errorhandler(CSRFError)
def handle_csrf_error(e):
    if wants_json_response():
        return api_error_response(CSRFError)
    return render_template('app/errors/400.html', description=e.description), 500