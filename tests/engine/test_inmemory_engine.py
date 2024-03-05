from lcgmt.engine.inmemory_engine import BaseEngine,InmemoryEngine
from lcgmt.model import Source,Observation
from pytest import fixture

@fixture
def instance()->InmemoryEngine:
    return InmemoryEngine()



