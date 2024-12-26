import React from 'react';
import { Snippet } from '../models/types';

interface SnippetListProps {
    snippets: Snippet[];
    searchText: string;
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
    selectedCategories,
    onCategoriesChange,
    onRefresh,
    onInsert,
    onEdit,
    onDelete
}) => {
    const categories = Array.from(
        new Set(
            snippets
                .map(s => s.category)
                .filter((category): category is string => category !== undefined && category !== null)
        )
    );

    const handleCategoryToggle = (category: string) => {
        if (selectedCategories.includes(category)) {
            onCategoriesChange(selectedCategories.filter(c => c !== category));
        } else {
            onCategoriesChange([...selectedCategories, category]);
        }
    };

    const filteredSnippets = snippets.filter(snippet => {
        const matchesSearch = searchText ? 
            snippet.name.toLowerCase().includes(searchText.toLowerCase()) ||
            snippet.description?.toLowerCase().includes(searchText.toLowerCase()) :
            true;
            
        const matchesCategory = selectedCategories.length === 0 || 
            (snippet.category && selectedCategories.includes(snippet.category));

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="jp-snippets-container">
            <div className="jp-snippets-header">
                <div className="jp-snippets-categories">
                    {categories.map(category => (
                        <label
                            key={category}
                            className={`jp-snippets-category-checkbox ${
                                selectedCategories.includes(category) ? 'active' : ''
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleCategoryToggle(category)}
                            />
                            {category}
                        </label>
                    ))}
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

    return (
        <div 
            className="jp-snippets-item"
            title={getPreviewCode(snippet.code)}
        >
            <div className="jp-snippets-item-header">
                <h3>{snippet.name}</h3>
                {snippet.category && (
                    <span className="jp-snippets-tag">{snippet.category}</span>
                )}
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