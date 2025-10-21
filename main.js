import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

const api = express();
api.use(cors());
api.use(bodyParser.json());

const SECRET_KEY = '3d335e76c29e45669e7930a5cc694fa8';

const users = [
  { id: 1, username: 'admin', password: 'admin123' },
  { id: 2, username: 'user', password: 'user123' }
];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

api.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

api.get('/api/news', authenticateToken, async (req, res) => {
  try {
    const response = await fetch('https://newsapi.org/v2/everything?q=apple&from=2025-09-24&to=2025-09-24&sortBy=popularity&apiKey=3d335e76c29e45669e7930a5cc694fa8');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news data" });
  }
});

api.listen(3500, () => {
  console.log('Proxy server with JWT running on port 3500');
});
