#/bin/bash
sh -c "echo $$ > influxd.pid;influxd &" &&\
echo "y" | influx setup -u username -p password -o naoc -b observation -r 0 &&\
kill $(cat influxd.pid)