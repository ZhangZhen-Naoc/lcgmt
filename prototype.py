from lcgmt.model import Source,Observation
from lcgmt.engine.inmemory_engine import InmemoryEngine

engine = InmemoryEngine()
def add():
    name = input("源名称\n")
    instru_id = input("设备id\n")
    start_time = int(input("开始时间\n"))
    exp_time = int(input("曝光时间\n"))
    energy_start = float(input("能级下限\n"))
    energy_end = float(input("能级上限\n"))
    flux = float(input("流量\n"))
    flux_err = float("流量误差\n")
    engine.put_obs(
        src=Source(name=name),
        obs = Observation(
            start_time=start_time,
            exp_time=exp_time,
            instru_id=instru_id,
            energy_start=energy_start,
            energy_end=energy_end,
            flux=flux,
            flux_err=flux_err
        )
    )
def get():
    src_name = input("源名称\n")
    for obs in engine.get(Source(name=src_name)):
        print(obs)


if __name__=="__main__":
    while True:
        option = input("0:添加；1：获取；2：退出\n")
        if option=="0":
            add()
        elif option=="1":
            get()
        else:
            break