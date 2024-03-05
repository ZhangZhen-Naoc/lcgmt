import datetime
import json
import math
from typing import Dict, List

import pandas as pd

from app.proposal_admin.model import4Proposal, ProposalSourceList, SourcePriority


def create_gp_sources_from_csv(filename: str, duration_unit="s") -> List[Dict]:
    sheet = pd.read_csv(filename)
    return [create_gp_source(
        row[1], duration_unit=duration_unit) for row in sheet.iterrows()]


def create_too_sources_from_csv(filename: str, duration_unit="o") -> List[Dict]:
    sheet = pd.read_csv(filename)
    return [create_sy01_too_source(
        row[1], duration_unit=duration_unit) for row in sheet.iterrows()]
# def read_csv



def prevent_empty(value):
    valid = True
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""

    return value

def create_gp_source(row: pd.Series, duration_unit="o") -> Dict:
    return {
        "sourceName": row["Source Name"],  # "必填", done
        "epDbBojectId": 0,  # "必填",
        "countrate": 1e-8,  # "必填", done
        "energyUpper": 4,  # "必填", done
        "energyLower": 0.5,  # "必填", done
        "nh": 0.2,  # "必填", done
        "payload": {
            "wxt": {
                "cmos": None if row.get('CMOS') == "" else row.get("CMOS"),
                "x": row.get('Pixel_X') ,
                "y": row.get('Pixel_X') 
            },
            "fxt": {
                "x": "",
                "y": ""
            },

        },
        "obsCoordinates": {
            "rightAscension": row['RA'],  # "必填", done
            "declination": row['Dec'],  # "必填"， done
        },
        "configuration": {
            "wxtConf": {
                "configparamswitch": "",
                "configforceswitch": "",
                "operationcode3": "",
                "minnsigmadim": "",
                "sndim": "",
                "snwindows": "",
                "retentionparam1": "",
                "retentionparam2": "",
                "retentionparam3": ""
            },
            "fxtConf1": {
                "observationMode": "science mode",  # "必填",
                "filter": "CLOSED POSITION",  # "必填"
                "windowMode": "ff",  # "必填"
            },
            "fxtConf2": {
                "observationMode": "science mode",  # "必填",
                "filter": "CLOSED POSITION",  # "必填"
                "windowMode": "ff",  # "必填"
            },
            "pfConf": ""
        },
        # "必填", done
        "requestedObsDurationInSecondsexposuretime": int(row['Duration'])*900 if duration_unit == "o" else int(row['Duration']),
        "timeConstraints": {
            "timeConstraintsSta": get_date(row.get('time_constraints_start')),
            "timeConstraintsEnd": get_date(row.get('time_constraints_stop'),"end")
        },
        "repeatObservation": {
            "cadenceInOrbits": int(row['cadence']),  # done
            "precisionInOrbits": int(row.get('precision'))
        },
        "minContObsDuratio": prevent_empty(row['min_cont_obs_duration']),
        "maxContObsDuratio": prevent_empty(row['max_cont_obs_duration']),
        "completeness": prevent_empty(row['completeness']),  # "必填", done
        "priorityLevel": row['Priority'],  # "必填",done
        "combinedObservation": ""
    }


