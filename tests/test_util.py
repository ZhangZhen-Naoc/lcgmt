from lcgmt.util import mjd_to_datetime,has_intersect

def test_mjd_to_datetime():
    assert mjd_to_datetime(55058.500000).year == 2009
    
def test_has_intersect():
    assert has_intersect((0,1),(0.5,2))
    assert has_intersect((0.5,2),(0,1))
    assert has_intersect((0,10),(5,6))
    assert has_intersect((7,8),(5,9))
    assert not has_intersect((1,2),(3,4))
    
    # 边界
    assert not has_intersect((0,1),(1,2))