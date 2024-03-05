from abc import abstractclassmethod, abstractmethod
import os
from lcgmt.loader.Loader import Loader
import itertools
from pandas import DataFrame
import pandas as pd
from astropy.time import Time
import csv
class BaseCsvLoader:
    @abstractmethod
    def write_csv(self,lc: DataFrame,output_path:str):
        pass
    

class CSVExporter:
    """为某个特定数据库建立特定的csv样式
    """
    @abstractmethod
    def write_csv(self,lc:DataFrame,output_path:str):
        pass
    
class TDengineCsv(CSVExporter):
    def write_csv(self, lc: DataFrame, output_path: str):
        """生成TDENGINE支持的csv格式
        超表定义：CREATE STABLE  IF NOT EXISTS nadc.ep_ref (start_time TIMESTAMP,exp_time DOUBLE,flux DOUBLE ,flux_err DOUBLE) TAGS (src_id BIGINT, mission INT);

        Args:
            lc (DataFrame): _description_
            output_path (str): _description_
        """
        # with open(os.path.join(output_path,"taos.sql"),"w")as f:
        #     for src,instru in itertools.product(lc.get_srcs(),lc.get_instrus()):
        #         f.write(f"INSERT INTO ep_ref_{src.id}_{instru.id} USING ep_ref TAGS({src.id},{instru.id}) FILE './maxi1.csv';\n")
        df_new = lc.copy()
        df_new['start_time'] = lc['start_time'].apply(lambda x: f"'{x}'")
        df_new.to_csv(output_path, index=False,header=False, quoting=csv.QUOTE_NONE, quotechar="", escapechar="\\")
            
        

class PostgreCsvLoader(BaseCsvLoader):
    def write_csv(self, lc: DataFrame, output_path: str):
        df_new = lc.copy()
        df_new['start_time'] = lc['start_time'].apply(lambda x: f"'{x}'")
        df_new.to_csv(output_path, index=False,header=True, quoting=csv.QUOTE_NONE, quotechar="", escapechar="\\")