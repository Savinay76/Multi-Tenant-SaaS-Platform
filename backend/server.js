require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');
const runMigrations = require('./scripts/runMigrations');
const runSeeds = require('./scripts/runSeeds');
const { bootstrapAdmins } = require("./bootstrapAdmins");

const PORT = process.env.PORT || 5000;



async function startServer() {
  try {
    console.log('Connecting to database...');
    await pool.query('SELECT 1');

    await runMigrations();
    await runSeeds();
    await bootstrapAdmins();


    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}



startServer();
