import React from 'react';
import { Snippet } from '../models/types';
import { MultiSelect } from './MultiSelect';
import { getTranslation } from '../i18n';

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
    onNew: () => void;
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
    onDelete,
    onNew
}) => {
    const t = getTranslation();
    const availableTags: string[] = Array.from(
        new Set(
            snippets.flatMap((s: Snippet) => s.tags || [])
        )
    );

    const filteredSnippets = snippets.filter(snippet => {
        // Filter by search text
        const matchesSearch = searchText ? 
            snippet.name.toLowerCase().includes(searchText.toLowerCase()) ||
            snippet.description?.toLowerCase().includes(searchText.toLowerCase()) :
            true;
            
        // Filter by selected categories/tags
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
                            placeholder={t.search.placeholder}
                        />
                    </div>
                    <MultiSelect
                        value={selectedCategories}
                        options={availableTags}
                        onChange={onCategoriesChange}
                        placeholder={t.search.tagPlaceholder}
                    />
                </div>
                <div className="jp-snippets-actions">
                    <button 
                        className="jp-snippets-button"
                        onClick={onNew}
                    >
                        {t.buttons.new}
                    </button>
                    <button 
                        className="jp-snippets-button"
                        onClick={onRefresh}
                    >
                        {t.buttons.refresh}
                    </button>
                </div>
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
    // Get preview code
    const getPreviewCode = (code: string) => {
        const lines = code.split('\n');
        if (lines.length > 10) {
            return lines.slice(0, 10).join('\n') + t.preview.more;
        }
        return code;
    };

    const tags = snippet.tags || [];
    const t = getTranslation();

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
                <button className="jp-snippets-button" onClick={() => onInsert(snippet.code)}>
                    {t.buttons.insert}
                </button>
                <button className="jp-snippets-button" onClick={() => onEdit(snippet)}>
                    {t.buttons.edit}
                </button>
                <button className="jp-snippets-button" onClick={() => onDelete(snippet.id)}>
                    {t.buttons.delete}
                </button>
            </div>
        </div>
    );
}; 