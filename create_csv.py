import sys
from config import loader, csvLoader, source_table
import pathlib
import itertools
import logging
target = pathlib.Path(sys.argv[1])
for src,instru in itertools.product(loader.get_srcs(),loader.get_instrus()):
    if src.id is None or src.id<=0:
        src_ = source_table.find(src)
        if src_ is None:
            logging.warning(f"src {src.name} is None")
            continue
        src.id = src_.id
    csvLoader.write_csv(loader.get_obses(src,instru),target / f"{src.id}_{instru.id}" )