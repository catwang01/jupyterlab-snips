import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { SnippetPanel } from './components/SnippetPanel';
import { LabIcon } from '@jupyterlab/ui-components';
import snippetsIconStr from '../style/icons/snippets.svg';
import { ICompletionProviderManager } from '@jupyterlab/completer';
import { SnippetCompleterProvider } from './services/completerService';
import { NotebookPanel } from '@jupyterlab/notebook';
import { EditSnippetPanel } from './components/EditSnippetPanel';
import { Snippet } from './models/types';
import { SnippetService } from './services/snippetService';

// 创建一个自定义图标
const snippetsIcon = new LabIcon({
    name: 'jupyterlab-snippets:snippets',
    svgstr: snippetsIconStr
});

const plugin: JupyterFrontEndPlugin<void> = {
    id: 'jupyterlab-snips:plugin',
    autoStart: true,
    requires: [ICompletionProviderManager],
    activate: (
        app: JupyterFrontEnd, 
        completionManager: ICompletionProviderManager
    ) => {
        console.log('JupyterLab extension jupyterlab-snips is activated!');

        // 创建面板
        const panel = new SnippetPanel();
        panel.id = 'jupyterlab-snippets';
        panel.title.icon = snippetsIcon;
        panel.title.caption = 'Manage your code snippets';
        panel.title.closable = true;

        // 创建 SnippetService 实例
        const snippetService = new SnippetService();

        // 添加面板到主区域
        app.shell.add(panel, 'left');

        // 注册补全提供者
        const provider = new SnippetCompleterProvider();
        completionManager.registerProvider(provider);

        // 添加创建代码片段的命令
        app.commands.addCommand('jupyterlab-snips:create-from-selection', {
            label: 'Create Code Snippet',
            execute: () => {
                const notebookWidget = app.shell.currentWidget as NotebookPanel;
                if (!notebookWidget || !notebookWidget.content) {
                    return;
                }

                const notebook = notebookWidget.content;
                const selectedCells = notebook.widgets.filter(cell => 
                    notebook.isSelectedOrActive(cell)
                );

                if (selectedCells.length > 1) {
                    // 多个 cell 的情况
                    const code = selectedCells
                        .map(cell => cell.model.sharedModel.source)
                        .join('<cell/>');

                    const newSnippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'> = {
                        name: '',
                        code,
                        tags: [],
                        description: '',
                        isMultiCell: true
                    };

                    const editPanel = new EditSnippetPanel({
                        snippet: newSnippet,
                        onSave: async (snippet) => {
                            try {
                                await snippetService.saveSnippet(snippet);
                                panel.refresh();
                                editPanel.dispose();
                            } catch (error) {
                                console.error('Failed to save snippet:', error);
                            }
                        },
                        onCancel: () => {
                            editPanel.dispose();
                        }
                    });

                    app.shell.add(editPanel, 'main');
                    return;
                }

                // 单个 cell 的情况
                const activeCell = notebook.activeCell;
                if (!activeCell || !activeCell.editor) {
                    return;
                }

                let selectedText: string;
                const selection = activeCell.editor.getSelection();

                if (selection && (
                    selection.start.line !== selection.end.line || 
                    selection.start.column !== selection.end.column
                )) {
                    selectedText = activeCell.editor.model.sharedModel.source.slice(
                        activeCell.editor.getOffsetAt(selection.start),
                        activeCell.editor.getOffsetAt(selection.end)
                    );
                } else {
                    selectedText = activeCell.model.sharedModel.source;
                }

                const newSnippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'> = {
                    name: '',
                    code: selectedText,
                    tags: [],
                    description: '',
                    isMultiCell: false
                };

                const editPanel = new EditSnippetPanel({
                    snippet: newSnippet,
                    onSave: async (snippet) => {
                        try {
                            await snippetService.saveSnippet(snippet);
                            panel.refresh();
                            editPanel.dispose();
                        } catch (error) {
                            console.error('Failed to save snippet:', error);
                        }
                    },
                    onCancel: () => {
                        editPanel.dispose();
                    }
                });

                app.shell.add(editPanel, 'main');
            },
            isEnabled: () => {
                const widget = app.shell.currentWidget;
                if (!widget || !(widget instanceof NotebookPanel)) {
                    return false;
                }
                return widget.content.activeCell !== null;
            }
        });


        // 添加到上下文菜单
        app.contextMenu.addItem({
            command: 'jupyterlab-snips:create-from-selection',
            selector: '.jp-Notebook .jp-Cell',
            rank: 10000,
            type: 'separator'
        });

        app.contextMenu.addItem({
            command: 'jupyterlab-snips:create-from-selection',
            selector: '.jp-Notebook .jp-Cell',
            rank: 10001
        });

        // 存储 app 实例供其他组件使用
        (window as any).jupyterapp = app;
    }
};

export default plugin; 