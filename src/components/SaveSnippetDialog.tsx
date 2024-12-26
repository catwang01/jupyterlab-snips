import React from 'react';
import { Dialog } from '@jupyterlab/apputils';
import { getTranslation } from '../i18n';
import { MultiSelect } from './MultiSelect';

interface SaveSnippetDialogProps {
    name?: string;
    description?: string;
    tags?: string[];
    onNameChange: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onTagsChange?: (value: string[]) => void;
    availableTags?: string[];
}

export class SaveSnippetDialog extends Dialog<void> {
    constructor(props: SaveSnippetDialogProps) {
        const t = getTranslation();
        super({
            title: t.saveDialog.title,
            body: (
                <div className="jp-snippets-save-dialog">
                    <div className="jp-snippets-save-field">
                        <label>{t.saveDialog.nameLabel}</label>
                        <input
                            type="text"
                            value={props.name || ''}
                            onChange={(e) => props.onNameChange(e.target.value)}
                            placeholder={t.saveDialog.namePlaceholder}
                            autoFocus
                        />
                    </div>
                    {props.onDescriptionChange && (
                        <div className="jp-snippets-save-field">
                            <label>{t.saveDialog.descriptionLabel}</label>
                            <input
                                type="text"
                                value={props.description || ''}
                                onChange={(e) => props.onDescriptionChange?.(e.target.value)}
                                placeholder={t.saveDialog.descriptionPlaceholder}
                            />
                        </div>
                    )}
                    {props.onTagsChange && (
                        <div className="jp-snippets-save-field">
                            <label>{t.saveDialog.tagsLabel}</label>
                            <MultiSelect
                                value={props.tags || []}
                                options={props.availableTags || []}
                                onChange={props.onTagsChange}
                                placeholder={t.saveDialog.tagsPlaceholder}
                            />
                        </div>
                    )}
                </div>
            ),
            buttons: [
                Dialog.cancelButton({ label: t.saveDialog.cancel }),
                Dialog.okButton({ label: t.saveDialog.save })
            ]
        });
    }
} 