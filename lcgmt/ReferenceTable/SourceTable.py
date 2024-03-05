from lcgmt.model import Source
from .ReferenceTable import ISourceTable
from typing import List
import psycopg2

class SouceTable(ISourceTable):
    def __init__(self,connection) -> None:
        ISourceTable.__init__(self)
        self.connection = connection

        
    def find_closet_src(self,src:Source)->Source:
        cur = self.connection.cursor()
        cur.execute(f"select id,name,ra, dec, mission from source WHERE mission={src.mission} AND name={src.name};")
        rows = cur.fetchall()
        if len(rows)==0:  # 表中没有，插入并返回
            return None
        else :
            row = rows[0]
            return Source(
                id = int(row[0]),
                name =row[1],
                ra=float(row[2]),
                dec=(float(row[3])),
                mission=row[4]
            )

    def find(self,src:Source)->Source:
        cur = self.connection.cursor()
        cur.execute(f"select id,name,ra, dec, mission from source WHERE mission='{src.mission}' AND name='{src.name}';")
        rows = cur.fetchall()
        if len(rows)==0:  # 表中没有，插入并返回
            return None
        else :
            row = rows[0]
            return Source(
                id = int(row[0]),
                name =row[1],
                ra=float(row[2]),
                dec=(float(row[3])),
                mission=row[4]
            )
        
    def insert(self, src: Source) -> Source:
        cur = self.connection.cursor()
        cur.execute(f"INSERT INTO source(name,ra,dec,mission) VALUES('{src.name}',{src.ra},{src.dec},'{src.mission}');")
        self.connection.commit()
        return self.find(src)

    def cone_search(self, ra: float, dec: float, radius: float) -> List[Source]:
        cur = self.connection.cursor()
        cur.execute(f"select id,name,ra, dec, mission from source where q3c_radial_query(ra, dec, {ra}, {dec}, {radius}) ORDER BY q3c_dist({ra},{dec},ra,dec);")
        rows = cur.fetchall()
        if len(rows)==0:  # 表中没有，插入并返回
            return None
        else :
            return [Source(
                id = int(row[0]),
                name =row[1],
                ra=float(row[2]),
                dec=float(row[3]),
                mission=row[4]
            ) for row in rows]
        
