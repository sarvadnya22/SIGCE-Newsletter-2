# AI Automated Newsletter Generator

A MERN stack application allowing administrators to automatically generate and format college newsletters using AI and export them as PDFs.

## Prerequisites
- Node.js (v16+)
- MongoDB (running locally on port 27017, or update `backend/.env` with your URI)
- An OpenAI API Key

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies (already installed if using the provided scaffolding):
   ```bash
   npm install
   ```
3. Update `.env`:
   Open `backend/.env` and replace `your_openai_api_key_here` with your actual OpenAI API Key.
4. Start the server:
   ```bash
   npm run start
   ```
   *The server runs on http://localhost:5000*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The app runs on http://localhost:5173*

## Usage Guide
1. **Admin Login**: Go to `http://localhost:5173/login`. You first need to create a test user (since there is no registration UI, you can send a POST request to `http://localhost:5000/api/auth/register` with `{ "username": "admin", "password": "password" }` using Postman/CURL, or add a register UI).
2. **Dashboard**: View your saved newsletters.
3. **Create Newsletter**: Fill in the cover details, add toppers, and add events. Upload photos and click "Generate with AI" to let OpenAI write a formal paragraph.
4. **Export**: Once saved, click "Export PDF" from the Dashboard. It will use Puppeteer to print the exact PDF formatting.
