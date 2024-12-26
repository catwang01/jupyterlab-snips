export interface Snippet {
    id: string;
    name: string;
    code: string;
    category?: string;
    description?: string;
    createdAt: number;
    updatedAt: number;
}

export interface SnippetCategory {
    id: string;
    name: string;
    count: number;
}

export interface SaveSnippetOptions {
    name: string;
    code: string;
    category?: string;
    description?: string;
} 