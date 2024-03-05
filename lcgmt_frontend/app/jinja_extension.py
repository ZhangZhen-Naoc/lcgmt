import datetime
import re

from app.sysadmin.models import SystemMenu, FriendLink
from app.cms.models import CMSArticle, CMSCategory, CMSCarousel


def keywords_split(keywords):
    return keywords.replace(u',', ' ') \
                   .replace(u';', ' ') \
                   .replace(u'+', ' ') \
                   .replace(u'；', ' ') \
                   .replace(u'，', ' ') \
                   .replace(u'　', ' ') \
                   .split(' ')


def date_filter(dt, fmt='%Y-%m-%d %H:%M'):
    return dt.strftime(fmt)


def timestamp_filter(stamp, fmt='%Y-%m-%d %H:%M'):
    return datetime.datetime.fromtimestamp(int(stamp)).strftime(fmt)


def emphasis(text, keyword=None):
    if keyword is not None:
        for _keyword in keywords_split(keyword):
            _pattern = re.compile(r'(%s)' % _keyword, flags=re.I)
            text = _pattern.sub(r'<em>\1</em>', text)
    return text


def get_articles_by_category(id, limit=-1, withOntop=False, expand=True, iddesc=True):
    _query = CMSArticle.query.filter_by(category_id=id).filter_by(published=True)
    if withOntop:
        _query.order_by(CMSArticle.ontop.desc(), CMSArticle.order.desc() if iddesc else CMSArticle.order.asc() )
    else:
        _query=_query.order_by(CMSArticle.order.desc() if iddesc else CMSArticle.order.asc() )
    if limit>-1:
        _query=_query.limit(int(limit))
    return _query.all()


def get_thumbnail_articles_by_categoryid(id, limit=10):
    _query = CMSArticle.query.filter_by(published=True).filter_by(id=id)
    results = _query.filter(CMSArticle.thumbnail_path.isnot(None)).limit(int(limit)).all()
    return results


def get_system_menu(parent_id=-1):
    m = SystemMenu.query.filter_by(parent_id=parent_id).order_by(SystemMenu.order.asc()).all()
    return m


def get_friend_links():
    links = FriendLink.query.order_by(FriendLink.order.asc()).all()
    return links


def get_carousel(category_id, limit=10):
    links = CMSCarousel.query.filter_by(category_id=category_id).order_by(CMSCarousel.order.asc()).all()
    return links