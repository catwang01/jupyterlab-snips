import React, { useState, useRef, useEffect } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { Snippet } from '../models/types';
import { SnippetService } from '../services/snippetService';

interface EditSnippetPanelProps {
    snippet: Snippet;
    onSave: (updatedSnippet: Snippet) => void;
    onCancel: () => void;
}

// 自定义多选输入组件
interface MultiSelectProps {
    value: string[];
    options: string[];
    onChange: (values: string[]) => void;
    onCreate?: (value: string) => void;
    placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    value,
    options,
    onChange,
    onCreate,
    placeholder
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            addValue(inputValue.trim());
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    // 添加新值的通用函数
    const addValue = (newValue: string) => {
        if (!options.includes(newValue)) {
            onCreate?.(newValue);
        }
        if (!value.includes(newValue)) {
            onChange([...value, newValue]);
        }
        setInputValue('');
    };

    const removeTag = (tag: string) => {
        onChange(value.filter(v => v !== tag));
    };

    // 处理选项点击
    const handleOptionClick = (opt: string) => {
        addValue(opt);
        // 点击后保持焦点在输入框
        inputRef.current?.focus();
    };

    // 处理输入框失去焦点
    const handleBlur = (e: React.FocusEvent) => {
        // 使用 setTimeout 确保点击选项时不会立即关闭选项列表
        setTimeout(() => {
            setIsEditing(false);
        }, 200);
    };

    return (
        <div className="jp-snippets-multi-select">
            <div className="jp-snippets-tags">
                {value.map(tag => (
                    <span key={tag} className="jp-snippets-tag">
                        {tag}
                        <span 
                            className="jp-snippets-tag-remove"
                            onClick={() => removeTag(tag)}
                        >
                            ×
                        </span>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsEditing(true)}
                    onBlur={handleBlur}
                    placeholder={value.length === 0 ? placeholder : ''}
                />
            </div>
            {isEditing && (
                <div className="jp-snippets-options">
                    {options
                        .filter(opt => 
                            !value.includes(opt) && 
                            opt.toLowerCase().includes(inputValue.toLowerCase())
                        )
                        .map(opt => (
                            <div
                                key={opt}
                                className="jp-snippets-option"
                                onClick={() => handleOptionClick(opt)}
                                onMouseDown={(e) => e.preventDefault()} // 防止失去焦点
                            >
                                {opt}
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
};

const EditSnippetPanelComponent: React.FC<EditSnippetPanelProps> = ({
    snippet,
    onSave,
    onCancel
}) => {
    const [name, setName] = useState(snippet.name);
    const [nameError, setNameError] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>(snippet.tags || []);
    const [description, setDescription] = useState(snippet.description || '');
    const [code, setCode] = useState(snippet.code);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const snippetService = useRef(new SnippetService());

    // 只在组件加载时获取一次可用标签
    useEffect(() => {
        const loadTags = async () => {
            try {
                const tags = await snippetService.current.getTags();
                setAvailableTags(tags);
            } catch (error) {
                console.error('加载标签失败:', error);
            }
        };
        loadTags();
    }, []);

    // 简化标签变化处理
    const handleTagsChange = (newTags: string[]) => {
        setTags(newTags);
    };

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
            return;
        }

        try {
            // 保存代码片段时一并更新标签
            const allTags = Array.from(new Set([...availableTags, ...tags]));
            await snippetService.current.saveTags(allTags);

            onSave({
                ...snippet,
                name,
                tags,
                description,
                code,
                updatedAt: Date.now()
            });
        } catch (error) {
            console.error('保存失败:', error);
        }
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
                        <label>标签：</label>
                        <MultiSelect
                            value={tags}
                            options={availableTags}
                            onChange={handleTagsChange}
                            onCreate={(value: string) => {
                                setTags([...tags, value]);
                                setAvailableTags([...availableTags, value]);
                            }}
                            placeholder="选择或输入标签"
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