import { CodeMirrorEditor } from '@jupyterlab/codemirror';
import { 
    ICompletionContext, 
    ICompletionProvider, 
    CompletionHandler,
    CompletionTriggerKind
} from '@jupyterlab/completer';
import { SnippetService } from './snippetService';

interface IRequest {
    text: string;
    offset: number;
}

type CompletionItem = {
    label: string;
    insertText: string;
    type: string;
}

export class SnippetCompleterProvider implements ICompletionProvider<CompletionItem> {
    readonly identifier = 'SnippetCompleter';
    readonly renderer = null;
    private snippetService: SnippetService;

    constructor() {
        this.snippetService = new SnippetService();
    }

    async fetch(
        request: IRequest,
        context: ICompletionContext,
        trigger?: CompletionTriggerKind
    ): Promise<CompletionHandler.ICompletionItemsReply<CompletionItem>> {
        const editor = context.editor as CodeMirrorEditor;
        const cursor = editor.getCursorPosition();
        const line = editor.getLine(cursor.line);

        // 检查行是否存在
        if (line === undefined) {
            return { items: [], start: 0, end: 0 };
        }

        const prefix = line.slice(0, cursor.column);

        // 获取所有代码片段
        const snippets = await this.snippetService.getSnippets();
        
        // 根据前缀过滤代码片段
        const matches = snippets.filter(snippet => 
            snippet.name.toLowerCase().startsWith(prefix.toLowerCase())
        );

        if (matches.length === 0) {
            return { items: [], start: 0, end: 0 };
        }

        const items = matches.map(snippet => ({
            label: snippet.name,
            insertText: snippet.code,
            type: snippet.isMultiCell ? 'multi-cell-snippet' : 'snippet'
        }));

        return {
            items,
            start: cursor.column - prefix.length,
            end: cursor.column
        };
    }

    async isApplicable(context: ICompletionContext): Promise<boolean> {
        return true;
    }
} 