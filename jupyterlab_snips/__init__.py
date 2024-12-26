"""
JupyterLab Snippets - A JupyterLab extension for managing code snippets
"""
from ._version import __version__
from jupyter_server.utils import url_path_join
from .handlers import SnippetHandler

def _jupyter_labextension_paths():
    return [{
        'src': 'labextension',
        'dest': 'jupyterlab-snips'
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
    
    handlers = [
        (url_path_join(base_url, 'jupyterlab-snips', 'snippets'),
         SnippetHandler),
        (url_path_join(base_url, 'jupyterlab-snips', 'snippets/([^/]+)'),
         SnippetHandler)  # 添加支持 ID 的路由
    ]
    web_app.add_handlers('.*$', handlers)
    return True  # 返回 True 表示加载成功 