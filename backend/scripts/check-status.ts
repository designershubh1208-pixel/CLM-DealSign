
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const CONTRACT_ABI = [
    "function verifyDocument(bytes32 documentHash) external view returns (bool exists, address registeredBy, uint256 timestamp)"
];

async function main() {
    console.log('🔍 Checking System State...\n');

    // 1. Check Database
    const contract = await prisma.contract.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: true }
    });

    if (!contract) {
        console.log('❌ No contracts found in the database.');
        console.log('   -> Did you upload a file via the Frontend yet?');
        return;
    }

    console.log(`📄 Latest Contract: "${contract.title}"`);
    console.log(`   - ID: ${contract.id}`);
    console.log(`   - Status: ${contract.status}`);
    console.log(`   - Uploaded By: ${contract.uploadedBy.email}`);
    console.log(`   - AI Risk Score: ${contract.riskScore ?? 'N/A'}`);
    console.log(`   - Verified in DB: ${contract.isVerified ? '✅ Yes' : '❌ No'}`);

    if (contract.isVerified && contract.blockchainHash) {
        console.log(`   - Hash: ${contract.blockchainHash}`);

        // 2. Check Blockchain
        const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
        const contractAddress = process.env.CONTRACT_ADDRESS;

        if (!contractAddress) {
            console.log('⚠️  Cannot check blockchain: CONTRACT_ADDRESS not set in .env');
            return;
        }

        try {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const registry = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

            console.log('\n🔗 Checking Blockchain State...');
            const [exists, registeredBy, timestamp] = await registry.verifyDocument(contract.blockchainHash);

            if (exists) {
                console.log(`   ✅ On-Chain Verification Passed!`);
                console.log(`   - Registered By: ${registeredBy}`);
                console.log(`   - Timestamp: ${new Date(Number(timestamp) * 1000).toLocaleString()}`);
            } else {
                console.log(`   ❌ Hash NOT found on blockchain (Sync issue?)`);
            }
        } catch (error: any) {
            console.log(`   ❌ Blockchain Check Failed: ${error.message}`);
        }
    } else {
        console.log('\n⚠️  Contract is NOT verified on the blockchain yet.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
