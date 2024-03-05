import json
import time
import numpy as np
from astropy.time import Time as astrotime
import datetime
from scipy.spatial.transform import Rotation as R
from multiprocessing import Pool
from astropy.coordinates import get_sun, get_body
from astropy.modeling.projections import Sky2Pix_AIT
from astropy.modeling.projections import Pix2Sky_AIT
from pathlib import Path
import matplotlib.pyplot as plt
from pylab import *
import matplotlib.ticker as mticker
import matplotlib
matplotlib.use('Agg')
from matplotlib import dates
from datetime import date
import io
import base64


Sky2Pix_AIT = Sky2Pix_AIT()
Pix2Sky_AIT = Pix2Sky_AIT()

global nprocess0
nprocess0 = 32

# from coordtrans.py
def rad(degree):
    '''
    将角度转换为弧度
    '''

    pai = np.pi
    return degree*pai/180

def radec2xyz(ra, dec, r=100):
    '''
    将赤经赤纬转换为xyz坐标
    ra，dec为输入的赤经赤经，r为半径长度
    '''

    if not isinstance(ra, np.ndarray):
        ra = np.array(ra)
    ra = ra.flatten()
    if not isinstance(dec, np.ndarray):
        dec = np.array(dec)
    dec = dec.flatten()

    x = r * np.cos(rad(dec)) * np.cos(rad(ra))
    y = r * np.cos(rad(dec)) * np.sin(rad(ra))
    z = r * np.sin(rad(dec))

    return x, y, z


# from gen_quat_ep.py
def radec2quat(ra, dec, vect_sun, array=True):
    x, y, z = radec2xyz(ra, dec, r=1)
    vect_src = np.hstack((x, y, z))
    roty = np.cross(vect_sun, vect_src)
    roty = roty/np.linalg.norm(roty)
    rotz = np.cross(vect_src, roty)
    rotz = rotz/np.linalg.norm(rotz)
    sat2j2000 = np.transpose(np.vstack((vect_src, roty, rotz)))
    quat = R.from_matrix(sat2j2000)
    if array:
        return quat.as_quat()
    else:
        return quat

def get_sun_vector(time):
    sun_position = get_sun(time)
    ra_sun = sun_position.ra.degree
    dec_sun = sun_position.dec.degree
    x, y, z = radec2xyz(ra_sun, dec_sun, r=1)
    vect_sun = np.hstack((x, y, z))

    return vect_sun

def get_moon_vector(time):
    moon_position = get_body("moon", time)
    ra_moon = moon_position.ra.degree
    dec_moon = moon_position.dec.degree
    x, y, z = radec2xyz(ra_moon, dec_moon, r=1)
    vect_moon = np.hstack((x, y, z))

    return vect_moon

def check_quat_sun(quat, vect_sun, threshold_sun_a1):
    '''
    判断姿态是否符合太阳约束
    a1是X轴指向和太阳矢量夹角，需要大于90度，强约束
    a2是Y轴指向和太阳矢量夹角，根据约束应该是等于90度
    a3是Z轴和太阳矢量夹角，按照实验星约束，这个角度应该大于90度。按照EP主平面对日约束，这个角度应该小于90度
    '''
    sat_axis_origin = np.transpose(np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1]]))
    sat_axis = quat.as_matrix() @ sat_axis_origin

    # a0 = calangle_vector(vect_src, sat_axis[:, 0])
    a1 = calangle_vector(vect_sun, sat_axis[:, 0])
    a2 = calangle_vector(vect_sun, sat_axis[:, 1])
    a3 = calangle_vector(vect_sun, sat_axis[:, 2])

    index = (a1 >= threshold_sun_a1) & (abs(a2-90) < 1) & (a3 <= 90)
    return index, [a1, a2, a3], xyz2radec(sat_axis[0, 0], sat_axis[1, 0], sat_axis[2, 0])

