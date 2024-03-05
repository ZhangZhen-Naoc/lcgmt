FROM postgres
COPY ./sources.list /etc/apt/sources.list
RUN echo .......... &&\
    apt-get update &&\
    apt-get install gcc make git postgresql-server-dev-13 -y \ 
    libssl-dev libreadline-dev zlib1g-dev && \
    git clone https://github.com.cnpmjs.org/segasai/q3c.git && \
    cd q3c &&\
    make &&\
    make install &&\
    echo ........
    
COPY ./sql/*.sql /docker-entrypoint-initdb.d
COPY ./sql/*.csv .