import React, { useState, useRef } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Snippet } from '../models/types';
import { SnippetService } from '../services/snippetService';

interface EditSnippetPanelProps {
    snippet: Snippet;
    onSave: (updatedSnippet: Snippet) => void;
    onCancel: () => void;
}

const EditSnippetPanelComponent: React.FC<EditSnippetPanelProps> = ({
    snippet,
    onSave,
    onCancel
}) => {
    const [name, setName] = useState(snippet.name);
    const [nameError, setNameError] = useState<string | null>(null);
    const [category, setCategory] = useState(snippet.category || '');
    const [description, setDescription] = useState(snippet.description || '');
    const [code, setCode] = useState(snippet.code);
    const snippetService = useRef(new SnippetService());

    // 验证名称
    const validateName = async (newName: string) => {
        if (!newName.trim()) {
            setNameError('名称不能为空');
            return false;
        }

        const exists = await snippetService.current.checkNameExists(
            newName,
            snippet.id  // 编辑时排除当前片段
        );

        if (exists) {
            setNameError('该名称已存在');
            return false;
        }

        setNameError(null);
        return true;
    };

    // 处理名称变化
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);
        validateName(newName);
    };

    const handleSave = async () => {
        if (!await validateName(name)) {
            return;  // 如果验证失败，不执行保存
        }

        onSave({
            ...snippet,
            name,
            category,
            description,
            code,
            updatedAt: Date.now()
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onCancel();
        }
    };

    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        nextElementId?: string
    ) => {
        if (e.key === 'Enter' && !e.shiftKey && nextElementId) {
            e.preventDefault();
            const nextElement = document.getElementById(nextElementId);
            if (nextElement) {
                nextElement.focus();
            }
        }
    };

    return (
        <div className="jp-snippets-modal-backdrop" onClick={onCancel}>
            <div 
                className="jp-snippets-modal-content" 
                onClick={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="jp-snippets-modal-header">
                    <h2>{snippet.id ? '编辑代码片段' : '新建代码片段'}</h2>
                    <button className="jp-snippets-modal-close" onClick={onCancel}>×</button>
                </div>
                <div className="jp-snippets-modal-body">
                    <div className="jp-snippets-edit-field">
                        <label>名称：</label>
                        <div className="jp-snippets-input-wrapper">
                            <input 
                                id="snippet-name"
                                type="text"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="输入代码片段名称"
                                onKeyDown={(e) => handleInputKeyDown(e, 'snippet-category')}
                                autoFocus
                                className={nameError ? 'has-error' : ''}
                            />
                            {nameError && (
                                <div className="jp-snippets-input-error">
                                    {nameError}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="jp-snippets-edit-field">
                        <label>分类：</label>
                        <input 
                            id="snippet-category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="输入分类（可选）"
                            onKeyDown={(e) => handleInputKeyDown(e, 'snippet-description')}
                        />
                    </div>
                    <div className="jp-snippets-edit-field">
                        <label>描述：</label>
                        <textarea 
                            id="snippet-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="输入描述（可选）"
                            rows={2}
                            onKeyDown={(e) => handleInputKeyDown(e, 'snippet-code')}
                        />
                    </div>
                    <div className="jp-snippets-edit-field">
                        <label>代码：</label>
                        <textarea 
                            id="snippet-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="jp-snippets-code-editor"
                            rows={10}
                            placeholder="输入代码"
                            spellCheck={false}
                            wrap="off"
                        />
                    </div>
                </div>
                <div className="jp-snippets-modal-footer">
                    <button onClick={handleSave}>{snippet.id ? '更新' : '保存'}</button>
                    <button onClick={onCancel}>取消</button>
                </div>
            </div>
        </div>
    );
};

export class EditSnippetPanel extends ReactWidget {
    private _isDisposed = false;  // 改用不同的名字
    private _props: EditSnippetPanelProps;

    constructor(options: EditSnippetPanelProps) {
        super();
        this.addClass('jp-snippets-modal-widget');
        this._props = options;
        this.id = `snippet-editor-${options.snippet.id || 'new'}-${Date.now()}`;
        
        this.title.label = options.snippet.id ? '编辑代码片段' : '新建代码片段';
        this.title.closable = true;
    }

    dispose(): void {
        if (this._isDisposed) {  // 使用新的变量名
            return;
        }
        this._isDisposed = true;  // 使用新的变量名
        
        super.dispose();
        this._props.onCancel();
    }

    render(): JSX.Element {
        return (
            <div className="jp-snippets-editor-container">
                <EditSnippetPanelComponent {...this._props} />
            </div>
        );
    }
} 