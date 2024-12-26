import { Snippet } from '../models/types';

export class StorageService {
    private readonly STORAGE_KEY = 'jupyterlab-snippets';

    constructor() {
        // 初始化存储
        if (!this.getAllSnippets()) {
            this.saveToStorage([]);
        }
    }

    async getAllSnippets(): Promise<Snippet[]> {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    async getSnippet(id: string): Promise<Snippet | null> {
        const snippets = await this.getAllSnippets();
        return snippets.find(snippet => snippet.id === id) || null;
    }

    async saveSnippet(snippet: Snippet): Promise<void> {
        const snippets = await this.getAllSnippets();
        const index = snippets.findIndex(s => s.id === snippet.id);
        
        if (index >= 0) {
            snippets[index] = snippet;
        } else {
            snippets.push(snippet);
        }

        this.saveToStorage(snippets);
    }

    async deleteSnippet(id: string): Promise<void> {
        const snippets = await this.getAllSnippets();
        const filteredSnippets = snippets.filter(s => s.id !== id);
        this.saveToStorage(filteredSnippets);
    }

    private saveToStorage(snippets: Snippet[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(snippets));
    }
} 