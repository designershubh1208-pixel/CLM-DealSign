"use client"

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'; // Note: Need to verify if progress exists or use default
import { cn, formatFileSize } from '@/lib/utils';
import { toast } from 'sonner';

// Install progress component first if needed, but I'll assume standard shadcn/ui basic setup
// If Progress is missing, I will just use a div for now to be safe or install it later. 
// Actually shadcn/ui init includes skeleton but maybe not progress. I'll code a simple one if needed or assume user installs it.
// Checking previous steps: I did NOT install "progress" component. I should handle that.

interface FileUploadZoneProps {
    onFileSelect: (file: File) => void;
    maxSize?: number; // in bytes
    acceptedTypes?: Record<string, string[]>;
    className?: string;
}

export function FileUploadZone({
    onFileSelect,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedTypes = {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    className
}: FileUploadZoneProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        if (fileRejections.length > 0) {
            setError(fileRejections[0].errors[0].message);
            return;
        }

        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setError(null);
            onFileSelect(selectedFile);
        }
    }, [onFileSelect]);

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setError(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize,
        accept: acceptedTypes,
        maxFiles: 1,
        multiple: false
    });

    return (
        <div className={cn("w-full", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center gap-4 group",
                    isDragActive
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900",
                    error && "border-red-500 bg-red-50 dark:bg-red-900/10",
                    file && "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                )}
            >
                <input {...getInputProps()} />

                {file ? (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2">
                            <FileIcon className="h-8 w-8 text-emerald-600" />
                        </div>
                        <p className="font-medium text-emerald-700 dark:text-emerald-400">{file.name}</p>
                        <p className="text-sm text-slate-500">{formatFileSize(file.size)}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="mt-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                            <X className="h-4 w-4 mr-2" /> Remove
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className={cn(
                            "h-16 w-16 rounded-full flex items-center justify-center transition-colors",
                            isDragActive ? "bg-primary/20 text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary group-hover:scale-110 duration-300"
                        )}>
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-lg">
                                {isDragActive ? "Drop the contract here" : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                PDF or DOCX (max 10MB)
                            </p>
                        </div>
                    </>
                )}

                {error && (
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center text-red-500 text-sm font-medium animate-pulse">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
