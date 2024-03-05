#!/bin/bash

BASEPATH=$1
files=$(ls $BASEPATH)

for file in $files; do
    tags=(${file//_/ })
    echo "\copy obses (start_time, exp_time, flux, flux_err) FROM '$BASEPATH/$file' DELIMITER ',';"
    echo "UPDATE obses SET src_id=${tags[0]} WHERE src_id is NULL;"
    echo "UPDATE obses SET instru_id=${tags[1]} WHERE instru_id is NULL;"
done