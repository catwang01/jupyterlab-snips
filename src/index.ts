import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin,
    ILayoutRestorer
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { codeIcon } from '@jupyterlab/ui-components';
import { showSaveSnippetDialog } from './components/SaveSnippetDialog';
import { SnippetService } from './services/snippetService';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { SnippetPanel } from './components/SnippetPanel';

const plugin: JupyterFrontEndPlugin<void> = {
    id: 'jupyterlab-snips:plugin',
    autoStart: true,
    requires: [ICommandPalette, INotebookTracker, IMainMenu, ILayoutRestorer],
    activate: (
        app: JupyterFrontEnd,
        palette: ICommandPalette,
        notebookTracker: INotebookTracker,
        mainMenu: IMainMenu,
        restorer: ILayoutRestorer
    ) => {
        console.log('JupyterLab extension jupyterlab-snips is activated!');

        // 初始化 SnippetService
        const snippetService = new SnippetService();
        snippetService.initialize();

        // 创建代码片段���板
        const snippetPanel = new SnippetPanel();
        snippetPanel.id = 'jupyterlab-snips';
        snippetPanel.title.icon = codeIcon;
        snippetPanel.title.caption = '代码片段';

        // 添加到左侧边栏
        app.shell.add(snippetPanel, 'left', { rank: 200 });

        // 创建 widget 跟踪器以保存面板状态
        const tracker = new WidgetTracker<SnippetPanel>({
            namespace: 'jupyterlab-snips'
        });

        // 恢复面板状态
        if (restorer) {
            restorer.restore(tracker, {
                command: 'snippets:show',
                name: () => 'jupyterlab-snips'
            });
        }

        // 添加命令
        const command = 'snippets:show';
        app.commands.addCommand(command, {
            label: '显示代码片段面板',
            execute: () => {
                if (!snippetPanel.isAttached) {
                    app.shell.add(snippetPanel, 'left', { rank: 200 });
                }
                app.shell.activateById(snippetPanel.id);
            }
        });

        // 添加保存代码片段的命令
        const saveCommand = 'snippets:save';
        app.commands.addCommand(saveCommand, {
            label: '保存为代码片段',
            execute: async () => {
                try {
                    const notebook = notebookTracker.currentWidget;
                    if (!notebook) {
                        console.warn('没有活动的笔记本');
                        return;
                    }

                    const cell = notebook.content.activeCell;
                    if (!cell) {
                        console.warn('没有选中的单元格');
                        return;
                    }

                    const code = cell.model.sharedModel.source;
                    const result = await showSaveSnippetDialog(code);
                    
                    if (result) {
                        await snippetService.saveSnippet({
                            name: result.name,
                            code,
                            category: result.category,
                            description: result.description
                        });
                        // 保存成功后刷新面板
                        snippetPanel.refresh();
                    }
                } catch (error) {
                    console.error('保存代码片段失败:', error);
                }
            }
        });

        // 添加到上下文菜单
        app.contextMenu.addItem({
            command: saveCommand,
            selector: '.jp-CodeCell'
        });

        // 添加到命令面板
        palette.addItem({
            command: saveCommand,
            category: '代码片段'
        });

        // 添加到菜单栏
        mainMenu.fileMenu.addGroup([
            { command: saveCommand }
        ], 30);
    }
};

export default plugin; 