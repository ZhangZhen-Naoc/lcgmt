# 这里模拟三个组件注入app，用以测试
from typing import Iterable, Tuple
from _pytest.fixtures import fixture
from flask import Flask
from lcgmt.ReferenceTable import ISourceTable, IInstruTable
from lcgmt.engine import BaseEngine
from lcgmt.model import Instrument, Observation, Source
from datetime import datetime

from lcgmt.webapi import create_app
instru1 = Instrument(
    id=1,
    name="ep1",
    energy_start=10.0,
    energy_end=20.0
    )
instru2 = Instrument(
    id=2,
    name="ep1",
    energy_start=10.0,
    energy_end=20.0
    )
class SourceTable(ISourceTable):
    def find(self,src:Source)->Source:
        return Source(id = 1,name ="src1",ra=0,dec=0)
    
    def find_closet_src(self,src:Source)->Source:
        return Source(id = 1,name ="src1",ra=0.1,dec=0)
    
    
class InstruTable(IInstruTable):
    def find_by_name(self, name: str) -> Instrument:
        return Instrument(id=0,name="instru1",energy_start=0.5,energy_end=10)
    
    def find_by_energy_band(self, energy_start: float, energy_end: float) -> Iterable[Instrument]:
        return [instru1,instru2]


class Engine(BaseEngine):
    def get(self,src:Source)->Iterable[Observation]:
        """
        返回一个源所有观测集合（按照时序排列）
        """
        pass
    
    def get_obs_by_timerange(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime], timebin: float) -> Iterable[Observation]:

        return [
            Observation(
            start_time=datetime.strptime("2020-01-01 00:00:00","%Y-%m-%d %H:%M:%S"),
            exp_time=1,
            flux=10.0,
            flux_err=2.0,
            instru=instru1
            ),
            Observation(
                    start_time=datetime.strptime("2020-01-02 00:00:00","%Y-%m-%d %H:%M:%S"),
                    exp_time=2,
                    flux=12.0,
                    flux_err=3.0,
                    instru=instru2
            ),
        ]

@fixture
def client():
    app:Flask = create_app(SourceTable(),InstruTable(),Engine())
    with app.app_context():
        yield app.test_client()