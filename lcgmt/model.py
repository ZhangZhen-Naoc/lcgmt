from datetime import datetime
from typing import Iterable
from dataclasses import dataclass

@dataclass
class Instrument:
    id: int = -1
    name: str = ""
    energy_start: float = 0
    energy_end: float = 0
    mission: str = ""

    
    def __eq__(self, o: object) -> bool:
        if not isinstance(o, Instrument):
            return False
        for attr in ['name','energy_start','energy_end']:
            if getattr(self,attr) != getattr(o,attr):
                return False
        return True

@dataclass
class Observation:
    instru:Instrument = ""
    start_time: datetime = datetime(2000,1,1)
    flux: float = 0
    flux_err: float = 0
    exp_time: float  = 0

    # @property
    # def instru_name(self):
    #     return self.instru.name
    # @property
    # def energy_start(self):
    #     return self.instru.energy_start
    # @property
    # def energy_end(self):
    #     return self.instru.energy_end
    # @property
    # def instru_id(self):
    #     return self.instru.id

    def __str__(self) -> str:
        return f"{self.__dict__}"

    def __repr__(self) -> str:
        return self.__str__()

    def __eq__(self, o: object) -> bool:
        if not isinstance(o, Observation):
            return False
        o: Observation
        for attr in [
                     "start_time",
                     "exp_time",
                     "flux",
                     "flux_err"
                     ]:
            if getattr(self,attr) != getattr(o,attr):
                return False
        return True


@dataclass
class Source:
    id: int=-1  # 作为指向参考表的“外键”
    name: str ="" # 作为时序库表名
    ra: float = 0
    dec: float = 0
    mission: str = ""

    
    def __eq__(self, o: object) -> bool:
        if not isinstance(o, Source):
            return False
        o: Source
        for attr in ["name","ra","dec","mission"]:
            if getattr(self,attr) != getattr(o,attr):
                return False
        return True


class SourceDetail:
    src: Source
    obses: Iterable[Observation]



