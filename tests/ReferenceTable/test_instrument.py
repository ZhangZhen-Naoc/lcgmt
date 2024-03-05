from lcgmt.ReferenceTable.InstruTable import InstruTable,has_intersect
from iterassert import any_match,all_match
def test_find_by_name(connection):
    table = InstruTable(connection)
    instru = table.find_by_name("maxi1")
    assert instru.energy_start==2
    assert instru.energy_end==20
    assert instru.name=="maxi1"
    
def test_find_by_name_when_none(connection):
    table = InstruTable(connection)
    instru = table.find_by_name("notexist")
    assert instru is None
    

def test_find_by_energy_band(connection):
    table = InstruTable(connection)
    instrus = table.find_by_energy_band(3,5)
    assert instrus.__len__()==3
    assert all_match(instrus,lambda i:has_intersect((3,5),(i.energy_start,i.energy_end)))
    
