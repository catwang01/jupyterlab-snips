export interface Snippet {
    id: string;
    name: string;
    code: string;
    description?: string;
    tags?: string[];
    createdAt: number;
    updatedAt: number;
    isMultiCell?: boolean;
}

export interface SnippetCategory {
    id: string;
    name: string;
    count: number;
}

export interface SaveSnippetOptions {
    name: string;
    code: string;
    tags?: string[];
    description?: string;
} 