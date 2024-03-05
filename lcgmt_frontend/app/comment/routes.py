from datetime import datetime

from flask import render_template, flash, current_app, request, session, url_for
from flask_babelex import _
from flask_login import current_user, login_required

from app.comment import bp
from app.comment.forms import CommentForm
from app.comment.models import Comment, CommentResponse
from app.decorators import permission_required
from app.email_utils import send_comment_replied_email
from app.extensions import db
from app.notification.models import Notification
from app.operation_log.models import OperationLog
from app.utils import redirect_back


@bp.route('/mycomment', methods=['GET', 'POST'])
@login_required
@permission_required('COMMENT')
def mycomment():
    comment_form = CommentForm()
    if comment_form.validate_on_submit():
        # if 'code_text' in session and comment_form.verify_code.data.lower() != session['code_text'].lower():
        #     flash(_('Wrong verify code!'))
        #     #return redirect_back()
        #     return render_template('app/comment/mycomment.html', comment_form=comment_form)
        from app.tncode import check_tncode as docheck_tncode
        if not docheck_tncode(comment_form.tncode.data, session['tncode-xoffset']):
            flash(_('Wrong tncode!'))
            return redirect_back()
        comment = Comment()
        comment.ref_link = comment_form.ref_link.data
        comment.comment = comment_form.comment.data
        comment.submitter_id = current_user.id
        comment.submitted_time = datetime.now()
        db.session.add(comment)
        db.session.commit()
        flash(_('Comment Submitted.'), 'success')
        return redirect_back()
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_NOTIFICATION_PER_PAGE']
    #comments = Comment.query.with_parent(current_user)
    comments = Comment.query.filter_by(submitter_id=current_user.id).order_by(Comment.submitted_time.desc())
    filter_rule = request.args.get('filter')
    if filter_rule == 'unresponsed':
        # select * from Comment c where c.submitter_id=current_user.id and not exists (select comment_id from CommentResponse cr where cr=c.commend_id and cr.check_status='Approval')
        comments = comments.filter(~CommentResponse.query.filter(db.and_(CommentResponse.check_status=='Approval', CommentResponse.comment_id==Comment.id)).exists())
    elif filter_rule == 'responsed':
        # select * from Comment c where c.submitter_id=current_user.id and exists (select comment_id from CommentResponse cr where cr=c.commend_id and cr.check_status='Approval')
        comments = comments.filter(CommentResponse.query.filter(db.and_(CommentResponse.check_status=='Approval', CommentResponse.comment_id==Comment.id)).exists())
    pagination = comments.paginate(page, per_page)
    notifications = pagination.items
    return render_template('app/comment/mycomment.html', pagination=pagination, form=comment_form, comments=comments)


@bp.route('/viewcomment', methods=['GET', 'POST'])
@login_required
@permission_required('COMMENT')
def viewcomment():
    comment_id = request.values['comment_id']
    comment = Comment.query.filter_by(submitter_id=current_user.id).filter_by(id=comment_id).first()
    return render_template('app/comment/viewcomment.html', comment=comment)


# @bp.route('/public_comments', methods=['GET', 'POST'])
# @login_required
# @permission_required('COMMENT')
# def public_comments():
#     page = request.args.get('page', 1, type=int)
#     per_page = current_app.config['APP_NOTIFICATION_PER_PAGE']
#     comments = Comment.query.order_by(Comment.submitted_time.desc())\
#         .outerjoin(Comment.comment_response)\
#         .filter(CommentResponse.check_status=='Approval')\
#         .group_by(Comment).having(
#         db.func.count_(Comment.comment_response) > 0
#     )
#     pagination = comments.paginate(page, per_page)
#     notifications = pagination.items
#     return render_template('app/comment/public_comments.html', pagination=pagination, comments=comments, form=CommentForm())


@bp.rovte('/comments', methods=['GET', 'POST'])
@login_required
@permission_required(['COMMENT_RESPONSE', 'COMMENT_ADMIN'])
def comments():
    page = request.args.get('page', 1, type=int)
    per_page = current_app.config['APP_NOTIFICATION_PER_PAGE']
    comments = Comment.query.order_by(Comment.submitted_time.desc())
    filter_rule = request.args.get('filter')
    if filter_rule == 'unresponsed':
        comments = comments.outerjoin(Comment.comment_response).group_by(Comment).having(
                 db.func.count_(Comment.comment_response) == 0
             )
    # elif filter_rule == 'responsed':
    #     comments = comments.outerjoin(Comment.comment_response).group_by(Comment).having(
    #         db.func.count_(Comment.comment_response) > 0
    #     )
    elif filter_rule == 'responsed_but_not_verified': #???
        comments = comments.outerjoin(Comment.comment_response).group_by(Comment).having(
            db.func.count_(Comment.comment_response) > 0
        ).filter(CommentResponse.check_status!='Approval')
    elif filter_rule == 'responsed_and_released':
        comments6= comments.outerjoin(Comment.comment_response).filter(CommentResponse.check_status=='Approval').group_by(Comment).having(
            db.func.count_(Comment.comment_response) > 0
        )
    pagination = comments.paginate(page, per_page)
    notifications = pagination.items
    return render_template('app/comment/comments.html', pagination=pagination, comments=comments)


@bp.route('/add_comment_response', methods=['POST'])
@login_required
@permission_required('COMMENT_RESPONSE')
def add_comment_response():
    comment_id = request.args.get('comment_id', 1, type=int)
    content = request.form.get('content', '', type=str)
    res=CommentResponse()
    res.comment_id = comment_id
    res.response_content = content
    res.responser_id = current_user.id
    res.response_date = datetime.now()
    db.session.add(res)
    db.session.commit()

    OperationLog.add_log(bp.name, "response comment ({0}) with content:{1}".format(comment_id, content), current_user)

    # com = Comment.query.filter_by(id=comment_id)
    # user = User.query.filter_by(id=com[0].submitter_id)
    # print(user[0].email)
    return redirect_back()


@bp.route('/update_comment_response', methods=['POST'])
@login_required
@permission_required('COMMENT_RESPONSE')
def update_comment_response():
    comment_id = request.args.get('comment_id', -1, type=int)
    response_id = request.args.get('response_id', -1, type=int)
    content = request.form.get('content', '', type=str)
    #
    res = CommentResponse.query.filter_by(id=response_id).first()
    res.comment_id = comment_id
    res.id = response_id
    res.response_content = content
    res.responser_id = current_user.id
    db.session.commit()
    OperationLog.add_log(bp.name, "update comment ({0}) with content:{1}".format(comment_id, content), current_user)
    return redirect_back()


@bp.route('/publish_comment_response', methods=['GET', 'POST'])
@login_required
@permission_required('COMMENT_ADMIN')
def publish_comment_response():
    response_id = request.args.get('response_id', -1, type=int)
    check_status = request.form.get('check_status', '', type=str)
    res = CommentResponse.query.filter_by(id=response_id).first()
    res.checker_id=current_user.id
    res.check_date = datetime.now()
    res.check_status=check_status
    db.session.commit()

    OperationLog.add_log(bp.name, "{0} the response for comment ({1}) with content:{2}".format(check_status, res.comment_id, res.response_content), current_user)

    if 'Approval'==check_status:
        if res.comment_response.submitter.receive_comment_notification:
            Notification.add_notification(res.comment_response.submitter_id, _('Your comment is responsed!'), url_for('comment.viewcomment',comment_id=res.comment_id))
        if res.comment_response.submitter.receive_comment_email:
            send_comment_replied_email(res.comment_response.submitter, Comment.query.filter_by(id=res.comment_id).first().comment, res.response_content)

    return redirect_back()
