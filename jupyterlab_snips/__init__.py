"""
JupyterLab Snippets - A JupyterLab extension for managing code snippets
"""
from ._version import __version__
from jupyter_server.utils import url_path_join
from .handlers import SnippetHandler, setup_handlers
import json
import os

def _jupyter_labextension_paths():
    # 读取 package.json 文件
    package_path = os.path.join(os.path.dirname(__file__), '..', 'package.json')
    with open(package_path) as f:
        package_data = json.load(f)
    
    return [{
        'src': 'labextension',
        'dest': package_data['name']  # 使用 package.json 中的名称
    }]

def _jupyter_server_extension_points():
    return [{
        "module": "jupyterlab_snips"
    }]

def _jupyter_server_extension_paths():
    return [{
        "module": "jupyterlab_snips"
    }]

def load_jupyter_server_extension(nb_server_app):
    """
    注册处理器
    """
    web_app = nb_server_app.web_app
    base_url = web_app.settings['base_url']
    setup_handlers(web_app)
    return True  # 返回 True 表示加载成功 