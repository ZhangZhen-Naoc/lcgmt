# -*- coding: utf-8 -*-

from flask import request

from .. import api, db
from ..cms.models import CMSArticle


@api.route('/gethits/')
def gethits():
    id = int(request.args.get('id', 0))
    article = CMSArticle.query.get(id)
    if article:
        article.hits += 1
        db.session.add(article)
        db.session.commit()
        return str(article.hits)
    return 'err'
