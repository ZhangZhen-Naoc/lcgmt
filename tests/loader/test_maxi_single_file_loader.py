from iterassert import any_match
from lcgmt.loader import MaxiSingleFileLoader, Loader
from lcgmt.model import *
from pytest import fixture, approx
import os

@fixture
def loader():
    assert "MAXI_PATH" in os.environ.keys()
    return MaxiSingleFileLoader(os.environ['MAXI_PATH'],os.path.join(os.environ['MAXI_PATH'],"J0011-114/glcscan_lcbg_v1.qdp"))

def test_get_srcs(loader:Loader):
    srcs = loader.get_srcs()
    src:Source = srcs[0]
    assert len(srcs)==1       # 这是区别于MaxiLoader最关键一步
    assert (src.name,src.ra,src.dec,src.mission) == \
         ('J0011-114',approx(2.853250000),approx(-11.478640000),"MAXI")

def test_get_instrus(loader:Loader):
    instrus =list( loader.get_instrus())
    assert instrus[0].energy_start == 2
    assert instrus[0].energy_end == 20
    assert instrus[1].energy_start == 2
    assert instrus[1].energy_end == 4
    assert instrus[2].energy_start == 4
    assert instrus[2].energy_end == 10
    assert instrus[3].energy_start == 10
    assert instrus[3].energy_end == 20

def test_get_obses(loader:Loader):
    src = Source(name='J0011-114')
    obses = list(loader.get_obses(src,Instrument(name='maxi1')))
    assert obses[0].start_time == datetime.strptime('2009-08-12 08:30:44.006400',"%Y-%m-%d %H:%M:%S.%f")
    assert obses[0].exp_time == approx(48.9888)
    assert obses[0].flux ==  approx(0.007665)
    assert obses[0].flux_err == approx(0.064974)
    