# DealSign Backend API

Production-ready backend for the DealSign CLM Platform. Built with Node.js, Express, TypeScript, and Prisma.

## Tech Stack
-   **Runtime**: Node.js 20+
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Validation**: Zod
-   **Auth**: JWT (Access + Refresh Tokens)
-   **File Storage**: Local filesystem (Multer)

## Getting Started

### Prerequisites
-   Node.js 20+
-   PostgreSQL
-   npm

### Installation

1.  **Install dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Copy `.env.example` to `.env` and update values.
    ```bash
    cp .env.example .env
    ```

3.  **Database Setup**
    Ensure PostgreSQL is running, then populate the schema and seed data.
    ```bash
    npm run prisma:generate
    npm run prisma:migrate
    npm run prisma:seed
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    API will be available at `http://localhost:5000/api`.

## API Endpoints

### Auth
-   `POST /api/auth/register`
-   `POST /api/auth/login`

### Contracts
-   `GET /api/contracts` - List contracts
-   `POST /api/contracts/upload` - Upload new contract
-   `GET /api/contracts/:id` - Get details

### Users
-   `GET /api/users/me` - Get current user profile

## Scripts
-   `npm run build`: Compile TypeScript
-   `npm start`: Run production server
-   `npm run lint`: Lint code
