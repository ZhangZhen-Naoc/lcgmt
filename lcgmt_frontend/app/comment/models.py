from datetime import datetime

from app.extensions import db


class Comment(db.Model):
    __table_args__ = {"schema": "tdic"}
    id = db.Column(db.Integer, primary_key=True)
    ref_link = db.Column(db.String(300), nullable=True)
    comment = db.Column(db.Text, nullable=False)
    submitted_time = db.Column(db.DateTime, default=datetime.now, index=True)
    submitter_id = db.Column(db.Integer, db.ForeignKey('tdic.user.id'))
    submitter = db.relationship('User', foreign_keys=[submitter_id], backref='comments')

    @staticmethod
    def get_unresponsed_count():
        count = Comment.query.outerjoin(Comment.comment_response).group_by(Comment).having(
            db.func.count_(Comment.comment_response) == 0
        ).count()
        return count

    @staticmethod
    def get_responsed_but_not_published_count():
        count = Comment.query.outerjoin(Comment.comment_response).group_by(Comment).having(
            db.func.count_(Comment.comment_response) > 0
        ).filter(CommentResponse.check_status!='Approval').count()
        return count


class CommentResponse(db.Model):
    __table_args__ = {"schema": "tdic"}

    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer, db.ForeignKey('tdic.comment.id'))
    comment_response = db.relationship('Comment', foreign_keys=[comment_id], backref='comment_response')
    #
    response_content = db.Column(db.Text, nullable=False)
    responser_id = db.Column(db.Integer, db.ForeignKey('tdic.user.id'))
    responser = db.relationship('User',  foreign_keys=[responser_id], backref='comment_responses')
    response_date = db.Column(db.DateTime, default=datetime.now, index=True)
    #
    check_status = db.Column(db.String(30), nullable=True) # db.Column(db.Enum('Approval', 'Denial'), nullable=True)
    checker_id = db.Column(db.Integer, db.ForeignKey('tdic.user.id'))
    checker = db.relationship('User',  foreign_keys=[checker_id], backref='comment_responses_checks')
    check_date = db.Column(db.DateTime)
