from flask import render_template, flash, redirect, current_app, request, abort, url_for
from flask_babelex import _
from flask_login import login_required, current_user

from app.extensions import db
from app.notification import bp
from app.notification.models import Notification


@bp.route('/')
@login_required
def show_notifications():
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_NOTIFICATION_PER_PAGE']
    notifications = Notification.query.with_parent(current_user)
    filter_rule = request.args.get('filter')
    if filter_rule == 'unread':
        notifications = notifications.filter_by(is_read=False)

    pagination = notifications.order_by(Notification.timestamp.desc()).paginate(page, per_page)
    notifications = pagination.items
    return render_template('app/notification/notifications.html', pagination=pagination, notifications=notifications)


@bp.route('/read/<int:notification_id>', methods=['POST'])
@login_required
def read_notification(notification_id):
    notification = Notification.query.get_or_404(notification_id)
    if current_user != notification.receiver:
        abort(403)

    notification.is_read = True
    db.session.commit()
    flash(_('Notification archived.'), 'success')
    return redirect(url_for('notification.show_notifications'))


@bp.route('/read/all', methods=['POST'])
@login_required
def read_all_notification():
    for notification in current_user.notifications:
        notification.is_read = True
    db.session.commit()
    flash(_('All notifications archived.'), 'success')
    return redirect(url_for('notification.show_notifications'))