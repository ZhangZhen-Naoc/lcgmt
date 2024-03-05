#!/bin/bash

BASEPATH=$1
files=$(ls $BASEPATH)

for file in $files; do
    tags=(${file//_/ })
    echo "DROP TABLE d${tags[0]}_${tags[1]};"
    echo "INSERT INTO d${tags[0]}_${tags[1]} USING obs TAGS (${tags[0]}, ${tags[1]}) FILE '$BASEPATH/$file';"
done
