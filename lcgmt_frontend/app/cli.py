import os
import click
from flask import current_app

from app.extensions import db
from app.initdata import init_admin, init_fakeuser, init_role_permission, init_cms_category, init_systemmenu, \
    init_friend_link, init_cms_article, init_cms_carousel

from app.wxtmetadata import addMeta,getObsMetaFromImgfile, addBeidouMeta, add_pipeline_info
from app.fxtmetadata import addMeta as addFxtMeta
from app.vhfmetadata import addMeta as addVhfMeta
from app.vhfmetadata import create_vhf_alert

# from app.project.models import ProjectTypeOne,ProjectTypeTwo,ProjectTypeThree


def register_commands(app):
    @app.cli.command()
    @click.option('--drop', is_flag=True, help='Create after drop.')
    @click.option('--user', default=5, help='Quantity of users, default is 5.')
    @click.option('--clean', default=False, help='Clean data, default is 0.')
    @click.option('--bind', default=None, help="bind database, default None, could be '__all__'")
    @click.option('--url_prefix', default='', help="URL prefix, e.g. '/leia', the x-subsite of nginx configuration")
    def init(drop, user, clean, bind, url_prefix):
        """
        Initialize the database and the App. \n
        flask init\n
        flask init --drop\n
        flask init --drop --url_prefix /ep
        """
        # if drop:
        #     click.confirm('This operation will delete the database, do you want to continue?', abort=True)
        #     db.drop_all(bind=bind)
        #     click.echo('Drop tables.')

        # click.echo('Initializing the database...')
        # db.create_all(bind=bind)

        click.echo('Initializing Roles and Permissions...')
        init_role_permission(clean)

        # click.echo('Initializing CMS Categories...')
        # init_cms_category(clean)
        # #
        # click.echo('Initializing CMS Articles...')
        # init_cms_article(url_prefix, clean)
        # #
        # click.echo('Initializing CMS Carousel...')
        # init_cms_carousel(url_prefix, clean)

        # click.echo('Initializing System menu...')
        # init_systemmenu(url_prefix, clean)

        # click.echo('Initializing Friend Links...')
        # init_friend_link(url_prefix, clean)

        click.echo('Generating the administrator...')
        init_admin()

        # click.echo('Initialising the project list...')
        # ProjectTypeOne.create()
        # ProjectTypeTwo.create()
        # ProjectTypeThree.create()

        if user>0:
            click.echo('Generating %d users...' % user)
            init_fakeuser(user)

        click.echo('Done.')

    @app.cli.command()
    def rmver():
        """Remove version info from alembic_version data table"""
        verpath=os.path.abspath('migrations/versions')
        if os.path.exists(verpath):
            files = os.listdir(verpath)
            for item in files:
                if item.endswith(".py"):
                    f = os.path.join(verpath, item)
                    if os.path.exists(f):
                        os.remove(f)
                        print("delete", f)
        db.get_engine(bind=None).execute('delete from alembic_version')#default engine
        for key in current_app.config['SQLALCHEMY_BINDS']:
            engine=db.get_engine(bind=key)
            engine.execute('delete from alembic_version')
        click.echo('Done.')

    @app.cli.command()
    @click.argument('wxtdatapath')
    @click.argument('obs_id')
    def getwxtmetadata(wxtdatapath, obs_id):
        """ Get meta data from WXT products """
        addMeta(wxtdatapath, obs_id)

    @app.cli.command()
    @click.argument('datapath')
    @click.argument('obs_id')
    def getvhfmetadata(datapath,obs_id):
        """ Get meta data from VHF products """
        addVhfMeta(datapath,obs_id)

    @app.cli.command()
    @click.argument('datapath')
    def getvhfalert(datapath):
        """ Get meta data from VHF products """
        create_vhf_alert(datapath)
        
    @app.cli.command()
    @click.argument('urn')
    def getfxtmetadata(urn:str):
        """ Get meta data from FXT products """
        addFxtMeta(urn)

    @app.cli.command()1    @click.argument('uuid')
    @click.argument('oss_paths')
    @click.argument('obs_id')
    def add_pipeline(uuid,oss_paths:str,obs_id):
        """添加pipeline处理记录

        Args:
            uuid (_type_): pipeline uuid
            oss_paths (str): file oss path
            obs_id (_type_): obsid
        """
        add_pipeline_info(obs_id,uuid=uuid,oss_paths=oss_paths.split('-'))
    

    @app.cli.command()
    @click.argument('data_path')
    def addbdmetadata(data_path):
        """从ALert中获取北斗信息

        Args:
            data_path (_type_): _description_
        """
        addBeidouMeta(data_path)
        
    @app.cli.command("fovtest")
    def fovtest():
        """ Get meta data from WXT products """
        img_file_name = 'ep11900003831wxt1.img'
        getObsMetaFromImgfile("11900003831", os.path.join("/Users/xuyunfei/tdic/data/wxt_product_level2/11900003831", img_file_name),1)

   
    @app.cli.command()
    @click.argument('srcimage')
    def gentnimages(srcimage):
        """
        cut image to subimages for tncode
        flask gentnimages "C:/Users/Dongwei/Projects/NADC/dev/ep/data/tncode_resource/bigimg.jpg"
        """
        bg_img_dir = current_app.config['TNCODE_RESOURCE_PATH']+'/bg'
        click.echo('cut image ' + srcimage + ' to ' + bg_img_dir)
        from PIL import Image
        if not os.path.exists(srcimage):
            click.echo('image not exists: ' + srcimage)
            return
        if not os.path.exists(bg_img_dir):
            os.makedirs(bg_img_dir)
        img = Image.open(srcimage)
        w, h = img.size
        nw, nh = 240, 150
        sw, sh = 0, 0
        index = 0
        while sh + nh < h:
            while sw + nw < w:
                img.crop((sw, sh, sw + nw, sh + nh)).save(bg_img_dir + '/' + str(index) + '.png')
                index += 1
                sw += nw
            sw = 0
            sh += nh
        #
        destdir = current_app.config['APP_STATIC_FOLDER']+'/tn/img'
        from app.tncode import gen_tncode_images
        click.echo('generate tncode from ' + bg_img_dir + ' to ' + destdir)
        if not os.path.exists(destdir):
            os.makedirs(destdir)
        gen_tncode_images(bg_img_dir, destdir)
        click.echo('Done.')

    @app.cli.group()
    def translate():
        """Translation and localization commands."""
        pass

    @translate.command()
    @click.argument('lang')
    def init(lang):
        """Initialize a new language."""
        if os.system('pybabel extract -F babel.cfg -k _l -o messages.pot .'):
            raise RuntimeError('extract command failed')
        if os.system(
                'pybabel init -i messages.pot -d app/translations -l ' + lang):
            raise RuntimeError('init command failed')
        os.remove('messages.pot')

    @translate.command()
    def update():
        """Update all languages."""
        if os.system('pybabel extract -F babel.cfg -k _l -o messages.pot .'):
            raise RuntimeError('extract command failed')
        if os.system('pybabel update -i messages.pot -d app/translations'):
            raise RuntimeError('update command failed')
        os.remove('messages.pot')

    @translate.command()
    def compile():
        """Compile all languages."""
        if os.system('pybabel compile -d app/translations'):
            raise RuntimeError('compile command failed')
