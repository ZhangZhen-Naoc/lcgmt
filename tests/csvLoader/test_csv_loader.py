from datetime import datetime
import os
from typing import Iterable
from iterassert import any_match

from pytest import fixture
from lcgmt.csvloader import TDengineCsvLoader, PostgreCsvLoader
from lcgmt.loader.Loader import Loader
from lcgmt.model import Instrument, Observation, Source
from tests.resources.initdata import src1,src2,obs1,obs2,instru1,instru2,obs3

class SimpleLoader(Loader):
    def get_srcs(self) -> Iterable[Source]:
        return [
            src1,src2
        ]
    def get_instrus(self) -> Iterable[Instrument]:
        return [
            instru1,instru2
        ]
        
    def get_obses(self, src: Source, instru: Instrument) -> Iterable[Observation]:
        return obs1
    
@fixture
def mkdir():
    now = datetime.now().strftime("%Y-%m-%dT%H-%M-%S.%f")
    target = os.path.join("/tmp/taoscsv",now)
    os.mkdir(target)
    
    return target

def test_tdengine(mkdir:str):
    loader = TDengineCsvLoader()
    loader.write_csv(SimpleLoader(),mkdir)
    files = os.listdir(mkdir)
    assert len(list(filter(lambda x:x[-4:]==".sql",files)))==1 # 一个sql文件
    assert len(list(filter(lambda x:x[-4:]==".csv",files)))==4 # 2*2=4个csv文件
    
def test_postgre(mkdir:str):
    loader = PostgreCsvLoader()
    loader.write_csv(SimpleLoader(),mkdir)
    files = os.listdir(mkdir)
    assert len(list(filter(lambda x:x[-4:]==".sql",files)))==1 # 一个sql文件
    assert len(list(filter(lambda x:x[-4:]==".csv",files)))==4 # 2*2=4个csv文件
