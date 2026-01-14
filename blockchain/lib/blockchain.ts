import { ethers } from 'ethers';

// ------------------------------------------------------------------
// Backend Integration Helper for DealSign Registry
// ------------------------------------------------------------------
// This file demonstrates how to integrate the backend with the 
// deployed smart contract using ethers.js v6.
//
// Usage:
// 1. Copy this file to your backend (e.g., src/lib/blockchain.ts)
// 2. Install ethers: npm install ethers
// 3. Set env inputs: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS
// ------------------------------------------------------------------

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const ABI = [
    "function registerContract(bytes32 documentHash, string contractId) external",
    "function logApproval(bytes32 documentHash, string role, string comment) external",
    "function verifyDocument(bytes32 documentHash) external view returns (bool exists, address registeredBy, uint256 timestamp)",
    "function getApprovals(bytes32 documentHash) external view returns (tuple(address approver, string role, uint256 timestamp, string comment)[])",
    "function getAuditLog(bytes32 documentHash) external view returns (string[])",
    "event ContractRegistered(bytes32 indexed documentHash, address indexed registeredBy, uint256 timestamp, string contractId)",
    "event ApprovalLogged(bytes32 indexed documentHash, address indexed approver, string role, uint256 timestamp)"
];

const getProvider = () => new ethers.JsonRpcProvider(RPC_URL);

const getWallet = () => {
    if (!PRIVATE_KEY) throw new Error("Missing PRIVATE_KEY");
    return new ethers.Wallet(PRIVATE_KEY, getProvider());
};

const getContract = (signerOrProvider: any) => {
    if (!CONTRACT_ADDRESS) throw new Error("Missing CONTRACT_ADDRESS");
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
};

export const registerHash = async (hash: string, contractId: string) => {
    const wallet = getWallet();
    const contract = getContract(wallet);
    const tx = await contract.registerContract(hash, contractId);
    return await tx.wait();
};

export const logApproval = async (hash: string, role: string, comment: string) => {
    const wallet = getWallet();
    const contract = getContract(wallet);
    const tx = await contract.logApproval(hash, role, comment);
    return await tx.wait();
};

export const verifyHash = async (hash: string) => {
    const provider = getProvider();
    const contract = getContract(provider);
    return await contract.verifyDocument(hash);
};

export const getApprovals = async (hash: string) => {
    const provider = getProvider();
    const contract = getContract(provider);
    return await contract.getApprovals(hash);
};
