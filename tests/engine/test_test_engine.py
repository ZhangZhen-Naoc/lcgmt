"""
测试testengine
"""
from unittest import mock
from pytest import fixture
from pytest_mock.plugin import MockerFixture
from lcgmt.engine.test_engine import TestEngine
from lcgmt.model import Source
from lcgmt.engine.inmemory_engine import InmemoryEngine
import time

@fixture
def engine(mocker:MockerFixture)->TestEngine:
    core_engine = InmemoryEngine()
    mocker.patch.object(core_engine,'get')
    return TestEngine(core_engine)


def test_monitor_decorator(engine:TestEngine,mocker:MockerFixture):
    mocked_ptime = mocker.spy(time,'process_time')
    engine.get(Source())
    assert engine.logs.__len__()==1
    assert engine.logs[0].operation=="get"    
    assert mocked_ptime.call_count == 2