def create_sy01_too_source(row: pd.Series, duration_unit="o") -> Dict:
    if len(row['OBS Type'])>0:
        return {
            "countrate": 0.5,  # "必填",
            "energyUpper": 2,  # "必填",
            "energyLower": 0.5,  # "必填",
            "nh": 1,  # "必填",
            "payload": {
                        "wxt": {
                            "cmos": row["CMOS"],
                            "x": row["Pixel_X"],
                            "y": row["Pixel_Y"]
                        },
                        "fxt": {
                            "x": "",
                            "y": ""
                        }
                    },
            "sourceChars": {
                "sourceName": row["Source Name"],  # "必填",
                "epDbBojectId": 1,  # "必填",
                "obsCoordinates": {
                    "rightAscension": row["RA"],  # "必填",
                    "declination": row["Dec"],  # "必填"
                },
                "tooMmId": "",
                "tileId": "",
                "tileScore": "",
                "requestedObsDurationInOrbits": int(row["Duration"]) if duration_unit=="o" else int(float(row["Duration"])/900),
                "requestedObsDurationInSecond": int(row["Duration"]) if duration_unit=="s" else int(float(row["Duration"])*900)
                
            },
            "configurazion": {
                "wxtConf": {
                    "configparamswitch": "",
                    "configforceswitch": "",
                    "operationcode3": "",
                    "minnsigmadim": "",
                    "sndim": "",
                    "snwindows": "",
                    "retentionparam1": "",
                    "retentionparam2": "",
                    "retentionparam3": ""
                },
                "fxtConf1": {
                    "observationMode": "science mode",  # "必填",
                    "filter": "CLOSED POSITION",  # "必填"
                    "windowMode": "ff",  # "必填"
                },
                "fxtConf2": {
                    "observationMode": "science mode",  # "必填",
                    "filter": "CLOSED POSITION",  # "必填"
                    "windowMode": "ff",  # "必填"
                },
                "pfConf": ""
            },
            "obsPriority": row["Priority"],  # "必填",
            "timeConstraints": get_date(row['time_constraints']),
            "combinedObservation": ""
        }
    
def get_date(date_str:str,type="start"):
    try: # datetime格式
        result= datetime.datetime.strptime(date_str,"%Y-%m-%dT%H:%M:%SZ")
    except Exception: # delta格式
        offset = int(date_str)
        result =  datetime.datetime(2022,10,1) + datetime.timedelta(offset)
    if type!="start":
        return result + datetime.timedelta(0,3600*23+60*59+59)
        
    return result

def is_valid_value(v)->bool:
    if isinstance(v,float):
        return not math.isnan(v)
    if isinstance(v,str):
        return v!=""
    return True
def gp_source_decode(source_json:Dict):
    source=ProposalSourceList()
    # source.proposal_id = proposal_id
    source.source_name=source_json["sourceName"]
    source.ra = source_json["obsCoordinates"]["rightAscension"]
    source.dec = source_json["obsCoordinates"]["declination"]
    source.energy_upper = source_json["energyUpper"]
    source.energy_lower = source_json["energyLower"]
    source.nh = source_json["nh"]
    source.exposure_time =source_json["requestedObsDurationInSecondsexposuretime"]
    source.count_rate = source_json["countrate"]
    # source.multiple_observation = form.multiple_observation.data
    # source.visit_number = form.visit_number.data
    source.exposure_per_vist_min= source_json["minContObsDuratio"] if source_json["minContObsDuratio"] else None
    source.exposure_per_vist_max= source_json["maxContObsDuratio"] if source_json["maxContObsDuratio"] else None
    source.monitoring_cadence = source_json["repeatObservation"]["cadenceInOrbits"]
    source.precision = source_json["repeatObservation"]["precisionInOrbits"] if source_json["repeatObservation"]["precisionInOrbits"] else None
    source.completeness =  source_json["completeness"] if source_json["completeness"] else None
    source.time_critical= False
    source.start_time = source_json["timeConstraints"]["timeConstraintsSta"] if source_json["timeConstraints"]["timeConstraintsSta"]!="" else None
    source.end_time = source_json["timeConstraints"]["timeConstraintsEnd"] if source_json["timeConstraints"]["timeConstraintsEnd"]!="" else None
    source.time_critical_remark = "" # ?
    # source.tomm = form.tomm.data
    # source.tomm_id = form.tomm_id.data
    # source.tomm_tile_id = form.tomm_tile_id.data
    # source.fxt1_obs_mode = FXTObservationMode.from_str(form.fxt1_obs_mode.data)
    # source.fxt1_window_mode= FXTWindowMode.from_str(form.fxt1_window_mode.data)
    # source.fxt1_filter =FXTFilterType.from_str(form.fxt1_filter.data)
    # source.fxt2_obs_mode =  FXTObservationMode.from_str(form.fxt2_obs_mode.data)
    # source.fxt2_window_mode= FXTWindowMode.from_str(form.fxt2_window_mode.data)
    # source.fxt2_filter=FXTFilterType.from_str(form.fxt2_filter.data)
    source.wxt_cmos = int(source_json["payload"]["wxt"]["cmos"]) if is_valid_value(source_json["payload"]["wxt"]["cmos"]) else None
    source.wxt_x = source_json["payload"]["wxt"]["x"]  if is_valid_value(source_json["payload"]["wxt"]["x"]) else None
    source.wxt_y = source_json["payload"]["wxt"]["y"]  if is_valid_value(source_json["payload"]["wxt"]["y"]) else None
    # source.fxt1_x = form.fxt1_x.data
    # source.fxt1_y = form.fxt1_y.data
    # source.fxt2_x = form.fxt2_x.data
    # source.fxt2_y = form.fxt2_y.data
    # source.fxt_data_realtime_trans = form.fxt_data_realtime_trans.data
    source.wxt_config_param_switch = source_json["configuration"]["wxtConf"]["configparamswitch"]
    source.wxt_config_force_switch = source_json["configuration"]["wxtConf"]["configforceswitch"]
    source.wxt_operation_code_3 = source_json["configuration"]["wxtConf"]["operationcode3"]
    source.wxt_minnsigma_dim = source_json["configuration"]["wxtConf"]["minnsigmadim"]
    source.wxt_sn_dim = source_json["configuration"]["wxtConf"]["sndim"]
    source.wxt_sn_windows = source_json["configuration"]["wxtConf"]["snwindows"]
    source.source_priority = SourcePriority.from_str(source_json["priorityLevel"].strip())
    
    # db.session.add(source)
    # db.session.commit()
    
    return source

