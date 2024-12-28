import React, { useCallback, useRef, useEffect } from 'react';
import { Snippet } from '../models/types';
import { MultiSelect } from './MultiSelect';
import { getTranslation } from '../i18n';
import { JupyterFrontEnd } from '@jupyterlab/application';
import { Widget } from '@lumino/widgets';
import { TooltipModal } from './TooltipModal';

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
                    <div key={snippet.id} className="jp-snippets-item-wrapper">
                        <SnippetItem
                            snippet={snippet}
                            onInsert={onInsert}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
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
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<Widget | null>(null);

    const getPreviewContent = (snippet: Snippet) => {
        if (snippet.isMultiCell) {
            return snippet.code.split('<cell/>').map((cell, i) => (
                `# Cell ${i + 1}\n${cell.trim()}`
            )).join('\n\n');
        }
        return snippet.code;
    };

    const handleTooltip = useCallback((show: boolean) => {
        const app = (window as any).jupyterapp as JupyterFrontEnd;
        if (!app) return;

        if (show) {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const tooltip = new TooltipModal({
                content: getPreviewContent(snippet),
                position: {
                    top: rect.top,
                    left: rect.right + 8
                }
            });

            Widget.attach(tooltip, document.body);
            tooltipRef.current = tooltip;
        } else {
            if (tooltipRef.current) {
                tooltipRef.current.dispose();
                tooltipRef.current = null;
            }
        }
    }, [snippet]);

    // 组件卸载时清理 tooltip
    useEffect(() => {
        return () => {
            if (tooltipRef.current) {
                tooltipRef.current.dispose();
                tooltipRef.current = null;
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="jp-snippets-item"
            onMouseEnter={() => handleTooltip(true)}
            onMouseLeave={() => handleTooltip(false)}
        >
            <div className="jp-snippets-item-header">
                <h3>{snippet.name}</h3>
                {snippet.isMultiCell && (
                    <span className="jp-snippets-multicell-badge">
                        Multi-cell
                    </span>
                )}
                {snippet.tags && snippet.tags.length > 0 && <div className="jp-snippets-tags">
                    {snippet.tags.map(tag => (
                        <span key={tag} className="jp-snippets-tag">
                            {tag}
                        </span>
                    ))}
                </div>}
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