def check_quat_moon(quat, vect_moon, threshold_moon_a1):
    '''
    判断姿态是否符合月亮约束
    a1是X轴指向和月亮矢量夹角，需要大于10度
    '''
    sat_axis_origin = np.transpose(np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1]]))
    sat_axis = quat.as_matrix() @ sat_axis_origin

    # a0 = calangle_vector(vect_src, sat_axis[:, 0])
    a1 = calangle_vector(vect_moon, sat_axis[:, 0])
    a2 = calangle_vector(vect_moon, sat_axis[:, 1])
    a3 = calangle_vector(vect_moon, sat_axis[:, 2])

    index = (a1 >= threshold_moon_a1)
    return index, [a1, a2, a3], xyz2radec(sat_axis[0, 0], sat_axis[1, 0], sat_axis[2, 0])

# from gen_quat_ep_v2.py
def xyz2radec(x, y, z):
    '''
    将xyz坐标转换为赤经赤纬
    '''

    if not isinstance(x, np.ndarray):
        x = np.array(x)
    x = x.flatten()
    if not isinstance(y, np.ndarray):
        y = np.array(y)
    y = y.flatten()
    if not isinstance(z, np.ndarray):
        z = np.array(z)
    z = z.flatten()

    r = np.sqrt(x ** 2 + y ** 2 + z ** 2)
    dec = np.rad2deg(np.arcsin(z / r))
    ra = np.rad2deg(np.arctan2(y, x))
    mask = y < 0
    ra[mask] = ra[mask] + 360

    return ra, dec


def calangle_vector(vect1, vect2, unit=True, array=False):
    # 计算两个向量的夹角。unit为Ture说明两个向量都是单位向量
    if array:
        if (len(np.shape(vect1)) == 2) & (np.shape(vect1)[0] > 1):
            mat_prod = np.sum(vect1*vect2, axis=1)
        else:
            mat_prod = vect1@vect2
        angle_distance = np.rad2deg(np.arccos(mat_prod))
    else:
        if not unit:
            vect1 = vect1/np.linalg.norm(vect1)
            vect2 = vect2/np.linalg.norm(vect2)
        vect_prod = np.dot(vect1, vect2)
        angle_distance = np.rad2deg(np.arccos(vect_prod))
    return angle_distance




