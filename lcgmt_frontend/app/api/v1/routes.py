from flask import jsonify, request, current_app
from flask_login import login_required, current_user
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

from app import User
from app.api.errors import error_response
from app.api.v1 import bp
import uuid
from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import current_user, login_required, login_user
from app import csrf

def generate_token(user, expires_in=None):
    s = Serializer(current_app.config['SECRET_KEY'], salt='2019-10-11', expires_in=expires_in)
    return s.dumps({'id': user.id})


def verify_auth_token(request):
    token = request.args.get("token")
    s = Serializer(current_app.config['SECRET_KEY'], salt='2019-10-11')
    try:
        data = s.loads(token)
    except SignatureExpired:
        return 1, None # valid token, but expired
    except BadSignature:
        return 2, None  # invalid token
    user = User.query.filter_by(id=data['id']).first()
    if not user:
        return 3, None
    if not user.allowed_api:
        return 4, user
    else:
        return 0, user
    return 2, None


def handle_error(status):
    if 1 == status:
        message = 'valid token, but expired'
    elif 2 == status or 3 == status:
        message = 'invalid token'
    elif 4 == status:
        message = 'you are not allowed to use this api'

    return jsonify({'error': message})


# @bp.route('/get_token')
# @login_required
# def get_token():
#     if not current_user.allowed_api:
#         return handle_error(4)
#     token = generate_token(user=current_user)
#     return jsonify({'token': token.decode('ascii')})


@bp.route('/get_title')
def get_title():
    status, user = verify_auth_token(request)
    if status != 0: return handle_error(status)
    #
    if user:
        return jsonify({'title': user.name})
    return error_response(403, 'Authentication Failed')

@bp.route('/get_tokenp', methods=['POST'])
@csrf.exempt
def get_tokenp():
    email = request.values.get('email')
    password = request.values.get('password')
    if not email or not password:
        return jsonify({'token': uuid.uuid4().hex})
    #
    user = User.query.filter(User.email==email).first()
    if not user:
        return jsonify({'token': uuid.uuid4().hex})
    #
    if not check_password_hash(user.password_hash, password):
        return jsonify({'token': uuid.uuid4().hex})
    if not user.allowed_api:
        return handle_error(4)
    else:
        login_user(user)
        token = generate_token(user=user)
    return jsonify({'token': token.decode('ascii')})

@bp.route('/get_token')
@login_required
def get_token():
    if not current_user.allowed_api:
        return handle_error(4)
    token = generate_token(user=current_user)
    return jsonify({'token': token.decode('ascii')})


# @bp.route('/get_title')
# # @auth_required
# def get_title():
#     if current_user:
#         return jsonify({'title': current_user.name})
#     return error_response(403, 'Authentication Failed')

@bp.route('/msg')
def msg():
    return jsonify({'msg':'Message from Flask'})

