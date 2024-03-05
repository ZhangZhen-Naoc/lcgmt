import os
from shutil import copy
energy_level=['50-100','100-150','150-200','200-250','250-300','300-350','350-400']
cmos_id=['13','14','15','16']
image_type=['cts-AF','cts','flux-AF','flux']

def cpfiles(file_name):
    target_folder = '/mnt/xuyf/sy01_hips/raw_images/'
    f = open(file_name)
    line = f.readline()
    while line:
        src_folder = '/mnt/dyli/sydata_image_update/{}/image/'.format(line.replace('\n','').replace('\r',''))

        for el in energy_level:
            src_folder = os.path.join(src_folder, el)
            target_folder = os.path.join(target_folder,el)
            filenames = os.walk(src_folder)
            for filename in filenames:
                print(filename)
                if "cts" in filename and "AF" not in filename:
                    src_file = src_folder+'/'+filename
                    target_folder = os.path.join(target_folder,'cts')
                    copy(src_file,target_folder+'/'+filename)
                    print(src_file)
                
            break
        break
    


if __name__=='__main__':
    list_file = 'image_file_list.txt'
    cpfiles(list_file)
