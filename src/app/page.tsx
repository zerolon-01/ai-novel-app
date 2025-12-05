"use client";

import { NovelForm } from "@/components/NovelForm";
import { SubscriptionPricing } from "@/components/SubscriptionPricing";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Subscription error:", error);
      // Handle error (e.g., show toast)
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-8">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-xs font-medium text-primary-foreground/80">
            <Sparkles className="w-3 h-3 mr-2 text-primary" />
            차세대 AI 스토리텔링
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            상상을 현실로 만드세요
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            세계관, 등장인물, 줄거리를 정의하세요. AI가 이야기를 엮어냅니다.
          </p>
        </div>

        <NovelForm />

        <div className="w-full mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">요금제 선택</h2>
          <SubscriptionPricing onSubscribe={handleSubscribe} />
        </div>
      </div>
    </div>
  );
}
