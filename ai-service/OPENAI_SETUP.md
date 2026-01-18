# OpenAI API Configuration Guide

## Current Status
The system is currently using **fallback text analysis** because no valid OpenAI API key is configured.

## What This Means
- ✅ The system **still works** - it extracts answers from contract text using intelligent pattern matching
- ⚠️ Answers are less sophisticated than with OpenAI's GPT-3.5
- ℹ️ Confidence scores are lower (0.65 vs 0.95 with OpenAI)

## How to Get a Valid OpenAI API Key

### Step 1: Create an OpenAI Account
1. Go to https://platform.openai.com/signup
2. Sign up with your email or Google/Microsoft account
3. Verify your email

### Step 2: Set Up Billing
1. Go to https://platform.openai.com/account/billing/overview
2. Click "Set up paid account"
3. Add a payment method (credit/debit card)
4. Set a usage limit to control costs

### Step 3: Create an API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (you won't be able to see it again)

### Step 4: Update the .env File
1. Open `ai-service/.env`
2. Replace the `OPENAI_API_KEY` value with your new key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   PORT=8000
   ```
3. Save the file

### Step 5: Restart the AI Service
```bash
cd ai-service
python -m uvicorn app.main:app --reload
```

## Pricing Information
- OpenAI API is **not free** - you need to pay for usage
- GPT-3.5-turbo costs approximately $0.0005 per 1K tokens
- You can set usage limits to control costs
- Free trial credits (if available) expire after 3 months

## Troubleshooting

### "insufficient_quota" Error
- Your account has no credits or billing method
- Solution: Add a payment method to your OpenAI account

### "Invalid API key" Error
- The API key is incorrect or revoked
- Solution: Generate a new API key from https://platform.openai.com/api-keys

### Still Getting Fallback Analysis
- The API key is not configured correctly
- Check that the .env file has the correct key
- Restart the AI service after updating .env

## Current Fallback System Features
The fallback system (when OpenAI is not available):
- ✅ Extracts relevant sentences from contracts
- ✅ Filters out common words to find meaningful keywords
- ✅ Ranks sentences by relevance
- ✅ Returns the most relevant information
- ⚠️ May not understand complex legal concepts
- ⚠️ Cannot perform reasoning or inference

## Recommendation
For production use, it's recommended to:
1. Set up a valid OpenAI API key with billing
2. Monitor your API usage and costs
3. Set appropriate usage limits
4. Consider using GPT-4 for more complex legal analysis (higher cost)
