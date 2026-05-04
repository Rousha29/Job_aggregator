import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

console.log('JWT_SECRET =', process.env.JWT_SECRET);
console.log('WELOVEDEVS_API_URL =', process.env.WELOVEDEVS_API_URL);

app.listen(4000, () => {
  console.log('Server running on port 4000');
});