const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {                           
    rejectUnauthorized: false      
  }                                
});


const seedAdmin = async () => {
  try {
    console.log('Connecting to database...');
    
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Connected to database successfully');

    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
    
    await new Promise((resolve, reject) => {
      connection.query(query, ['admin', password_hash], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nYou can now login at http://localhost:5173/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    connection.end();
    console.log('Database connection closed');
  }
};

seedAdmin();
