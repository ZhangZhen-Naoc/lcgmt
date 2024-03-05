import flask_login
from .models import User

def get_current_user()->User:
    """封装flask_login，使得可被mock

    Returns:
        _type_: _description_
    """
    return flask_login.current_user