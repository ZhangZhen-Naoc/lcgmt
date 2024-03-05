FROM tdengine/tdengine:2.0.20.10
COPY init.sh init.sh
COPY init.sql init.sql
RUN chmod u+x init.sh &&\
    ./init.sh
CMD sed -i -e s/localhost/$(hostname)/ /var/lib/taos/dnode/dnodeEps.json  && taosd
