import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware untuk parsing body request
app.use(express.urlencoded({ extended: true })); // Parsing application/x-www-form-urlencoded
app.use(express.json()); // Parsing application/json

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [process.env.ALLOWED_ORIGIN];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
}));

// Middleware akses berdasarkan hostname
app.use((req, res, next) => {
  const allowedHostname = process.env.ALLOWED_HOSTNAME;
  if (req.hostname === allowedHostname && (req.path.startsWith('/pinceng') || req.path.startsWith('/api'))) {
    next();
  } else {
    res.status(403).send('Access denied');
  }
});

const connection = new sqlite3.Database('./db/aplikasi.db');

app.get('/api/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ?`;
  connection.all(query, [req.params.id], (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.post('/api/user/:id/change-email', (req, res) => {
  const newEmail = req.body.email;
  if (!newEmail) {
    return res.status(400).send("Email is required.");
  }

  const query = `UPDATE users SET email = ? WHERE id = ?`;
  const params = [newEmail, req.params.id];

  connection.run(query, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) res.status(404).send('User not found');
    else res.status(200).send('Email updated successfully');
  });
});

app.get('/api/file', (req, res) => {
  const __filename = fileURLToPath(import.meta.url); 
  const __dirname = path.dirname(__filename); 

  const allowedFiles = ['example.txt', 'data.csv'];
  if (!allowedFiles.includes(req.query.name)) {
    return res.status(400).send('Invalid file request');
  }

  const filePath = path.join(__dirname, 'files', req.query.name);
  res.sendFile(filePath);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