def gp_source_encode(src:ProposalSourceList)->Dict:
       return {
        "sourceName": src.source_name,  # "必填", done
        "epDbObjectId": f"{src.proposal.id}-{src.source_index_in_proposal}",  # "必填",
        "countrate": 1e-8,  # "必填", done
        "energyUpper": 4,  # "必填", done
        "energyLower": 0.5,  # "必填", done
        "nh": 0.2,  # "必填", done
        "payload": {
            "wxt": {
                "cmos": str(src.wxt_cmos) if src.wxt_cmos is not None else "",
                "x": str(int(src.wxt_x)) if src.wxt_x is not None else "",
                "y": str(int(src.wxt_y)) if src.wxt_y is not None else ""
            },
            "fxt": {
                "x": "",
                "y": ""
            },

        },
        "obsCoordinates": {
            "rightAscension": round(float(src.ra),3),
            "declination": round(float(src.dec),3)
        },
        "configuration": {
            "wxtConf": {
                "configparamswitch": "",
                "configforceswitch": "",
                "operationcode3": "",
                "minnsigmadim": "",
                "sndim": "",
                "snwindows": "",
                "retentionparam1": "",
                "retentionparam2": "",
                "retentionparam3": ""
            },
            "fxtConf1": {
                "observationMode": "science mode",  # "必填",
                "filter": "closed position",  # "必填"
                "windowMode": "full-frame mode",  # "必填"
            },
            "fxtConf2": {
                "observationMode": "science mode",  # "必填",
                "filter": "closed position",  # "必填"
                "windowMode": "full-frame mode",  # "必填"
            },
            "pfConf": ""
        },
        "requestedObsDurationInSecondsexposuretime": int(src.exposure_time),  # "必填", done
        "timeConstraints": {
            "timeConstraintsSta":src.start_time.strftime("%Y-%m-%dT%H:%M:%SZ") if src.start_time else None,
            "timeConstraintsEnd": src.end_time.strftime("%Y-%m-%dT%H:%M:%SZ") if src.end_time else None
        },
        "repeatObservation": {
            "cadenceInOrbits": src.monitoring_cadence,
            "precisionInOrbits": int(src.precision)
        },
        "minContObsDuratio": int(src.exposure_per_vist_min),
        "maxContObsDuratio": int(src.exposure_per_vist_max),
        "completeness": src.completeness,  # "必填", done
        "priorityLevel": str(src.source_priority),  # "必填",done
        "combinedObservation": ""
    }

