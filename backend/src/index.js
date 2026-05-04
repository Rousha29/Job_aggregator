import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

console.log('JWT_SECRET =', process.env.JWT_SECRET);
console.log('WELOVEDEVS_API_URL =', process.env.WELOVEDEVS_API_URL);

const server = app.listen(4000, () => {
  console.log('Server running on port 4000');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});