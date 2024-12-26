import React, { useState } from 'react';
import { Dialog, ReactWidget } from '@jupyterlab/apputils';

interface SaveSnippetDialogProps {
    code: string;
    onSave: (name: string, category: string, description: string) => void;
}

const SaveSnippetDialog: React.FC<SaveSnippetDialogProps> = ({ code, onSave }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    return (
        <div className="jp-snippets-dialog">
            <div className="jp-snippets-dialog-field">
                <label>名称：</label>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="输入代码片段名称"
                />
            </div>
            <div className="jp-snippets-dialog-field">
                <label>分类：</label>
                <input 
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="输入分类（可选）"
                />
            </div>
            <div className="jp-snippets-dialog-field">
                <label>描述：</label>
                <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
    constructor(props: SaveSnippetDialogProps) {
        super();
        this._props = props;
    }

    render(): JSX.Element {
        return <SaveSnippetDialog {...this._props} />;
    }

    private _props: SaveSnippetDialogProps;
}

export async function showSaveSnippetDialog(code: string): Promise<{
    name: string;
    category: string;
    description: string;
} | null> {
    const dialog = new Dialog({
        title: '保存代码片段',
        body: new DialogWidget({ 
            code, 
            onSave: () => {} 
        }),
        buttons: [
            Dialog.cancelButton(),
            Dialog.okButton({ label: '保存' })
        ]
    });

    const result = await dialog.launch();
    if (!result.button.accept) {
        return null;
    }

    const body = dialog.node.querySelector('.jp-snippets-dialog');
    if (!body) {
        return null;
    }

    const nameInput = body.querySelector('input[placeholder="输入代码片段名称"]') as HTMLInputElement;
    const categoryInput = body.querySelector('input[placeholder="输入分类（可选）"]') as HTMLInputElement;
    const descriptionInput = body.querySelector('textarea') as HTMLTextAreaElement;

    if (!nameInput || !categoryInput || !descriptionInput) {
        console.error('无法获取对话框输入值');
        return null;
    }

    return {
        name: nameInput.value,
        category: categoryInput.value,
        description: descriptionInput.value
    };
} 