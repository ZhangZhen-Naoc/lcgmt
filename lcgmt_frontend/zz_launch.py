from mockito import when,ANY
from unittest import mock
from app import create_app
import app

from flask_docs import ApiDoc
import sys
import logging
from pandas import DataFrame
# 跳过验证码和密码验证

from wsgi import application
# assert application.config['FLASK_CONFIG']=='zhangzhen'
ApiDoc(
    application,
    title="Sample App",
    version="1.0.0",
    description="A simple app API",
)
logging.basicConfig(level=logging.DEBUG)
# Mock upperlimit
if __name__=="__main__":
    if sys.argv.__len__() != 1:
        if sys.argv[1]=="docs":
            doc_content = application.test_client().get("/docs/api/").text
            with open("doc.html","w") as f:
                f.write(doc_content)
            exit()
    
    application.run(debug=True,host="0.0.0.0",port=5002)
