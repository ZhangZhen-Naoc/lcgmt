import taosrest
from app import lc
import json
topic_handler = {
    "TDIC/#": print,
    "TDIC/Src/Added": lambda topic,msg: lc.add_src(json.loads(msg)), # 从证认工具，添加了一个曾经不存在的已知天体
    "TDIC/Src/Delet": lambda topic,msg: lc.del_src(json.loads(msg)), # Source列表页面，src type修改为Empty
    # SourceObservation
    "TDIC/SO/Added": lambda topic,msg: lc.add_so(json.loads(msg)),  # 包含三种场景：SO绑定到S（包括流水线匹配和证认工具改名），SO被标记为已知天体，Det覆盖了S(插入upperlimit)
    "TDIC/SO/Delet": lambda topic,msg: lc.del_so(json.loads(msg)),  # 包含5种场景：SO解绑（修改了名称），SO从已知天体标记为其他，新数据到来旧版的观测SO删除，有新版数据到来旧版的upperlimit删除
}

# conn = taosrest.connect(url="http://localhost:6030")
# # Execute a sql, ignore the result set, just get affected rows. It's useful for DDL and DML statement.
# conn.execute("DROP DATABASE IF EXISTS test")
# conn.execute("CREATE DATABASE test")
# conn.execute("USE test")
# conn.execute("CREATE STABLE weather(ts TIMESTAMP, temperature FLOAT) TAGS (location INT)")