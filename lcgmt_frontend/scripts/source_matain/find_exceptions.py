"""
根据标准源表，在数据库中进行查找
"""
import csv
import psycopg2
from pytest import approx
import os
import dotenv
file_path = "./scripts/source_matain/na-ra-dec.csv"    
name_ra_dec = {}
dotenv.load_dotenv("./.env.prod")

# 创建simbad name 到ra-dec的dict
with open(file_path, mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    for row in csv_reader:
        name = row["name"]
        ra = float(row["ra"])
        dec = float(row["dec"])
        name_ra_dec[name] = (ra, dec)
# simbad_names = [' 1RXS J173546.9-302859', ' 4U 1246-58', '[MWC2015] MG J1549+3047 3357', '12 Mus', '1ES 0806+52.4', '1ES 1011+496', '1ES 1735-26.9', '1ES 1959+650', '1H 0512-401', '1RXS J041833.6-073637', '1RXS J052911.4+261009', '1RXS J054638.5-624322', '1RXS J060415.2+124555', '1RXS J101926.7+760947', '1RXS J121452.1-652801', '2FGL J0543.9-5532', '2FGL J1023.1-0115', '2MASS J05242572+1922070', '2MASS J08471293+1133501', '2MASX J08052657+7534247', '39 Cet', '3C 120', '3C 273', '3C 84', '4C 39.49', '4U 0900-40', '4U 0919-54', '4U 1210-64', '4U 1624-49', '4U 1642-45', '4U 1701-407', '4U 1705-44', '4U 1708-40', '4U 1722-30', '4U 1730-22', '4U 1746-371', '4U 1758-25', '4U 1823-00', 'AB Dor ', 'ACO 1651', 'ACO 1795', 'ACO 2029 ', 'ACO 2199', 'ACO 2811', 'ACO 3158', 'ACO 3571', 'ACO 401', 'ACO 576', 'ACO 644', 'ACO 990', 'ACO S 540', 'AF Lep', 'AJG 44', 'alf Aur', 'AR Lac', 'Ara X-1', 'AT 2019wey', 'BD+20 2465', 'bet Per', 'BF Lyn', 'BH CVn', 'BM CVn', 'BP Cru', 'BR Cir', 'Cas A', 'CD-56 1032B', 'Cen X-3', 'Coma Cluster', 'Crab', 'Cyg X-2', 'Cyg X-3', 'd UMa', 'DH Leo', 'DK Dra', 'DM Uma', 'DO Dra', 'EF Eri', 'EI Eri', 'ESO 383-35', 'EX Hya', 'EXO 2030+375', 'FF UMa', 'FI Cnc', 'gam Cas', 'GR Mus', 'GS Leo', 'GSC 4367-00629', 'GX 5-1', 'H 1700-377', 'HD 112859', 'HD 152751', 'HD 22403', 'HD 22468', 'HD 245358', 'HD 245770', 'HD 283447', 'HD 283750', 'HD 29697', 'HD 41824', 'HD 48189', 'HD 80492', 'HD 87525', 'HK Lac', 'HZ Her', 'IC 443', 'IGR J17062-6143', 'II Peg', 'IM Peg', 'IRAS 05078+1626', 'Kepler SNR', 'ksi UMa B', 'KZ TrA', 'L 34-26', 'lam And', 'LMC X-1', 'LMC X-2', 'LMC X-3', 'LMC X-4', 'LS V +44 17', 'LU TrA', 'M 42', 'M 87', 'MAXI J0911-655', 'MCC 124', 'MCG +08-11-011', 'MCG+04-22-042', 'MCG-02-08-038', 'MM Ser', 'Mrk 1044', 'Mrk 110', 'Mrk 421', 'Mrk 704', 'Mrk 79', 'NGC 3227', 'NGC 4051', 'NGC 4151', 'NGC 4253', 'NGC 5044', 'NGC 931', 'Nor X-1', 'NP Ser', 'NuSTAR J092418-3142.2', 'OKM2018 SWIFT J0244.8-5829', 'Oph Cluster', 'PSR B0540-69', 'PSR B1509-58', 'PSR J0146+6145', 'Pup A', 'Pup A', 'QSO B0317+18', 'QSO B0927+500', 'QSO B1218+304', 'QSO B1426+428', 'QSO B1553+113', 'QSO J1103-2329', 'QU TrA', 'QV Nor', 'QX Nor', 'RCW 86', 'RS CVn', 'RX J0227.2+0201', 'RX J0535.6-6651', 'RX J0925.7-4758', 'RX J1749.8-3312', 'RXC J0433.6-1315', 'Sco X-1', 'SDSS J081014.48+280337.1', 'SDSSJ12588-0143', 'Sgr X-1', 'Sgr X-3', 'Sgr X-4', 'sig CrB ', 'sig Gem', 'Slow Burster', 'SNR B0505-67.9/SNR J050555-680150', 'SNR B0519-69.0', 'SNR B0535-66.0', 'SNR G292.0+01.8', 'SNR G296.0-00.6/SNR G296.1-00.7', 'SNR J050854-684447', 'SNR J052501-693842', 'SNR J052559-660453/SNR B0525-66.0', 'SS Cyg', 'Terzan 1', 'Terzan 5', 'Tycho SNR', 'US 1665', 'UV Cet', 'UX Ari', 'V1055 Ori', 'V1101 Sco', 'V1405 Aql', 'V2216 Oph', 'V376 Cep', 'V395 Car', 'V4134 Sgr', 'V4634 Sgr', 'V5512 Sgr', 'V801 Ara', 'V841 Cen', 'V926 Sco', 'Vela Pulsar', 'VY Ari', 'WRAY 15-1674', 'X Per', 'XTE J1739-285', 'XTE J1810-189', 'YY Men', 'YZ Cmi', 'ZwCl 0335+0956', 'ZwCl 1215+0400', '', '', '', '', '', 'name', 'SMC X-1', 'SNR J050555-680150/SNR B0505-67.9', 'LEIA221207a', 'SNR B0525-66.0/SNR J052559-660453', 'RX J0539.5-6433', 'HD 42270', '7C 080602.89+522749.00', '2MASS J09172811+1348577', 'Z 121-75', '2FGL J1033.5-5032', '1RXS J112042.3-605905', 'LEIA230308a', 'SNR G296.1-00.7/SNR G296.0-00.6', 'ACO 1650', 'ACO 1656', 'SDSS J134448.52+404106.8', 'MCG+05-33-005', 'NGC 5548', 'i Boo', 'XTE J1701-462', '4U 1728-337', 'GX 3+1']
simbad_names = name_ra_dec.keys()
with psycopg2.connect(database=os.environ['MWR_DB'],user=os.environ['MWR_USER'],password=os.environ['MWR_PWD'],host=os.environ['MWR_HOST']).cursor() as cur:
    for simbad_name in simbad_names:
        cur.execute(f"SELECT ra,dec FROM tdic.source WHERE simbad_name like '%{simbad_name.strip()}%'")
        data = cur.fetchall()
        ra,dec = name_ra_dec[simbad_name]
        if len(data)==0: # 缺失的情况
            print(f"Not Fount:{simbad_name}")
            
            # print(simbad_name,ra,dec)
            cur.execute(f"SELECT id,ra, dec, simbad_name,src_type FROM tdic.source WHERE q3c_radial_query(ra, dec, {ra}, {dec}, {10./60}) AND src_type='known_source';")
            srcs = cur.fetchall()
            for src in srcs:
                print("  ",src)
            # assert srcs.__len__()==1
            # print(f"UPDATE tdic.source SET simbad_name='{simbad_name}' WHERE q3c_radial_query(ra, dec, {ra}, {dec}, {3./60}) AND src_type='known_source';")
            # print("")
            # print(f"UPDATE tdic.source SET simbad_name ='{name}' WHERE id={data[0][0]};")
            # print(f"UPDATE tdic.source SET src_type='known_source' WHERE id={data[0][0]};")
        if len(data)==1 and (ra,dec)!=(approx(data[0][0]),approx(data[0][1])):
            print(f"POS ERR:{simbad_name},real:{(ra,dec)},db:{(approx(data[0][0]),approx(data[0][1]))}")
        if len(data) >1:
            print(f"Multi: {simbad_name}")
            print(simbad_name,f"SELECT id,ra, dec, simbad_name,src_type FROM tdic.source WHERE simbad_name like '%{simbad_name.strip()}%';")
    cur.execute('SELECT simbad_name FROM tdic.source GROUP BY simbad_name HAVING COUNT(*)>1;')
    for item in cur.fetchall():
        if not item[0]:
            continue
        simbad_name = item[0]
        print(f"Multi: {simbad_name}")
        print(simbad_name,f"SELECT id,ra, dec, simbad_name,src_type FROM tdic.source WHERE simbad_name like '%{simbad_name.strip()}%';")

    # 找到检查表里缺少的
    cur.execute('SELECT simbad_name,ra,dec FROM tdic.source;')
    for item in cur.fetchall():
        if not item[0]:
            continue
        if item[0] in name_ra_dec:
            continue
        print(f"Not in name-ra-dec.csv", item[0])
        # print(f"{item[0]},{item[1]},{item[2]}")