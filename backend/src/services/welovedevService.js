import axios from 'axios';

const API_URL = process.env.WELOVEDEVS_API_URL;
const API_KEY = process.env.WELOVEDEVS_API_KEY;

export const fetchJobs = async (page = 0, size = 10) => {
  const response = await axios.get(API_URL, {
    headers: {
      'X-API-Key': API_KEY,
    },
    params: {
      page,
      size,
    },
  });

  return response.data;
};
