import asyncio
from io import StringIO
from time import sleep
from typing import Dict
from . import client_newURLv3
import pandas as pd

async def get_upper_limit(ra:float,dec:float)->Dict:
    """从ESA API读取upperlimit

    Args:
        ra (float): _description_
        dec (float): _description_

    Returns:
        Dict: _description_
    """
    missions = ['Ginga','Asca','Ariel5','XMMpnt','XMMslew','RosatSurvey',
                'RosatPointedPSPC','RosatPointedHRI','Integral','ExosatLE',
                'ExosatME','Einstein','SwiftXRT','Uhuru', 'Vela5B']

    # Defaults to returning results in text format
    # Defaults to using all the energy bands
    # Defaults to using a spectral model of wabs*pow, with NH=3E20
    # and power-law slope=2.0 to convert c/s to flux

    # Get an array of sources from the input parameters
    
    
    result = {}
    tasks = [get_upperlimit_in_mission(ra, dec, result, mission) for mission in missions]
    await asyncio.gather(*tasks)
    
    return result

async def get_upperlimit_in_mission(ra, dec, result, mission):
    FORMAT='csv'
    # Get the flux and upper limits for this mission and position 
    try:
        result_str:str = (await client_newURLv3.ULS_mission(mission, str(ra), str(dec), '', FORMAT)).decode()
    except asyncio.exceptions.TimeoutError:
        result[mission] = [{"error":"time out error"}]
        return 
    except Exception:
        result[mission] = [{"error":"Unknown error"}]
        return 
    result[mission] = decode_result(result_str)
    

def decode_result(result_str:str)->list:
    if result_str.endswith("No data found for this position\r\n"):
        return []
    else:
        f = StringIO(result_str)
        df = pd.read_csv(f,skiprows=1)
        try:
            return list(df.to_dict(orient='index').values())
        except Exception:
            return [{"error":"Unknown error"}]