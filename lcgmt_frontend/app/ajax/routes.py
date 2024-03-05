from flask import jsonify
from flask_login import current_user

from app.ajax import bp as ajax_bp
from app.notification.models import Notification


@ajax_bp.route('/notifications-count')
def notifications_count():
    if not current_user.is_authenticated:
        return jsonify(message='Login required.'), 403

    count = Notification.query.with_parent(current_user).filter_by(is_read=False).count()
    return jsonify(count=count)
