# DealSign CLM Platform - Setup Guide

This guide explains how to install, configure, and run all components of the DealSign Platform.

## 📋 Prerequisites

Ensure you have the following installed:
*   **Node.js** (v18+) & **npm**
*   **Python** (v3.10+)
*   **Docker Desktop** (for PostgreSQL database)
*   **Git**

---

## 🛠️ Installation & Setup

### 1. Blockchain Service (Hardhat)
Sets up the local blockchain and smart contract.

```bash
cd blockchain
npm install
```

**Start the Local Node:**
Open a generic terminal and run:
```bash
npx hardhat node
```
*(Keep this running!)*

**Deploy Contract:**
Open a **new** terminal and run:
```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```
> ⚠️ **Important:** Copy the "DealSignRegistry deployed to: `0x...`" address. You will need it for the Backend `.env`.

---

### 2. AI Service (Python)
Sets up the AI engine for contract analysis.

```bash
cd ai-service

# Create Virtual Environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (Mac/Linux)
# source venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Download AI Model
python -m spacy download en_core_web_sm
```

**Start AI Server:**
```bash
uvicorn app.main:app --reload --port 8000
```
*(Keep this running!)*

---

### 3. Backend Service (Node.js + PostgreSQL)
Sets up the API and Database.

**Step 3.1: Database Setup (Docker)**

1.  **Install Docker Desktop**:
    *   Download from [Docker Desktop](https://www.docker.com/products/docker-desktop).
    *   Install it and open the application.
    *   Wait until the engine is running (green icon in bottom-left or system tray).

2.  **Start PostgreSQL Container**:
    Run this command in your terminal (PowerShell or CMD) to start the database:
    ```bash
    docker run --name dealsign-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dealsign -p 5432:5432 -d postgres
    ```

**Backend configuration:**
1.  Navigate to `backend` folder.
2.  Make sure `.env` file exists with:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/dealsign?schema=public"
    AI_SERVICE_URL="http://localhost:8000"
    BLOCKCHAIN_RPC_URL="http://localhost:8545"
    PRIVATE_KEY="YOUR_PRIVATE_KEY_FROM_HARDHAT_NODE"
    CONTRACT_ADDRESS="YOUR_DEPLOYED_CONTRACT_ADDRESS"
    ```
3.  Install dependencies and setup DB:

```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
```

**Start Backend Server:**
```bash
npm run dev
```
*(Runs on Port 5000)*

---

### 4. Frontend Application (Next.js)
Sets up the user interface.

```bash
cd frontend
npm install
```

**Start Frontend:**
```bash
npm run dev
```
*(Runs on Port 3000)*

---

## 🚀 How to Run (Daily Usage)

You need **4 Terminal Windows** running simultaneously:

1.  **Terminal 1 (Blockchain):** `cd blockchain && npx hardhat node`
2.  **Terminal 2 (AI):** `cd ai-service && .\venv\Scripts\activate && uvicorn app.main:app --reload --port 8000`
3.  **Terminal 3 (Backend):** `cd backend && npm run dev`
4.  **Terminal 4 (Frontend):** `cd frontend && npm run dev`

Access the App: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Credentials

The database is seeded with these users:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@dealsign.com` | `password123` |
| **Legal** | `legal@dealsign.com` | `password123` |
| **Manager**| `manager@dealsign.com` | `password123` |

---

## 🧪 End-to-End Testing Guide

Follow these steps to verify the entire system is working correctly.

### Step 1: Login
1.  Open your browser and go to `http://localhost:3000`.
2.  You should see the **Landing Page**. Click **"Login"**.
3.  Use the Admin credentials:
    *   **Email:** `admin@dealsign.com`
    *   **Password:** `password123`
4.  Click **"Sign In"**. You should be redirected to the **Dashboard**.

### Step 2: Upload a Contract
1.  On the Dashboard sidebar, click **"New Contract"**.
2.  Fill in the form:
    *   **Title:** e.g., "NDA with Acme Corp"
    *   **Type:** Select "NDA"
    *   **Parties:** e.g., "DealSign Inc, Acme Corp"
    *   **File:** Upload a PDF or DOCX file (you can use any sample text file too).
3.  Click **"Upload Contract"**.
4.  You will be redirected to the **Contract Details** page.

### Step 3: Verify AI Analysis
1.  On the Contract Details page, look at the **"AI Analysis"** section on the right.
2.  **Risk Score:** You should see a score (e.g., "High Risk", "Low Risk").
3.  **Clauses:** You should see extracted clauses like "Confidentiality" or "Termination".
4.  *Note: If the AI service is off, this section will keep loading or show an error.*

### Step 4: Verify Blockchain Registration
1.  Look for the **"Blockchain Verification"** card.
2.  Initially, it will show **"Status: Not Verified"**.
3.  Click the **"Verify on Blockchain"** button.
4.  Wait a few seconds.
    *   The status should change to **"Verified"**.
    *   A **Transaction Hash** (e.g., `0x123...`) will appear.
    *   A **Block Number** will appear.
5.  **Technical Check:** Check your **Blockchain Terminal**. You should see a log like:
    `eth_sendTransaction` ... `ContractRegistered`.

### Step 5: Check Dashboard
1.  Go back to the **Dashboard**.
2.  The "Recent Contracts" list should show your new contract.
3.  The "Blockchain Verified" count in the stats should have increased.

**🎉 Congratulations! You have successfully run the full DealSign Platform.**

---

## 🔧 Troubleshooting

### Python/AI Service Errors (Python 3.12+)
If you see errors like `TypeError: ForwardRef._evaluate() missing 1 required keyword-only argument`, it means there is a version mismatch with `pydantic` and `spacy`.

**Fix:** Run these commands to upgrade your dependencies:

```bash
cd ai-service
.\venv\Scripts\activate

# Upgrade Pip and Typing Extensions
python.exe -m pip install --upgrade pip typing-extensions

# Force Upgrade Core Libraries

### Database / Docker Errors
**Issue:** `Error response from daemon: Conflict. The container name "/dealsign-postgres" is already in use.`
*   **Fix:** Run `docker rm -f dealsign-postgres` and try again.

**Issue:** `Bind for 0.0.0.0:5432 failed: port is already allocated`
*   **Fix:** Check if you have another PostgreSQL instance running. stop it, or change the port in the docker run command (e.g., `-p 5433:5432`) and update your `.env` file accordingly.

