cd /home/zhangzhen/time-domain-astronomy-information-system/tdic-system
python3 -m pipenv run gunicorn -c gunicorn.config.py --limit-request-line 8188 --access-logfile="-" --error-logfile="-" 'app:create_app()'
