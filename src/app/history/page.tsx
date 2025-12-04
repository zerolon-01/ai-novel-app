import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

// Mock data
const HISTORY = [
    {
        id: "1",
        title: "The Neon Rain",
        genre: "Cyberpunk",
        date: "2024-03-15",
        preview: "The rain fell hard on Sector 7..."
    },
    {
        id: "2",
        title: "Dragon's Oath",
        genre: "Fantasy",
        date: "2024-03-14",
        preview: "The ancient scales shimmered in the moonlight..."
    }
];

export default function HistoryPage() {
    return (
        <div className="container py-8 px-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <Clock className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Your Stories</h1>
            </div>

            <div className="grid gap-4">
                {HISTORY.map((item) => (
                    <Card key={item.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xl">{item.title}</CardTitle>
                                <CardDescription>{item.genre} • {item.date}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/generate?id=${item.id}`}>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground line-clamp-2">
                                {item.preview}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
