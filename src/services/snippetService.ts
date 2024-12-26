import { ServerConnection } from '@jupyterlab/services';
import { Snippet } from '../models/types';

export class SnippetService {
    private readonly baseUrl: string;
    private readonly serverSettings: ServerConnection.ISettings;

    constructor() {
        this.serverSettings = ServerConnection.makeSettings();
        this.baseUrl = `${this.serverSettings.baseUrl}jupyterlab-snips/snippets`;
    }

    async saveSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
        const newSnippet: Snippet = {
            id: crypto.randomUUID(),
            ...snippet,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const response = await ServerConnection.makeRequest(
            this.baseUrl,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newSnippet)
            },
            this.serverSettings
        );

        if (!response.ok) {
            throw new Error('保存代码片段失败');
        }

        return newSnippet;
    }

    async getSnippets(): Promise<Snippet[]> {
        const response = await ServerConnection.makeRequest(
            this.baseUrl,
            {},
            this.serverSettings
        );

        if (!response.ok) {
            throw new Error('获取代码片段失败');
        }

        return response.json();
    }

    initialize(): void {
        // 初始化检查
        this.getSnippets().catch(console.error);
    }
} 