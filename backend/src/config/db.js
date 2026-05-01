import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'jobdb',
  password: 'pass',
  port: 5432,
});

export default pool;