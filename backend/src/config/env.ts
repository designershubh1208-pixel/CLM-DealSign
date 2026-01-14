import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(10),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
    BLOCKCHAIN_RPC_URL: z.string().url().default('http://localhost:8545'),
    CONTRACT_ADDRESS: z.string().optional(),
    PRIVATE_KEY: z.string().optional()
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(envParsed.error.format(), null, 4));
    process.exit(1);
}

export const env = envParsed.data;
