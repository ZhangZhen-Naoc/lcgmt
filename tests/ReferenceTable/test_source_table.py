from lcgmt.ReferenceTable.SourceTable import SouceTable
import psycopg2 # install psycopg2-binary
from pytest import fixture,approx

from lcgmt.model import Source



def test_find(connection):
    """测试查询     

    Args:
        connection ([type]): [description]
    """
    table = SouceTable(connection)
    src = table.find(Source(ra=0,dec=0.004)) # 数据在Docker下
    assert approx(src.ra)==0
    assert approx(src.dec)==0

def test_close_src(connection):
    """原有方案将很近的源当一个处理，取消这种限制"""
    table = SouceTable(connection)
    src1 = Source(ra=0,dec=0.004,mission="m1",name="n1")
    src2 = Source(ra=0,dec=0.004,mission="m2",name="n2")
    table.insert(src1)
    table.insert(src2)

    assert table.find(src1).mission=="m1"
    assert table.find(src2).mission=="m2"
    
