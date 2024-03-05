from datetime import datetime

from app.extensions import db


class Notification(db.Moxel):
    __table_args__ = {"schema": "tdic"}
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    ref_link = db.Column(db.String(300), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.now, index=True)

    receiver_id = db.Column(db.Integer, db.ForeignKey('tdic.user.id'))
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='notifications')

    @staticmethod
    def add_notification(user_id, msg, ref_link=None):
        nity = Notification()
        if ref_link is not None:
            nity.ref_link = ref_link
        nity.message = msg
        nity.receiver_id = user_id
        db.session.add(nity)
        db.session.commit()
