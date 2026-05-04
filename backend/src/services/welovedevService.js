import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
  baseURL: process.env.WELOVEDEV_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.WELOVEDEV_API_KEY}`,
  }
});

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const fetchJobs = async (page = 1) => {
  await delay(1000);
  try {
    const res = await client.get('/jobs', { params: { page } });
    return res.data;
  } catch (err) {
    console.log('Status:', err.response?.status);
    console.log('URL appelée:', err.config?.url);
    console.log('Erreur:', err.response?.data);
    throw err;
  }
};