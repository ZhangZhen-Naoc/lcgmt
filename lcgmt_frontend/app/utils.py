from io import BytesIO
import os
from typing import IO, List, Tuple, Union
import uuid
import datetime
import math
import zipfile
try:
    from urllib.parse import urlparse, urljoin
except ImportError:
    from urlparse import urlparse, urljoin
import PIL
from PIL import Image
from flask import current_app, request, url_for, redirect, flash, jsonify
from itsdangerous import BadSignature, SignatureExpired
from itsdangerous import TimedJSONWebSignatureSerializer as Serializer

from app.extensions import db


def generate_token(user, operation, expire_in=None, **kwargs):
    s = Serializer(current_app.config['SECRET_KEY'], expire_in)

    data = {'id': user.id, 'operation': operation}
    data.update(**kwargs)
    return s.dumps(data)


def validate_token_simple(token, operation):
    s = Serializer(current_app.config['SECRET_KEY'])

    try:
        data = s.loads(token)
        return operation == data.get('operation')
    except (SignatureExpired, BadSignature):
        return False


def validate_token(user, token, operation, new_password=None):
    s = Serializer(current_app.config['SECRET_KEY'])

    try:
        data = s.loads(token)
    except (SignatureExpired, BadSignature):
        return False

    if operation != data.get('operation') or user.id != data.get('id'):
        return False

    if operation == 'EMAIL_CONFIRM':
        user.email_confirmed = True
    elif operation == 'RESET_PASSWORD':
        user.set_password(new_password)
    elif operation == 'CHANGE_EMAIL':
        new_email = data.get('new_email')
        if new_email is None:
            return False
        from app.user.models import User
        if User.query.filter_by(email=new_email).first() is not None:
            return False
        user.email = new_email
    else:
        return False

    db.session.commit()
    return True


def rename_image(old_filename):
    ext = os.path.splitext(old_filename)[1]
    new_filename = uuid.uuid4().hex + ext
    return new_filename


def resize_image(image, filename, base_width):
    filename, ext = os.path.splitext(filename)
    img = Image.open(image)
    if img.size[0] <= base_width:
        return filename + ext
    w_percent = (base_width / float(img.size[0]))
    h_size = int((float(img.size[1]) * float(w_percent)))
    img = img.resize((base_width, h_size), PIL.Image.ANTIALIAS)

    filename += current_app.config['APP_PHOTO_SUFFIX'][base_width] + ext
    img.save(os.path.join(current_app.config['APP_UPLOAD_PATH'], filename), optimize=True, quality=85)
    return filename


def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and \
           ref_url.netloc == test_url.netloc


def redirect_back(default='main.index', **kwargs):
    for target in request.args.get('next'), request.referrer:
        if not target:
            continue
        if is_safe_url(target):
            return redirect(target)
    return redirect(url_for(default, **kwargs))


def flash_errors(form):
    for field, errors in form.errors.items():
        for error in errors:
            flash(u"Error in the %s field - %s" % (
                getattr(form, field).label.text,
                error
            ))


def two_sets_equal(pre_roles, roles):
    sc = set(pre_roles) & set(roles)
    pl = len(pre_roles)
    if len(sc) == pl and pl == len(roles):
        return True
    return False


def get_subsite():
    return current_app.config['APP_URL_PREFIX']


# 1440751417.283 --> '2015-08-28 16:43:37.283'
def timestamp2string(timeStamp):
    try:
        d = datetime.datetime.fromtimestamp(timeStamp)
        str1 = d.strftime("%Y-%m-%d %H:%M:%S.%f")
        # 2015-08-28 16:43:37.283000'
        return str1
    except Exception as e:
        print(e)
        return ''


def get_emails(email):
    email_lower = email.lower()
    emails = [email_lower]
    if email_lower.endswith('@nao.cas.cn'):
        emails.append(email_lower.replace('@nao.cas.cn', '@bao.ac.cn'))
    if email_lower.endswith('@bao.ac.cn'):
        emails.append(email_lower.replace('@bao.ac.cn', '@nao.cas.cn'))
    return emails


