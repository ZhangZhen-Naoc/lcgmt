import os
from shutil import copy
energy_level=['50-100','100-150','150-200','200-250','250-300','300-350','350-400']
cmos_id=['13','14','15','16']
image_type=['cts-AF','cts','flux-AF','flux']

def cpfiles(file_name):

    f = open(file_name)
    line = f.readline()
    while line:

        # print(src_folder)
        for el in energy_level:
            src_folder = '/mnt/dyli/gc_test/{}/image/'.format(line.strip().replace('\n','').replace('\r',''))
            target_folder = '/mnt/xuyf/sy01_hips/raw_images_minus/'
            src_folder = os.path.join(src_folder, el)
            target_folder = os.path.join(target_folder,el,'flux')
            filenames = os.listdir(src_folder)
            for filename in filenames:
                print(filename)
                if "flux" in filename and "AF" not in filename:
                    src_file = src_folder+'/'+filename
                    # target_folder = os.path.join(target_folder,'cts')
                    copy(src_file,target_folder+'/'+filename)
                    print(src_file)

            # break
        # break
        line = f.readline()
    f.close()
#
def mkfolder():
    for el in energy_level:
        os.mkdir(os.path.join('/Users/xuyunfei/tdic/data/multihips/raw_images_minus/test-1//',el))
        for tp in image_type:
            os.mkdir(os.path.join('/mnt/xuyf/sy01_hips/raw_images_minus/',el,tp))

# 针对
def generateHiPS(src_folder,target_path):
    filenames = [f for f in os.listdir(src_folder) if os.path.isfile(os.path.join(src_folder, f))]
    
    for filename in filenames:
        
        command = "java -Xmx2g -jar /Users/xuyunfei/tdic/data/Hipsgen.jar in={0}  out={1} img=/Users/xuyunfei/tdic/data/ep06800000878wxt14_100-150-flux.img  blank=-1 creator_did=NADC/SY01/{2} mode=average".format(os.path.join(src_folder,filename), os.path.join(target_path,filename), filename)
        print(command)
        os.system(command)
        



if __name__=='__main__':
    # list_file = 'new_list'
    # cpfiles(list_file)
    generateHiPS('/Users/xuyunfei/tdic/data/rawimagesminus','/Users/xuyunfei/tdic/data/multihips/raw_images_minus/test-1')