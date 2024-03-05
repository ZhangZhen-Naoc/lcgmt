from datetime import datetime
from typing import List
import pytest
from lcgmt.engine.base_engine import BaseEngine
from lcgmt.model import Observation, Source
from tests.resources.initdata import src1,src2,obs1,obs2,instru1,instru2,obs3
from engine_config import engines
from iterassert import any_match ,all_match

engines_par = [(engine) for engine in engines]

# @pytest.mark.parametrize("engine",engines_par)
# def test_engines(engine):
#     put_obs(engine)
#     put_obses(engine)
#     query_obses(engine)

@pytest.mark.parametrize("engine",engines_par)
def test_put_obs(engine:BaseEngine):
    """
    用src1测试put_obs和get
    """
    engine.clear()
    engine.put_obs(src1,instru1,obs1[0])
    engine.put_obs(src1,instru1,obs1[1])
    engine.put_obs(src1,instru2,obs1[2])
    engine.put_obs(src1,instru2,obs1[3])

    obses =[obs for obs in engine.get(src1, instru1)]
    assert len(obses)==2
    for obs in obses:
        assert any_match(obs1) == obs


@pytest.mark.parametrize("engine",engines_par)
def test_put_obses(engine:BaseEngine):
    engine.clear()
    engine.put_obses(src2,instru1,obs2[0:2])
    engine.put_obses(src2,instru2,obs2[2:4])

    obses =[obs for obs in engine.get(src2,instru2)]
    assert len(obses)==2
    for obs in obses:
        assert any_match(obs2) == obs
        
@pytest.mark.parametrize("engine",engines_par)
def test_query_obses(engine:BaseEngine):
    engine.clear()
    engine.put_obses(src2,instru2,obs2[2:4])
    result1: List[Observation] = engine.get_obs_by_timerange(src2,instru2,(datetime(2019,12,31),datetime(2020,1,1,2)))
    assert len(result1) ==1
    assert result1[0].flux == pytest.approx(16)
    
    result2 = engine.get_obs_by_timerange(src2,instru2,(datetime(2019,12,31),datetime(2020,1,3)))
    assert len(result2)==2
    
    result3 = engine.get_obs_by_timerange(src2,instru2,(datetime(2020,1,3),datetime(2020,1,4)))
    assert len(result3)==0

@pytest.mark.parametrize("engine",engines_par)
def test_timebin(engine:BaseEngine):
    engine.clear()
    
    engine.put_obses(src1,instru1,obs3)
    result:List[Observation] = engine.get_obs_by_timerange_timebin(
        src1,instru1,
        time_range=(datetime(2020,1,1),datetime(2020,1,3)),
        timebin=1
    )
    assert len(result)==2
    assert result[0].flux == pytest.approx(12.0)
    assert result[1].flux == pytest.approx(18.0)
    

@pytest.mark.parametrize("engine",engines_par)
def test_clear(engine):
    engine.clear()
    engine.put_obses(src2,instru1,obs2[0:2])
    engine.clear()
    
    assert len(engine.get(src2,instru1))==0