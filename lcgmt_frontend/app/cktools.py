import json
import os
import time

from PIL import Image
from flask import url_for
from wtforms import TextAreaField
from wtforms.widgets import TextArea


class CKTextAreaWidget(TextArea):
    def __call__(self, field, **kwargs):
        kwargs.setdefault('class_', 'ckeditor')
        return super(CKTextAreaWidget, self).__call__(field, **kwargs)


class CKTextAreaField(TextAreaField):
    widget = CKTextAreaWidget()


class CkFinder(object):
    '''注意filetree是通过rel="path/"中的/来判断是不是文件夹的，否则就当作文件处理'''

    def __init__(self, savePath, relativePath):
        self.savePath = savePath
        self.relativePath = relativePath

    def format_dir(self, path):
        if not path.endswith('/'):
            path += '/'
        return path

    def to_save_path(self, path):
        '''
        pagepath as /cms/files/filename,
        while realpath is CMS_SAVE_PATH/cms/filename
                relativePath=current_app.config['CMS_RELATIVE_PATH']
        path=current_app.config['CMS_SAVE_PATH']
        '''
        if path.startswith(self.relativePath):
            savePath = path[len(self.relativePath):]
        else:  # path is filename
            savePath = path
        savePath = self.savePath + savePath
        return savePath

    def to_pape_path(self, path):
        if path.startswith(self.savePath):
            pagePath = path[len(self.savePath):]
        else:  # path is filename
            pagePath = path
        pagePath = self.relativePath + pagePath
        return pagePath

    def list_dir(self, request_dir, list_file=False):  # 给jqueryFileTree使用的，只列出dir即可
        result = ['<ul class="jqueryFileTree" style="display: none;">']
        dir = self.to_save_path(request_dir)
        try:
            for f_item in os.listdir(dir):
                f_sub = os.path.join(dir, f_item)
                if os.path.isdir(f_sub):
                    # jqueryFileTree通过'/'结尾来判断是不是文件夹
                    result.append('<li class="directory collapsed"><a href="#" rel="%s/">%s/</a></li>' % (request_dir + f_item, f_item))
                elif list_file:
                    ext = os.path.splitext(f_item)[1][1:]
                    result.append('<li class="file ext_%s"><a href="#" rel="%s">%s</a></li>' % (ext, (request_dir + f_item), f_item))
            result.append('</ul>')
        except:
            pass
        if request_dir == self.relativePath:
            result.append('</li></ul>')
        return ''.join(result)

    def resize_image(self, infile, w=64, h=64):
        outfile = os.path.splitext(infile)[0] + "_64" + ".jpg"
        infilepath = self.to_save_path(infile)
        outfilepath = self.to_save_path(outfile)
        if infile != outfile:
            try:
                im = Image.open(infilepath)
                size = w, h
                im.thumbnail(size, Image.ANTIALIAS)
                im.save(outfilepath, "JPEG")
                status_code = 0
                error_message = "Set thumbnail successful"
                # return outfile
            except IOError:
                error_message = "cannot create thumbnail for '%s'" % infile
                status_code = 1
                # return None
            finally:
                result = {
                    "Thumbnail": outfile,
                    "Error": error_message,
                    "Code": status_code
               0}
            return json.dumps(result)

    def rename(self, old, new):
        result = {}
        try:
            old_full_name = self.to_save_path(old)
            if old_full_name.endswith('/'):
                old_full_name = old_full_name[:-1]
            old_path, old_name = os.path.split(old_full_name)
            newpath = old_path +'/' + new
            os.rename(old_full_name, newpath)
            error_message = new
            status_code = "0"
        except Exception as e:
            status_code = "500"
            error_message = "There was an error renaming the file."
        finally:
            result = {
                "Old Path": old,
                "Old Name": old_name,
                "New Path": self.format_dir(self.to_pape_path(newpath)),
                "New Name": new,
                "Error": error_message,
                "Code": status_code
            }
        return json.dumps(result)

    def delete(self, path):
        full_path = self.to_save_path(path)
        dir_path, name = os.path.split(os.path.dirname(full_path))
        try:
            if os.path.isdir(full_path):
                os.rmdir(full_path)
            else:
                os.remove(full_path)

            error_message = name + ' was deleted successfully.'
            status_code = "0"
        except Exception as error:
            status_code = "500"
            error_message = "There was an error deleting the file. <br/> The operation was either not permitted, or it contains sub files/direcotries, or it may hav    e already been deleted."
        finally:
            result = {
                "Path": path,
                "Name": name,
                "Error": error_message,
                "Code": status_code
            }
        return json.dumps(result)

    def addfolder(self, path, name):
        try:
            full_path = self.to_save_path(path)
            name = name.replace(" ", "_")
            new_path = full_path + name
            new_path = self.check_directory_available(new_path)
            if os.path.exists(full_path):
                os.mkdir(new_path)
                status_code = "0"
                error_message = 'Successfully created folder.'
            else:
                status_code = "500"
                error_message = 'There is no Root Directory.'
        except:
            error_message = 'There was an error creating the directory.'
            status_code = "500"
        finally:
            result = {
                "Path": self.to_pape_path(new_path)+'/',
                "Parent": path,
                "Name": new_path.split('/')[-1],
                "New Path": self.to_pape_path(new_path)+'/',
                "Error": error_message,
                "Code": status_code
            }
        return json.dumps(result)

    def upload(self, path, new_file):
        filename = new_file.filename
        file_path = self.to_save_path(path) + '/' + filename
        try:
            file_path = self.check_filename_available(file_path.replace('//', '/')) #复制粘贴时upload的内容里path为空''
            new_file.save(file_path)
            filename = os.path.split(file_path)[-1]
        except:
            pass
        page_url = self.to_pape_path(file_path)
        result = {
            "Name": filename,
            "uploaded": 1,
            "url": page_url,
            "Code": "0",
            "Error": "",
            "Path": page_url[:page_url.rfind('/') + 1]
        }
        return json.dumps(result)

    def check_directory_available(self, dirname):
        n = [0]

        def check_meta(dirname):
            dirname_new = dirname
            if os.path.isdir(dirname):
                dirname_new = dirname + '_' + str(n[0])
                n[0] += 1
            if os.path.isdir(dirname_new):
                dirname_new = check_meta(dirname)
            return dirname_new

        return_name = check_jeta(dirname)
        return return_name

    def check_filename_available(self, filename):
        n = [0]

        def check_meta(file_name):
            file_name_new = file_name
            if os.path.isfile(file_name):
                file_name_new = file_name[:file_name.rfind('.')] + '_' + str(n[0]) + file_name[file_name.rfind('.'):]
                n[0] += 1
            if os.path.isfile(file_name_new):
                file_name_new = check_meta(file_name)
            return file_name_new

        return_name = check_meta(filename)
        return return_name

    def get_dir_file(self, path, mkdir=False):  # 详细页使用的，tree使用的是list_dir
        result = {}
        dir_full=self.to_save_path(path)
        if not os.path.exists(dir_full) and mkdir:
            os.mkdir(dir_full)
        dir_list = os.listdir(dir_full)
        for filename in dir_list:
            file_path = path + filename
            info = self.get_info(file_path)
            result[file_path] = info
        return result

    def get_info(self, request_path):
        path = self.to_save_path(request_path)
        imagetypes = ['.gif', '.jpg', '.jpeg', '.png']
        if os.path.isdir(path):
            request_path = self.format_dir(request_path)
            thefile = {
                "Path": request_path,
                "Filename": os.path.split(request_path[:-1])[-1],
                "File Type": 'Directory',
                "Preview": url_for('static', filename='filemanager/images/fileicons/_Open.png'),
                "Properties": {
                    "Date Created": '',
                    "Date Modified": '',
                    "Width": '',
                    "Height": '',
                    "Size": ''
                },
                "Return": request_path,
                "Error": '',
                "Code": 0
            }
        else:
            ext = os.path.splitext(path)
            ext_p = ext[1][1:].lower()
            if '' == ext_p: ext_p = 'default'
            preview = url_for('static', filename='filemanager/images/fileicons/' + ext_p + '.png')
            thefile = {
                "Path": request_path,
                "Filename": os.path.split(request_path)[-1],
                "File Type": os.path.split(path)[1][1:],
                "Preview": preview,
                "Properties": {
                    "Date Created": '',
                    "Date Modified": '',
                    "Width": '',
                    "Height": '',
                    "Size": ''
                },
                "Return": request_path,
                "Error": '',
                "Code": 0
            }
            if ext[1].lower() in imagetypes:
                try:
                    img = Image.open(open(path, "rb"))
                    xsize, ysize = img.size
                    thefile["Properties"]["Width"] = xsize
                    thefile["Properties"]["Height"] = ysize
                    thefile["Preview"] = request_path
                except:
                    preview = url_for('static', filename='filemanager/images/fileicons/' + ext[1][1:].lower() + '.png')
                    thefile["Preview"] = preview

            thefile["File Type"] = os.path.splitext(path)[1][1:]
            thefile["Properties"]["Date Created"] = time.strftime('%Y-%m-%d %H:%M:%S',
                                                                  time.localtime(os.path.getctime(path)))
            thefile["Properties"]["Date Modified"] = time.strftime('%Y-%m-%d %H:%M:%S',
                                                                   time.localtime(os.path.getmtime(path)))
            thefile["Properties"]["Size"] = os.path.getsize(path)
        return thefile
