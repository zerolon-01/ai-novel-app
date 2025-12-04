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
            description: "For hobbyists",
            features: ["Daily 3 generations", "Standard speed", "Community support"],
            priceId: "free",
            tier: "FREE"
        },
        {
            name: "BASIC",
            price: "₩4,900",
            description: "For creators",
            features: ["Unlimited generations", "Fast speed", "Email support"],
            priceId: "price_basic_id_placeholder", // Replace with actual Stripe Price ID
            tier: "BASIC"
        },
        {
            name: "PRO",
            price: "₩9,900",
            description: "For professionals",
            features: ["Everything in Basic", "GPT-4o & Claude-3.5", "Priority support"],
            priceId: "price_pro_id_placeholder", // Replace with actual Stripe Price ID
            tier: "PRO"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
