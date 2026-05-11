import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { ensureDefaultAdminAccount } from './bootstrap/defaultAdmin.js';

const startServer = async () => {
  try {
    await ensureDefaultAdminAccount();

    const server = app.listen(4000, () => {
      console.log('Server running on port 4000');
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

startServer();