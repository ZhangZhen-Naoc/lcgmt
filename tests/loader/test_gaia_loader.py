from iterassert import any_match
from lcgmt.loader.GaiaLoader import GaiaLoader, Loader
from lcgmt.model import *
from pytest import fixture, approx
import os
from pytest import mark
from datetime import timedelta
@fixture
def loader():
    assert "GAIA_PATH" in os.environ.keys()
    return GaiaLoader( os.environ['GAIA_PATH'])

def test_get_srcs(loader:Loader):
    srcs_in_gaia = [(src.name,src.ra,src.dec,src.mission)
        for  src in loader.get_srcs()]

    src1 = ('56075093274240',approx(45.2144,abs=0.05),approx(0.565,abs=0.05),"Gaia")
    src2 = ('242055427570051072',approx(52.415,abs=0.05),approx(46.109,abs=0.05),"Gaia")
    assert any_match(srcs_in_gaia) == src1
    assert any_match(srcs_in_gaia) == src2


@mark.xfail
def test_get_instrus(loader:Loader):
    assert False, "待查证"
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
    src = Source(name='56075093274240')
    obses = list(loader.get_obses(src,Instrument(name='Gaia_g')))
    err =  obses[0].start_time - datetime.strptime('2014-09-06 10:41:25.63',"%Y-%m-%d %H:%M:%S.%f")
    assert err>timedelta(-1) and err<timedelta(1)
    assert obses[0].exp_time == approx(44)
    assert obses[0].flux ==  approx(283.0317076185603)
    assert obses[0].flux_err == approx(6.643353340115672)
    
