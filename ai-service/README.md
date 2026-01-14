# DealSign AI Service

A FastAPI-based microservice for the DealSign CLM platform. It provides document analysis capabilities using NLP and LLMs.

## Features

-   **Document Parsing**: Supports PDF and DOCX formats.
-   **Summarization**: Concisely summarizes legal contracts (OpenAI GPT-3.5 with fallback).
-   **Clause Extraction**: Identifies key clauses (Payment, Termination, Liability, etc.) using spaCy.
-   **Risk Detection**: Detects critical legal risks based on predefined patterns.
-   **Q&A**: Answers questions about the contract context.

## Tech Stack

-   **Framework**: FastAPI
-   **Language**: Python 3.11+
-   **LLM**: OpenAI API
-   **NLP**: spaCy (`en_core_web_sm`)
-   **Parsing**: PyMuPDF, python-docx

## Setup

1.  **Clone and Navigate**
    ```bash
    cd ai-service
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    ```

3.  **Configure Environment**
    Copy `.env.example` to `.env` and add your OpenAI API Key.
    ```bash
    cp .env.example .env
    ```

4.  **Run Server**
    ```bash
    uvicorn app.main:app --reload
    ```
    API will be available at `http://localhost:8000`. Docs at `/docs`.

## Docker

1.  **Build Image**
    ```bash
    docker build -t dealsign-ai .
    ```

2.  **Run Container**
    ```bash
    docker run -p 8000:8000 --env-file .env dealsign-ai
    ```
