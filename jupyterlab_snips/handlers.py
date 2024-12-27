import json
import os
from pathlib import Path
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
import uuid
import time

class SnippetHandler(APIHandler):
    def initialize(self):
        # 确保文件存在并包含有效的 JSON 数组
        file_path = self._get_snippets_file()
        if not file_path.exists():
            self._save_snippets([])

    @tornado.web.authenticated
    def get(self, snippet_id=None):
        # 获取所有代码片段
        snippets = self._load_snippets()
        if snippet_id:
            # 如果提供了 ID，返回特定的代码片段
            snippet = next((s for s in snippets if s['id'] == snippet_id), None)
            if snippet is None:
                raise tornado.web.HTTPError(404, f"Snippet {snippet_id} not found")
            self.finish(json.dumps(snippet))
        else:
            # 否则返回所有代码片段
            self.finish(json.dumps(snippets))

    @tornado.web.authenticated
    def post(self, snippet_id=None):
        data = self.get_json_body()
        
        # 如果没有 id，生成一个新的
        if not data.get('id'):
            data['id'] = str(uuid.uuid4())
            data['createdAt'] = data.get('createdAt', int(time.time() * 1000))
            data['updatedAt'] = data.get('updatedAt', int(time.time() * 1000))
        
        snippets = self._load_snippets()
        snippets.append(data)
        self._save_snippets(snippets)
        
        # 返回完整的片段数据（包含新生成的 id）
        self.finish(json.dumps(data))

    @tornado.web.authenticated
    def put(self, snippet_id=None):
        # 更新代码片段
        if not snippet_id:
            raise tornado.web.HTTPError(400, "Snippet ID is required")
        
        data = self.get_json_body()
        snippets = self._load_snippets()
        
        for i, snippet in enumerate(snippets):
            if snippet['id'] == snippet_id:
                snippets[i] = {**snippet, **data}
                break
        
        self._save_snippets(snippets)
        self.finish(json.dumps({"status": "success"}))

    @tornado.web.authenticated
    def delete(self, snippet_id=None):
        # 删除代码片段
        if not snippet_id:
            raise tornado.web.HTTPError(400, "Snippet ID is required")
            
        snippets = self._load_snippets()
        snippets = [s for s in snippets if s['id'] != snippet_id]
        self._save_snippets(snippets)
        self.finish(json.dumps({"status": "success"}))

    def _get_snippets_file(self):
        # 获取存储文件路径
        # 使用 jupyter 配置目录来存储代码片段
        jupyter_dir = Path.home() / '.jupyter'  # 使用 ~/.jupyter 目录
        snippets_dir = jupyter_dir / 'snippets'
        snippets_dir.mkdir(parents=True, exist_ok=True)
        return snippets_dir / 'snippets.json'

    def _load_snippets(self):
        # 加载代码片段
        file_path = self._get_snippets_file()
        try:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            self.log.error(f"Error loading snippets: {e}")
            # 如果文件损坏或无法读取，返回空数组
            return []
        return []

    def _save_snippets(self, snippets):
        # 保存代码片段
        file_path = self._get_snippets_file()
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(snippets, f, ensure_ascii=False, indent=2)
        except OSError as e:
            self.log.error(f"Error saving snippets: {e}")
            raise tornado.web.HTTPError(500, f"Could not save snippets: {e}") 

class TagsHandler(APIHandler):
    def _get_tags_file(self):
        # 使用和 snippets 相同的目录
        jupyter_dir = Path.home() / '.jupyter'
        snippets_dir = jupyter_dir / 'snippets'
        snippets_dir.mkdir(parents=True, exist_ok=True)
        return snippets_dir / 'tags.json'

    @tornado.web.authenticated
    def get(self, tag_id=None):
        # 读取 tags.json 文件
        tags_file = self._get_tags_file()
        try:
            if tags_file.exists():
                with open(tags_file, 'r', encoding='utf-8') as f:
                    tags = json.load(f)
            else:
                tags = []
        except (json.JSONDecodeError, OSError) as e:
            self.log.error(f"Error loading tags: {e}")
            tags = []
        
        if tag_id:
            # 如果提供了 tag_id，返回特定的标签
            tag = next((t for t in tags if t == tag_id), None)
            if tag is None:
                raise tornado.web.HTTPError(404, f"Tag {tag_id} not found")
            self.finish(json.dumps(tag))
        else:
            # 否则返回所有标签
            self.finish(json.dumps(tags))

    @tornado.web.authenticated
    def post(self, _=None):
        # 保存 tags 到 tags.json 文件
        tags = self.get_json_body()
        tags_file = self._get_tags_file()
        
        try:
            with open(tags_file, 'w', encoding='utf-8') as f:
                json.dump(tags, f, ensure_ascii=False, indent=2)
            self.finish(json.dumps({"status": "success"}))
        except OSError as e:
            self.log.error(f"Error saving tags: {e}")
            raise tornado.web.HTTPError(500, f"Could not save tags: {e}")

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    handlers = [
        # 先处理 tags 相关的路由
        (url_path_join(base_url, "jupyterlab-snips", "tags"), TagsHandler),  # GET /tags
        (url_path_join(base_url, "jupyterlab-snips", "tags", "([^/]+)"), TagsHandler),  # GET /tags/{id}
        
        # 然后是 snippets 相关的路由
        (url_path_join(base_url, "jupyterlab-snips", "snippets"), SnippetHandler),  # GET /snippets
        (url_path_join(base_url, "jupyterlab-snips", "snippets", "([^/]+)"), SnippetHandler),  # POST, PUT, DELETE /snippets/{id}
    ]

    web_app.add_handlers(host_pattern, handlers) 