# 用来测试时序数据融合
from datetime import datetime
from typing import Iterable

from encodings.base64_codec import base64_encode
import requests
from lcgmt.loader.MaxiLoader import MaxiLoader
from lcgmt.loader.Loader import Loader
from lcgmt.loader.XMMLoader import XMMLoader
from lcgmt.loader.MaxiLoader import MaxiLoader
from lcgmt.engine.taos_engine import TaosEngine
from lcgmt.engine.base_engine import BaseEngine
from lcgmt.ReferenceTable.SourceTable import SouceTable
from lcgmt.ReferenceTable.InstruTable import InstruTable
import psycopg2

from lcgmt.model import Instrument, Observation, Source
from lcgmt.webapi import create_app
from config import source_table, instru_table, engine
from flask_cors import CORS


app = create_app(source_table,instru_table,engine)
CORS(app)
app.run(debug=True,host="0.0.0.0")
