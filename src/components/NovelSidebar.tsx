"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, BookOpen, Trash2 } from "lucide-react";
import { Novel, getNovels, deleteNovel } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface NovelSidebarProps {
    currentNovelId?: string;
}

export function NovelSidebar({ currentNovelId }: NovelSidebarProps) {
    const router = useRouter();
    const [novels, setNovels] = useState<Novel[]>([]);

    useEffect(() => {
        // Load novels on mount
        setNovels(getNovels().sort((a, b) => b.updatedAt - a.updatedAt));

        // Listen for storage events (in case of multiple tabs)
        const handleStorage = () => {
            setNovels(getNovels().sort((a, b) => b.updatedAt - a.updatedAt));
        };

        window.addEventListener("storage", handleStorage);
        // Custom event for local updates
        window.addEventListener("novel-updated", handleStorage);

        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("novel-updated", handleStorage);
        };
    }, []);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("정말 이 소설을 삭제하시겠습니까?")) {
            deleteNovel(id);
            window.dispatchEvent(new Event("novel-updated"));
            if (currentNovelId === id) {
                router.push("/");
            }
        }
    };

    return (
        <div className="w-64 h-full bg-black/40 border-r border-white/10 flex flex-col backdrop-blur-md">
            <div className="p-4 border-b border-white/10">
                <Button
                    onClick={() => router.push("/")}
                    className="w-full justify-start gap-2"
                    variant="outline"
                >
                    <Plus className="w-4 h-4" />
                    새 소설 만들기
                </Button>
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="p-2">
                    <h3 className="text-xs font-semibold text-muted-foreground px-2 py-2 mb-1">
                        내 서재
                    </h3>
                    <div className="space-y-1">
                        {novels.length === 0 ? (
                            <div className="text-sm text-muted-foreground p-4 text-center">
                                저장된 소설이 없습니다.
                            </div>
                        ) : (
                            novels.map((novel) => (
                                <div
                                    key={novel.id}
                                    onClick={() => router.push(`/generate?id=${novel.id}`)}
                                    className={cn(
                                        "group flex items-center justify-between w-full p-2 rounded-lg text-sm transition-colors cursor-pointer",
                                        currentNovelId === novel.id
                                            ? "bg-primary/20 text-primary"
                                            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                                    )}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <BookOpen className="w-4 h-4 shrink-0" />
                                        <span className="truncate">
                                            {novel.title || novel.context.genre + " 소설"}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                                        onClick={(e) => handleDelete(e, novel.id)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
