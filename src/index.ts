import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { SnippetPanel } from './components/SnippetPanel';

const plugin: JupyterFrontEndPlugin<void> = {
    id: 'jupyterlab-snips:plugin',
    autoStart: true,
    activate: (app: JupyterFrontEnd) => {
        console.log('JupyterLab extension jupyterlab-snips is activated!');

        // 创建面板
        const panel = new SnippetPanel();
        panel.id = 'jupyterlab-snippets';
        panel.title.label = 'Snippets';
        panel.title.closable = true;

        // 添加面板到主区域
        app.shell.add(panel, 'left');

        // 存储 app 实例供其他组件使用
        (window as any).jupyterapp = app;
    }
};

export default plugin; 