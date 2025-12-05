"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NovelOutput } from "@/components/NovelOutput";
import { NovelSidebar } from "@/components/NovelSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, FastForward } from "lucide-react";
import { StorySegment, NovelRequest } from "@/lib/types";
import { getNovel, saveNovel } from "@/lib/storage";
import { useAuth } from "@/components/AuthProvider";

function GenerateContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const novelId = searchParams.get("id");

    const [segments, setSegments] = useState<StorySegment[]>([]);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [context, setContext] = useState<NovelRequest | null>(null);

    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (novelId) {
            const novel = getNovel(novelId);
            if (novel) {
                setContext(novel.context);
                setSegments(novel.segments);

                // If it's a new novel with no segments, start generation
                if (novel.segments.length === 0 && !hasStartedRef.current) {
                    hasStartedRef.current = true;
                    handleGenerate("이야기를 시작해줘.", novel.context);
                }
            } else {
                // Novel not found, redirect to home
                router.push("/");
            }
        }
    }, [novelId]);

    // Save segments whenever they change
    useEffect(() => {
        if (novelId && context && segments.length > 0) {
            const novel = getNovel(novelId);
            if (novel) {
                saveNovel({ ...novel, segments });
                window.dispatchEvent(new Event("novel-updated"));
            }
        }
    }, [segments, novelId, context]);

    const { user, profile } = useAuth();

    const handleGenerate = async (promptText: string, currentContext: NovelRequest | null = context) => {
        if (!promptText.trim() || isGenerating || !currentContext) return;

        // Check credits/subscription
        if (!profile) {
            // Allow guest usage or redirect to login? For now, let's assume login required for generation beyond initial demo
            // But the requirements said "User Login -> Auth Required".
            // If no user, maybe redirect to login or show modal.
            if (!user) {
                alert("로그인이 필요합니다.");
                router.push("/"); // Or open login modal
                return;
            }
        }

        if (profile) {
            if (profile.subscription_tier === 'FREE' && profile.credits <= 0) {
                alert("일일 무료 크레딧을 모두 소진했습니다. BASIC 요금제로 업그레이드하여 무제한 생성을 즐기세요!");
                router.push("/");
                return;
            }
        }

        const userSegment: StorySegment = {
            id: Date.now().toString(),
            content: promptText,
            type: "user",
            timestamp: Date.now()
        };

        // Don't add "Start the story" as a visible user segment if it's the auto-start
        if (promptText !== "이야기를 시작해줘.") {
            setSegments(prev => [...prev, userSegment]);
        }

        setInput("");
        setIsGenerating(true);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: promptText, context: currentContext }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = "";

            const aiSegmentId = (Date.now() + 1).toString();
            setSegments(prev => [...prev, { id: aiSegmentId, content: "", type: "ai", timestamp: Date.now() }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                aiContent += chunk;

                setSegments(prev => prev.map(seg =>
                    seg.id === aiSegmentId ? { ...seg, content: aiContent } : seg
                ));
            }

            // Decrement credits after successful generation
            try {
                const creditResponse = await fetch("/api/decrement-credits", {
                    method: "POST",
                });

                if (creditResponse.ok) {
                    const { credits } = await creditResponse.json();
                    console.log(`Credits remaining: ${credits}`);
                } else if (creditResponse.status === 403) {
                    // This shouldn't happen as we check before generation, but just in case
                    console.warn("Credits exhausted during generation");
                }
            } catch (creditError) {
                console.error("Failed to decrement credits:", creditError);
                // Don't block the user, just log the error
            }

        } catch (error: any) {
            console.error("Generation failed", error);
            alert(`스토리 생성에 실패했습니다: ${error.message || "알 수 없는 오류가 발생했습니다."}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNextChapter = () => {
        handleGenerate("다음 화를 계속 써줘. 흥미진진하게 전개해줘.");
    };

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar (Desktop) */}
            <div className="hidden md:block h-full">
                <NovelSidebar currentNovelId={novelId || undefined} />
            </div>

            <div className="flex-1 flex flex-col h-full relative">
                <NovelOutput segments={segments} isGenerating={isGenerating} />

                <div className="p-4 bg-black/80 backdrop-blur-md border-t border-white/10">
                    <div className="max-w-4xl mx-auto relative flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleGenerate(input)}
                                placeholder="다음 내용을 서술해주세요..."
                                className="h-14 pl-4 pr-12 bg-white/10 border-white/10 text-lg focus:bg-white/15 rounded-xl"
                                disabled={isGenerating}
                            />
                            <Button
                                size="icon"
                                className="absolute right-2 top-2 h-10 w-10 bg-primary hover:bg-primary/90"
                                onClick={() => handleGenerate(input)}
                                disabled={isGenerating || !input.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>

                        <Button
                            className="h-14 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg shadow-purple-900/20"
                            onClick={handleNextChapter}
                            disabled={isGenerating}
                        >
                            <FastForward className="w-5 h-5 mr-2" />
                            다음 화 생성
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-white">로딩 중...</div>}>
            <GenerateContent />
        </Suspense>
    );
}
