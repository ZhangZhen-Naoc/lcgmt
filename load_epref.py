import csv
import pandas as pd
dict_values = {}

ep_ref = pd.read_csv("xray_epref.csv",delimiter="\t")


with open('xray_epref.csv', 'r') as f:
    reader = csv.reader(f,delimiter='\t')
    next(reader)  # skip header row
    for row in reader:
        # row = [x if x != '---' else None for x in row]  # convert '---' to None
        id = int(row[-1])  # use 'id' column as key
        values = row[:-1]  # use all other columns as values
        dict_values[id] = values

def get_ep_ref():
    return ep_ref

def get_maxi_name_id_dict():
    maxi = ep_ref.loc[ep_ref['name_maxi'] != '---']
    maxi['name_maxi_modified'] = maxi['name_maxi'].str.split('_').str[-1]
    print(maxi['name_maxi_modified'])
    return dict(zip(maxi['name_maxi_modified'], maxi['id']))

if __name__=="__main__":
    get_maxi_name_id_dict()
