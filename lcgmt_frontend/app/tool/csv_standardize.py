import csv
from app.models.Strategy import Strategy
from app.models.ObserveType import ObserveType
from app.tool.JsonModelRender import json_standardize


def csv_file_standardize(file_in_path: str, file_out_path: str, obs_type: ObserveType, strategy: Strategy):
    with open(file_in_path, mode='r') as file_in, open(file_out_path, mode='x') as file_out:
        content = csv.DictReader(file_in)
        fieldnames = [fieldname for fieldname in content.fieldnames]
        fieldnames.remove("")
        fieldnames.append("id")
        fieldnames.append("type")
        fieldnames.append("strategy")
        writer = csv.DictWriter(file_out, fieldnames)
        writer.writeheader()
        for row in content:
            json_standardize(row)
            row["type"] = obs_type.name
            row["strategy"] = strategy.name
            row["id"] = row[""]
            row.pop("")
            writer.writerow(row)
