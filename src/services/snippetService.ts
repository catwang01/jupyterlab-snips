import { Snippet } from '../models/types';

export class SnippetService {
    private readonly STORAGE_KEY = 'jupyterlab-snips';

    async saveSnippet(snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
        try {
            const snippets = await this.getSnippets();
            const newSnippet: Snippet = {
                id: crypto.randomUUID(),
                ...snippet,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            snippets.push(newSnippet);
            this.saveToStorage(snippets);
            return newSnippet;
        } catch (error) {
            console.error('保存代码片段失败:', error);
            throw error;
        }
    }

    async getSnippets(): Promise<Snippet[]> {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('获取代码片段失败:', error);
            return [];
        }
    }

    private saveToStorage(snippets: Snippet[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(snippets));
        } catch (error) {
            console.error('保存到存储失败:', error);
            throw error;
        }
    }

    initialize(): void {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            this.saveToStorage([]);
        }
    }
} 