from typing import Tuple


def ra_degree_to_time(degree: float) -> Tuple[int, int, int]:
    '''

    :param degree: 角度，0-360
    :return: 时，分，秒元组
    '''
    if isinstance(degree, str):
        degree = float(degree)
    seconds = int(240 * degree)  # 化简自 seconds = (degree/360)*(24*60*60)
    hour = int(seconds / 3600)
    minute = int((seconds - hour * 3600)/60)
    second = seconds - hour * 3600 - minute * 60
    return hour, minute, second

def dec_float_to_degree(value: float) -> Tuple[int, int, int]:
    if isinstance(value, str):
        value = float(value)
    abs_value = abs(value)
    degree = int(abs_value)
    rest = abs_value  - degree
    minute = int(rest*60)
    rest = rest - minute/60
    second = int(rest * 3600)

    if value < 0:
        degree =  degree*-1
    return degree, minute, second
