import json
import math
import requests
from typing import Dict,Tuple
from numpy import source
import time
from typing import List
from datetime import datetime,date,timedelta
from app.proposal_admin.model import FXTFilterType, FXTObservationMode, \
    FXTWindowMode, Proposal, ProposalSourceList, SourcePriority, \
    ProposalInvestigator, ProposalType1, ProposalType2, ProposalSeason, ObservationType
from app.extensions import db
import csv
import logging
import math


# 科学运行系统Proposal相关API
def too_source_encode(src:ProposalSourceList)->Dict:
    return {
            "countrate": src.count_rate or 0,
            "timeConstraints": src.start_time.strftime("%Y-%m-%dT%H:%M:%SZ")  if src.start_time else None ,
            "combinedObservation": "",
            "obsPriority": str(src.proposal.priority),
            "observePlanCode": "1140856272",
            "observePlanId": 343,
            # 修改 fxt 新增cmr  , wxt ,fxt 二选一传值
            "payload": {
                "wxt": {
                    "cmos": str(src.wxt_cmos) if src.wxt_cmos else "",
                    "x": str(round(int(src.wxt_x),2)) if src.wxt_x else "",   # 数据库存的float
                    "y": str(round(int(src.wxt_y),2)) if src.wxt_y else ""
                },
                "fxt": {
                    "cmr": "A",
                    "x": "192.50",
                    "y": "192.50"
                }
            },
            "configuration": {
                "wxtConf": {
                    "configparamswitch": "0xAAAAAAAA",
                    "configforceswitch": "0x33333333",
                    "operationcode3": "0",
                    "minnsigmadim": "9999.99",
                    "sndim": "9999.99",
                    "snwindows": "9999.99",
                    "retentionparam1": "",
                    "retentionparam2": "",
                    "retentionparam3": ""
                },
                "fxtConf1": {
                    "observationMode": "ff",
                    "filter": "THIN FILTER",
                    "process_switch":"on"
                },
                "fxtConf2": {
                    "observationMode": "ff",
                    "filter": "THIN FILTER",
                    "process_switch":"on"
                },
                "pfConf": ""
            },
            "sourceChars": {
                # 必传整数
                "tooMmId": 0,
                # 必传整数
                "tileId": src.source_index_in_proposal,
                    
                "obsCoordinates": {
                    "declination": round(float(src.dec),3),
                    "rightAscension": round(float(src.ra),3)
                },
                
                "sourceName": src.source_name,
                "epDbObjectId": f"{src.proposal.get_no()}-{src.source_index_in_proposal}" if src.proposal.obs_type!=ObservationType.GP_PPT_TT else f"{src.proposal.get_no()}-{src.source_index_in_proposal}-{src.source_index_in_proposal}",  # "必填",tiling 类别的 ，要在提案号-观测顺序号后面再加一个指向序列号，跟观测顺序号一致就行了 
                #必传整数
                "tileScore": src.source_index_in_proposal,
                # 新增 userName
                "userName":src.proposal.get_pi_name() or "Unknown"  
            },
            # 新增requestedObsDuration 新增单位有sec, orbit
            # "requestedObsDuration": {
            #     "unit": 'sec' if src.exposure_unit=='second' else src.exposure_unit,
            #     "value":  int(src.exposure_time) if src.exposure_time else None
            # },
            "requestedObsDuration": {
                "unit": get_too_request_obs_duration_unit(src),
                "value": get_too_request_obs_duration_vaule(src)
            },
            "energyUpper": src.energy_upper,
            "energyLower": src.energy_lower,
            "nh": src.nh,
            #新增Indicate that a GP request is survey or notfalse: for no survey true: for survey
            "survey":False
        }

def get_too_request_obs_duration_unit(too_source:ProposalSourceList):
    if too_source.proposal.type1== ProposalType1.TOO:
        return 'orbit'
    else: # GP ToO-MM为sec
        return 'sec'

def get_too_request_obs_duration_vaule(too_source:ProposalSourceList):
    # TOO EX NOM按轨道提，sec/3600向上取整
    if too_source.proposal.type1== ProposalType1.TOO: 
        if too_source.proposal.get_assigned_time()!='----':
            return math.ceil(too_source.proposal.get_assigned_time()/3600)
        else:
            return 'time not assigned'
            
    else: # GP ToO-MM按sec提 
        return math.ceil(too_source.exposure_time)


