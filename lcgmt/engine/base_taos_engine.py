from abc import abstractmethod
import time
from typing import Iterable, List, Tuple
from encodings.base64_codec import base64_encode
import requests
import json
from lcgmt.model import Instrument, Observation, Source
from .base_engine import BaseEngine
from datetime import datetime
import logging

MAX_ITEM_EACH_TIME=800  # 由于最大sql限制（64K），所以限制一次最多800条
class BaseTaosEngine(BaseEngine):
    url:str
    database:str
    username:str
    password:str
    token:str

    @abstractmethod
    def get_sql(self,src:Source,instru:Instrument)->str:
        pass
    
    @abstractmethod
    def put_sql(self,src:Source,instru:Instrument,obs:Observation)->str:
        pass
    
    @abstractmethod
    def get_obs_by_timerange_timebin_sql(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime], timebin: float)->str:
        pass
    
    @abstractmethod
    def get_obs_by_timerange_sql(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime])->str:
        pass
    
    @abstractmethod
    def put_obses_sql(self,src:Source,instru:Instrument,obses:List[Observation]) :
        pass
    
    def __init__(self,url:str,database:str,username,password) -> None:
        super().__init__()
        token,token_len = base64_encode(f"{username}:{password}".encode())
        self.url = url
        self.database = database
        self.token = token.decode()[:-1] # :-1是为了去除末尾的换行符

    def execute(self,sqls:Iterable[str])->str:
        """
        执行sql
        """
        headers = {
            "Authorization": f"Basic {self.token}" # :-1是为了去除末尾的换行符
        }
        if isinstance(sqls,str): # 单条sql
            sqls = (sqls,)
        for sql in sqls:
            response = requests.post("http://localhost:6041/rest/sql",headers=headers,data=sql)
        
        if response.status_code == 200:
            return TDEngineResult(response.content.decode())
        else:
            raise Exception(f"Sql Error: {sqls}")

    
    
    

    def put_obs(self, src: Source,instru:Instrument, obs: Observation) -> bool:
        self.execute(self.put_sql(src,instru,obs))
        return True

    def get(self, src: Source, instru:Instrument) -> Iterable[Observation]:
        sql = self.get_sql(src,instru)
        
    
        TIME_START_IDX=0
        EXP_TIME_IDX=1
        FLUX_IDX=2
        FLUX_ERR_IDX=3
        SRC_ID_IDX=4
        ENERGY_START=5
        ENERGY_END=6
        INSTRU_NAME_IDX=7
        INSTRU_ID_IDX=8
        
        try:
            return self.execute(sql)
        except Exception:
            return []
       
    
    
    
    def put_obses(self, src: Source,instru:Instrument, obses: Iterable[Observation]) -> bool:
        """插入一系列观测。插入前需保证：这些obs有相同的元数据（设备，能段）"""
        obs_lst = [obs for obs in obses]
        create_stable_sql,create_table_sql = self.create_table_sql(src,instru)
        values:List[str] = [f"('{obs.start_time}',{obs.exp_time},{obs.flux},{obs.flux_err})" for obs in obses]
        cnt = len(values)
        idx=0
        while idx<cnt:
            idx_end = idx+MAX_ITEM_EACH_TIME
            if idx_end>cnt:
                idx_end=cnt
            put_sql = put_obses_sql(self,src,instru,obses) 
            self.execute(( create_stable_sql,create_table_sql,put_sql ))
            idx=idx_end

    def get_obs_by_timerange_timebin(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime], timebin: float) -> Iterable[Observation]:
        start_time = time_range[0].strftime("%Y-%m-%d %H:%M:%S")
        end_time = time_range[1].strftime("%Y-%m-%d %H:%M:%S")
        sql = self.get_obs_by_timerange_timebin_sql(src,instru,time_range,timebin)
        try:
            return self.execute(sql)
        except Exception:
            return []
        
    
    def get_obs_by_timerange(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime]) -> Iterable[Observation]:
        start_time = time_range[0].strftime("%Y-%m-%d %H:%M:%S")
        end_time = time_range[1].strftime("%Y-%m-%d %H:%M:%S")
        sql = self.get_obs_by_timerange_sql(src,instru,time_range)
        try:
            return self.execute(sql)
        except Exception:
            return []

    def clear(self):
        self.execute((f"drop database {self.database};",))
        self.execute((f"CREATE DATABASE IF NOT EXISTS {self.database};",))

class TDEngineResult:
        
    def __init__(self,result:str):
        self.result = result
        self.unpacked = None

    def __iter__(self):
        if not self.unpacked:
            self.unpacked = _unpack(self.result)
        return iter(self.unpacked)
    
    def __len__(self):
        if not self.unpacked:
            self.unpacked = _unpack(self.result)
        return self.unpacked.__len__()

    def __getitem__(self,key:int):
        if not self.unpacked:
            self.unpacked = _unpack(self.result)
        return self.unpacked[key]

def _unpack(result:str)->List[Observation]:
    logging.warn(result)
    logging.warn(".....................................................................")
    time1 = time.process_time()
    data_json = json.loads(result).get('data')
    time2 = time.process_time()
    obses = [Observation(
                start_time=datetime.strptime(obs[0],"%Y-%m-%dT%H:%M:%S.%fZ"),
                exp_time=obs[1],
                flux=obs[2],
                flux_err=obs[3]
                ) for obs in data_json
            ]
    time3 = time.process_time()
    return obses
