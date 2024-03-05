from typing import Tuple
from astropy.time import Time
from datetime import datetime
def mjd_to_datetime(mjd:float)->datetime:
    return Time(mjd,format='mjd').to_datetime()

def has_intersect(range1:Tuple[float,float],range2:Tuple[float,float]):
    """判断两个区间是否有交集"""
    return is_in_range(range1[0],range2) or is_in_range(range1[1],range2) \
        or is_in_range(range2[0],range1) or is_in_range(range2[1],range1)

def is_in_range(key:float, range:Tuple[float,float]):
    return key>range[0] and key<range[1]