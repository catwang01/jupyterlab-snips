import React from 'react';
import { Snippet } from '../models/types';

interface SnippetListProps {
    snippets: Snippet[];
    searchText: string;
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({
    snippets,
    searchText,
    selectedCategory,
    onCategoryChange
}) => {
    const categories = Array.from(
        new Set(
            snippets
                .map(s => s.category)
                .filter((category): category is string => category !== undefined && category !== null)
        )
    );

    const filteredSnippets = snippets.filter(snippet => {
        const matchesSearch = searchText ? 
            snippet.name.toLowerCase().includes(searchText.toLowerCase()) ||
            snippet.description?.toLowerCase().includes(searchText.toLowerCase()) :
            true;
            
        const matchesCategory = selectedCategory ? 
            snippet.category === selectedCategory :
            true;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="jp-snippets-container">
            <div className="jp-snippets-categories">
                <button 
                    onClick={() => onCategoryChange(null)}
                    className={selectedCategory === null ? 'active' : ''}
                >
                    全部
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={selectedCategory === category ? 'active' : ''}
                    >
                        {category}
                    </button>
                ))}
            </div>
            
            <div className="jp-snippets-list">
                {filteredSnippets.map(snippet => (
                    <div key={snippet.id} className="jp-snippets-item">
                        <h3>{snippet.name}</h3>
                        {snippet.description && (
                            <p>{snippet.description}</p>
                        )}
                        <div className="jp-snippets-item-actions">
                            <button onClick={() => {/* 实现插入代码 */}}>
                                插入
                            </button>
                            <button onClick={() => {/* 实现编辑代码 */}}>
                                编辑
                            </button>
                            <button onClick={() => {/* 实现删除代码 */}}>
                                删除
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 