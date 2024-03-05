import math
import re
from typing import List, Tuple
import sqlalchemy.types as types
from sqlalchemy import text

class SPolyColumn(types.UserDefinedType):
    def get_col_spec(self, **kw):
        return "SPOLY"
    def bind_processor(self, dialect):
        def process(value:SPoly):
            
            points = ", ".join([f"({point.lon},{point.lat})" for point in value.points])
            return "{" + points + "}"
        return process

    def result_processor(self, dialect, coltype):
        def process(value:str):
            points_str:List[str] = re.findall("[0-9\.]+",value)
            points = []
            for i in range(len(points_str)):
                if i%2==0:
                    continue
                points.append((float(points_str[i-1]),float(points_str[i])))
            
            return SPoly(points)
        return process
    

class SPoly:
    def __init__(self, coords:List[Tuple[float,float]]) -> None:
        super().__init__()
        self.points = [SPoint(lon,lat) for lon,lat in coords]
        
    def __eq__(self, __o: object) -> bool:
        return isinstance(__o,SPoly) and self.points==__o.points
    
    def __repr__(self) -> str:
        return ", ".join([f"({point.lon},{point.lat})" for point in self.points])
class SPoint:
    def __init__(self,lon:float,lat:float) -> None:
        super().__init__()
        self.lon = lon
        self.lat = lat
    
    def __eq__(self, __o: object) -> bool:
        return isinstance(__o,SPoint) and self.lat==__o.lat and self.lon==__o.lon
class SPointColumn(types.UserDefinedType):
    def get_col_spec(self, **kw):
        return "SPOINT"
    
    