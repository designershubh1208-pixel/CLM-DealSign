import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Cleanup
    await prisma.activity.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.risk.deleteMany();
    await prisma.clause.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@dealsign.com',
            name: 'Admin User',
            password,
            role: 'ADMIN',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        }
    });

    const legal = await prisma.user.create({
        data: {
            email: 'legal@dealsign.com',
            name: 'Legal Team',
            password,
            role: 'LEGAL',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Legal'
        }
    });

    const manager = await prisma.user.create({
        data: {
            email: 'manager@dealsign.com',
            name: 'Project Manager',
            password,
            role: 'MANAGER',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager'
        }
    });

    // Create Contract
    const contract = await prisma.contract.create({
        data: {
            title: 'Service Agreement - Acme Corp',
            type: 'MSA',
            status: 'UNDER_REVIEW',
            fileUrl: '/uploads/demo/service-agreement.pdf',
            fileName: 'service-agreement.pdf',
            fileSize: 1024 * 500,
            parties: ['DealSign Inc', 'Acme Corp'],
            effectiveDate: new Date(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            uploadedById: manager.id,
            riskScore: 65,
            activities: {
                create: {
                    type: 'UPLOADED',
                    description: 'Contract uploaded',
                    userId: manager.id
                }
            }
        }
    });

    // Add Clauses & Risks
    await prisma.clause.create({
        data: {
            contractId: contract.id,
            type: 'LIABILITY',
            text: 'Liability is limited to $1.',
            section: '8.1',
            riskLevel: 'HIGH'
        }
    });

    await prisma.risk.create({
        data: {
            contractId: contract.id,
            severity: 'HIGH',
            description: 'Liability cap is extremely low.',
            recommendation: 'Increase liability cap to contract value.',
            clauseReference: '8.1'
        }
    });

    // Add Comments
    await prisma.comment.create({
        data: {
            contractId: contract.id,
            userId: legal.id,
            content: 'We need to renegotiate the liability clause immediately.'
        }
    });

    // Add Approval Request
    await prisma.approval.create({
        data: {
            contractId: contract.id,
            userId: legal.id,
            role: 'LEGAL',
            status: 'PENDING'
        }
    });

    console.log('✅ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
