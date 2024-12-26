import React, { useState } from 'react';
import { Dialog, ReactWidget } from '@jupyterlab/apputils';

interface SaveSnippetDialogProps {
    code: string;
    name?: string;
    category?: string;
    description?: string;
    onNameChange?: (value: string) => void;
    onCategoryChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
}

const SaveSnippetDialog: React.FC<SaveSnippetDialogProps> = ({ 
    code,
    name = '',
    category = '',
    description = '',
    onNameChange,
    onCategoryChange,
    onDescriptionChange
}) => {
    const [localName, setLocalName] = useState(name);
    const [localCategory, setLocalCategory] = useState(category);
    const [localDescription, setLocalDescription] = useState(description);

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

    return (
        <div className="jp-snippets-dialog">
            <div className="jp-snippets-dialog-field">
                <label>名称：</label>
                <input 
                    type="text"
                    value={localName}
                    onChange={handleNameChange}
                    placeholder="输入代码片段名称"
                />
            </div>
            <div className="jp-snippets-dialog-field">
                <label>分类：</label>
                <input 
                    type="text"
                    value={localCategory}
                    onChange={handleCategoryChange}
                    placeholder="输入分类（可选）"
                />
            </div>
            <div className="jp-snippets-dialog-field">
                <label>描述：</label>
                <textarea 
                    value={localDescription}
                    onChange={handleDescriptionChange}
                    placeholder="输入描述（可选）"
                />
            </div>
            <div className="jp-snippets-dialog-preview">
                <label>代码预览：</label>
                <pre>{code}</pre>
            </div>
        </div>
    );
};

class DialogWidget extends ReactWidget {
    private _props: SaveSnippetDialogProps;
    private _name: string = '';
    private _category: string = '';
    private _description: string = '';

    constructor(props: SaveSnippetDialogProps) {
        super();
        this._props = props;
    }

    getValue(): { name: string; category: string; description: string } {
        return {
            name: this._name,
            category: this._category,
            description: this._description
        };
    }

    render(): JSX.Element {
        return (
            <SaveSnippetDialog 
                {...this._props}
                name={this._name}
                category={this._category}
                description={this._description}
                onNameChange={(value) => this._name = value}
                onCategoryChange={(value) => this._category = value}
                onDescriptionChange={(value) => this._description = value}
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
    }
): Promise<{
    name: string;
    category: string;
    description: string;
} | null> {
    const dialogWidget = new DialogWidget({ 
        code,
        name: initialValues?.name || '',
        category: initialValues?.category || '',
        description: initialValues?.description || ''
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