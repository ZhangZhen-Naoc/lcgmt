from flask import render_template, current_app, request
from flask_login import login_required

from app.decorators import permission_required
from app.operation_log import bp
from app.operation_log.models import OperationLog


@bp.route('/', methods=['GET', 'POST'])
@login_required
@permission_required('SYSTEM_ADMIN')
def index():
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_NOTIFICATION_PER_PAGE']
    logs = OperationLog.query.order_by(OperationLog.operation_time.desc())
    filter_rule = request.args.get('module')
    if 'all' != filter_rule:
        logs = logs.filter_by(from_module=filter_rule)
    pagination = logs.paginate(page, per_page)
    return render_template('app/operation_log/operation_log.html', pagination=pagination, logs=pagination.items)

