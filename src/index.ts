import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { showSaveSnippetDialog } from './components/SaveSnippetDialog';
import { SnippetService } from './services/snippetService';
import { IMainMenu } from '@jupyterlab/mainmenu';

const plugin: JupyterFrontEndPlugin<void> = {
    id: 'jupyterlab-snip:plugin',
    autoStart: true,
    requires: [ICommandPalette, INotebookTracker, IMainMenu],
    activate: (
        app: JupyterFrontEnd,
        palette: ICommandPalette,
        notebookTracker: INotebookTracker,
        mainMenu: IMainMenu
    ) => {
        console.log('JupyterLab extension jupyterlab-snippets is activated!');

        // 初始化 SnippetService
        const snippetService = new SnippetService();
        snippetService.initialize();

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