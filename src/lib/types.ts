export interface NovelRequest {
    title: string;
    genre: string;
    characters: string[];
    plot: string;
    tone?: string;
}

export interface StorySegment {
    id: string;
    content: string;
    type: "user" | "ai";
    timestamp: number;
}

export interface NovelHistoryItem {
    id: string;
    title: string;
    preview: string;
    date: string;
}

export interface Novel {
    id: string;
    title: string;
    context: NovelRequest;
    segments: StorySegment[];
    createdAt: number;
    updatedAt: number;
}

export interface Profile {
    id: string;
    email: string;
    full_name?: string;
    credits: number;
    subscription_tier: 'FREE' | 'BASIC' | 'PRO';
    subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
    stripe_customer_id?: string;
}
