from ..ReferenceTable import ISourceTable, IInstruTable
from ..engine import BaseEngine
from flask import Flask
from .routes import api
def create_app(source_table:ISourceTable,instru_table:IInstruTable,engine:BaseEngine)->Flask:
    app = Flask(__name__)
    app.register_blueprint(api,url_prefix="")
    app.config['source_table'] = source_table
    app.config['instru_table'] = instru_table
    app.config['engine'] = engine
    
    return app