# 涉及到reportlab等需要python-dev和gcc的包，slim版本不行
FROM python:3.9.15

WORKDIR /src
# 生成pdf的工具，后续把它抽取出来
# RUN sed -i s/deb.debian.org/mirrors.aliyun.com/g /etc/apt/sources.list &&\
# 阿里云出了点问题（7.28）
RUN sed -i s/deb.debian.org/mirrors.tuna.tsinghua.edu.cn/g /etc/apt/sources.list &&\
    apt-get update &&\ 
    apt-get install xvfb wkhtmltopdf -y

COPY ./Pipfile* /src/
RUN pip install pipenv -i https://mirrors.aliyun.com/pypi/simple/ &&\
    pipenv --version &&\
    pipenv install --skip-lock

COPY ./Pipfile* /src/

COPY . /src/