def get_obs_type(proposal:Proposal)->str:
    #"ToO-MM" if ProposalType2为HighUrgencyToO或HighestUrgencyToO，且obs type为Tiling
    if proposal.type1==ProposalType1.TOOMM and proposal.type2==ProposalType2.HighestUrgencyToO and proposal.obs_type==ObservationType.GP_PPT_TT:
        return "ToO-MM"
    return {
        ProposalType2.HighestUrgencyToO: "ToO-EX",
        ProposalType2.HighUrgencyToO: "ToO-EX",
        ProposalType2.MediumUrgencyToO: "ToO-NOM-AT",
        ProposalType2.LowUrgencyToO: "ToO-NOM-AT",
        # ProposalType2.TooMM: "ToO-MM",
        ProposalType2.GuestObserver: "GP-PPT",
        ProposalType2.NonToo: "GP-PPT",
        ProposalType2.AnticipateToO: "GP-PPT",
        ProposalType2.Calibration: "GP-CAL",
        None: "B1 law",
        ProposalType2.SYToo: "ToO-NOM-AT"
    }[proposal.type2]
    
def render_user_group(pi:ProposalInvestigator):
    return {
        "CAS team":"CHN",
        "MPE Team":"MPE",
        "ESA Team":"ESA",
        "CNES Team":"FRA",
        "Other":"CHN"
    }.get(pi.user_group,"CHN")

def too_proposal_encode(proposal:Proposal)->Dict:
    obs_type = proposal.upload_type
    return {
        "proposalId": proposal.id,
        "title": proposal.proposal_title,
        "proposalTime": proposal.create_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "abstract": proposal.proposal_abstract,
        "scientificCategories": [],
        "principleInvestigator": [
            {
                "investigatortype": "PI",
                "sex": "male",
                "name": proposal.get_pi_name() or "Unknown",
                "telephone": "0000000",
                "email": proposal.get_pi_email(),
                "institute": "China",
                "userGroup": render_user_group(proposal.proposal_investigator[0])
            }
        ],
        "obsType": obs_type,
        "isthroughBD": "",
        "tooData": {
            "totalNumberOfObs": len(proposal.proposal_source_list),
		    "nbMaxOfObsPer": "",
            "requestDate": get_request_date(proposal.submit_time),
            # "urgency":"urgent" if proposal.obs_type in [ObservationType.TOO_MM,ObservationType.TOO_NOM_AT] else "normal",  # urgent 或 normal
            # "urgency":"urgent" if proposal.type2 in [ProposalType2.HighestUrgencyToO,ProposalType2.HighUrgencyToO] else "normal",  # urgent 或 normal
            "urgency":proposal.urgency,
            "observation": [too_source_encode(src) for src in proposal._proposal_source_list ]
        }
    }

def get_request_date(proposal_submit_date):
    time_format = "%Y-%m-%dT%H:%M:%SZ"
    # 增加1单位时间，例如1天
    proposal_submit_date += timedelta(days=1)
    # 将结果格式化为字符串
    result_str = proposal_submit_date.strftime(time_format)
    return result_str
    


    
