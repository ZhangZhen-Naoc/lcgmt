# 改自https://github.com/binwind8/tncode/blob/master/TnCode.class.php
import glob
import hashlib
import os
import random

from PIL import Image
from flask import current_app

bg_width, bg_height = 240, 150 # 图片宽， 高
mark_width, mark_height = 50, 50

def gen_x_offset():
    x_offset = random.randint(50, bg_width-mark_width-1)
    return x_offset


def create_tncode_image():
    files = glob.glob(os.path.join(current_app.config['TNCODE_RESOURCE_PATH'], 'bg/*.png'))
    filename = files[random.randint(0, len(files)-1)]
    x_offset = gen_x_offset()
    img_output = create_image(filename, x_offset)
    #
    return img_output, x_offset


def create_image(filename, x_offset):
    bgimg = Image.open(filename, mode="r").convert("RGBA")
    markimg = Image.open(os.path.join(current_app.config['TNCODE_RESOURCE_PATH'], 'mark/mark.png'), mode="r")
    mark2img = Image.open(os.path.join(current_app.config['TNCODE_RESOURCE_PATH'], 'mark/mark2.png'), mode="r")
    img_output = Image.new("RGBA", (bg_width, bg_height*2), (0, 0, 0, 0))  # 创建图形
    img_output.paste(bgimg, (0,0), bgimg)
    #
    y_offset = random.randint(0, bg_height-mark_height-1)
    y_offset = int(y_offset)
    img_output.paste(markimg, (x_offset, y_offset), markimg)
    img_output.paste(mark2img, (0, bg_height+y_offset), mark2img)
    # img_output.paste(bgimg, (0,bg_height*2), bgimg)
    img_output = img_output.convert('P', palette=Image.ADAPTIVE, colors=255)
    return img_output


def check_tncode(val1, val2):
    if val1 is None or val2 is None:
        return False
    val1 = float(val1)
    val2 = float(val2)
    #return abs(val1-val2) < 3
    return abs(val1 - val2) <= current_app.config['TNCODE_TOLERANCE']


def get_gen_filename(filename, x_offset):
    name = hashlib.md5((filename + ':' + str(x_offset)).encode('utf-8'))
    return name.hexdigest()+".png"


def create_tncode():
    if not hasattr(current_app, 'tncode_bg_filenames'):
        bg_files = glob.glob(current_app.config['TNCODE_RESOURCE_PATH'] + '/bg/*.png')
        current_app.tncode_bg_filenames = [os.path.basename(f) for f in bg_files]
    x_offset = random.randint(50, bg_width - mark_width - 1)
    filename = current_app.tncode_bg_filenames[random.randint(0, len(current_app.tncode_bg_filenames)-1)]
    return x_offset, get_gen_filename(filename, x_offset)


def gen_tncode_images(srcdir, destdir):
    files = glob.glob(os.path.join(srcdir, '*.png'))
    for f in files:
        for x in range(50, bg_width-mark_width-1):
            img_output = create_image(f, x)
            img_output.save(os.path.join(destdir, get_gen_filename(os.path.basename(f), x)))

