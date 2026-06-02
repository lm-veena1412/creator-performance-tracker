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
      console.error('Get all performance logs error:', err);
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
      console.error('Get performance log by ID error:', err);
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
      console.error('Get performance logs by creator ID error:', err);
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
      console.error('Create performance log error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ id: result.insertId, creator_id, provided_link, posted_link, views_count });
  });
};

const updatePerformanceLog = (req, res) => {
  const { id } = req.params;
  const { provided_link, posted_link, views_count } = req.body;
  
  // Notice creator_id is completely gone from this query!
  const query = 'UPDATE performance_logs SET provided_link = ?, posted_link = ?, views_count = ? WHERE id = ?';
  
  db.query(query, [provided_link, posted_link, views_count, id], (err, result) => {
    if (err) {
      console.error('Update performance log error:', err);
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
      console.error('Delete performance log error:', err);
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
    "SELECT COUNT(*) as total FROM performance_logs WHERE provided_link IS NOT NULL AND provided_link != ''",
    "SELECT COUNT(*) as total FROM performance_logs WHERE posted_link IS NOT NULL AND posted_link != ''",
    'SELECT COALESCE(SUM(views_count), 0) as total FROM performance_logs'
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
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Database error' });
  });
};

const getMonthlyStats = (req, res) => {
  const query = `
    SELECT
      DATE_FORMAT(date_logged, '%Y-%m') as month,
      COALESCE(SUM(views_count), 0) as total_views
    FROM performance_logs
    WHERE date_logged IS NOT NULL
    GROUP BY DATE_FORMAT(date_logged, '%Y-%m')
    ORDER BY month ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Monthly stats error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};
const getCreatorMonthlyDetails = (req, res) => {
  const query = `
    SELECT 
      c.id as creator_id,
      c.name as creator_name,
      DATE_FORMAT(pl.date_logged, '%Y-%m') as month,
      COALESCE(SUM(pl.views_count), 0) as total_views,
      COUNT(pl.id) as posts_count
    FROM performance_logs pl
    JOIN creators c ON pl.creator_id = c.id
    WHERE pl.date_logged IS NOT NULL
    GROUP BY c.id, c.name, DATE_FORMAT(pl.date_logged, '%Y-%m')
    ORDER BY month DESC, total_views DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Creator monthly details error:', err);
      return res.status(500).json({ message: 'Database error fetching monthly details' });
    }
    res.json(results);
  });
};

module.exports = {
  getAllPerformanceLogs,
  getPerformanceLogById,
  getPerformanceLogsByCreatorId,
  createPerformanceLog,
  updatePerformanceLog,
  deletePerformanceLog,
  getDashboardStats,
  getMonthlyStats,
  getCreatorMonthlyDetails
};
