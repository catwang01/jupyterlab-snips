import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { SnippetPanel } from './components/SnippetPanel';
import { LabIcon } from '@jupyterlab/ui-components';
import snippetsIconStr from '../style/icons/snippets.svg';
import { ICompletionProviderManager } from '@jupyterlab/completer';
import { SnippetCompleterProvider } from './services/completerService';

// 创建一个自定义图标
const snippetsIcon = new LabIcon({
    name: 'jupyterlab-snippets:snippets',
    svgstr: snippetsIconStr
});

const plugin: JupyterFrontEndPlugin<void> = {
    id: 'jupyterlab-snips:plugin',
    autoStart: true,
    requires: [ICompletionProviderManager],
    activate: (app: JupyterFrontEnd, completionManager: ICompletionProviderManager) => {
        console.log('JupyterLab extension jupyterlab-snips is activated!');

        // 创建面板
        const panel = new SnippetPanel();
        panel.id = 'jupyterlab-snippets';
        panel.title.icon = snippetsIcon;
        panel.title.caption = 'Manage your code snippets';
        panel.title.closable = true;

        // 添加面板到主区域
        app.shell.add(panel, 'left');

        // 注册补全提供者
        const provider = new SnippetCompleterProvider();
        completionManager.registerProvider(provider);

        // 存储 app 实例供其他组件使用
        (window as any).jupyterapp = app;
    }
};

export default plugin; 