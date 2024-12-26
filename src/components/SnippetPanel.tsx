import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { SnippetList } from './SnippetList';
import { SnippetService } from '../services/snippetService';
import { Snippet } from '../models/types';

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