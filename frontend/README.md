# Creator Performance Tracker - Frontend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features

- **Secure Login**: JWT-based authentication with protected routes
- **Dashboard**: Overview with summary statistics
  - Total creators
  - Total links provided
  - Total links posted
  - Total views generated
- **Performance Logs Table**: View all recent performance logs with:
  - Creator name
  - Provided link (clickable)
  - Posted link (clickable)
  - View count
  - Date logged
  - Actions (View, Delete)
- **Creator Details Modal**: View full creator profile and performance history

## Tech Stack

- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls

## Project Structure

```
src/
├── components/
│   ├── CreatorDetailsModal.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Dashboard.jsx
│   └── Login.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Notes

- Make sure the backend server is running on `http://localhost:5000` before starting the frontend
- The application uses localStorage to store JWT tokens
- All routes except `/login` are protected and require authentication
