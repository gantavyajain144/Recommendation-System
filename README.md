# Modern Analytics Platform

A production-ready analytics platform built with FastAPI, Next.js, and MySQL.

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PyMySQL, Pydantic, Alembic
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Database**: MySQL
- **Auth**: JWT, Google Identity Services (OAuth2)

## Project Structure

- `backend/`: FastAPI application code.
- `frontend/`: Next.js application code.

## Setup Instructions

### Backend

1.  Navigate to `backend/`:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  **Install Backend Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure Environment Variables:
    - Copy `.env.example` to `.env` (create one if needed) set `MYSQL_USER`, `MYSQL_PASSWORD`, `GOOGLE_CLIENT_ID`.
5.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend

1.  Navigate to `frontend/`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

## Authentication

- **Standard**: Email/Password registration and login.
- **Google**: Sign In with Google (ID Token flow).
