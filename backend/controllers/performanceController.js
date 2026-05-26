const db = require('../config/database');

const getAllPerformanceLogs = (req, res) => {
  const query = `
    SELECT pl.*, c.name as creator_name 
    FROM performance_logs pl 
    JOIN creators c ON pl.creator_id = c.id 
    ORDER BY pl.date_logged DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

const getPerformanceLogById = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT pl.*, c.name as creator_name 
    FROM performance_logs pl 
    JOIN creators c ON pl.creator_id = c.id 
    WHERE pl.id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Performance log not found' });
    }
    res.json(results[0]);
  });
};

const getPerformanceLogsByCreatorId = (req, res) => {
  const { creatorId } = req.params;
  const query = `
    SELECT pl.*, c.name as creator_name 
    FROM performance_logs pl 
    JOIN creators c ON pl.creator_id = c.id 
    WHERE pl.creator_id = ? 
    ORDER BY pl.date_logged DESC
  `;
  db.query(query, [creatorId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

const createPerformanceLog = (req, res) => {
  const { creator_id, provided_link, posted_link, views_count } = req.body;
  const query = 'INSERT INTO performance_logs (creator_id, provided_link, posted_link, views_count) VALUES (?, ?, ?, ?)';
  db.query(query, [creator_id, provided_link, posted_link, views_count || 0], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ id: result.insertId, creator_id, provided_link, posted_link, views_count });
  });
};

const updatePerformanceLog = (req, res) => {
  const { id } = req.params;
  const { creator_id, provided_link, posted_link, views_count } = req.body;
  const query = 'UPDATE performance_logs SET creator_id = ?, provided_link = ?, posted_link = ?, views_count = ? WHERE id = ?';
  db.query(query, [creator_id, provided_link, posted_link, views_count, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Performance log not found' });
    }
    res.json({ message: 'Performance log updated successfully' });
  });
};

const deletePerformanceLog = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM performance_logs WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Performance log not found' });
    }
    res.json({ message: 'Performance log deleted successfully' });
  });
};

const getDashboardStats = (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total FROM creators',
    'SELECT COUNT(*) as total FROM performance_logs WHERE provided_link IS NOT NULL AND provided_link != ""',
    'SELECT COUNT(*) as total FROM performance_logs WHERE posted_link IS NOT NULL AND posted_link != ""',
    'SELECT SUM(views_count) as total FROM performance_logs'
  ];

  Promise.all(
    queries.map(query => 
      new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
          if (err) reject(err);
          else resolve(results[0].total || 0);
        });
      }))
  )
  .then(([totalCreators, totalProvidedLinks, totalPostedLinks, totalViews]) => {
    res.json({
      totalCreators,
      totalProvidedLinks,
      totalPostedLinks,
      totalViews: totalViews || 0
    });
  })
  .catch(err => {
    res.status(500).json({ message: 'Database error' });
  });
};

module.exports = {
  getAllPerformanceLogs,
  getPerformanceLogById,
  getPerformanceLogsByCreatorId,
  createPerformanceLog,
  updatePerformanceLog,
  deletePerformanceLog,
  getDashboardStats
};
