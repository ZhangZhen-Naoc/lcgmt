import numpy as np
import cv2 as cv

from astropy.io import fits
from astropy.wcs import WCS
from astropy.coordinates import SkyCoord
from typing import List


# from matplotlib import pyplot as plt

# file_path = "/Users/xuyunfei/tdic/data/wxt_product_level2/11900003831/ep11900003831wxt1.exp"
# f = fits.open(file_path)
# data = f[0].data
# print(type(data))

# edge=cv.Canny(np.uint8(data),100,1000)
# print(edge)

# plt.subplot(121),plt.imshow(data,cmap = 'gray')
# plt.title('Original Image'), plt.xticks([]), plt.yticks([])
# plt.subplot(122),plt.imshow(edge,cmap = 'gray')
# plt.title('Edge Image'), plt.xticks([]), plt.yticks([])

# plt.savefig('test')
# w = WCS(f[0].header)
# sky = w.pixel_to_world(30, 40)
# print(sky)

# 设置putText函数字体
font=cv.FONT_HERSHEY_SIMPLEX
#计算两边夹角额cos值
def angle_cos(p0, p1, p2):
    d1, d2 = (p0-p1).astype('float'), (p2-p1).astype('float')
    return abs( np.dot(d1, d2) / np.sqrt( np.dot(d1, d1)*np.dot(d2, d2) ) )

def find_squares(img):
    squares = []
    # print(img.shape)
    img = cv.GaussianBlur(img, (3, 3), 0)   
    # print(img.shape)
    # gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
    # bin = cv.Canny(img, 100, 200)    
    contours, _hierarchy = cv.findContours(img, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    # print("轮廓数量：%d" % len(contours))
    index = 0
    # 轮廓遍历
    for cnt in contours:
        cnt_len = cv.arcLength(cnt, True) #计算轮廓周长
        cnt = cv.approxPolyDP(cnt, 0.02*cnt_len, True) #多边形逼近
        # 条件判断逼近边的数量是否为4，检测轮廓是否为凸的
        if len(cnt) == 4 and cv.isContourConvex(cnt): # cv.contourArea(cnt) > 1000 and
            M = cv.moments(cnt) #计算轮廓的矩
            cx = int(M['m10']/M['m00'])
            cy = int(M['m01']/M['m00'])#轮廓重心
            
            cnt = cnt.reshape(-1, 2)
            max_cos = np.max([angle_cos( cnt[i], cnt[(i+1) % 4], cnt[(i+2) % 4] ) for i in range(4)])
            # 只检测矩形（cos90° = 0）
            # print("here")
            if max_cos < 0.1:
            # 检测四边形（不限定角度范围）
          2 #if True:
                index = index + 1
                # print(cnt)
                # print(cx,cy)
                # cv.putText(bin,("#%d"%index),(cx,cy),font,0.7,(255,0,255),2)
                # cv.putText(img,("#%d"%index),(cnt[0][0],cnt[0][1]),font,0.7,(255,0,255),2)
                # cv.putText(img,("#%d"%index),(cnt[1][0],cnt[1][1]),font,0.7,(255,0,255),2)
                # cv.putText(img,("#%d"%index),(cnt[2][0],cnt[2][1]),font,0.7,(255,0,255),2)
                # cv.putText(img,("#%d"%index),(cnt[3][0],cnt[3][1]),font,0.7,(255,0,255),2)
                squares.append(cnt)
                # print(squares)
    return squares, img


def getFovCornerPoints(exp_file_path)->List[SkyCoord]:
    """从exp曝光文件中获取源信息
        exp_file_path:
            通过basepath、obs_id、cmos_id拼接得到的exp文件路径
        return
            曝光图中提取的fov四个边角的j2000坐标（degrees）
    """
    f = fits.open(exp_file_path)
    w = WCS(f[0].header)
    data = np.uint8(f[0].data)  
    squares, img = find_squares(data)
    corner = []
    for point in squares[0]:
        sky = w.pixel_to_world(point[0], point[1])
        corner.append(sky)
    return corner



def main():
    # file_path = "/Users/xuyunfei/ep11900014174wxt1.exp"
    # f = fits.open(file_path)
    # w = WCS(f[0].header)
    # data = np.uint8(f[0].data)


    # squares, img = find_squares(data)
    # cv.drawContours( img, squares, -1, (0, 0, 255), 2 )
    # cv.imshow('squares', img)
    # for point in squares[0]:
    #     sky = w.pixel_to_world(point[0], point[1])
    #     print(sky)
    # ch = cv.waitKey()

    exp_file_name = '/Users/xuyunfei/ep11900014174wxt1.exp'
    corners = getFovCornerPoints(exp_file_name)
    print(corners)
    sql_str_update_fov= f'UPDATE tdic.wxt_detection set fov_new = spoly \'{{({corners[0].ra.degree}d, {corners[0].dec.degree}d),({corners[1].ra.degree}d, {corners[1].dec.degree}d),({corners[2].ra.degree}d, {corners[2].dec.degree}d),({corners[3].ra.degree}d, {corners[3].dec.degree}d)}}\' where id=1;'
    print(sql_str_update_fov)
    

    print('Done')

def getFovFromExpImage(obs_id,cmos_index):
    exp_file_name = f'/data/wxt_data_new/level2/{obs_id}/ep{obs_id}wxt{cmos_index}.exp'
    corners = getFovCornerPoints(exp_file_name)
    sql_str_update_fov= f'UPDATE tdic.wxt_detection set fov_new = spoly \'{{({corners[0][0]}d, {corners[0][1]}d),({corners[1][0]}d, {corners[1][1]}d),({corners[2][0]}d, {corners[2][1]}d),({corners[3][0]}d, {corners[3][1]}d)}}\' where id=1;'
    print(sql_str_update_fov)
    return corners

if __name__ == '__main__':
    print(__doc__)
    main()
    cv.destroyAllWindows()