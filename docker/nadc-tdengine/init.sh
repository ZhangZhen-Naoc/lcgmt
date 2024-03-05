# /bin/bash
taosd &
taos -f init.sql
kill $(ps | grep taosd | awk '{print $1}')