def gp_source_encode(src:ProposalSourceList)->Dict:
        return {
                "sourceName": src.source_name,
                "epDbObjectId": f"{src.proposal.get_no()}-{src.source_index_in_proposal}" if src.proposal.obs_type!=ObservationType.GP_PPT_TT else f"{src.proposal.get_no()}-{src.source_index_in_proposal}-{src.source_index_in_proposal}",  # "必填",tiling 类别的 ，要在提案号-观测顺序号后面再加一个指向序列号，跟观测顺序号一致就行了 
                "countrate": 1e-8,
                "energyUpper": 4,
                "energyLower": 0.5,
                "nh": 0.2,
                "payload": {
                    "wxt": {
                        "cmos": str(src.wxt_cmos) if src.wxt_cmos else "",
                        "x": str(round(int(src.wxt_x),2)) if src.wxt_x else "",   # 数据库村的float
                        "y": str(round(int(src.wxt_y),2)) if src.wxt_y else ""
                    },
                    "fxt": {
                        "CMR": "A",
                        "x": "192.50",
                        "y": "192.50"
                    }
                },
                "obsCoordinates": {
                    "rightAscension": src.ra,
                    "declination": src.dec
                },
                "configuration": {
                    "wxtConf": {
                        "configparamswitch": "0xAAAAAAAA",
                        "configforceswitch": "0x33333333",
                        "operationcode3": "0",
                        "minnsigmadim": "9999.99",
                        "sndim": "9999.99",
                        "snwindows": "9999.99",
                        "retentionparam1": "",
                        "retentionparam2": "",
                        "retentionparam3": ""
                    },
                    "fxtConf1": {
                        "observationMode": "ff",
                        "filter": "THIN FILTER",
                        "process_switch":"on"
                    },
                    "fxtConf2": {
                        "observationMode": "ff",
                        "filter": "THIN FILTER",
                        "process_switch":"on"
                    },
                    "pfConf": ""
                },
                "requestedObsDuration": {
                   "unit": 'sec' if src.exposure_unit=='second' else src.exposure_unit,
                    "value": int(src.exposure_time) if src.exposure_time else None
                },
                "timeConstraints": {
                    "timeConstraintsSta":src.start_time.strftime("%Y-%m-%dT%H:%M:%SZ") if src.start_time else None,
                    "timeConstraintsEnd": src.end_time.strftime("%Y-%m-%dT%H:%M:%SZ") if src.end_time else None
                },
                "repeatObservation": {
                    "cadence": {
                        "value": src.monitoring_cadence,
                        "unit": src.cadence_unit
                    },
                    "precision": {
                        "value": int(src.precision) if src.precision else None,
                        "unit": src.precision_unit
                    }
                },
                "minContObsDuration": {
                    "unit": 'sec' if src.exposure_per_vist_min_unit=='second' else src.exposure_per_vist_min_unit,
                    "value": int(src.exposure_per_vist_min) if src.exposure_per_vist_min else None,
                },
                "maxContObsDuration": {
                    "unit": 'sec' if src.exposure_per_vist_max_unit=='second' else src.exposure_per_vist_max_unit,
                    "value": int(src.exposure_per_vist_max) if src.exposure_per_vist_max else None,
                },
                "completeness": src.completeness,
                "priorityLevel": str(src.source_priority),
                "userGroup": render_user_group(src.proposal.proposal_investigator[0]),
                "userName": src.proposal.get_pi_name() or "Unknown",
            }
       

def gp_proposal_encode(proposal:Proposal)->Dict:
    return {
        "proposalId": proposal.id,
        "title": proposal.proposal_title,
        "proposalTime": proposal.create_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "abstract": proposal.proposal_abstract,
        "scientificCategories": [],
        "principleInvestigator": [
            {
                "investigatortype": "PI",
                "sex": "male",
                "name": proposal.get_pi_name() or "Unknown",
                "telephone": "0000000",
                "email": "ep@bao.ac.cn",
                "institute": "naoc",
                "userGroup": render_user_group(proposal.proposal_investigator[0])
            }
        ],
        "obsType": {
            ObservationType.GP_PPT_LT:"GP-PPT-LT",
            ObservationType.GP_PPT_MT:"GP-PPT-MT",
            ObservationType.GP_PPT_TT:"GP-PPT-TT",
            ObservationType.GP_PPT_ST:"GP-PPT-ST",
        }.get(proposal.obs_type),
        "isthroughBD": "",
        "gpData": {
            "gpCatalogWindow": {
                "begin": mintime( proposal.proposal_source_list),
                "end": maxtime( proposal.proposal_source_list)
            },
            "gpTarget": [gp_source_encode(src) for src in proposal._proposal_source_list ]
        }
    }

def mintime(proposal_source_list):
    try:
        min_starttime = min([src.start_time for src in proposal_source_list]) 
        return  min_starttime.strftime('%Y-%m-%dT%H:%M:%SZ') 
    except Exception as e:
        return ""

def maxtime(proposal_source_list):
    try:
        max_endtime = min([src.end_time for src in proposal_source_list]) 
        return  max_endtime.strftime('%Y-%m-%dT%H:%M:%SZ') 
    except Exception as e:
        return ""


BASE_URL="http://{BASE_URL}:31503/ep/sys"

def get_token():
    resp = requests.post(f"{BASE_URL}/user/login?password=!%{PWD}&username=admin",headers={"accept": "*/*"})
    return resp.json()['token']

def submit(proposal:Proposal)->Tuple[int,Dict]:
    if proposal.is_too_proposal():
        body = too_proposal_encode(proposal)
    else :
        body = gp_proposal_encode(proposal)
    logging.info('for submit testing:',body)
    token = get_token()
    resp = requests.post(f"{BASE_URL}/observetask/receiveProposalInfo",headers={"X-AUTH-TOKEN":token,"Content-Type": "application/json"},json=body,stream=True)
    return resp.status_code,resp.json()
