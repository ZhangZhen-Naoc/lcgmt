from datetime import datetime, timedelta
from typing import Generic, Iterable, List, Tuple
from lcgmt.engine.base_engine import BaseEngine
from lcgmt.model import Instrument, Observation, Source
from influxdb_client import InfluxDBClient, Point, WritePrecision  # install influxdb-client
from influxdb_client.client.write_api import SYNCHRONOUS

class InfluxdbResult():
    
    def __init__(self,result:List):
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
    
class InfluxdbEngine(BaseEngine):
    def __init__(self,url:str, token:str, org:str, bucket: str) -> None:
        self.bucket = bucket
        self.client = InfluxDBClient(url=url, token=token)
        
        client = self.client
        
        write_api = client.write_api(write_options=SYNCHRONOUS)
        self.write = lambda point:write_api.write(bucket,org,point)
        query_api = client.query_api()
        self.query = lambda query:query_api.query(query,org)
        self.delte = lambda :client.delete_api().delete(datetime(1950,1,1),datetime(2050,1,1),'_measurement="obs"',bucket,org)
    def put_obs(self, src: Source, instru: Instrument, obs: Observation) -> bool:
        self.write(
            Point("obs")\
            .tag('src_id',src.id)\
            .tag('instru_id',instru.id)\
            .time(obs.start_time)\
            .field('exp_time',float(obs.exp_time))\
            .field('flux',float(obs.flux))\
            .field('flux_err',float(obs.flux_err))
        )
    
    def put_obses(self, src: Source, instru: Instrument, obses: Iterable[Observation]) -> bool:
        for obs in obses:
            self.put_obs(src,instru,obs)
    
    def get_obs_by_timerange(self, src: Source, instru: Instrument, time_range: Tuple[datetime, datetime]) -> Iterable[Observation]:
        start_time = time_range[0].strftime("%Y-%m-%dT%H:%M:%SZ")
        end_time = time_range[1].strftime("%Y-%m-%dT%H:%M:%SZ") 

        # sql = f'''from(bucket: \"{self.bucket}\") 
        #     // |> range(start: {start_time}, stop:{end_time})
        #     range(start: -50y)
        #     |> filter(fn:(r) => r._measurement == "obs")
        #     |> filter(fn: (r) => r.src_id == "{src.id}")
        #     |> filter(fn: (r) => r.instru_id == "{instru.id}")
        #  //   |> filter(fn:(r) => r._field == "flux" )
        #     '''
        sql = f'''from(bucket: "{self.bucket}")  |> range(start: {start_time}, stop:{end_time})
            |> filter(fn:(r) => r._measurement == "obs")
            |> filter(fn: (r) => r.src_id == "{src.id}")
            |> filter(fn: (r) => r.instru_id == "{instru.id}")
            '''
        result = self.query(sql)
        
        return InfluxdbResult(result)
            
    def get(self, src: Source, instru: Instrument) -> Iterable[Observation]:
        sql = f'''from(bucket: "{self.bucket}")  |> range(start: -30y)
            |> filter(fn:(r) => r._measurement == "obs")
            |> filter(fn: (r) => r.src_id == "{src.id}")
            |> filter(fn: (r) => r.instru_id == "{instru.id}")
            
            '''
        result = self.query(sql)
        

        # return _unpack(result)
        return InfluxdbResult(result)
    

    def clear(self):
        self.delte()

def _unpack(influxdb_result)->List[Observation]:
    obses = []
    for col_idx,col in enumerate(influxdb_result):
            
        for row_idx,row in enumerate(col):
            if col_idx==0: # 第一次访问，插入列表
                obs = Observation()
                obses.append(obs)
            else:
                obs = obses[row_idx]
            obs.start_time = row['_time'].replace(tzinfo=None)
            if row.get_field()=="flux":
                obs.flux=row.get_value()
            if row.get_field()=="flux_err":
                obs.flux_err=row.get_value()
            if row.get_field()=="exp_time":
                obs.exp_time = row.get_value()
    
    return obses