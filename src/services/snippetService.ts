import { ServerConnection } from '@jupyterlab/services';
import { Snippet } from '../models/types';

export interface ISnippetExport {
  snippets: Snippet[];
  tags: string[];
  version: string;
}

export class SnippetService {
    private readonly baseUrl: string;
    private readonly serverSettings: ServerConnection.ISettings;

    constructor() {
        this.serverSettings = ServerConnection.makeSettings();
        this.baseUrl = `${this.serverSettings.baseUrl}jupyterlab-snips`;
    }

    async saveSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
        try {
            const response = await ServerConnection.makeRequest(
                `${this.baseUrl}/snippets`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...snippet,
                        isMultiCell: snippet.isMultiCell || false
                    })
                },
                this.serverSettings
            );

            if (!response.ok) {
                throw new Error('保存代码片段失败');
            }
        } catch (error) {
            console.error('Failed to save snippet:', error);
            throw error;
        }
    }

    async importSnippets(data: ISnippetExport): Promise<void> {
        try {
            if (!data.version || !data.snippets) {
                throw new Error('Invalid import data format');
            }

            // 清除现有数据
            await this.clearAll();

            // 导入新数据
            for (const snippet of data.snippets) {
                const { id, createdAt, updatedAt, ...rest } = snippet;  // 移除不需要的字段
                await this.saveSnippet({
                    ...rest,
                    isMultiCell: snippet.isMultiCell || false
                });
            }

            // 更新标签
            const allSnippets = await this.getSnippets();
            const allTags = Array.from(new Set(
                allSnippets.flatMap(s => s.tags || [])
            ));
            await this.saveTags(allTags);
        } catch (error) {
            console.error('Failed to import snippets:', error);
            throw error;
        }
    }

    async exportSnippets(): Promise<ISnippetExport> {
        try {
            const snippets = await this.getSnippets();
            const tags = await this.getTags();
            return {
                snippets,
                tags,
                version: '1.0.0'
            };
        } catch (error) {
            console.error('Failed to export snippets:', error);
            throw error;
        }
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

    private async clearAll(): Promise<void> {
        const snippets = await this.getSnippets();
        for (const snippet of snippets) {
            await this.deleteSnippet(snippet.id);
        }
    }
} 