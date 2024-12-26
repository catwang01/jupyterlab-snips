import React from 'react';
import { Snippet } from '../models/types';
import { MultiSelect } from './MultiSelect';

interface SnippetListProps {
    snippets: Snippet[];
    searchText: string;
    setSearchText: (value: string) => void;
    selectedCategories: string[];
    onCategoriesChange: (categories: string[]) => void;
    onRefresh: () => void;
    onInsert: (code: string) => void;
    onEdit: (snippet: Snippet) => void;
    onDelete: (id: string) => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({
    snippets,
    searchText,
    setSearchText,
    selectedCategories,
    onCategoriesChange,
    onRefresh,
    onInsert,
    onEdit,
    onDelete
}) => {
    const availableTags: string[] = Array.from(
        new Set(
            snippets.flatMap((s: Snippet) => s.tags || [])
        )
    );

    const filteredSnippets = snippets.filter(snippet => {
        const matchesSearch = searchText ? 
            snippet.name.toLowerCase().includes(searchText.toLowerCase()) ||
            snippet.description?.toLowerCase().includes(searchText.toLowerCase()) :
            true;
            
        const matchesCategory = selectedCategories.length === 0 || 
            (snippet.tags && snippet.tags.some(tag => selectedCategories.includes(tag)));

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="jp-snippets-container">
            <div className="jp-snippets-header">
                <div className="jp-snippets-filter">
                    <div className="jp-snippets-search">
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="搜索代码片段..."
                        />
                    </div>
                    <div className="jp-snippets-tag-filter">
                        <MultiSelect
                            value={selectedCategories}
                            options={availableTags}
                            onChange={onCategoriesChange}
                            placeholder="选择标签过滤..."
                        />
                    </div>
                </div>
                <button 
                    className="jp-snippets-refresh"
                    onClick={onRefresh}
                    title="刷新列表"
                >
                    刷新
                </button>
            </div>
            
            <div className="jp-snippets-list">
                {filteredSnippets.map(snippet => (
                    <SnippetItem
                        key={snippet.id}
                        snippet={snippet}
                        onInsert={onInsert}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};

interface SnippetItemProps {
    snippet: Snippet;
    onInsert: (code: string) => void;
    onEdit: (snippet: Snippet) => void;
    onDelete: (id: string) => void;
}

const SnippetItem: React.FC<SnippetItemProps> = ({ snippet, onInsert, onEdit, onDelete }) => {
    // 获取预览代码
    const getPreviewCode = (code: string) => {
        const lines = code.split('\n');
        if (lines.length > 10) {
            return lines.slice(0, 10).join('\n') + '\n...';
        }
        return code;
    };

    const tags = snippet.tags || [];

    return (
        <div 
            className="jp-snippets-item"
            title={getPreviewCode(snippet.code)}
        >
            <div className="jp-snippets-item-header">
                <h3>{snippet.name}</h3>
                { tags.length > 0 && <div className="jp-snippets-tags">
                    {tags.map(tag => (
                        <span key={tag} className="jp-snippets-tag">
                            {tag}
                        </span>
                    ))}
                </div>
                }
            </div>
            {snippet.description && <p>{snippet.description}</p>}
            <div className="jp-snippets-item-actions">
                <button onClick={() => onInsert(snippet.code)}>插入</button>
                <button onClick={() => onEdit(snippet)}>编辑</button>
                <button onClick={() => onDelete(snippet.id)}>删除</button>
            </div>
        </div>
    );
}; 