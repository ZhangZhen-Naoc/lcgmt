# 向数据库中添加数据，需要再componentInjecter.py文件配置组件
from config import loader, engine, source_table, instru_table,csvLoader
from itertools import product
from load_epref import get_ep_ref,get_maxi_name_id_dict


srcs = loader.get_srcs()
src_names = [src.name for src in srcs]
instrus = loader.get_instrus()
name_id_dict = get_maxi_name_id_dict()

for src,instru_ in product(srcs,instrus):
    src_name = src.name
    if src_name not in name_id_dict:
        continue
    src.id = name_id_dict[src_name]
    
    
    instru_name = instru_.name
    instru = instru_table.find_by_name(instru_name)
    
    obses = loader.get_obses(src,instru)
    csvLoader.write_csv(obses,f"/data/tdengine_csv/{src.id}_{instru.id}")
    
