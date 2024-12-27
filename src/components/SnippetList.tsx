import React from 'react';
import { Snippet } from '../models/types';
import { MultiSelect } from './MultiSelect';
import { getTranslation } from '../i18n';

interface ISnippetListProps {
    snippets: Snippet[];
    searchText: string;
    setSearchText: (text: string) => void;
    selectedCategories: string[];
    onCategoriesChange: (categories: string[]) => void;
    onInsert: (snippet: Snippet) => void;
    onEdit: (snippet: Snippet) => void;
    onDelete: (id: string) => void;
}

export const SnippetList: React.FC<ISnippetListProps> = ({
    snippets,
    searchText,
    setSearchText,
    selectedCategories,
    onCategoriesChange,
    onInsert,
    onEdit,
    onDelete
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
    onInsert: (snippet: Snippet) => void;
    onEdit: (snippet: Snippet) => void;
    onDelete: (id: string) => void;
}

const SnippetItem: React.FC<SnippetItemProps> = ({ snippet, onInsert, onEdit, onDelete }) => {
    const t = getTranslation();

    // 更新预览代码的函数定义
    const getPreviewCode = (code: string, isMultiCell?: boolean) => {
        if (isMultiCell) {
            // 对于多个 cell 的情况，分别处理每个 cell 的代码
            const cells = code.split('<cell/>');
            const preview = cells.map((cellCode, index) => {
                const lines = cellCode.trim().split('\n');
                if (lines.length > 5) {
                    // 每个 cell 最多显示 5 行
                    return `# Cell ${index + 1}:\n${lines.slice(0, 5).join('\n')}...\n`;
                }
                return `# Cell ${index + 1}:\n${cellCode.trim()}`;
            }).join('\n---\n'); // 使用分隔线分隔不同的 cell

            if (cells.length > 3) {
                // 如果 cell 太多，只显示前三个
                return preview.split('---\n').slice(0, 3).join('\n---\n') + '\n...(more cells)';
            }
            return preview;
        } else {
            // 单个 cell 的情况保持原样
            const lines = code.split('\n');
            if (lines.length > 10) {
                return lines.slice(0, 10).join('\n') + '\n' + t.preview.more;
            }
            return code;
        }
    };

    const tags = snippet.tags || [];

    return (
        <div 
            className="jp-snippets-item"
            title={getPreviewCode(snippet.code, snippet.isMultiCell)}
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
                <button 
                    className="jp-snippets-button" 
                    onClick={() => onInsert(snippet)}
                >
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