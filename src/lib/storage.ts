import { NovelRequest, StorySegment } from "./types";

export interface Novel {
    id: string;
    title: string;
    context: NovelRequest;
    segments: StorySegment[];
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = "ai_novels";

export function getNovels(): Novel[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to load novels", e);
        return [];
    }
}

export function getNovel(id: string): Novel | undefined {
    const novels = getNovels();
    return novels.find((n) => n.id === id);
}

export function saveNovel(novel: Novel): void {
    if (typeof window === "undefined") return;
    try {
        const novels = getNovels();
        const index = novels.findIndex((n) => n.id === novel.id);

        if (index >= 0) {
            novels[index] = { ...novel, updatedAt: Date.now() };
        } else {
            novels.push({ ...novel, createdAt: Date.now(), updatedAt: Date.now() });
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(novels));
    } catch (e) {
        console.error("Failed to save novel", e);
    }
}

export function deleteNovel(id: string): void {
    if (typeof window === "undefined") return;
    try {
        const novels = getNovels().filter((n) => n.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(novels));
    } catch (e) {
        console.error("Failed to delete novel", e);
    }
}
