from datetime import datetime
from typing import Iterable, List, Tuple
from lcgmt.engine.base_engine import BaseEngine
from lcgmt.model import Instrument, Observation, Source
import psycopg2
import json

MAX_ITEM_EACH_TIME=80
class RelationalEngine(BaseEngine):
    def __init__(self,database="nadc", user="postgres", password="password", host="127.0.0.1", port="5432") -> None:
        super().__init__()
        self.host = host
        self.database = database
        self.user=user
        self.password = password
        self.port = port
    
    def put_obs(self, src: Source, instru: Instrument, obs: Observation) -> bool:
        with psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port) as conn:
            cur = conn.cursor()
            insert_sql = f"INSERT INTO obses (start_time, exp_time, flux, flux_err, src_id, instru_id) VALUES ('{obs.start_time}',{obs.exp_time}, {obs.flux}, {obs.flux_err}, {src.id}, {instru.id})"
            cur.execute(insert_sql)
            conn.commit()

    
    def put_obses(self, src: Source, instru: Instrument, obses: Iterable[Observation]) -> bool:
        values:List[str] = [f"('{obs.start_time}',{obs.exp_time},{obs.flux},{obs.flux_err},{src.id},{instru.id})" for obs in obses]
        cnt = len(values)
        idx=0
        with psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port) as conn:
            while idx<cnt:
                cur = conn.cursor()
                idx_end = idx+MAX_ITEM_EACH_TIME
                if idx_end>cnt:
                    idx_end=cnt
                put_sql = f"INSERT INTO obses (start_time, exp_time, flux, flux_err, src_id, instru_id) VALUES {', '.join(values[idx:idx_end])};"
                cur.execute(put_sql)
                idx=idx_end
    
    def get(self, src: Source, instru: Instrument) -> Iterable[Observation]:
        with psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port) as conn:
            get_sql = f"SELECT * FROM obses WHERE src_id={src.id} AND instru_id={instru.id};"
            cur = conn.cursor()
            cur.execute(get_sql)
            rows = cur.fetchall()
            return RelationalEngineResult(rows)
            
    def clear(self):
        with psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port) as conn:
            cur = conn.cursor()
            cur.execute("TRUNCATE TABLE obses RESTART IDENTITY CASCADE;")
            
        
    
    def get_obs_by_timerange(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime]) -> Iterable[Observation]:
        with psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port) as conn:
            cur = conn.cursor()
            cur.execute(f"SELECT * FROM obses WHERE src_id={src.id} AND instru_id={instru.id} AND start_time between '{time_range[0]}' AND '{time_range[1]}'")
            rows = cur.fetchall()
            return RelationalEngineResult(rows)
    
    def get_obs_by_timerange_timebin(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime], timebin: float) -> Iterable[Observation]:
        start_time = time_range[0].strftime("%Y-%m-%d %H:%M:%S")
        end_time = time_range[1].strftime("%Y-%m-%d %H:%M:%S")
        with psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port) as conn:
            cur = conn.cursor()
            cur.execute(f"SELECT reduce_time('{start_time}',start_time,{timebin}*3600*24) AS reduced_time, AVG(flux) FROM obses WHERE src_id={src.id} AND instru_id={instru.id} AND start_time BETWEEN '{start_time}' AND '{end_time}' GROUP BY reduced_time ORDER BY reduced_time;")
        rows = cur.fetchall()
        return [Observation(
            instru=instru,
            start_time=row[0],
            exp_time=0,
            flux=row[1],
            flux_err=0
        ) for row in rows]
    # select FLOOR(EXTRACT(EPOCH FROM start_time-'2020-1-1')/21)*21 AS time1, AVG(flux)  FROM obses GROUP BY time1 ; # 将start_time分组

class RelationalEngineResult:
    
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
    return [Observation(
            start_time=row[0],
            exp_time=row[1],
            flux=row[2],
            flux_err=row[3]
        ) for row in result]
