from app.sysadmin.models import SystemMenu
from typing import List
from app.extensions import db
menus : List[SystemMenu]= SystemMenu.query.all()
for menu in menus:
    if menu.url.startswith('/ep/tdic2/'):
        menu.url = menu.url.replace('/ep/tdic2/','/ep/')
        db.session.commit()
