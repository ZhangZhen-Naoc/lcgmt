from iterassert import any_match
from lcgmt.loader.MaxiLoader import MaxiLoader
from lcgmt.model import *
from pytest import fixture, approx
import os

@fixture
def loader():
    assert "MAXI_PATH" in os.environ.keys()
    return MaxiLoader( os.environ['MAXI_PATH'])

def test_get_srcs(loader:MaxiLoader):
    assert any_match((src.name,src.ra,src.dec,src.mission) for src in loader.get_srcs()) == \
         ('J0011-114',approx(2.853250000),approx(-11.478640000),"MAXI")

def test_get_instrus(loader:MaxiLoader):
    instrus =list( loader.get_instrus())
    assert instrus[0].energy_start == 2
    assert instrus[0].energy_end == 20
    assert instrus[1].energy_start == 2
    assert instrus[1].energy_end == 4
    assert instrus[2].energy_start == 4
    assert instrus[2].energy_end == 10
    assert instrus[3].energy_start == 10
    assert instrus[3].energy_end == 20

def test_get_obses(loader:MaxiLoader):
    src = Source(name='J0011-114')
    obses = loader.get_obses(src,Instrument(name='maxi1'))
    # assert obses[0].start_time == datetime.strptime('2009-08-12 08:30:44.006400',"%Y-%m-%d %H:%M:%S.%f")
    assert obses['start_time'][0] == datetime.strptime('2009-08-12 08:30:44.006400',"%Y-%m-%d %H:%M:%S.%f")
    assert obses['exp_time'][0] == approx(48.9888)
    assert obses['flux'][0] ==  approx(0.007665)
    assert obses['flux_err'][0] == approx(0.064974)
    
