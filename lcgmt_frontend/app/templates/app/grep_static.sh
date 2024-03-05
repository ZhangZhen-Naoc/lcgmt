#!/bin/bash
grep "/static" $1
if [ $? -eq 0 ]
then
	echo "来自文件:"$1
fi

