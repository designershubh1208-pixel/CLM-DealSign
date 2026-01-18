"use client"

import { useUserStore } from "@/stores/user-store";
import { useBlockchainStore } from "@/stores/blockchain-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { WalletConnect } from "@/components/blockchain/wallet-connect";
import { User, Bell, Shield, Brain, Wallet, LogOut } from "lucide-react";

export default function SettingsPage() {
    // Page Component for User Settings
    const { user, settings, updateSettings, logout } = useUserStore();
    const { isConnected, walletAddress, network } = useBlockchainStore();

    const handleSave = () => {
        toast.success("Settings saved successfully");
    };

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account, team, and preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-white dark:bg-slate-900 border p-1 h-auto">
                    <TabsTrigger value="profile" className="gap-2 px-4 py-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
                    <TabsTrigger value="ai" className="gap-2 px-4 py-2"><Brain className="h-4 w-4" /> AI Preferences</TabsTrigger>
                    <TabsTrigger value="blockchain" className="gap-2 px-4 py-2"><Wallet className="h-4 w-4" /> Blockchain</TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2 px-4 py-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your public profile and details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="text-lg bg-indigo-100 text-indigo-700">
                                            {user?.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline">Change Avatar</Button>
                                </div>

                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" defaultValue={user?.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" defaultValue={user?.email} disabled />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Role</Label>
                                        <div className="flex">
                                            <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t pt-6 flex justify-between">
                                <Button variant="destructive" onClick={logout} className="gap-2">
                                    <LogOut className="h-4 w-4" /> Sign Out
                                </Button>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>Manage your organization access.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>U{i}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">Team Member {i}</p>
                                                    <p className="text-xs text-muted-foreground">member{i}@example.com</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">Editor</Badge>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-6">Invite New Member</Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analysis Sensitivity</CardTitle>
                            <CardDescription>Configure how strictly the AI evaluates contracts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <Label className="text-base">Auto-Analysis</Label>
                                    <p className="text-sm text-muted-foreground">Automatically analyze contracts upon upload.</p>
                                </div>
                                <Switch
                                    checked={settings.autoAnalysis}
                                    onCheckedChange={(checked) => updateSettings({ autoAnalysis: checked })}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Risk Tolerance Level</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['low', 'medium', 'high'].map((level) => (
                                        <div
                                            key={level}
                                            onClick={() => updateSettings({ riskSensitivity: level as any })}
                                            className={`border rounded-xl p-4 cursor-pointer transition-all ${settings.riskSensitivity === level ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'hover:border-slate-300'}`}
                                        >
                                            <p className="font-semibold capitalize text-sm mb-1">{level} Sensitivity</p>
                                            <p className="text-xs text-muted-foreground">
                                                {level === 'low' ? 'Only critical risks flagged.' : level === 'medium' ? 'Standard risk detection.' : 'Strict review of all clauses.'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="blockchain" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Blockchain Connection</CardTitle>
                            <CardDescription>Manage your wallet and network settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {!isConnected ? (
                                <Alert className="bg-amber-50 border-amber-200">
                                    <Shield className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="text-amber-800">Wallet Disconnected</AlertTitle>
                                    <AlertDescription className="text-amber-700">
                                        Connect your MetaMask wallet to enable contract verification features.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert className="bg-emerald-50 border-emerald-200">
                                    <Shield className="h-4 w-4 text-emerald-600" />
                                    <AlertTitle className="text-emerald-800">Wallet Connected</AlertTitle>
                                    <AlertDescription className="text-emerald-700">
                                        You are ready to verify contracts on {network || 'Polygon'}.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex flex-col gap-2">
                                <Label>Active Wallet</Label>
                                <div className="flex items-center gap-4">
                                    <Input value={walletAddress || "Not connected"} readOnly className="font-mono bg-slate-50 dark:bg-slate-900" />
                                    <WalletConnect />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Preferred Network</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="border rounded-lg p-3 text-center bg-slate-50 opacity-50 cursor-not-allowed">
                                        Ethereum
                                    </div>
                                    <div className="border rounded-lg p-3 text-center border-indigo-500 bg-indigo-50 text-indigo-700 font-medium">
                                        Polygon PoS
                                    </div>
                                    <div className="border rounded-lg p-3 text-center bg-slate-50 opacity-50 cursor-not-allowed">
                                        Hyperledger
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
