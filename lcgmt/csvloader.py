import csv
from datetime import datetime
from typing import Dict, Iterable, List, Tuple 
from .model import Instrument, Source, Observation
import os


class CsvLoader:
    mission_dir:str
    instrus:Dict[str,Instrument]

    def __init__(self, mission:str,base_dir=os.environ.get("DATA_DIR")) -> None:
        self.mission_dir=os.path.join(base_dir,mission)
        self.instrus =dict([(instru.name,instru) for instru in  self.load_instrus()])
    
    def load(self)->Iterable[Tuple[Source,Iterable[Tuple[Instrument,Iterable[Observation]]]]]:
        """
        从一个文件夹加载源和观测。组织方式：任务名称/源/设备名称.csv
        任务名称下包含：
            一个设备配置文件，包含设备列表：id，name，energy_start,energy_end
            一个源表文件：包含参考数据库中id，name，ra，dec
        每个csv文件包括4列：开始时间，结束时间，流量，流量误差
        """

    def load_instrus(self)->Iterable[Instrument]:
        with open(os.path.join(self.mission_dir,"instrus.csv"))as f:
            reader = csv.DictReader(f)
            instrus =  [Instrument(
                id=int(instru['id']),
                name=instru['name'],
                energy_start=float(instru['energy_start']),
                energy_end=float(instru['energy_end'])
                ) for instru in reader]
        return instrus

    def load_obses(self,instru_name:str,src_name)->Iterable[Observation]:
        with open(f"{self.mission_dir}/{src_name}/{instru_name}.csv")as f:
            reader = csv.reader(f)
            obses =  [Observation(
                instrument=self.instrus[instru_name],
                start_time=datetime.strptime(obs[0],'%Y-%m-%d %H:%M:%S'),
                end_time=datetime.strptime(obs[1],'%Y-%m-%d %H:%M:%S'),
                flux = float(obs[2]),
                flux_err = float(obs[3])
                ) for obs in reader]
        return obses

    def load_srcs(self)->Iterable[Source]:
        with open(os.path.join(self.mission_dir,"sources.csv"))as f:
            reader = csv.DictReader(f)
            srcs =  [Source(
                id=int(src['id']),
                name=src['name'],
                ra=float(src['ra']),
                dec=float(src['dec'])
                ) for src in reader]
        return srcs