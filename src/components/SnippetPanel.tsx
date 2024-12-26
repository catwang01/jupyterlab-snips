import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { SnippetList } from './SnippetList';
import { SnippetService } from '../services/snippetService';
import { Snippet } from '../models/types';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { EditSnippetPanel } from './EditSnippetPanel';

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
        const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
        const snippetService = useRef(new SnippetService());

        const loadSnippets = useCallback(async () => {
            try {
                const data = await snippetService.current.getSnippets();
                setSnippets(data);
                onRefresh?.();
            } catch (error) {
                console.error('加载代码片段失败:', error);
            }
        }, [onRefresh]);

        // 暴露 loadSnippets 方法给父组件
        React.useImperativeHandle(ref, () => ({
            loadSnippets
        }));

        useEffect(() => {
            loadSnippets();
        }, [loadSnippets]);

        const handleInsert = async (code: string) => {
            try {
                // 获取当前活动的笔记本
                const notebook = window.jupyterapp?.shell.currentWidget;
                if (!notebook) {
                    window.alert('请先打开一个笔记本');
                    return;
                }

                // 获取当前活动的单元格
                const activeCell = (notebook as any).content.activeCell;
                
                if (activeCell) {
                    // 如果有活动单元格，直接插入代码
                    await window.jupyterapp?.commands.execute('notebook:replace-selection', {
                        text: code
                    });
                } else {
                    // 如果没有活动单元格，创建新的单元格并插入代码
                    await window.jupyterapp?.commands.execute('notebook:insert-cell-below');
                    await window.jupyterapp?.commands.execute('notebook:replace-selection', {
                        text: code
                    });
                }

                // 聚焦到单元格
                await window.jupyterapp?.commands.execute('notebook:enter-edit-mode');
            } catch (error) {
                console.error('插入代码片段失败:', error);
                window.alert('插入代码片段失败，请重试');
            }
        };

        const handleEdit = async (snippet: Snippet) => {
            const editPanel = new EditSnippetPanel({
                snippet,
                onSave: async (updatedSnippet) => {
                    await snippetService.current.updateSnippet(snippet.id, updatedSnippet);
                    loadSnippets();
                    // 关闭编辑面板
                    editPanel.dispose();
                },
                onCancel: () => {
                    // 关闭编辑面板
                    editPanel.dispose();
                }
            });

            // 将编辑面板添加到主区域
            window.jupyterapp?.shell.add(editPanel, 'main');
        };

        const handleDelete = async (id: string) => {
            const confirmed = window.confirm('确定要删除这个代码片段吗？');
            if (confirmed) {
                await snippetService.current.deleteSnippet(id);
                loadSnippets();
            }
        };

        return (
            <div className="jp-snippets-panel">
                <div className="jp-snippets-search">
                    <input 
                        type="text"
                        placeholder="搜索代码片段..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <div className="jp-snippets-content">
                    <SnippetList 
                        snippets={snippets}
                        searchText={searchText}
                        selectedCategory={selectedCategory}
                        onCategoryChange={(category) => setSelectedCategory(category)}
                        onRefresh={loadSnippets}
                        onInsert={handleInsert}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
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
        // 调用组件的 loadSnippets 方法
        const component = this._component.current;
        if (component) {
            component.loadSnippets();
        }
    }

    render(): JSX.Element {
        return <SnippetPanelComponent ref={this._component} onRefresh={() => this.update()} />;
    }
} 