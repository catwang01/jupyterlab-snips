import { ServerConnection } from '@jupyterlab/services';
import { Snippet } from '../models/types';

export class SnippetService {
    private readonly baseUrl: string;
    private readonly serverSettings: ServerConnection.ISettings;

    constructor() {
        this.serverSettings = ServerConnection.makeSettings();
        this.baseUrl = `${this.serverSettings.baseUrl}jupyterlab-snips`;
    }

    async saveSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
        const newSnippet: Snippet = {
            id: crypto.randomUUID(),
            ...snippet,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const response = await ServerConnection.makeRequest(
            `${this.baseUrl}/snippets/${newSnippet.id}`,
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
            `${this.baseUrl}/snippets`,
            {},
            this.serverSettings
        );

        if (!response.ok) {
            throw new Error('获取代码片段失败');
        }

        return response.json();
    }

    async updateSnippet(id: string, snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
        const response = await ServerConnection.makeRequest(
            `${this.baseUrl}/snippets/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...snippet,
                    updatedAt: Date.now()
                })
            },
            this.serverSettings
        );

        if (!response.ok) {
            throw new Error('更新代码片段失败');
        }

        return response.json();
    }

    async deleteSnippet(id: string): Promise<void> {
        const response = await ServerConnection.makeRequest(
            `${this.baseUrl}/snippets/${id}`,
            {
                method: 'DELETE'
            },
            this.serverSettings
        );

        if (!response.ok) {
            throw new Error('删除代码片段失败');
        }
    }

    initialize(): void {
        // 初始化检查
        this.getSnippets().catch(console.error);
    }

    async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
        const snippets = await this.getSnippets();
        return snippets.some(s => s.name === name && s.id !== excludeId);
    }

    async getTags(): Promise<string[]> {
        const response = await ServerConnection.makeRequest(
            `${this.baseUrl}/tags`,
            {
                method: 'GET'
            },
            this.serverSettings
        );

        if (!response.ok) {
            throw new Error('获取标签失败');
        }

        return response.json();
    }

    async saveTags(tags: string[]): Promise<void> {
        const response = await ServerConnection.makeRequest(
            `${this.baseUrl}/tags`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tags)
            },
            this.serverSettings
        );

        if (!response.ok) {
            throw new Error('保存标签失败');
        }
    }
} 