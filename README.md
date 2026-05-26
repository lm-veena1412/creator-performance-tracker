# Creator Performance Tracker

A full-stack web application to track content creators, provided links, posted links, and view counts. Built to replace manual Google Sheets tracking with a professional CRM-like interface.

## Tech Stack

### Backend
- Node.js with Express
- MySQL database
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

### Frontend
- React 18 with Vite
- Tailwind CSS
- Lucide React icons
- React Router
- Axios

## Features

- **Secure Authentication**: JWT-based login system with protected routes
- **Dashboard Overview**: Summary statistics showing:
  - Total number of creators
  - Total links provided
  - Total links posted
  - Total views generated
- **Performance Tracking**: Data table with:
  - Creator name
  - Provided link (clickable)
  - Posted link (clickable)
  - View count
  - Date logged
  - Action buttons (View, Delete)
- **Creator Details**: Modal panel showing:
  - Full creator profile (name, email, phone, address)
  - Complete performance history

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL server
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=creator_tracker
JWT_SECRET=your_secret_key_here
```

5. Set up the MySQL database:
- Open MySQL Workbench or command line
- Run the SQL commands from `backend/config/schema.sql`

6. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
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

The frontend will be available at `http://localhost:5173`

### Initial Setup

1. Register your first admin user:
   - You can use the backend API endpoint `POST /api/auth/register` or
   - Use the registration functionality (if added to frontend)

2. Login with your credentials to access the dashboard

## Database Schema

### Users Table
- `id` (INT, Primary Key, Auto Increment)
- `username` (VARCHAR(50), Unique)
- `password_hash` (VARCHAR(255))
- `created_at` (TIMESTAMP)

### Creators Table
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(100))
- `email` (VARCHAR(100), Unique)
- `phone` (VARCHAR(20))
- `address` (TEXT)
- `created_at` (TIMESTAMP)

### Performance Logs Table
- `id` (INT, Primary Key, Auto Increment)
- `creator_id` (INT, Foreign Key to creators)
- `provided_link` (TEXT)
- `posted_link` (TEXT)
- `views_count` (INT, Default 0)
- `date_logged` (TIMESTAMP)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Creators (Protected)
- `GET /api/creators` - Get all creators
- `GET /api/creators/:id` - Get creator by ID
- `POST /api/creators` - Create a new creator
- `PUT /api/creators/:id` - Update a creator
- `DELETE /api/creators/:id` - Delete a creator

### Performance Logs (Protected)
- `GET /api/performance/stats` - Get dashboard statistics
- `GET /api/performance` - Get all performance logs
- `GET /api/performance/:id` - Get performance log by ID
- `GET /api/performance/creator/:creatorId` - Get performance logs by creator ID
- `POST /api/performance` - Create a new performance log
- `PUT /api/performance/:id` - Update a performance log
- `DELETE /api/performance/:id` - Delete a performance log

## Future Enhancements

- **Automated View Fetching**: Integrate YouTube Data API or Meta Graph API to automatically fetch view counts
- **Sorting and Filtering**: Make table headers sortable and add date range filters
- **Export to CSV**: Add export functionality for reports
- **Edit Functionality**: Implement edit modal for performance logs
- **Add Creator Form**: UI to add new creators and performance logs
- **Responsive Design**: Enhance mobile experience

## License

ISC
