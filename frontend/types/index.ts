// Contract Types
export type ContractStatus = 'draft' | 'under_review' | 'approved' | 'verified' | 'rejected';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ContractType = 'NDA' | 'MSA' | 'SLA' | 'SOW' | 'Other';

export interface Contract {
    id: string;
    title: string;
    type: ContractType;
    status: ContractStatus;
    riskLevel: RiskLevel;
    uploadDate: string;
    effectiveDate?: string;
    expiryDate?: string;
    parties: string[];
    isVerified: boolean;
    blockchainHash?: string;
    transactionHash?: string;
    blockNumber?: number;
    fileUrl?: string;
    version: number;
    createdBy: string;
    updatedAt: string;
}

export interface ContractMetadata {
    title: string;
    type: ContractType;
    parties: string[];
    effectiveDate?: string;
    expiryDate?: string;
}

// AI Analysis Types
export interface AIClause {
    id: string;
    type: 'payment' | 'termination' | 'liability' | 'ip_rights' | 'confidentiality' | 'indemnification' | 'other';
    text: string;
    section: string;
    risk: RiskLevel;
    explanation?: string;
}

export interface AIRisk {
    id: string;
    severity: RiskLevel;
    description: string;
    recommendation: string;
    clauseReference?: string;
}

export interface AIAnalysis {
    id: string;
    contractId: string;
    summary: string;
    riskScore: number;
    clauses: AIClause[];
    risks: AIRisk[];
    analyzedAt: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: { text: string; section: string }[];
    timestamp: string;
}

// Blockchain Types
export interface BlockchainVerification {
    contractId: string;
    hash: string;
    transactionHash: string;
    blockNumber: number;
    timestamp: string;
    network: 'ethereum' | 'polygon' | 'fabric' | 'sepolia';
    gasUsed?: string;
}

export interface AuditEvent {
    id: string;
    contractId: string;
    type: 'uploaded' | 'analyzed' | 'reviewed' | 'approved' | 'rejected' | 'verified' | 'commented';
    description: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    timestamp: string;
    metadata?: Record<string, string>;
}

// User Types
export type UserRole = 'admin' | 'legal' | 'manager' | 'viewer';

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
    teamId: string;
    createdAt: string;
}

export interface Team {
    id: string;
    name: string;
    members: User[];
}

// Notification Types
export type NotificationType = 'approval_request' | 'analysis_complete' | 'verification_done' | 'comment' | 'mention';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    contractId?: string;
    isRead: boolean;
    createdAt: string;
}

// Version Types
export interface ContractVersion {
    id: string;
    contractId: string;
    version: number;
    changedBy: string;
    changedByName: string;
    changeSummary: string;
    fileUrl: string;
    content?: string;
    createdAt: string;
}

// Approval Workflow Types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalStep {
    id: string;
    contractId: string;
    role: 'legal' | 'manager' | 'finance';
    status: ApprovalStatus;
    approver?: User;
    approvedAt?: string;
    comment?: string;
}

// Comment Types
export interface Comment {
    id: string;
    contractId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    parentId?: string;
    replies?: Comment[];
}

// Dashboard Types
export interface DashboardStats {
    totalContracts: number;
    totalContractsTrend: number;
    pendingReviews: number;
    highRiskDetected: number;
    blockchainVerified: number;
    blockchainVerifiedTrend: number;
}

// Settings Types
export interface UserSettings {
    riskSensitivity: 'low' | 'medium' | 'high';
    autoAnalysis: boolean;
    notifications: {
        email: boolean;
        inApp: boolean;
        approvalRequests: boolean;
        analysisComplete: boolean;
    };
}

export interface BlockchainSettings {
    connectedWallet?: string;
    network: 'ethereum' | 'polygon' | 'fabric' | 'sepolia';
    autoVerify: boolean;
}
