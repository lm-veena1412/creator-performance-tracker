const db = require('../config/database');

const getAllCreators = (req, res) => {
  const query = 'SELECT * FROM creators ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

const getCreatorById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM creators WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    res.json(results[0]);
  });
};

const createCreator = (req, res) => {
  const { name, email, phone, address } = req.body;
  const query = 'INSERT INTO creators (name, email, phone, address) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, phone, address], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ id: result.insertId, name, email, phone, address });
  });
};

const updateCreator = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  const query = 'UPDATE creators SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?';
  db.query(query, [name, email, phone, address, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    res.json({ message: 'Creator updated successfully' });
  });
};

const deleteCreator = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM creators WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Creator not found' });
    }
    res.json({ message: 'Creator deleted successfully' });
  });
};

module.exports = {
  getAllCreators,
  getCreatorById,
  createCreator,
  updateCreator,
  deleteCreator
};
