# Alumni Influencer Platform - Frontend (React + Vite)

This is the frontend application for the alumni influencer platform. It connects to the Express backend API and provides role-based interfaces for users, alumni, and admins.

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Aserver-side-cw-front-end
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Copy the example file (or create `.env` manually if example does not exist):

```bash
cp .env.example .env
```

Then update `.env` with your values:

```env
VITE_BACKEND_URL=http://localhost:3000/api
VITE_API_KEY_HEADER=x-api-key
```

### 4. Run frontend server

```bash
npm run dev
```

Frontend will run on:

`http://localhost:5173`

## Backend Setup (Express API)

### 1. Navigate to backend

```bash
cd ../Aserver-side-cw-back-end
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup backend env

Create `.env`:

```env
PORT=3000
JWT_SECRET=your_secret_key
GMAIL_APP_PASSWORD=your_gmail_app_password
API_KEY_HEADER=x-api-key
```

### 4. Run backend server

```bash
npm start
```

Backend runs at:

`http://localhost:3000`

## Swagger API Documentation

Access Swagger UI:

`http://localhost:3000/api-docs`

## Technologies Used

### Frontend

- React (Vite)
- Axios
- Tailwind CSS
- React Router
- Chart.js / react-chartjs-2
- html2canvas + jsPDF (PDF export)

### Backend

- Node.js
- Express.js
- SQLite3
- JWT Authentication
- Node-cron
- Swagger

## Notes

- New registrations are created as `user`
- User can become alumni through alumni profile flow
- Some admin pages need API keys with proper scopes
- `VITE_API_KEY_HEADER` must match backend `API_KEY_HEADER`
