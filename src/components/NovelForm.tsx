"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GenreSelector } from "./GenreSelector";
import { CharacterFields } from "./CharacterFields";
import { Wand2, ArrowRight } from "lucide-react";
import { NovelRequest } from "@/lib/types";
import { saveNovel } from "@/lib/storage";

export function NovelForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<NovelRequest>({
        title: "",
        genre: "Fantasy",
        characters: ["Protagonist"],
        plot: "",
        tone: "Standard"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newNovelId = Date.now().toString();
        const newNovel = {
            id: newNovelId,
            title: formData.title,
            context: formData,
            segments: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        saveNovel(newNovel);

        // Dispatch event to update sidebar
        window.dispatchEvent(new Event("novel-updated"));

        router.push(`/generate?id=${newNovelId}`);
    };

    return (
        <Card className="w-full max-w-2xl border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl animate-fade-in-up">
            <CardHeader>
                <CardTitle className="text-3xl">세계관 설정</CardTitle>
                <CardDescription>새로운 이야기의 설정을 구성하세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">제목</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="소설의 제목을 입력하세요"
                            className="bg-white/5 border-white/10 focus:bg-white/10"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">장르</label>
                        <GenreSelector
                            selected={formData.genre}
                            onSelect={(g) => setFormData({ ...formData, genre: g })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">등장인물</label>
                        <CharacterFields
                            characters={formData.characters}
                            onChange={(chars) => setFormData({ ...formData, characters: chars })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-200">초기 줄거리</label>
                        <Textarea
                            value={formData.plot}
                            onChange={(e) => setFormData({ ...formData, plot: e.target.value })}
                            placeholder="이야기의 시작 상황을 묘사하세요..."
                            className="min-h-[150px] bg-white/5 border-white/10 focus:bg-white/10 resize-none"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                                초기화 중...
                            </>
                        ) : (
                            <>
                                이야기 생성 시작 <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