# main
def main(ra, dec, t_start, t_end, path, threshold_sun_a1, threshold_moon_a1):
    '''
    流程描述：根据输入的开始、结束时刻，计算相隔的天数，输出每天的约束结果。
            根据时间和赤经赤纬，判断是否符合太阳约(角度大于90度)）、月亮约束（角度大于10度），并且输出太阳角度、月亮角度。
    输入的内容：ra(赤经), dec(赤纬), t_start(开始时刻，utc), t_end(结束时刻，utc), path(文档保存路径)
    输出的内容：data_list = index(排序从1开始), ra(赤经), dec(赤纬), date(计算约束的具体时刻),
              angle_sun(某时刻的天体源方向和太阳矢量的夹角), angle_moon(某时刻的天体源方向和月亮矢量的夹角),
              check_sun(是否符合太阳约束，符合为Yes不符合为No), check_moon(是否符合月亮约束，符合为Yes不符合为No),
              check_sunmoon(是否同时符合太阳约束及月亮约束，符合为Yes不符合为No)
    '''

    time1 = time.time()

    t1 = time.strptime(t_start, "%Y-%m-%dT%H:%M:%S")
    year1, month1, day1, hour1, minute1, second1 = t1.tm_year, t1.tm_mon, t1.tm_mday, t1.tm_hour, t1.tm_min, t1.tm_sec
    t2 = time.strptime(t_end, "%Y-%m-%dT%H:%M:%S")
    year2, month2, day2, hour2, minute2, second2 = t2.tm_year, t2.tm_mon, t2.tm_mday, t2.tm_hour, t2.tm_min, t2.tm_sec
    d1 = datetime.datetime(year1, month1, day1)
    d2 = datetime.datetime(year2, month2, day2)
    duration_day = (d2 - d1).days+1  # 结束时刻与开始时刻之间相差的天数
    #print('duration_day=',duration_day)

    data_list = []
    for i in range(duration_day):
        t_sec_1 = time.mktime(time.strptime(t_start, "%Y-%m-%dT%H:%M:%S"))
        t_sec_2 = t_sec_1 + 24*60*60*i
        t = time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(t_sec_2))
        t0 = time.strptime(t, "%Y-%m-%dT%H:%M:%S")
        year, month, day, hour, minute, second = t0.tm_year, t0.tm_mon, t0.tm_mday, t0.tm_hour, t0.tm_min, t0.tm_sec
        t_obs = astrotime(datetime.datetime(int(year), int(month), int(day), int(hour), int(minute), int(second)))
        vect_sun = get_sun_vector(t_obs)
        vect_moon = get_moon_vector(t_obs)
        quat = radec2quat(ra, dec, vect_sun)
        test_sun = check_quat_sun(R.from_quat(quat), vect_sun, threshold_sun_a1)  # angle_sun = test_sun[1][0]
        test_moon = check_quat_moon(R.from_quat(quat), vect_moon, threshold_moon_a1)  # angle_moon = test_moon[1][0]
        test_sunmoon = (test_sun[0] == 1) & (test_moon[0] == 1)  # True: 1  False:0
        # Sun violation, Moon violation, Visible
        if test_sun[0] == 1: check_sun = 'No'
        else: check_sun = 'Yes'
        if test_moon[0] == 1: check_moon = 'No'
        else: check_moon = 'Yes'
        if test_sunmoon == 1: check_sunmoon = 'Yes'
        else: check_sunmoon = 'No'

        #print(i+1,ra,dec,t,test_sun[1][0],test_moon[1][0],check_sun, check_moon, check_sunmoon)
        data_dictionary = {}
        data_dictionary['index'], data_dictionary['ra'], data_dictionary['dec'], \
            data_dictionary['date'], data_dictionary['angle_sun'], data_dictionary['angle_moon'], \
            data_dictionary['test_sun'], data_dictionary['test_moon'], data_dictionary['test_sunmoon'] = \
                i+1, ra, dec, t, test_sun[1][0],test_moon[1][0], check_sun, check_moon, check_sunmoon
        data_list.append(data_dictionary)
    #print('data_list',len(data_list),data_list)

    # 将结果保存到文档中
    # input_path = Path.joinpath(path, "cal_ep_sunmoon.json")
    # with Path(input_path).open('w') as f:
    #     json.dump(data_list, f, indent=2, ensure_ascii=False)
    # f.close()
    # print("output: cal_ep_sunmoon.json")

    # time2 = time.time()
    #print('time (s) ：', time2 - time1)

    return data_list

