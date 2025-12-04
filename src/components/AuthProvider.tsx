"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/types";

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    loginWithGoogle: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async (userId: string) => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data as Profile);
            } else if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create one
                const newProfile: Profile = {
                    id: userId,
                    email: user?.email || "",
                    credits: 3,
                    subscription_tier: 'FREE',
                    subscription_status: 'active'
                };
                // Note: In a real app, this should be done via a trigger on auth.users creation
                // But for client-side init (if no trigger), we can try to insert.
                // Better approach: Use a Postgres Trigger.
                // For now, we'll just set local state as fallback or handle null profile in UI.
                setProfile(newProfile);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setIsLoading(false);
            if (event === 'SIGNED_IN') {
                router.refresh();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router, supabase]);

    const loginWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return !error;
    };

    const signup = async (name: string, email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });
        return !error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <AuthContext.Provider value={{ user, profile, isLoading, loginWithGoogle, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
