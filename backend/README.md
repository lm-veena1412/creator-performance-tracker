# Creator Performance Tracker - Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following content:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=creator_tracker
JWT_SECRET=your_secret_key_here
```

3. Set up the MySQL database:
- Open MySQL Workbench or command line
- Run the SQL commands from `config/schema.sql` to create the database and tables

4. Create the admin user:
```bash
node seed.js
```
This will create an admin user with:
- Username: admin
- Password: admin123

5. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login and get JWT token

### Creators (Protected)
- GET `/api/creators` - Get all creators
- GET `/api/creators/:id` - Get creator by ID
- POST `/api/creators` - Create a new creator
- PUT `/api/creators/:id` - Update a creator
- DELETE `/api/creators/:id` - Delete a creator

### Performance Logs (Protected)
- GET `/api/performance/stats` - Get dashboard statistics
- GET `/api/performance` - Get all performance logs
- GET `/api/performance/:id` - Get performance log by ID
- GET `/api/performance/creator/:creatorId` - Get performance logs by creator ID
- POST `/api/performance` - Create a new performance log
- PUT `/api/performance/:id` - Update a performance log
- DELETE `/api/performance/:id` - Delete a performance log

## Default Admin User

Run the seed script to create the default admin user:
```bash
node seed.js
```

This creates an admin user with:
- Username: admin
- Password: admin123

After running the script, you can login at the frontend with these credentials.