def plot_visible(data_list, path):

    # 准备好画图的数据
    data_array = np.zeros(len(data_list),
                          dtype=[('date', 'U50'), ('mjd', float), ('angle_sun', float), ('angle_moon', float), \
                                 ('Sun_violation', 'U50'), ('Moon_violation', 'U50'), ('Visible', 'U50')])

    for i in range(len(data_list)):
        data_array[i]['date'], data_array[i]['mjd'], data_array[i]['angle_sun'], data_array[i]['angle_moon'], \
            data_array[i]['Sun_violation'], data_array[i]['Moon_violation'], data_array[i]['Visible']= \
                data_list[i]['date'], astrotime(data_list[i]['date']).mjd, \
                    data_list[i]['angle_sun'], data_list[i]['angle_moon'], \
                    data_list[i]['test_sun'], data_list[i]['test_moon'], data_list[i]['test_sunmoon']

    datetime_all = [datetime.datetime.strptime(d, '%Y-%m-%dT%H:%M:%S') for d in data_array['date']]

    # 计算可见时间段
    visible_start_date = []
    visible_end_date = []
    visible_start = []
    visible_end = []
    kk = 0
    for i in range(len(data_list)):
        if i == 0:
            if data_list[i]['test_sunmoon'] == 'Yes':
                visible_start_date.append(data_list[i]['date'])
                visible_start.append(datetime_all[i])
                kk += 1
            else:
                pass
        if i > 0:
            if data_list[i]['test_sunmoon'] != last_test:
                if data_list[i]['test_sunmoon'] == 'Yes':
                    visible_start_date.append(data_list[i]['date'])
                    visible_start.append(datetime_all[i])
                    kk += 1
                if data_list[i]['test_sunmoon'] == 'No':
                    visible_end_date.append(last_date)
                    visible_end.append(last_datetime)
        last_date = data_list[i]['date']
        last_datetime = datetime_all[i]
        last_test = data_list[i]['test_sunmoon']
    if len(visible_start) > len(visible_end):
        visible_end_date.append(data_array[len(data_array) - 1]['date'])
        visible_end.append(datetime_all[len(datetime_all) - 1])
    print('data_list', len(data_list), data_list[0])
    print('data_array', len(data_array), data_array[0])
    print('visible_start_date:', len(visible_start_date), visible_start_date)
    print('visible_end_date:', len(visible_end_date), visible_end_date)
    print('visible_start:', len(visible_start), visible_start)
    print('visible_end:', len(visible_end), visible_end)

    img_base64 = ''
    # 画图，仅当大于1天时，才画图并保存
    if len(data_list) > 1:
        #mpl.rcParams['font.sans-serif'] = ['Times New Roman']
        #matplotlib.rcParams['font.family'] = 'sans-serif'
        fig, ax1 = plt.subplots(figsize=(14, 6))

        # 用阴影表示可观测时间段
        for j in range(len(visible_start)):
            ax1.axvspan(visible_start[j], visible_end[j], color='lightgreen', alpha=0.5, label='Visible')
            if j == 0:
                plt.legend(fontsize=12, loc='upper right')

        # 第一条纵轴：太阳角度
        ax1.tick_params(labelsize=10)
        plt.plot(datetime_all, data_array['angle_sun'], 'firebrick')
        if len(datetime_all) > 1:
            plt.xlim(datetime_all[0], datetime_all[len(datetime_all) - 1])
        plt.ylabel('Solar aspect angle', fontsize=13, color='firebrick')
        plt.grid(True, alpha=0.5)

        # 画图展示X轴的时间年月日样式
        if len(data_list) > 5:
            dateFmt = dates.DateFormatter("%Y-%m-%d")
            #if len(data_list) > 300 and len(data_list) < 367:
            #    plt.xticks(rotation=15)
        else:
            #dateFmt = dates.DateFormatter("%Y-%m-%d %H:%M")
            dateFmt = dates.DateFormatter("%Y-%m-%d %H:%M:%S")
            plt.xticks(rotation=15)
        ax1.xaxis.set_major_formatter(dateFmt)
        # x_major_locator = mticker.MultipleLocator(6)
        # ax1.xaxis.set_major_locator(x_major_locator)

        # 第二条纵轴：月亮角度
        ax2 = ax1.twinx()
        plt.plot(datetime_all, data_array['angle_moon'], c='#0056b3')
        ax2.tick_params(labelsize=10)
        ax2.set_ylabel("Moon aspect angle", fontsize=13, color='#0056b3')

        # 保存图片
        # plt.show()
        # file_name = Path.joinpath(path, "visibility.png")
        
        file_io =  io.BytesIO()
        plt.savefig(file_io, bbox_inches='tight', dpi=230)
        file_io.seek(0)
        img_base64 = base64.b64encode(file_io.read()).decode()
        

    # 保存数据
    data_dictionary = {}
    data_dictionary['visible_start'], data_dictionary['visible_end'] = visible_start_date, visible_end_date
    visible_date_list = [data_dictionary]
    # input_path = Path.joinpath(path, "visible_date.json")
    # with Path(input_path).open('w') as f:
    #     json.dump(visible_date_list, f, indent=2, ensure_ascii=False)
    # f.close()
    # print("output: visible_date.json")

    return data_dictionary, img_base64

if __name__ == '__main__':
    ra, dec, t_start, t_end = 0.0, 0.0, '2024-01-01T00:00:00', '2025-01-01T00:00:00' # 时间格式须为"%Y-%m-%dT%H:%M:%S"
    data_list = main(ra, dec, t_start, t_end, path = Path('.'), threshold_sun_a1=94.5, threshold_moon_a1=10)

    visible_date_list = plot_visible(data_list, path = Path('.'))