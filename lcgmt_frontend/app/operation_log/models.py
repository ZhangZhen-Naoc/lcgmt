from datetime import datetime
from sqlalchemy.orm import Query
from app.extensions import db


class OperationLog(db.Model):
    __table_args__ = {"schema": "tdic"}
    query: Query
    id = db.Column(db.Integer, primary_key=True)
    from_module = db.Column(db.Text, nullable=False)
    operation = db.Column(db.Text, nullable=False)
    operation_time = db.Column(db.DateTime, default=datetime.now, index=True)
    operator_id = db.Column(db.Integer, db.ForeignKey('tdic.user.id'))
    operator = db.relationship('User', foreign_keys=[operator_id], backref='operation_logs')

    @staticmethod
    def add_log(module, operation, user):
        ol = OperationLog()
        if None == user:
            ol.operator_id = None
        else:
            ol.operator_id = user.id
        ol.from_module = module
        ol.operation = operation
        ol.operation_time = datetime.now()
        db.session.add(ol)
        db.session.commit()

