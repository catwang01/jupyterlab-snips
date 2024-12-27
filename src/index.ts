import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin,
    ILayoutRestorer
} from '@jupyterlab/application';
import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { codeIcon } from '@jupyterlab/ui-components';
import { EditSnippetPanel } from './components/EditSnippetPanel';
import { SnippetService } from './services/snippetService';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { SnippetPanel } from './components/SnippetPanel';
import { ICompletionProviderManager } from '@jupyterlab/completer';
import { SnippetCompleterProvider } from './services/completerService';

const plugin: JupyterFrontEndPlugin<void> = {
    id: 'jupyterlab-snips:plugin',
    autoStart: true,
    requires: [
        ICommandPalette,
        INotebookTracker,
        IMainMenu,
        ILayoutRestorer,
        ICompletionProviderManager
    ],
    activate: (
        app: JupyterFrontEnd,
        palette: ICommandPalette,
        notebookTracker: INotebookTracker,
        mainMenu: IMainMenu,
        restorer: ILayoutRestorer,
        completionManager: ICompletionProviderManager
    ) => {
        console.log('JupyterLab extension jupyterlab-snips is activated!');

        // 将应用实例添加到 window 对象
        (window as any).jupyterapp = app;

        // 初始化 SnippetService
        const snippetService = new SnippetService();
        snippetService.initialize();

        // 创建代码片段板
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
                    if (!notebook || !notebook.content || !notebook.content.model) {
                        console.warn('没有活动的笔记本');
                        return;
                    }

                    let code = '';
                    let isMultiCell = false;

                    // 获取选中的 cells
                    const activeCell = notebook.content.activeCell;
                    const selectedCells = notebook.content.widgets.filter(
                        cell => notebook.content.isSelectedOrActive(cell)
                    );

                    if (selectedCells.length > 1) {
                        // 多个 cell 的情况
                        const codes = selectedCells.map(cell => {
                            // 使用正确的类型访问
                            return cell.model.sharedModel.source;
                        });
                        code = codes.join('\n<cell/>\n');
                        isMultiCell = true;
                    } else {
                        // 单个 cell 的情况
                        if (!activeCell) {
                            console.warn('没有选中的单元格');
                            return;
                        }
                        code = activeCell.model.sharedModel.source;
                    }

                    const editPanel = new EditSnippetPanel({
                        snippet: {
                            id: crypto.randomUUID(),
                            name: '',
                            code,
                            tags: [],
                            description: '',
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                            isMultiCell
                        },
                        onSave: async (snippet) => {
                            try {
                                await snippetService.saveSnippet(snippet);
                                snippetPanel.refresh();
                                editPanel.dispose();
                            } catch (error) {
                                console.error('保存代码片段失败:', error);
                            }
                        },
                        onCancel: () => {
                            editPanel.dispose();
                        }
                    });

                    app.shell.add(editPanel, 'main');
                } catch (error) {
                    console.error('保存代码片段失败:', error);
                }
            }
        });

        // 添加上下文菜单
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

        // 注册代码片段补���提供者
        const provider = new SnippetCompleterProvider();
        completionManager.registerProvider(provider);
    }
};

export default plugin; 