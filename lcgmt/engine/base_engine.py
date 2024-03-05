from abc import abstractmethod
import abc
from typing import Dict, Iterable, Tuple
from ..model import  Instrument, Observation, Source, SourceDetail
from datetime import datetime

class BaseEngine:
    @abstractmethod
    def put_obs(self,src:Source,instru:Instrument,obs:Observation)->bool:
        """
        向数据库中添加一条观测记录
        """
        pass


    @abstractmethod
    def put_obses(self,src:Source, instru:Instrument,obses:Iterable[Observation]) -> bool:
        """
        向数据库中一次性添加某个源的多条记录
        """
        pass

    @abstractmethod
    def get(self,src:Source,instru:Instrument)->Iterable[Observation]:
        """
        返回一个源所有观测集合（按照时序排列）
        """
        pass

    @abstractmethod
    def get_obs_by_timerange_timebin(self,src:Source,instru:Instrument,time_range:Tuple[datetime,datetime],timebin:float)->Iterable[Observation]:
        """根据源和能量，以及时间范围、时标获取光变

        Args:
            src (Source): 源，来自参考表查找
            instru (Instrument): 设备
            time_range (Tuple[datetime,datetime]): 时间范围
            timebin (float): timebin

        Returns:
            Iterable[Observation]: 观测的集合
        """
        pass
    
    @abstractmethod
    def get_obs_by_timerange(self,src:Source,instru:Instrument,time_range:Tuple[datetime,datetime])->Iterable[Observation]:
        """根据源和能量，以及时间范围、时标获取光变

        Args:
            src (Source): 源，来自参考表查找
            instru (Instrument): 设备
            time_range (Tuple[datetime,datetime]): 时间范围
            timebin (float): timebin

        Returns:
            Iterable[Observation]: 观测的集合
        """
        pass

    @abstractmethod
    def clear(self):
        """注意！！！
        谨慎使用！！！
        通常只用于测试环境！！！
        会删除所有数据
        """

