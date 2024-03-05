linux deploy
CentOS 7上部署 FastWWW
修改sshd

vi /etc/ssh/sshd_config
PermitRootLogin no #禁止root用户登录
ClientAliveInterval 60 #60秒
ClientAliveCountMax 30 #30次
systemctl retart sshd
关闭SELinux

vi /etc/selinux/config
SELINUX=disabled
#然后重启服务器
打开防火墙端口

firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
firewall-cmd --list-ports
用户准备

useradd www --shell=/sbin/nologin
usermod -G www fandongwei
chown -R www.www /data
chmod 775 -R /data
安装Python

yum install -y python3 python3-devel.x86_64 python3-pip postgresql python3-psycopg2
pip3 install pipenv
上传代码，为当前项目建立独立运行环境

cd fastwww
#下面的环境变量设置，在windows下用set，linux用export
export FLASK_APP=fastapp
export PIPENV_VENV_IN_PROJECT=1
export PIPENV_IGNORE_VIRTUALENVS=1
pipenv install --skip-lock
进入虚拟环境并安装gunicorn Python Web服务器

pipenv shell
pipenv install gunicorn
启动gunicorn

pipenv run gunicorn -b localhost:8000 -w 4 "fastapp:create_app()"  --timeout 650
# 若已经在pipenv环境中则前面不需要再加`pipenv run`
# Ctrl+C关闭gunicorn
安装supervisor

#yum install -y supervisor
#systemctl enable supervisord
配置supervisor

#vi /etc/supervisord.d/fastwww.ini
[program:fastwww]
command=pipenv run gunicorn -w 4 "fastapp:create_app()" --log-file=/data/log/gunicorn/fastwww.log
directory=/data/fastwww
autostart=true
autorestart=true
stopsignal=QUIT
stopasgroup=true
killasgroup=true
user=www
redirect_stderr=true
stdout_logfile=/data/log/supervisor/fastwww.log
[supervisord]
environment=LC_ALL='en_US.UTF-8',LANG='en_US.UTF-8'
运行supervisor

#systemctl start supervisord#启动
#systemctl stop supervisord#关闭
#supervisorctl reload#重新载入
#supervisorctl#进入控制系统
安装nginx

#yum install nginx
#systemctl enable nginx
配置nginx

#vi /etc/nginx/conf.d/fastwww.conf
upstream gunicorn_8000{
        server 127.0.0.1:8000;
}

server {
    listen       80;
    listen       [::]:80;
    server_name  fastwww.china-vo.org;
    #root         /usr/share/nginx/html;
    #root          /data/skyview;
    access_log    /data/log/http/fastwww.china-vo.org-access.log main;    
    error_log     /data/log/http/fastwww.china-vo.org-error.log;
    # Load configuration files for the default server block.

    location /{
        proxy_pass      http://gunicorn_8000;
        proxy_redirect  off;
    
        proxy_set_header    Host                $host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto   $scheme;
    }

    location /static/{
        alias '/data/fastwww/fastapp/static/';
    }
    location /data/fastwww/static/{
        alias '/data/fastwww/fastapp/static/';
    }

    error_page 404 /404.html;
    location = /40x.html {
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
    }
}
运行Nginx

#systemctl start nginx #启动
#systemctl stop nginx #关闭
#systemctl restart nginx #重启
安装中文字体

初始化网站

pipenv shell #进入pipenv环境
flask db init #初始化数据库
mkdir uploads/avatars
flask forge #生成假用户
访问网站，输入帐号fandongwei@nao.cas.cn密码fandongwei可进入超级管理员用户

注意事项

gunicorn并不会去读取.flaskenv文件，所以需要在代码里面把要配置的东西写好，或者放到环境变量中读取（也可写到~/.bashrc中）