"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/user-store";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useUserStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        login("alex@dealsign.com");
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-indigo-600 p-2 rounded-xl">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>
                        Enter your email to sign in to your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" defaultValue="alex@dealsign.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link href="#" className="text-xs text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
                            </div>
                            <Input id="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" type="submit">Sign In</Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-indigo-600 hover:text-indigo-500 font-medium">
                                Sign up
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
