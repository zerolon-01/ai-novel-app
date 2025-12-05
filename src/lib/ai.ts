import OpenAI from "openai";

export interface StoryContext {
    title?: string;
    genre: string;
    characters: string[];
    plot: string;
    previousContent?: string;
}

/**
 * Generate a story using OpenAI's streaming chat completion API.
 * @param prompt The user prompt describing the next part of the story.
 * @param context Additional context such as genre, characters, and plot.
 * @returns A ReadableStream of Uint8Array containing the generated text.
 */
export async function generateStory(
    prompt: string,
    context: StoryContext
): Promise<ReadableStream<Uint8Array>> {
    // Initialize OpenAI client with Groq API key and base URL.
    const openai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY!,
        baseURL: "https://api.groq.com/openai/v1",
    });

    // Construct a system prompt that provides the story context.
    const systemPrompt = `You are an AI novelist. Write the next part of a story in a vivid, engaging style.
CRITICAL INSTRUCTION: The output must be 100% in Korean. Do not use any English, Chinese, or other foreign characters. Even if the context contains other languages, translate and write the story in Korean.
Title: ${context.title || "Untitled"}
Genre: ${context.genre}
Characters: ${context.characters.join(", ")}
Plot: ${context.plot}
${context.previousContent ? `Previous content: ${context.previousContent}` : ""}`;

    // Create a streaming chat completion request.
    const response = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Using Llama 3.3 70B on Groq for high quality and speed
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `${prompt}\n\n(Write ONLY in Korean)` },
        ],
        stream: true,
    });

    const encoder = new TextEncoder();

    // Convert the async iterator from OpenAI into a ReadableStream.
    const stream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of response) {
                    const content = chunk.choices[0].delta?.content;
                    if (content) {
                        // Filter out English (A-Za-z) and Chinese (\u4e00-\u9fff) characters
                        const filteredContent = content.replace(/[a-zA-Z\u4e00-\u9fff]+/g, "");
                        if (filteredContent) {
                            controller.enqueue(encoder.encode(filteredContent));
                        }
                    }
                }
                controller.close();
            } catch (err) {
                controller.error(err);
            }
        },
    });

    return stream;
}
