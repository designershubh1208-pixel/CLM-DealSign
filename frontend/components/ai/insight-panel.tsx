"use client"

import { useState } from "react";
import { AIClause, AIRisk } from "@/types";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RiskBadge } from "@/components/ai/risk-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, AlertTriangle, FileText, ChevronRight } from "lucide-react";

interface AIInsightPanelProps {
    summary: string;
    risks: AIRisk[];
    clauses: AIClause[];
    riskScore: number;
}

export function AIInsightPanel({ summary, risks, clauses, riskScore }: AIInsightPanelProps) {
    // Score color calculation
    const getScoreColor = (score: number) => {
        if (score < 30) return "text-emerald-500 border-emerald-500";
        if (score < 70) return "text-amber-500 border-amber-500";
        return "text-red-500 border-red-500";
    };

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="h-5 w-5 text-indigo-500" />
                            Executive Summary
                        </CardTitle>
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 font-bold text-sm ${getScoreColor(riskScore)}`}>
                            {riskScore}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {summary}
                    </p>
                </CardContent>
            </Card>

            {/* Critical Risks */}
            {risks.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Detected Risks
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {risks.map((risk) => (
                            <Alert key={risk.id} variant="destructive" className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="font-semibold flex items-center justify-between">
                                    {risk.description}
                                    <RiskBadge level={risk.severity} showIcon={false} className="ml-2" />
                                </AlertTitle>
                                <AlertDescription className="mt-2 text-xs">
                                    <span className="font-semibold">Recommendation:</span> {risk.recommendation}
                                </AlertDescription>
                            </Alert>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Extracted Clauses */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-500" />
                        Key Clauses
                    </CardTitle>
                    <CardDescription>Automated extraction of key terms</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {clauses.map((clause) => (
                            <AccordionItem key={clause.id} value={clause.id}>
                                <AccordionTrigger className="hover:no-underline py-3">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <span className="font-medium flex items-center text-sm">
                                            <span className={`w-2 h-2 rounded-full mr-2 ${clause.risk === 'high' ? 'bg-red-500' : clause.risk === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                            {clause.type.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className="text-xs text-muted-foreground mr-2">Sec {clause.section}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md text-sm border">
                                        <p className="font-mono text-xs text-muted-foreground mb-2">"{clause.text}"</p>
                                        {clause.explanation && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 border-t pt-2 mt-2">
                                                <span className="font-semibold">Analysis:</span> {clause.explanation}
                                            </p>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
