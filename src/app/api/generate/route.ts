import { NextRequest } from "next/server";
import { generateStory } from "@/lib/ai";
import { NovelRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const { prompt, context } = await req.json();

        // In a real app, validate the request body
        const stream = await generateStory(prompt, context as NovelRequest);

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });
    } catch (error) {
        console.error("API Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
