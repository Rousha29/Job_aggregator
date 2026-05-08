import axios from 'axios';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const fetchJobs = async (page = 0, size = 20, q = '') => {
  await delay(1000);
  const params = { page, size };
  if (q) params.q = q;

  const res = await axios.get(`${process.env.WELOVEDEVS_API_URL}/v1`, {
    params,
    headers: {
      'accept': 'application/json',
      'X-API-Key': process.env.WELOVEDEVS_API_KEY,
    }
  });
  return res.data;
};