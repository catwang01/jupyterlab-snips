import json
import os
from pathlib import Path
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

class SnippetHandler(APIHandler):
    def initialize(self):
        # 确保文件存在并包含有效的 JSON 数组
        file_path = self._get_snippets_file()
        if not file_path.exists():
            self._save_snippets([])

    @tornado.web.authenticated
    def get(self):
        # 获取所有代码片段
        snippets = self._load_snippets()
        self.finish(json.dumps(snippets))

    @tornado.web.authenticated
    def post(self):
        # 保存新的代码片段
        data = self.get_json_body()
        snippets = self._load_snippets()
        snippets.append(data)
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