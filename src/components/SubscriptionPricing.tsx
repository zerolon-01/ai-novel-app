import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingProps {
    onSubscribe: (priceId: string) => void;
    currentTier?: string;
}

export function SubscriptionPricing({ onSubscribe, currentTier = 'FREE' }: PricingProps) {
    const plans = [
        {
            name: "FREE",
            price: "₩0",
            description: "취미로 즐기는 분들을 위한",
            features: ["하루 3회 생성", "표준 속도", "커뮤니티 지원"],
            priceId: "free",
            tier: "FREE"
        },
        {
            name: "BASIC",
            price: "₩4,900",
            description: "창작자를 위한",
            features: ["무제한 생성", "빠른 속도", "이메일 지원"],
            priceId: "price_1QVmMnQ72u5FI556aBbJjOTt", // Replace with your actual Stripe Price ID
            tier: "BASIC"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
                <Card key={plan.name} className={plan.tier === currentTier ? "border-primary" : ""}>
                    <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-4">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                        <ul className="space-y-2">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-center">
                                    <Check className="h-4 w-4 mr-2 text-primary" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            variant={plan.tier === currentTier ? "outline" : "default"}
                            disabled={plan.tier === currentTier}
                            onClick={() => plan.tier !== 'FREE' && onSubscribe(plan.priceId)}
                        >
                            {plan.tier === currentTier ? "Current Plan" : plan.tier === 'FREE' ? "Get Started" : "Upgrade"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
