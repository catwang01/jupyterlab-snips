import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { SnippetList } from './SnippetList';
import { SnippetService } from '../services/snippetService';
import { Snippet } from '../models/types';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { EditSnippetPanel } from './EditSnippetPanel';
import { Dialog, showDialog } from '@jupyterlab/apputils';
import { getTranslation } from '../i18n';
import { saveAs } from 'file-saver';
import { NotebookPanel, NotebookActions } from '@jupyterlab/notebook';
import { CodeCell } from '@jupyterlab/cells';

declare global {
    interface Window {
        jupyterapp?: JupyterFrontEnd;
    }
}

interface SnippetPanelComponentProps {
    onRefresh?: () => void;
}

type SnippetPanelComponentType = {
    loadSnippets: () => Promise<void>;
};

const SnippetPanelComponent = forwardRef<SnippetPanelComponentType, SnippetPanelComponentProps>(
    ({ onRefresh }, ref) => {
        const [snippets, setSnippets] = useState<Snippet[]>([]);
        const [searchText, setSearchText] = useState('');
        const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
        const snippetService = useRef(new SnippetService());

        const loadSnippets = useCallback(async () => {
            try {
                const data = await snippetService.current.getSnippets();
                setSnippets(data);
            } catch (error) {
                const t = getTranslation();
                console.error(t.dialog.loadSnippetsError, error);
            }
        }, []);

        // Expose loadSnippets method to parent component
        React.useImperativeHandle(ref, () => ({
            loadSnippets
        }), [loadSnippets]);

        useEffect(() => {
            loadSnippets();
        }, [loadSnippets]);

        const handleInsert = async (snippet: Snippet) => {
            const t = getTranslation();
            try {
                const notebookWidget = window.jupyterapp?.shell.currentWidget as NotebookPanel;
                if (!notebookWidget || !notebookWidget.content || !notebookWidget.content.model) {
                    void showDialog({
                        title: t.dialog.errorTitle,
                        body: t.dialog.noNotebook,
                        buttons: [Dialog.okButton({ label: t.buttons.confirm })]
                    });
                    return;
                }

                const notebook = notebookWidget.content;

                if (snippet.isMultiCell) {
                    // 处理多个 cell 的情况
                    const cells = snippet.code.split('<cell/>');
                    
                    // 获取当前活动 cell 的索引
                    const activeIndex = notebook.activeCellIndex;
                    
                    // 插入所有 cells
                    for (const cellCode of cells) {
                        // 创建并插入新的 cell
                        NotebookActions.insertBelow(notebook);
                        const cell = notebook.activeCell as CodeCell;
                        if (cell) {
                            cell.model.sharedModel.setSource(cellCode.trim());
                        }
                    }

                    // 回到第一个插入的 cell
                    notebook.activeCellIndex = activeIndex + 1;
                } else {
                    // 单个 cell 的情况
                    const activeCell = notebook.activeCell as CodeCell;
                    if (activeCell) {
                        // 如果有活动的 cell，直接插入代码
                        activeCell.model.sharedModel.setSource(snippet.code);
                    } else {
                        // 如果没有活动的 cell，创建新的并插入
                        NotebookActions.insertBelow(notebook);
                        const cell = notebook.activeCell as CodeCell;
                        if (cell) {
                            cell.model.sharedModel.setSource(snippet.code);
                        }
                    }
                }

                // 聚焦到活动的 cell
                notebook.activate();
            } catch (error) {
                console.error('Insert snippet error:', error);
                void showDialog({
                    title: t.dialog.errorTitle,
                    body: t.dialog.insertError + error,
                    buttons: [Dialog.okButton({ label: t.buttons.confirm })]
                });
            }
        };

        const handleEdit = async (snippet: Snippet) => {
            const t = getTranslation();
            const editPanel = new EditSnippetPanel({
                snippet,
                onSave: async (updatedSnippet) => {
                    try {
                        await snippetService.current.updateSnippet(snippet.id, updatedSnippet);
                        
                        // Update tags list
                        const allSnippets = await snippetService.current.getSnippets();
                        const allTags: string[] = Array.from(new Set(
                            allSnippets.flatMap((s: Snippet) => s.tags || [])
                        ));
                        await snippetService.current.saveTags(allTags);
                        
                        loadSnippets();
                        editPanel.dispose();
                    } catch (error) {
                        void showDialog({
                            title: t.dialog.errorTitle,
                            body: t.dialog.updateError + error,
                            buttons: [Dialog.okButton({ label: t.buttons.confirm })]
                        });
                    }
                },
                onCancel: () => {
                    editPanel.dispose();
                }
            });

            window.jupyterapp?.shell.add(editPanel, 'main');
        };

        const handleDelete = async (id: string) => {
            const t = getTranslation();
            
            const result = await showDialog({
                title: t.dialog.deleteTitle,
                body: t.dialog.deleteMessage,
                buttons: [
                    Dialog.cancelButton({ label: t.buttons.cancel }),
                    Dialog.warnButton({ label: t.buttons.delete })
                ]
            });

            if (result.button.accept) {
                try {
                    await snippetService.current.deleteSnippet(id);
                    
                    // Update tags list
                    const allSnippets = await snippetService.current.getSnippets();
                    const allTags: string[] = Array.from(new Set(
                        allSnippets.flatMap((s: Snippet) => s.tags || [])
                    ));
                    await snippetService.current.saveTags(allTags);
                    
                    loadSnippets();
                } catch (error) {
                    void showDialog({
                        title: t.dialog.errorTitle,
                        body: t.dialog.deleteError + error,
                        buttons: [Dialog.okButton({ label: t.buttons.confirm })]
                    });
                }
            }
        };

        const handleNew = () => {
            const t = getTranslation();
            const newSnippet: Snippet = {
                id: crypto.randomUUID(),
                name: '',
                code: '',
                tags: [],
                description: '',
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const editPanel = new EditSnippetPanel({
                snippet: newSnippet,
                onSave: async (snippet) => {
                    try {
                        await snippetService.current.saveSnippet(snippet);
                        loadSnippets();
                        editPanel.dispose();
                    } catch (error) {
                        void showDialog({
                            title: t.dialog.errorTitle,
                            body: t.dialog.saveError + error,
                            buttons: [Dialog.okButton({ label: t.buttons.confirm })]
                        });
                    }
                },
                onCancel: () => {
                    editPanel.dispose();
                }
            });

            window.jupyterapp?.shell.add(editPanel, 'main');
        };

        const handleExport = async () => {
            try {
                const data = await snippetService.current.exportSnippets();
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json'
                });
                saveAs(blob, 'snippets-export.json');
            } catch (error) {
                console.error('Export failed:', error);
            }
        };

        const handleImport = async () => {
            try {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                
                input.onchange = async (e: Event) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const data = JSON.parse(e.target?.result as string);
                            await snippetService.current.importSnippets(data);
                            // 刷新列表
                            loadSnippets();
                        } catch (error) {
                            console.error('Import failed:', error);
                        }
                    };
                    reader.readAsText(file);
                };

                input.click();
            } catch (error) {
                console.error('Import failed:', error);
            }
        };

        return (
            <div className="jp-snippets-panel">
                <div className="jp-snippets-header">
                    <div className="jp-snippets-actions">
                        <button className="jp-snippets-button" onClick={handleNew}>
                            New Snippet
                        </button>
                        <button className="jp-snippets-button" onClick={handleExport}>
                            Export
                        </button>
                        <button className="jp-snippets-button" onClick={handleImport}>
                            Import
                        </button>
                        <button className="jp-snippets-button" onClick={loadSnippets}>
                            Refresh
                        </button>
                    </div>
                </div>
                <SnippetList
                    snippets={snippets}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    selectedCategories={selectedCategories}
                    onCategoriesChange={setSelectedCategories}
                    onInsert={handleInsert}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
        );
    }
);

export class SnippetPanel extends ReactWidget {
    private _component: React.RefObject<SnippetPanelComponentType>;

    constructor() {
        super();
        this.addClass('jp-snippets-panel-widget');
        this._component = React.createRef();
    }

    refresh(): void {
        const component = this._component.current;
        if (component) {
            component.loadSnippets();
        }
    }

    render(): JSX.Element {
        return <SnippetPanelComponent ref={this._component} />;
    }
} 