import psycopg2
from lcgmt.model import Observation,Instrument,Source
from .base_engine import BaseEngine

CREATE_TABLE_TEMPLATE = """
CREATE TABLE {table_name}(
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP,
    flux DOUBLE PRECISION,
    flux_err DOUBLE PRECISION,
    src_id INTEGER,
    instru_id INTEGER
);
SELECT create_distributed_hypertable('{table_name}', 'start_time', 'instru_id');
"""
class TimescaleEngine(BaseEngine):
    def __init__(self,database="nadc", user="postgres", password="password", host="127.0.0.1", port="5432") -> None:
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.database = database

    def connect(self):
        return psycopg2.connect(database=self.database, user=self.user, password=self.password, host=self.host, port=self.port)
    
    def create_new_src(self,conn,src:str):
        pass
    def put(self, obs: Observation) -> Observation:
        with self.connect() as conn:
            cur = conn.cursor()
            table_name = "src"+str(obs.src_id)
            cur.execute("select exists(select * from information_schema.tables where table_name=%s)", (table_name,))
            if not cur.fetchone()[0]:
                cur.execute(CREATE_TABLE_TEMPLATE.format(table_name=table_name))
            cur.execute(f"""
            INSERT INTO {table_name}(src_id,instru_id,start_time,end_time,flux,flux_err)
            VALUES({obs.src_id},{obs.instru_id},cast ('{obs.start_time}' as timestamp),cast ('{obs.end_time}' as timestamp),{obs.flux},{obs.flux_err})
            """)
            conn.commit()

    def add_instru(self, instru: Instrument) -> Instrument:
        return super().add_instru(instru)

    def add_source(self, source: Source) -> Source:
        return super().add_source(source)

            