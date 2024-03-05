from pytest import fixture
import psycopg2
@fixture
def connection():
    with  psycopg2.connect(database="ep_referncetable", user="postgres", password="password", host="127.0.0.1", port=5433) as conn:
        cur = conn.cursor()
        # 加载数据
        clear(cur)
        init(cur)
        yield conn
        
        # 善后工作：清理数据
        clear(cur)
        
        
def clear(cur):
    cur.execute("TRUNCATE TABLE source RESTART IDENTITY CASCADE;")
    cur.execute("TRUNCATE TABLE instrument RESTART IDENTITY CASCADE;")
    
def init(cur):
    cur.execute(f"INSERT INTO source(ra,dec,name) VALUES(0,0,'src1');")
    cur.execute(f"INSERT INTO source(ra,dec,name) VALUES(0,0.01,'src2');")
    
    cur.execute("INSERT INTO instrument(mission,name,energy_start,energy_end) VALUES('maxi','maxi1',2,20);")
    cur.execute("INSERT INTO instrument(mission,name,energy_start,energy_end) VALUES('maxi','maxi2',2,4);")
    cur.execute("INSERT INTO instrument(mission,name,energy_start,energy_end) VALUES('maxi','maxi3',4,10);")
    cur.execute("INSERT INTO instrument(mission,name,energy_start,energy_end) VALUES('maxi','maxi4',10,20);")