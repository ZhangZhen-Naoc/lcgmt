from iterassert import any_match
from lcgmt.loader.XMMLoader import XMMLoader
from lcgmt.loader.Loader import Loader
from lcgmt.model import *
from pytest import fixture, approx
import os
from pytest import mark
@fixture(scope="module")
def loader():
    return XMMLoader( os.environ['XMM_PATH'])

@mark.xfail
def test_get_srcs(loader:Loader):
    assert any_match((src.name,src.ra,src.dec) for src in loader.get_srcs()) == \
         ('206931901010113',approx(0.000981297257679741),approx(-55.351744835539))

@mark.xfail
def test_get_instrus(loader:Loader):
    instrus =list( loader.get_instrus())
    assert instrus[0].energy_start == 0.2
    assert instrus[0].energy_end == 12.
    assert instrus[0].name == "xmmep8"


@mark.xfail
def test_get_obses(loader:Loader):
    src = Source(name='207241502010136')
    obses = list(loader.get_obses(src,Instrument(name='xmmep8')))
    assert obses[0].start_time == datetime.strptime('2013-12-23 11:36:09',"%Y-%m-%d %H:%M:%S")
    # assert obses[0].exp_timetime == datetime.strptime('2009-08-13 00:00:00',"%Y-%m-%d %H:%M:%S")
    assert obses[0].flux ==  approx(5.2829753e-14)
    assert obses[0].flux_err == approx(3.259059e-14)
    
    