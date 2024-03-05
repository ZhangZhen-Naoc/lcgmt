from typing import Iterable

from lcgmt.model import Instrument
from .ReferenceTable import IInstruTable
import psycopg2
from lcgmt.util import has_intersect
class InstruTable(IInstruTable):
    def __init__(self,connection) -> None:
        self.connection = connection

    def find_by_energy_band(self, energy_start: float, energy_end: float) -> Iterable[Instrument]:
        sql = f"""SELECT id,mission,name,energy_start,energy_end 
                FROM instrument
                WHERE 
                    (energy_start BETWEEN {energy_start} AND {energy_end}) OR
                    (energy_end BETWEEN {energy_start} AND {energy_end}) OR 
                    ({energy_start} BETWEEN energy_start AND energy_end) OR 
                    ({energy_end} BETWEEN energy_start AND energy_end)
                
                """
        cur = self.connection.cursor()
        cur.execute(sql)
        rows = cur.fetchall()
        return[
            Instrument(id=int(instru[0]),mission=instru[1],name=instru[2],energy_start=float(instru[3]),energy_end=float(instru[4]))
            for instru in rows
        ]

    def find_by_name(self, name: str) -> Instrument:
        
        cur = self.connection.cursor()
        cur.execute(f"select id,name,energy_start, energy_end from instrument where name='{name}';")
        rows = cur.fetchall()
        if len(rows)==0:
            return None
        
        instru=rows[0]
        return Instrument(id=int(instru[0]),name=instru[1],energy_start=float(instru[2]),energy_end=float(instru[3]))

    def find_by_id(self,id:int)->Instrument:
        cur = self.connection.cursor()
        cur.execute(f"select id,name,energy_start, energy_end from instrument where id={id};")
        if len(rows)==0:
            return None
        instru=rows[0]
        return Instrument(id=int(instru[0]),name=instru[1],energy_start=float(instru[2]),energy_end=float(instru[3]))
    
    def insert(self, instru: Instrument) -> Instrument:
        cur = self.connection.cursor()
        cur.execute(f"INSERT INTO instrument(name,energy_start, energy_end,mission) VALUES('{instru.name}',{instru.energy_start},{instru.energy_end},'{instru.mission}');") 
        self.connection.commit()
