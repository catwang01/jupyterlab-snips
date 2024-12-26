import React, { useState, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { SnippetList } from './SnippetList';
import { SnippetService } from '../services/snippetService';
import { Snippet } from '../models/types';

const SnippetPanelComponent: React.FC = () => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        loadSnippets();
    }, []);

    const loadSnippets = async () => {
        const service = new SnippetService();
        const data = await service.getSnippets();
        setSnippets(data);
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