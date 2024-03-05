from iterassert import any_match
from lcgmt.loader.FermiLoader import FermiLoader
from lcgmt.loader.MaxiLoader import MaxiLoader
from lcgmt.model import *
from pytest import fixture, approx
import os

from lcgmt.util import mjd_to_datetime

@fixture
def loader():
    assert "FERMI_PATH" in os.environ.keys()
    return FermiLoader( os.environ['FERMI_PATH'])

def test_get_srcs(loader:MaxiLoader):
    assert any_match((src.name,src.ra,src.dec) for src in loader.get_srcs()) == \
         ('0208-512_86400',approx(32.693),approx(-51.017))

def test_get_instrus(loader:MaxiLoader):
    instrus =list( loader.get_instrus())
    assert len(instrus)==3

def test_get_obses(loader:MaxiLoader):
    src = Source(name='0208-512_86400')
    obses = list(loader.get_obses(src,Instrument(name='Fermi3')))
    assert obses[0].start_time == datetime(2008,8,10)
    assert obses[0].exp_time == 86400
    assert obses[0].flux ==  approx(2.4947106e-08)
    assert obses[0].flux_err == approx( 1.9623884e-10)