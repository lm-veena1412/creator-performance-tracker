const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const login = (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt for username:', username);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log('User found:', results.length > 0);

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      console.log('Password match:', isMatch);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful for:', username);
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

const register = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const insertQuery = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
      db.query(insertQuery, [username, password_hash], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        const token = jwt.sign(
          { id: result.insertId, username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          token,
          user: {
            id: result.insertId,
            username
          }
        });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
};

module.exports = { login, register };
