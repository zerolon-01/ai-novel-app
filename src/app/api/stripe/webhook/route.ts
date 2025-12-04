import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin client to update user records
// Initialize Supabase Admin client to update user records
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return new NextResponse("Webhook Secret Missing", { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.userId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        // Update user profile with subscription details
        // Assuming we have a 'profiles' table or similar linked to auth.users
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                stripe_customer_id: session.customer as string,
                subscription_id: subscription.id,
                subscription_tier: 'PRO', // Logic to determine tier based on priceId needed if multiple tiers
                subscription_status: 'active',
                // Update credits based on tier if needed
                credits: 999999, // Unlimited for paid plans
            })
            .eq('id', session.metadata.userId);

        if (error) {
            console.error('Error updating profile:', error);
            return new NextResponse("Database Error", { status: 500 });
        }
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        // Renew credits or extend subscription validity
        // This part depends on how we want to handle recurring payments
        // For now, checkout.session.completed handles the initial setup
    }

    return new NextResponse(null, { status: 200 });
}
