from app import create_app
from mockito import when,ANY
from unittest import mock
from app import create_app
import app
from app.user import routes as user_routes
from app.user.models import User
from app.long_task import * 
from app.extensions import celery
from app.data_center import service as dc_service, upperlimit_api
from flask_docs import ApiDoc
import sys
when(user_routes).check_verify_code(ANY).thenReturn(True)
when(User).validate_password(ANY).thenReturn(True)
when(User).can(ANY).thenReturn(True)
app = create_app("xuyunfei")
if __name__=="__main__":
    app.run(debug=True)