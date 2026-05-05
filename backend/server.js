require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'An authorization header is required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Login Route (Mock Auth)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Mock check
  if (username && password) {
    const token = jwt.sign({ username, role: 'student' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username });
  } else {
    res.status(400).json({ message: 'Username and password required' });
  }
});

// Get Notifications (Paginated & Filtered)
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const notification_type = req.query.notification_type;

    let query = 'SELECT * FROM notifications';
    let countQuery = 'SELECT COUNT(*) as total FROM notifications';
    let params = [];
    let countParams = [];

    if (notification_type && notification_type !== 'All') {
      query += ' WHERE type = ?';
      countQuery += ' WHERE type = ?';
      params.push(notification_type);
      countParams.push(notification_type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countResult] = await pool.query(countQuery, countParams);
    const totalItems = countResult[0].total;

    res.json({
      status: 'success',
      data: {
        notifications: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          totalItems,
          limit
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// Stage 6: Get Priority Inbox (Top 10 sorted by weight and recency)
// "Write code only to find top 10 notifications (DB query is not expected)"
// So we fetch all unread and sort in memory.
app.get('/api/priority-notifications', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE is_read = false');
    
    const getWeight = (type) => {
      if (type === 'Placement') return 3;
      if (type === 'Result') return 2;
      if (type === 'Event') return 1;
      return 0;
    };

    // Sort by weight (desc) then by createdAt (desc)
    const sorted = rows.sort((a, b) => {
      const weightA = getWeight(a.type);
      const weightB = getWeight(b.type);
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

    // Top N (default 10)
    const n = parseInt(req.query.n) || 10;
    const topN = sorted.slice(0, n);

    res.json({ status: 'success', data: { notifications: topN } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching priority notifications' });
  }
});

// Mark as read
app.patch('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = true WHERE id = ?', [id]);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notification' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
