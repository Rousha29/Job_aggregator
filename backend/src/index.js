import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const server = app.listen(4000, () => {
  console.log('Server running on port 4000');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});