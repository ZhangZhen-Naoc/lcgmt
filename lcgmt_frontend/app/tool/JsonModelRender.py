from abc import abstractmethod
from typing import Dict


def diff_list(list1, list2):
    return [item for item in list1 if item not in list2]


class JsonModelRender:

    def __init__(self, j2m_ignore=[], m2j_ignore=[]):
        self.j2m_ignore = j2m_ignore
        self.m2j_ignore = m2j_ignore

    def json_to_model(self, json: Dict[str, str], model: object):
        self.fix_j2m(json, model)
        keys = diff_list(json.keys(), self.j2m_ignore)
        for key in keys:
            model.__setattr__(key, json[key])

    @abstractmethod
    def fix_j2m(self, json, model: object):
        pass

    def model_to_json(self, model: object):
        json = {}
        self.fix_m2j(model, json)
        keys = diff_list(
            diff_list(model.__dict__, '_sa_instance_state'),
            self.m2j_ignore
        )
        for key in keys:
            json[key] = model.__getattribute__(key)

        return json

    @abstractmethod
    def fix_m2j(self, model, json):
        pass


def json_standardize(json: Dict) -> Dict[str, str]:
    '''
    将从csv读取到的json标准化。由于测试数据的csv很多整形变量都是带有.0的，该函数主要负责去掉这些.0。
    :param json: 从csv中读取到的json
    :return: json变量原址修改。同时返回，方便单语句调用，使代码更紧凑
    '''
    # json["id"] = json[""]
    # json.pop("")

    if json["obsid"].find(".0") != -1:   # obsid 中存在.0，但该属性是用String存储的
        json["obsid"] = json["obsid"][0:-2]  # 截取.0
    # 去除空属性
    for key,value in json.items():
        if value=="":
            json[key] = None

    # 本应是Int的转化成int
    for key in ["", "x","y","cmosnum", "number_obs","number_5sigma" ]:
        if json.get(key,None)  is not None:
            json[key] = int(float(json[key]))





    return json
