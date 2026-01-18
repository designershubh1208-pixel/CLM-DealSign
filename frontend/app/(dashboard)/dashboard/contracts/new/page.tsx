"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ContractType } from "@/types";
import { useContractStore } from "@/stores/contract-store";
import { FileUploadZone } from "@/components/contracts/upload-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CONTRACT_TYPES } from "@/lib/constants";

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    type: z.string().min(1, "Contract type is required"),
    parties: z.string().min(3, "At least one party must be specified"),
    effectiveDate: z.string().optional(),
    expiryDate: z.string().optional()
});

export default function UploadContractPage() {
    const router = useRouter();
    const { uploadContract, isLoading } = useContractStore();
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState<1 | 2>(1);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            type: "NDA",
            parties: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!file) {
            toast.error("Please upload a contract file");
            return;
        }

        try {
            await uploadContract(file, {
                title: values.title,
                type: values.type as ContractType,
                parties: values.parties.split(',').map(p => p.trim()),
                effectiveDate: values.effectiveDate,
                expiryDate: values.expiryDate
            });

            // Redirect to the new contract (in a real app, we'd get the ID from the response)
            // For now, we'll redirect to the list or a mock ID if the store handles it
            // The store updates 'selectedContract', so we can check that, but for safety:
            router.push("/dashboard/contracts");

        } catch (error) {
            console.error(error);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        // Auto-fill title if empty
        if (!form.getValues("title")) {
            form.setValue("title", selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Upload Contract</h1>
                    <p className="text-muted-foreground">Upload, analyze, and verify a new contract.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Progress Steps */}
                <div className="md:col-span-1 space-y-6">
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 pl-6 py-2 space-y-8">
                        <div className="relative">
                            <span className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 ${step >= 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                                1
                            </span>
                            <h3 className={`font-semibold ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Upload Document</h3>
                            <p className="text-xs text-muted-foreground mt-1">Select PDF or DOCX file</p>
                        </div>

                        <div className="relative">
                            <span className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 ${step >= 2 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                                2
                            </span>
                            <h3 className={`font-semibold ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Contract Details</h3>
                            <p className="text-xs text-muted-foreground mt-1">Metadata and parties</p>
                        </div>

                        <div className="relative">
                            <span className={`absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-slate-100 border-slate-300 text-slate-500`}>
                                3
                            </span>
                            <h3 className="text-slate-500">AI Analysis</h3>
                            <p className="text-xs text-muted-foreground mt-1">Automatic processing</p>
                        </div>
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="md:col-span-2">
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>{step === 1 ? "Select Document" : "Contract Metadata"}</CardTitle>
                            <CardDescription>
                                {step === 1 ? "Drag and drop your contract file to begin." : "Provide basic information about the contract."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {step === 1 ? (
                                <div className="space-y-6">
                                    <FileUploadZone onFileSelect={handleFileSelect} />
                                    {file && (
                                        <div className="flex justify-end">
                                            <Button onClick={() => setStep(2)} className="bg-indigo-600 hover:bg-indigo-700">
                                                Continue <CheckCircle className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contract Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Master Service Agreement - Acme Corp" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Contract Type</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {CONTRACT_TYPES.map((type) => (
                                                                    <SelectItem key={type} value={type}>
                                                                        {type}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="parties"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Parties Involved</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Sep. by commas" {...field} />
                                                        </FormControl>
                                                        <FormDescription className="text-xs">
                                                            e.g. DealSign Inc, Acme Corp
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                                Back
                                            </Button>
                                            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 min-w-[140px]">
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                                    </>
                                                ) : (
                                                    "Upload & Analyze"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
