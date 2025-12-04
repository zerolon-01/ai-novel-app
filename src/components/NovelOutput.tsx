import { useRef, useEffect } from "react";
import { StorySegment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface NovelOutputProps {
    segments: StorySegment[];
    isGenerating: boolean;
}

export function NovelOutput({ segments, isGenerating }: NovelOutputProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [segments]);

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6 scroll-smooth"
        >
            {segments.map((segment) => (
                <div
                    key={segment.id}
                    className={cn(
                        "animate-fade-in-up",
                        segment.type === "user"
                            ? "opacity-70 text-sm border-l-2 border-primary/50 pl-4 py-2 italic"
                            : "text-lg md:text-xl leading-relaxed font-serif text-gray-100"
                    )}
                >
                    {segment.type === "user" && (
                        <div className="text-xs text-primary mb-1 font-sans not-italic font-bold uppercase tracking-wider">
                            Instruction
                        </div>
                    )}
                    {segment.content}
                </div>
            ))}

            {isGenerating && (
                <div className="flex items-center gap-2 text-muted-foreground animate-pulse pl-1">
                    <Sparkles className="w-4 h-4" />
                    <span>AI is writing...</span>
                </div>
            )}

            <div className="h-24" /> {/* Spacer for bottom input */}
        </div>
    );
}
