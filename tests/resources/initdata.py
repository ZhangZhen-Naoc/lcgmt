# 两个源，两个能段，每个源每个能段2次观测

from lcgmt.model import Instrument, Source, Observation
from datetime import datetime
src1 = Source(name="src1",id="1",ra=0.,dec=0.)
instru1 = Instrument(
            id=1,
            name="ep1",
            energy_start=10.0,
            energy_end=20.0
            )
instru2 = Instrument(
            id=2,
            name="ep2",
            energy_start=30.0,
            energy_end=50.0)
obs1 = [
    Observation(
            start_time=datetime.strptime("2020-01-01 00:00:00.1","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=10.0,
            flux_err=2.0,
    ),
    Observation(
            start_time=datetime.strptime("2020-01-02 00:00:00.2","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=2,
            flux=12.0,
            flux_err=2.0
    ),
    Observation(
            start_time=datetime.strptime("2020-01-01 00:00:00.3","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=16.0,
            flux_err=2.0
    ),
    Observation(
            start_time=datetime.strptime("2020-01-02 00:00:00.4","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=3,
            flux=16.0,
            flux_err=2.0
    )
    
]
src2 = Source(name="src2",id="2",ra=0.,dec=0.)
obs2 = [
    Observation(
            start_time=datetime.strptime("2020-01-01 00:00:00.5","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=10.0,
            flux_err=2.0
    ),
    Observation(
            start_time=datetime.strptime("2020-01-02 00:00:00.01","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=2,
            flux=12.0,
            flux_err=2.0
    ),
    Observation(
            start_time=datetime.strptime("2020-01-01 00:00:00.02","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=16.0,
            flux_err=2.0
    ),
    Observation(
            start_time=datetime.strptime("2020-01-02 00:00:00.09","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=3,
            flux=16.0,
            flux_err=2.0
    )
    
]

obs3 = [ 
    Observation(
            start_time=datetime.strptime("2020-01-01 00:00:00.5","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=10.0,
            flux_err=2.0
    ),
    Observation(
            start_time=datetime.strptime("2020-01-01 12:00:00.5","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=12,
            flux_err=2.0
    ), 
    Observation(
            start_time=datetime.strptime("2020-01-01 23:00:00.5","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=14,
            flux_err=2.0
    ), 
    Observation(
            start_time=datetime.strptime("2020-01-02 00:00:00.5","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=16.0,
            flux_err=2.0
    ), 
    Observation(
            start_time=datetime.strptime("2020-01-02 12:00:00.5","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=18.0,
            flux_err=2.0
    ), 
    Observation(
            start_time=datetime.strptime("2020-01-02 23:00:00.5","%Y-%m-%d %H:%M:%S.%f"),
            exp_time=1,
            flux=20.0,
            flux_err=2.0
    ), 
       
]