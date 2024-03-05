from time import sleep
from typing import Callable
def wait_for(is_ready:Callable):
    wait_cnt = 0
    while True:
        try:
            assert is_ready()
            break
        except AssertionError:
            sleep(0.5)
            wait_cnt+=1
            assert wait_cnt<20,"等待超时"