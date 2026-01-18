"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span>DealSign</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="#features">Features</Link>
          <Link href="#pricing">Pricing</Link>
          <Link href="#about">About</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:underline">Log in</Link>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40 bg-slate-50 dark:bg-slate-950">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 relative mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                New: Polygon Blockchain Integration
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl max-w-4xl leading-tight">
                AI-Powered Contract Intelligence with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">Blockchain Trust</span>
              </h1>
              <p className="mx-auto max-w-2xl text-slate-500 md:text-xl dark:text-slate-400">
                Accelerate reviews, detect risks automatically, and verify document integrity with our enterprise-grade CLM platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 min-w-[300px]">
                <Button size="lg" className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700" asChild>
                  <Link href="/signup">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white dark:bg-slate-900 hover:bg-slate-50">
                  Watch Demo
                </Button>
              </div>

              <div className="pt-8 flex items-center gap-8 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> 80% Faster Review</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> 95% Risk Detection</span>
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Immutable Audit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-white dark:bg-slate-900" id="features">
          <div className="container px-4 md:px-6 mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold">AI Intelligence</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Automatically extract clauses, detect liabilities, and summarize contracts in seconds using advanced LLMs.
                </p>
              </div>
              <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold">Blockchain Trust</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Verify document integrity by anchoring cryptographic hashes to the Polygon blockchain. Immutable proof of existence.
                </p>
              </div>
              <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Workflows</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Streamline approvals with automated routing, version control, and real-time collaboration tools.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-slate-950 text-slate-400">
        <div className="container px-4 md:px-6 mx-auto max-w-7xl border-t border-slate-900 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <span>DealSign</span>
            </div>
            <div className="text-sm">
              © 2024 DealSign Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
