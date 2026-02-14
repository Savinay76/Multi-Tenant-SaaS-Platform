const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://frontend:3000"
  ],
  credentials: true
}));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected'
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});

app.use("/api/auth", authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api', userRoutes);
app.use('/api', projectRoutes);
app.use('/api', taskRoutes);





module.exports = app;