def sy01_too_source_decode(source_json:Dict)->ProposalSourceList:
    source=ProposalSourceList()
    # source.proposal_id = proposal_id
    source.source_name=source_json["sourceChars"]["sourceName"]
    source.ra = source_json["sourceChars"]["obsCoordinates"]["rightAscension"]
    source.dec = source_json["sourceChars"]["obsCoordinates"]["declination"]
    source.energy_upper = source_json["energyUpper"]
    source.energy_lower = source_json["energyLower"]
    source.nh = source_json["nh"]
    source.exposure_time =source_json["sourceChars"]["requestedObsDurationInSecond"]
    source.count_rate = source_json["countrate"]
    # source.multiple_observation = form.multiple_observation.data
    # source.visit_number = form.visit_number.data
    # source.exposure_per_vist_min= source_json["minContObsDuratio"]
    # source.exposure_per_vist_max= source_json["maxContObsDuratio"]
    # source.monitoring_cadence = source_json["repeatObservation"]["cadenceInOrbits"]
    # source.precision = source_json["repeatObservation"]["precisionInOrbits"]
    # source.completeness =  source_json["completeness"]
    source.time_critical= False
    source.start_time = source_json["timeConstraints"]
    # source.end_time = datetime.strptime(source_json["timeConstraints"]["timeConstraintsEnd"],"%m/%d/%Y") if source_json["timeConstraints"]["timeConstraintsEnd"]!="" else None
    
    source.time_critical_remark = "" # ?
    # source.tomm = form.tomm.data
    # source.tomm_id = form.tomm_id.data
    # source.tomm_tile_id = form.tomm_tile_id.data
    # source.fxt1_obs_mode = FXTObservationMode.from_str(form.fxt1_obs_mode.data)
    # source.fxt1_window_mode= FXTWindowMode.from_str(form.fxt1_window_mode.data)
    # source.fxt1_filter =FXTFilterType.from_str(form.fxt1_filter.data)
    # source.fxt2_obs_mode =  FXTObservationMode.from_str(form.fxt2_obs_mode.data)
    # source.fxt2_window_mode= FXTWindowMode.from_str(form.fxt2_window_mode.data)
    # source.fxt2_filter=FXTFilterType.from_str(form.fxt2_filter.data)
    source.wxt_cmos = source_json["payload"]["wxt"]["cmos"]
    source.wxt_x = source_json["payload"]["wxt"]["x"]
    source.wxt_y = source_json["payload"]["wxt"]["y"]
    # source.fxt1_x = form.fxt1_x.data
    # source.fxt1_y = form.fxt1_y.data
    # source.fxt2_x = form.fxt2_x.data
    # source.fxt2_y = form.fxt2_y.data
    # source.fxt_data_realtime_trans = form.fxt_data_realtime_trans.data
    source.wxt_config_param_switch = source_json["configuration"]["wxtConf"]["configparamswitch"]
    source.wxt_config_force_switch = source_json["configuration"]["wxtConf"]["configforceswitch"]
    source.wxt_operation_code_3 = source_json["configuration"]["wxtConf"]["operationcode3"]
    source.wxt_minnsigma_dim = source_json["configuration"]["wxtConf"]["minnsigmadim"]
    source.wxt_sn_dim = source_json["configuration"]["wxtConf"]["sndim"]
    source.wxt_sn_windows = source_json["configuration"]["wxtConf"]["snwindows"]
    source.source_priority = SourcePriority.from_str(source_json["obsPriority"])
    
    return source

