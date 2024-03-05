from abc import abstractmethod
from typing import Iterable, List
from ..model import Instrument, Source


class ISourceTable:

    def find(self,src:Source)->Source:
        """
        在参考表中找到源，依据任务名称和源名
        """
        
    
    @abstractmethod
    def insert(self,src:Source)->Source:
        """
        在参考表中查找，若不存在，则将其插入参考表并返回
        """
    
    def find_closet_src(self,src:Source)->Source:
        """查找最近的源"""

    def cone_search(self,ra:float,dec:float,radius:float)->List[Source]:
        """锥形检索

        Args:
            ra (float): degree
            dec (float): degree
            radius (float): degree

        Returns:
            List[Source]: _description_
        """

class IInstruTable:
    @abstractmethod
    def find_by_name(self,name:str)->Instrument:
        """
        依据名称，在设备表中找到设备
        """

    @abstractmethod
    def find_by_energy_band(self,energy_start:float,energy_end:float)->Iterable[Instrument]:
        """
        依据能段，找到所有符合条件的设备
        """

    @abstractmethod
    def insert(self, instru:Instrument)->Instrument:
        """
        插入一个设备
        """
