import { ReactWidget } from '@jupyterlab/apputils';
import { CodeEditor } from '@jupyterlab/codeeditor';
import { CodeMirrorEditor } from '@jupyterlab/codemirror';
import { python } from '@codemirror/lang-python';
import React, { useEffect, useRef } from 'react';

interface TooltipModalProps {
    content: string;
    position: { top: number; left: number };
}

const TooltipModalComponent: React.FC<TooltipModalProps> = ({ content, position }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const editorWidgetRef = useRef<CodeEditor.IEditor | null>(null);

    useEffect(() => {
        if (editorRef.current && !editorWidgetRef.current) {
            const model = new CodeEditor.Model();
            model.sharedModel.setSource(content);
            model.mimeType = 'text/x-python';

            const editor = new CodeMirrorEditor({
                host: editorRef.current,
                model,
                config: {
                    readOnly: true,
                    lineNumbers: false,
                    lineWrap: 'on',
                    matchBrackets: true,
                    autoClosingBrackets: false,
                    codeFolding: false,
                    lineWiseCopyCut: false,
                    theme: 'jupyter',
                    styleActiveLine: false,
                    highlightActiveLineGutter: false,
                    extensions: [python()]
                }
            });

            editorWidgetRef.current = editor;

            return () => {
                editor.dispose();
            };
        }
    }, [content]);

    return (
        <div 
            className="jp-snippets-tooltip"
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: 10000
            }}
        >
            <div className="jp-snippets-tooltip-content">
                <div ref={editorRef} className="jp-snippets-editor" />
            </div>
        </div>
    );
};

export class TooltipModal extends ReactWidget {
    private _props: TooltipModalProps;

    constructor(props: TooltipModalProps) {
        super();
        this._props = props;
        this.addClass('jp-snippets-tooltip-modal');
    }

    render(): JSX.Element {
        return <TooltipModalComponent {...this._props} />;
    }
} 