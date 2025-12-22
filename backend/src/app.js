const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: 'connected' });
});

module.exports = app;