MULTIPLES = ["B", "k{}B", "M{}B", "G{}B", "T{}B", "P{}B", "E{}B", "Z{}B", "Y{}B"]
def humanbytes(i, binary=False, precision=2):
    if i==0: return '0B'
    base = 1024 if binary else 1000
    multiple = math.trunc(math.log2(i) / math.log2(base))
    value = i / math.pow(base, multiple)
    suffix = MULTIPLES[multiple].format("i" if binary else "")
    return f"{value:.{precision}f} {suffix}"

# 处理国台不同邮箱后缀
def format_email(email):
    email_lower = email.lower()
    emails = [email_lower]
    if email_lower.endswith('@nao.cas.cn'):
        emails.append(email_lower.replace('@nao.cas.cn', '@bao.ac.cn'))
    if email_lower.endswith('@bao.ac.cn'):
        emails.append(email_lower.replace('@bao.ac.cn', '@nao.cas.cn'))
    return emails

def is_source_proposal(cls, row):
    mode_mark = 0
    if len(row) < 3:
        return 2

    if row[1] == '':
        return 1

    # 'Tracking', 'TrackingWithAngle', 'Drift', 'SnapShot',  'DriftWithAngle', 'BasketWeaving' 5列
    #  'OnOff'  7列
    #  'MultiBeamOTF','OnTheFlyMapping'  9列
    if row[2] in ['Tracking', 'TrackingWithAngle', 'Drift', 'SnapShot', 'MultiBeamCalibration', 'DriftWithAngle', 'BasketWeaving', 'DecDriftWithAngle', 'SwiftCalibration'] and len(row) in [6, 7]:
        mode_mark = 1

    if row[2] in ['OnOff'] and len(row) in [8, 9]:
        mode_mark = 1

    if row[2] in ['OnTheFlyMapping', 'MultiBeamOTF'] and len(row) in [10, 11]:
        mode_mark = 1

    if row[2] in ['SolarSysTracking', 'SolarSysDrift'] and len(row) in [5, 6]:
        mode_mark = 1

    if mode_mark == 0:
        return 2

    return -1

def zip_filestreams(files:List[Tuple[Union[bytes, str],str]]):
    """输入文件列表，压缩为一个文件

    Args:
        files (List[Tuple[Union[bytes, str],str]]): _description_
    """
    zip_io = BytesIO()
    with  zipfile.ZipFile(zip_io,'w',zipfile.ZIP_DEFLATED) as z:
        for file_io,filename in files:
            z.writestr(filename,file_io)
    zip_io.seek(0)
    return zip_io

def now():
    """只是对datetime.now()做了个封装，使得可以被mock
    """
    return datetime.datetime.now()

def linear_interpolation(xs:List[float], ys:List[float], x:float)->float:
    """
    使用线性插值计算给定x值的y值
    参数：
        xs: 包含已知x值的列表或数组
        ys: 包含已知y值的列表或数组
        x_val: 需要计算相应y值的x值
    返回：
        计算得到的y值
    """

    # 首先判断x_val是否在x的范围内
    if x < min(xs) or x > max(xs):
        raise Exception("X out of range")

    # 找到x_val在x列表中的位置
    i = 0
    while xs[i] < x:
        i += 1

    # 执行线性插值计算
    x1, y1 = xs[i - 1], ys[i - 1]  # 插值区间的左边界点
    x2, y2 = xs[i], ys[i]          # 插值区间的右边界点

    y_val = y1 + ((y2 - y1) / (x2 - x1)) * (x - x1)
    return y_val

def handle_error(status):
    if 1 == status:
        message = 'valid token, but expired'
    elif 2 == status or 3 == status:
        message = 'invalid token'
    elif 4 == status:
        message = 'you are not allowed to use this api'

    return jsonify({'error': message})
