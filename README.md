# LCGMT : Light Curve Generator in Multi-Time-bin based on time-series database

## Components
- SourceTable : a postgresql table based database for storing the sources
- InstruTable : a postgresql table based database for storing the instruments or dataset metadata
- Engine : a time-series database engine for stroring and generating light curves. TDEngine, postgresql and Influxdb are supported

## Config
- config.py : the configuration file for the database and the engine, specify the database connection and the engine parameters

## Run 
- api.py : a flask application for the api
