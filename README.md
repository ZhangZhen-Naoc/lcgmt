# LCGMT : Light Curve Generator in Multi-Time-bin based on time-series database

## Enviroment requirements
- Postgresql >=12.0
- TDEngine >=3.0
- Python >=3.8
## Components
- SourceTable : a postgresql table based database for storing the sources
- InstruTable : a postgresql table based database for storing the instruments or dataset metadata
- Engine : a time-series database engine for stroring and generating light curves. TDEngine, postgresql and Influxdb are supported

## Config
- config.py : the configuration file for the database and the engine, specify the database connection and the engine parameters

## Run 
- backend: api.py : a flask application for the api
- frontend: lcgmt_frontend/wsgi.py
- Nginx: as the gateway. proxy /lcgmt to frontend and /lcgmt/api to backend

## Quick look
![Screenshot_20240305_152709](https://github.com/ZhangZhen-Naoc/lcgmt/assets/156745898/2f128541-369a-40fc-b956-07d87b00c871)