def sy01_too_source_encode(src:ProposalSourceList)->Dict:
    return {
        "countrate": 0.5,  # "必填",
        "energyUpper": 2,  # "必填",
        "energyLower": 0.5,  # "必填",
        "nh": 1,  # "必填",
        "payload": {
                    "wxt": {
                        "cmos": str(src.wxt_cmos) if src.wxt_cmos is not None else "",
                        "x": str(int(src.wxt_x)) if src.wxt_x is not None else "",   # 数据库存的float
                        "y": str(int(src.wxt_y)) if src.wxt_y is not None else ""
                    },
                    "fxt": {
                        "x": "",
                        "y": ""
                    }
                },
        "sourceChars": {
            "sourceName": src.source_name,  # "必填",
            "epDbObjectId": f"{src.proposal.id}-{src.source_index_in_proposal}",  # "必填",
            "obsCoordinates": {
                "rightAscension": round(float(src.ra),3),  # "必填",
                "declination": round(float(src.dec),3),  # "必填"
            },
            "tooMmId": "",
            "tileId": "",
            "tileScore": "",
            "requestedObsDurationInOrbits": int(src.exposure_time/900),
            "requestedObsDurationInSecond": int(src.exposure_time)
        },
        "configuration": {
            "wxtConf": {
                "configparamswitch": "",
                "configforceswitch": "",
                "operationcode3": "",
                "minnsigmadim": "",
                "sndim": "",
                "snwindows": "",
                "retentionparam1": "",
                "retentionparam2": "",
                "retentionparam3": ""
            },
            "fxtConf1": {
                "observationMode": "science mode",  # "必填",
                "filter": "closed position",  # "必填"
                "windowMode": "full-frame mode",  # "必填"
            },
            "fxtConf2": {
                "observationMode": "science mode",  # "必填",
                "filter": "closed position",  # "必填"
                "windowMode": "full-frame mode",  # "必填"
            },
            "pfConf": ""
        },
        "obsPriority": str(src.source_priority),  # "必填",
        "timeConstraints": src.start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "combinedObservation": ""
    }
def gp_proposal_encode(proposal:Proposal)->Dict:
    return  {
        "proposalId": proposal.id,
        "title": proposal.proposal_title,
        "proposalTime": proposal.create_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "abstract": proposal.proposal_abstract,
        "scientificCategories": [scicase.category_content for scicase in proposal.proposal_scientific_category],  # "必填",
        "principleInvestigator": [
            {
                "investigatortype": "PI",  # "必填（PI，co-pi）",
                "sex": "male",  # "必填",
                "name": "EPSC_Moniter",  # "必填",
                "telephone": "0000000",  # "必填",
                "email": "admin@ep.org",  # "必填",
                "institute": "naoc",  # "必填",
                "userGroup": "China",  # "必填"
            }
        ],
        "obsType": proposal.type2.encode(),  # "必填",
        "isthroughBD": "",
        "gpData": {
            "gpCatalogWindow": {
                "begin": "2022-10-01T00:00:00Z",
                "end": "2023-09-30T23:59:59Z"
            },
            "gpTarget": [gp_source_encode(src) for src in proposal.proposal_source_list]
        },
       }
def sy01_too_proposal_encode(proposal:Proposal,request_date)->Dict:
    srcs = [sy01_too_source_encode(src) for src in proposal.proposal_source_list]
    return  {
        "proposalId": proposal.id,
        "title": proposal.proposal_title,
        "proposalTime": proposal.create_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "abstract": proposal.proposal_abstract,
        "scientificCategories": [scicase.category_content for scicase in proposal.proposal_scientific_category],  # "必填",
        "principleInvestigator": [
            {
                "investigatortype": "PI",  # "必填（PI，co-pi）",
                "sex": "male",  # "必填",
                "name": "EPSC_Monitor",  # "必填",
                "telephone": "0000000",  # "必填",
                "email": "admin@ep.org",  # "必填",
                "institute": "naoc",  # "必填",
                "userGroup": "China",  # "必填"
            }
        ],
        "obsType": "ToO-NOM-AT",  # "必填",
        "isthroughBD": "",
        "tooData": {
            "requestDate": request_date,  # "必填",
            "totalNumberOfObs": len(srcs),  # "必填",
            "nbMaxOfObsPer": "",
            "observation": srcs
       }
    }
    