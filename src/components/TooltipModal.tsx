import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';

interface TooltipModalProps {
    content: string;
    position: { top: number; left: number };
}

const TooltipModalComponent: React.FC<TooltipModalProps> = ({ content, position }) => {
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
            <pre className="jp-snippets-tooltip-content">
                {content}
            </pre>
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