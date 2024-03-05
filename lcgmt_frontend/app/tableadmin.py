from flask import request, url_for
from flask_admin import AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from werkzeug.utils import redirect


# 这是首页
class TableAdminIndexView(AdminIndexView):
    def is_accessible(self):
        return current_user is not None and not current_user.is_anonymous and current_user.is_active and current_user.is_admin

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('main.index', next=request.url))


# 这是数据表页
class TableAdminModelView(ModelView):
    # list_template = 'app/table_admin/list.html'
    # create_template = 'app/table_admin/create.html'
    # edit_template = 'app/table_admin/edit.html'

    def is_accessible(self):
        return current_user is not None and not current_user.is_anonymous and current_user.is_active and current_user.is_admin

    def inaccessible_callback(self, name, **kwargs):
        # redirect to login page if user doesn't have access
        return redirect(url_for('main.index', next=request.url))

    def on_model_change(self, form, model, is_created):
        from app.operation_log.models import OperationLog
        if is_created:
            msg='creating on table "{0}": {1}'.format(model.__table__, model.__dict__)
        else:
            msg='changing on table "{0}": {1}'.format(model.__table__, model.__dict__)
        print(msg)
        OperationLog.add_log('table_admin', msg.__str__(), current_user)
        return super().on_model_change(form, model, is_created)

    def on_model_delete(self, model):
        from app.operation_log.models import OperationLog
        msg='deleting on table "{0}": {1}'.format(model.__table__, model.__dict__)
        print(msg)
        OperationLog.add_log('table_admin', msg.__str__(), current_user)
        return super().on_model_delete(model)

class SourceModelView(TableAdminModelView):
    column_filters = ('simbad_name','id','ra','dec')

class ObservationModelView(TableAdminModelView):
    column_filters = ('id',)

class SourceObservationModelView(TableAdminModelView):
    column_filters = ('id','wxt_detection_id','source_id')