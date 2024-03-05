from astropy.timeseries import TimeSeries
import os
from flask import current_app, send_from_directory
import json

# filename = 'ep11900000001wxt1s1.lc'
# quick_look_lc_filename = os.path.join('wxt_product_level2','11900000001',filename)
# example_data = os.path.join(current_app.config['APP_PRODUCT_FOLDER'], quick_look_lc_filename)
# test_table = TimeSeries.read(example_data,time_column="TIME",time_format="cxcsec")

def table_to_python(table):
    """Convert Astropy Table to Python dict.

    Numpy arrays are converted to lists, so that
    the output is JSON serialisable.

    Can work with multi-dimensional array columns,
    by representing them as list of list.
    """
    total_data = {}
    for name in table.colnames:
        print(name)
        if name == 'time' or name == 'RATE':
            data = table[name].value.tolist()
        else:
            continue
        total_data[name] = data
    return total_data

def convert_lc(filepath):
    """Get lc fits file and convert to dict
    """
    lc_ts = TimeSeries.read(filepath,time_column="TIME",time_format="cxcsec")
    lc = table_to_python(lc_ts)
    # lc_json = json.dumps(lc)
    # return lc_json
    return lc

