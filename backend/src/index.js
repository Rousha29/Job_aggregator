import 'dotenv/config'

console.log('JWT_SECRET =', process.env.JWT_SECRET);
console.log('API_URL =', process.env.API_URL);

import app from './app.js';

app.listen(4000, () => {
  console.log('Server running on port 4000');
});