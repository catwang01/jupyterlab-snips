import React, { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { SnippetList } from './SnippetList';
import { SnippetService } from '../services/snippetService';
import { Snippet } from '../models/types';

const SnippetPanelComponent: React.FC = () => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSnippets();
    }, []);

    const loadSnippets = async () => {
        try {
            const service = new SnippetService();
            const data = await service.getSnippets();
            setSnippets(data);
            setError(null);
        } catch (err) {
            console.error('加载代码片段失败:', err);
            setError('加载代码片段失败');
        }
    };

    const handleCategoryChange = (category: string | null) => {
        setSelectedCategory(category);
    };

    return (
        <div className="jp-snippets-panel">
            {error && (
                <div className="jp-snippets-error">
                    {error}
                </div>
            )}
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
                    onCategoryChange={handleCategoryChange}
                />
            </div>
        </div>
    );
};

export class SnippetPanel extends ReactWidget {
    constructor() {
        super();
        this.addClass('jp-snippets-panel-widget');
    }

    render(): JSX.Element {
        return <SnippetPanelComponent />;
    }
} 