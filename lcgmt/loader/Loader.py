from abc import abstractclassmethod, abstractmethod
from ..model import *
from pandas import DataFrame
class Loader:
    mission:str
    @abstractmethod
    def get_srcs(self)->Iterable[Source]:
        pass

    @abstractmethod
    def get_instrus(self)->Iterable[Instrument]:
        pass
    
    @abstractmethod
    def get_obses(self,src:Source,instru:Instrument)->DataFrame:
        pass