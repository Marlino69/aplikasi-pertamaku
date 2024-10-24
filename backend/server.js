import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const allowedOrigins = ['http://20.11.65.60', 'http://20.11.65.60/pinceng'];

app.use(cors({
  origin: function (origin, callback) {
    // Cek apakah origin diperbolehkan
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
}));

// Middleware untuk membatasi akses hanya ke /pinceng subdomain
app.use((req, res, next) => {
  if (req.hostname === '20.11.65.60' && req.path.startsWith('/pinceng')) {
    next(); // Izinkan akses
  } else {
    res.status(403).send('Access denied');
  }
});


const connection = new sqlite3.Database('./db/aplikasi.db')

app.get('/api/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ?`; // Query diubah menjadi prepared statement
  connection.all(query, [req.params.id], (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.post('/api/user/:id/change-email', (req, res) => {
  const newEmail = req.body.email;
  const query = `UPDATE users SET email = ? WHERE id = ?`; // Query diubah menjadi prepared statement
  
  connection.run(query, [newEmail, req.params.id], function (err) {
    if (err) throw err;
    if (this.changes === 0 ) res.status(404).send('User not found');
    else res.status(200).send('Email updated successfully');
  });
});


app.get('/api/file', (req, res) => {
  const __filename = fileURLToPath(import.meta.url); 
  const __dirname = path.dirname(__filename); 

  const allowedFiles = ['example.txt', 'data.csv'];  // Menambahkan whitelist file yang dapat diakses
  if (!allowedFiles.includes(req.query.name)) {
    return res.status(400).send('Invalid file request');
  }

  const filePath = path.join(__dirname, 'files', req.query.name);
  res.sendFile(filePath);
});


app.listen(3000, () => {
  console.log('Server running on port 3000');
});
