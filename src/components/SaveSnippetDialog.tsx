import React, { useState, useEffect } from 'react';
import { Dialog, ReactWidget } from '@jupyterlab/apputils';

interface SaveSnippetDialogProps {
    code: string;
    name?: string;
    category?: string;
    description?: string;
    editable?: boolean;
    onCodeChange?: (value: string) => void;
    onNameChange?: (value: string) => void;
    onCategoryChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

const SaveSnippetDialog: React.FC<SaveSnippetDialogProps> = ({ 
    code,
    name = '',
    category = '',
    description = '',
    editable = true,
    onCodeChange,
    onNameChange,
    onCategoryChange,
    onDescriptionChange
}) => {
    const [localCode, setLocalCode] = useState(code);
    const [localName, setLocalName] = useState(name);
    const [localCategory, setLocalCategory] = useState(category);
    const [localDescription, setLocalDescription] = useState(description);

    useEffect(() => {
        setLocalCode(code);
    }, [code]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalCode(e.target.value);
        onCodeChange?.(e.target.value);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalName(e.target.value);
        onNameChange?.(e.target.value);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalCategory(e.target.value);
        onCategoryChange?.(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalDescription(e.target.value);
        onDescriptionChange?.(e.target.value);
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
        nextElementId?: string
    ) => {
        if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.tagName.toLowerCase() === 'input') {
            e.preventDefault();
            e.stopPropagation();
            
            if (nextElementId) {
                const nextElement = document.getElementById(nextElementId);
                if (nextElement) {
                    nextElement.focus();
                }
            } else {
                const okButton = document.querySelector('.jp-mod-accept') as HTMLButtonElement;
                if (okButton) {
                    okButton.click();
                }
            }
        }
    };

    const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Shift + Enter: 退出编辑，点击保存按钮
                e.preventDefault();
                e.stopPropagation();  // 阻止事件冒泡
                // 使用 setTimeout 确保事件不被 Dialog 拦截
                setTimeout(() => {
                    const okButton = document.querySelector('.jp-Dialog-button.jp-mod-accept') as HTMLButtonElement;
                    if (okButton) {
                        okButton.click();
                    }
                }, 0);
            }
            // 普通的 Enter 键：不做任何处理，让它自然换行
        }
    };

    return (
        <div className="jp-snippets-dialog">
            <div className="jp-snippets-dialog-field">
                <label>名称：</label>
                <input 
                    id="snippet-name"
                    type="text"
                    value={localName}
                    onChange={handleNameChange}
                    placeholder="输入代码片段名称"
                    onKeyDown={(e) => handleKeyDown(e, 'snippet-category')}
                    autoFocus
                />
            </div>
            <div className="jp-snippets-dialog-field">
                <label>分类：</label>
                <input 
                    id="snippet-category"
                    type="text"
                    value={localCategory}
                    onChange={handleCategoryChange}
                    placeholder="输入分类（可选）"
                    onKeyDown={(e) => handleKeyDown(e, 'snippet-description')}
                />
            </div>
            <div className="jp-snippets-dialog-field">
                <label>描述：</label>
                <textarea 
                    id="snippet-description"
                    value={localDescription}
                    onChange={handleDescriptionChange}
                    placeholder="输入描述（可选）"
                    onKeyDown={(e) => handleKeyDown(e, 'snippet-code')}
                    rows={2}
                />
            </div>
            <div className="jp-snippets-dialog-field">
                <label>代码：</label>
                <textarea 
                    id="snippet-code"
                    value={localCode}
                    onChange={handleCodeChange}
                    className="jp-snippets-code-editor"
                    rows={10}
                    placeholder="输入代码"
                    spellCheck={false}
                    wrap="off"
                    onKeyDown={handleCodeKeyDown}
                    onKeyPress={(e) => {
                        // 阻止 Enter 键的默认提交行为
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.stopPropagation();
                        }
                    }}
                />
            </div>
        </div>
    );
};

class DialogWidget extends ReactWidget {
    private _props: SaveSnippetDialogProps;
    private _name: string;
    private _category: string;
    private _description: string;
    private _code: string;

    constructor(props: SaveSnippetDialogProps) {
        super();
        this._props = props;
        this._name = props.name || '';
        this._category = props.category || '';
        this._description = props.description || '';
        this._code = props.code || '';
    }

    getValue(): { name: string; category: string; description: string; code: string } {
        return {
            name: this._name,
            category: this._category,
            description: this._description,
            code: this._code
        };
    }

    render(): JSX.Element {
        return (
            <SaveSnippetDialog 
                {...this._props}
                name={this._name}
                category={this._category}
                description={this._description}
                code={this._code}
                onNameChange={(value) => { this._name = value; this.update(); }}
                onCategoryChange={(value) => { this._category = value; this.update(); }}
                onDescriptionChange={(value) => { this._description = value; this.update(); }}
                onCodeChange={(value) => { this._code = value; this.update(); }}
            />
        );
    }
}

export async function showSaveSnippetDialog(
    code: string,
    initialValues?: {
        name?: string;
        category?: string;
        description?: string;
        editable?: boolean;
    }
): Promise<{
    name: string;
    category: string;
    description: string;
    code: string;
} | null> {
    const dialogWidget = new DialogWidget({ 
        code,
        name: initialValues?.name || '',
        category: initialValues?.category || '',
        description: initialValues?.description || '',
        editable: initialValues?.editable ?? true
    });
    
    const dialog = new Dialog({
        title: initialValues ? '编辑代码片段' : '保存代码片段',
        body: dialogWidget,
        buttons: [
            Dialog.cancelButton(),
            Dialog.okButton({ label: initialValues ? '更新' : '保存' })
        ]
    });

    const result = await dialog.launch();

    if (!result.button.accept) {
        return null;
    }

    return dialogWidget.getValue();
} 