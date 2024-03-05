from app import db


class SystemMenu(db.Model):
    __table_args__ = {"schema": "tdic"}
    __tablename__ = "sys_menu"

    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    url = db.Column(db.String(100), nullable=False, index=True)
    order = db.Column(db.Integer, nullable=True, index=True)
    title_zh = db.Column(db.String(255), nullable=False, index=True)
    title_en = db.Column(db.String(255), nullable=False, index=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('tdic.sys_menu.id'), nullable=True)
    Children = db.relationship('SystemMenu', backref=db.backref('parent', remote_side=[id]), lazy="joined")

    def __repr__(self):
        if self.title_zh is not None:
            return self.title_zh
        return self.title_en

    def __str__(self):
        prx=''
        if self.parent_id!=-1:
            pp = self.parent
            prx=pp.__repr__()+' -|'
        return prx + self.__repr__()


class FriendLink(db.Model):
    __table_args__ = {"schema": "tdic"}
    '''友情链接'''
    id = db.Column(db.Integer, autoincrement=True, primary_key=True, nullable=False)
    name_zh = db.Column(db.String(300), nullable=True, index=True)
    name_en = db.Column(db.String(300), nullable=True, index=True)
    url = db.Column(db.String(300), nullable=True, index=True)
    logo_url = db.Column(db.String(300), nullable=True, index=True)
    order = db.Column(db.Integer, nullable=True)


