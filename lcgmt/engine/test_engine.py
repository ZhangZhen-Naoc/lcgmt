"""
engine的性能测试引擎，与Engine有相同接口
但是，在每一次接口调用，都记录了参数和运行时间
通过.logs对象获取操作记录
"""
from datetime import datetime
from io import StringIO
from typing import Dict, Iterable, List, Tuple
from lcgmt.engine.base_engine import BaseEngine
from ..model import Instrument, Observation, Source
import time 

class Log:
    operation:str
    args:Tuple
    kwargs:Dict
    timespan:float

    def __init__(self,operation,args,kwargs,timespan) -> None:
        self.operation = operation
        self.args = args
        self.kwargs = kwargs
        self.timespan = timespan
        
    def __str__(self) -> str:
        return f"""
    Operation: {self.operation},
    args     : {self.args},
    kwargs   : {self.kwargs},
    timespan : {self.timespan}
    
    """
    
    def __repr__(self) -> str:
        return self.__str__()

def monitor_decorator(funcname:str):
    def decorator(func):
        def wrapped_func(self,*args, **kwargs):
            time_start = time.process_time()
            result =  func(self,*args, **kwargs)
            time_end = time.process_time()
            self.logs.append(Log(
                operation=funcname,
                args=args,
                kwargs=kwargs,
                timespan=time_end-time_start
            ))
            return result

        return wrapped_func
    return decorator
class TestEngine(BaseEngine):
    core: BaseEngine
    logs: List[Log]
    def __init__(self,core:BaseEngine) -> None:
        self.core = core
        self.logs = []


    @monitor_decorator("put_obs")
    def put_obs(self, src: Source, obs: Observation) -> bool:
        self.core.put_obs(src,obs)

    @monitor_decorator("get")
    def get(self, src: Source) -> Iterable[Observation]:
        self.core.get(src)

    @monitor_decorator("get_obs_by_timerange")
    def get_obs_by_timerange(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime]) -> Iterable[Observation]:
        return self.core.get_obs_by_timerange(src, instru, time_range)
    
    @monitor_decorator("get_obs_by_timerange_timebin")
    def get_obs_by_timerange_timebin(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime], timebin: float) -> Iterable[Observation]:
        return self.core.get_obs_by_timerange_timebin(src, instru, time_range, timebin)

    @monitor_decorator("put_obses")
    def put_obses(self, src: Source, obses: Iterable[Observation]) -> bool:
        self.core.put_obses(src,obses)

