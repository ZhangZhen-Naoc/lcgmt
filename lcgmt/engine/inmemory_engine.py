from typing import Dict, Iterable, List

from .base_engine import Source, Observation, BaseEngine, Instrument

class InmemoryEngine(BaseEngine):
    data: Dict[str,Dict[str,List[Observation]]]
    def __init__(self) -> None:
        self.data = {}

    def put_obs(self, src: Source,instru:Instrument, obs: Observation) -> bool:
        if src.name not in self.data:
            self.data[src.name] = {}
        if instru.name not in self.data[src.name]:
            self.data[src.name][instru.name] = []
        self.data[src.name][instru.name].append(obs)

    def get(self, src: Source) -> Iterable[Observation]:
        data =  self.data.get(src.name)
        if data is None:
            return None
        result = []
        for data_per_wavelength in data.values():
            result = result + [obs for obs in data_per_wavelength]
        return result

    def put_obses(self, src: Source,instru:Instrument, obses: Iterable[Observation]) -> bool:
        for obs in obses:
            self.put_obs(src,instru,obs)