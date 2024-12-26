import React, { Key } from 'react';
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
    const categories: string[] = Array.from(
        new Set(
            snippets.flatMap((s: Snippet) => s.tags || [])
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
            (snippet.tags && snippet.tags.some(tag => selectedCategories.includes(tag)));

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="jp-snippets-container">
            <div className="jp-snippets-header">
                <div className="jp-snippets-categories">
                    {categories.map((category: string) => (
                        <label
                            key={category as Key}
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

    const tags = snippet.tags || [];

    return (
        <div 
            className="jp-snippets-item"
            title={getPreviewCode(snippet.code)}
        >
            <div className="jp-snippets-item-header">
                <h3>{snippet.name}</h3>
                <div className="jp-snippets-tags">
                    {tags.map(tag => (
                        <span key={tag} className="jp-snippets-tag">
                            {tag}
                        </span>
                    ))}
                </div>
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