# DealSign Blockchain

Smart contracts for the DealSign CLM platform's immutable audit trail and verification system.

## Stack
- **Hardhat**: Development environment
- **Solidity**: 0.8.20
- **Ethers.js**: Interaction library
- **OpenZeppelin**: Standard contracts

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env` and set your Private Key and RPC URL (if deploying to testnet).
   ```bash
   cp .env.example .env
   ```

## Commands

### Compile
```bash
npm run compile
```

### Test
Run the comprehensive test suite:
```bash
npm run test
```

### Local Deployment
1. Start local node:
   ```bash
   npm run node
   ```
2. Deploy (in new terminal):
   ```bash
   npm run deploy:local
   ```

### Testnet Deployment (Sepolia)
```bash
npm run deploy:sepolia
```

## Integration

Use the helper in `lib/blockchain.ts` to integrate with your backend. Ensure `CONTRACT_ADDRESS` is set in your backend environment variables after deployment.
