from datetime import datetime
from lcgmt.model import Observation
from lcgmt.engine.timescale_engine import TimescaleEngine
from pytest import fixture

# @fixture
# def engine():
#     return TimescaleEngine()  # 需确保Docker的数据库打开

# def test_put(engine:TimescaleEngine):
#     obs = Observation(src_id=1,instru_id=1,start_time=datetime.strptime("2020-1-1T00:00:00","%Y-%m-%dT%H:%M:%S"),exp_time=datetime.strptime("2021-01-01T00:00:00","%Y-%m-%dT%H:%M:%S"),flux=100,flux_err=10)
#     engine.put(obs)

