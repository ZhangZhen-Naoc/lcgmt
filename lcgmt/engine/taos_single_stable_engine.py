from typing import Iterable, List, Tuple
from encodings.base64_codec import base64_encode
import requests
import json
from lcgmt.model import Instrument, Observation, Source
from .base_engine import BaseEngine
from datetime import datetime
from .base_taos_engine import BaseTaosEngine
MAX_ITEM_EACH_TIME=800  # 由于最大sql限制（64K），所以限制一次最多800条
class SingleSTableEngine(BaseTaosEngine):
    

    def create_table_sql(self,src:Source,instru:Instrument):
        create_table_sql = f"CREATE TABLE IF NOT EXISTS {self.database}.src{src.id}_{instru.name} USING {self.database}.obs TAGS({src.id},{instru.energy_start},{instru.energy_end},'{instru.name}',{instru.id});"
        create_stable_sql = f"CREATE STABLE  IF NOT EXISTS {self.database}.obs (start_time TIMESTAMP,exp_time DOUBLE,flux DOUBLE ,flux_err DOUBLE) TAGS (src_id BIGINT,energy_start DOUBLE ,energy_end DOUBLE ,instru_NAME NCHAR(100),instru_id BIGINT);"
        return create_stable_sql, create_table_sql,
    
    def put_sql(self,src:Source,instru:Instrument,obs: Observation):
        """生成插入obs的sql"""
        create_stable_sql, create_table_sql = self.create_table_sql(src,instru)
        put_sql = f"INSERT INTO {self.database}.src{src.id}_{instru.name} VALUES('{obs.start_time}',{obs.exp_time},{obs.flux},{obs.flux_err});"
        # return f"{create_stable_sql}{create_table_sql}{put_sql}"
        return  create_stable_sql, create_table_sql,put_sql

    
    def get_sql(self,src,instru):
        return f"SELECT * FROM {self.database}.src{src.id}_{instru.name};"
    
    def get_obs_by_timerange_timebin_sql(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime], timebin: float)->str:
        start_time = time_range[0].strftime("%Y-%m-%d %H:%M:%S")
        end_time = time_range[1].strftime("%Y-%m-%d %H:%M:%S")
        return f'SELECT _wstart, SUM(exp_time),AVG(flux),MAX(flux_err) FROM {self.database}.obs  WHERE src_id={src.id} AND instru_id={instru.id} AND start_time BETWEEN "{start_time}" AND "{end_time}" INTERVAL({timebin}d)'
    
    def get_obs_by_timerange_sql(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime])->str:
        start_time = time_range[0].strftime("%Y-%m-%d %H:%M:%S")
        end_time = time_range[1].strftime("%Y-%m-%d %H:%M:%S")
        return f'SELECT * FROM {self.database}.obs WHERE src_id={src.id} AND instru_id={instru.id} AND start_time BETWEEN "{start_time}" AND "{end_time}" '
    

    
    # def put_obs(self, src: Source,instru:Instrument, obs: Observation) -> bool:
    #     self.execute(self.put_sql(src,instru,obs))
    #     return True

    # def get(self, src: Source, instru:Instrument) -> Iterable[Observation]:
    #     get_sql = f"SELECT * FROM {self.database}.src{src.id}_{instru.name};"
    #     response =  self.execute((get_sql,)).decode()
    #     data = json.loads(response)['data']
    #     TIME_START_IDX=0
    #     EXP_TIME_IDX=1
    #     FLUX_IDX=2
    #     FLUX_ERR_IDX=3

    #     return [Observation(
    #             instru=instru,
                
    #             start_time=datetime.strptime(obs[TIME_START_IDX],"%Y-%m-%d %H:%M:%S.%f"),
    #             exp_time=obs[EXP_TIME_IDX],
    #             flux=obs[FLUX_IDX],
    #             flux_err=obs[FLUX_ERR_IDX]
    #         ) for obs in data
    #     ]
    
    def put_obses(self, src: Source,instru:Instrument, obses: Iterable[Observation]) -> bool:
        """插入一系列观测。插入前需保证：这些obs有相同的元数据（设备，能段）"""
        obs_lst = [obs for obs in obses]
        self.execute( self.create_table_sql(src,instru))
        values:List[str] = [f"('{obs.start_time}',{obs.exp_time},{obs.flux},{obs.flux_err})" for obs in obses]
        cnt = len(values)
        idx=0
        while idx<cnt:
            idx_end = idx+MAX_ITEM_EACH_TIME
            if idx_end>cnt:
                idx_end=cnt
            put_sql = f"INSERT INTO {self.database}.src{src.id}_{instru.name} VALUES {' '.join(values[idx:idx_end])};"
            self.execute(( put_sql, ))
            idx=idx_end

    # def get_obs_by_timerange_timebin(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime], timebin: float) -> Iterable[Observation]:
    #     start_time = time_range[0].strftime("%Y-%m-%d %H:%M:%S")
    #     end_time = time_range[1].strftime("%Y-%m-%d %H:%M:%S")
    #     resp = self.execute(( f'SELECT AVG(flux) FROM {self.database}.src{src.id}_{instru.name}  WHERE start_time BETWEEN "{start_time}" AND "{end_time}" INTERVAL({timebin}d)' ,)).decode()
    #     data = json.loads(resp)['data']
    #     return [Observation(
    #         start_time=datetime.strptime(obs[0],"%Y-%m-%d %H:%M:%S.%f"),
    #             flux=obs[1],
    #             flux_err=0
    #         ) for obs in data
    #     ]
    
    # def get_obs_by_timerange(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime]) -> Iterable[Observation]:
    #     start_time = time_range[0].strftime("%Y-%m-%d %H:%M:%S")
    #     end_time = time_range[1].strftime("%Y-%m-%d %H:%M:%S")
    #     resp = self.execute(( f'SELECT start_time, flux,flux_err FROM {self.database}.src{src.id}_{instru.name}  WHERE start_time BETWEEN "{start_time}" AND "{end_time}" ' ,)).decode()
    #     data = json.loads(resp)['data']
    #     return [Observation(
    #         start_time=datetime.strptime(obs[0],"%Y-%m-%d %H:%M:%S.%f"),
    #             flux=obs[1],
    #             flux_err=obs[2]
    #         ) for obs in data
    #     ]

    def clear(self):
        self.execute((f"drop database {self.database};",))
        self.execute((f"CREATE DATABASE IF NOT EXISTS {self.database};",))