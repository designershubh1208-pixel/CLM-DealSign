import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

// Combine class names with Tailwind merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Truncate blockchain hash for display
export function truncateHash(hash: string, startLength = 6, endLength = 4): string {
  if (!hash) return '';
  if (hash.length <= startLength + endLength) return hash;
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}

// Format date for display
export function formatDate(date: string | Date | null | undefined, formatStr = 'MMM dd, yyyy'): string {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid date';
  }
}

// Format date with time
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return format(dateObj, 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
}

// Format relative time
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Generate random ID
export function generateId(prefix = ''): string {
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${random}` : random;
}

// Calculate SHA-256 hash of file
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hashHex}`;
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Get risk level color
export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low':
      return 'text-emerald-500';
    case 'medium':
      return 'text-amber-500';
    case 'high':
      return 'text-red-500';
    default:
      return 'text-slate-500';
  }
}

// Get risk level background color
export function getRiskBgColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low':
      return 'bg-emerald-500/10';
    case 'medium':
      return 'bg-amber-500/10';
    case 'high':
      return 'bg-red-500/10';
    default:
      return 'bg-slate-500/10';
  }
}

// Get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-slate-500';
    case 'under_review':
      return 'bg-amber-500';
    case 'approved':
      return 'bg-emerald-500';
    case 'verified':
      return 'bg-indigo-500';
    case 'rejected':
      return 'bg-red-500';
    default:
      return 'bg-slate-500';
  }
}

// Get status label
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'under_review':
      return 'Under Review';
    case 'approved':
      return 'Approved';
    case 'verified':
      return 'Verified';
    case 'rejected':
      return 'Rejected';
    default:
      return status;
  }
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
