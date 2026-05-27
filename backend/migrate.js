const mysql = require('mysql2');
const fs = require('fs');
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

const migrate = async () => {
  try {
    console.log('Connecting to database...');
    
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Connected to database successfully');

    // Read schema.sql file
    const schema = fs.readFileSync('./config/schema.sql', 'utf8');
    
    // Split by semicolon to get individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim());

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (const statement of statements) {
      if (statement.trim()) {
        await new Promise((resolve, reject) => {
          connection.query(statement, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      }
    }

    console.log('✅ Database migration completed successfully!');
    console.log('Tables have been created in your Aiven database');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    connection.end();
    console.log('Database connection closed');
  }
};

migrate();
