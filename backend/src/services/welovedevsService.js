import axios from 'axios';

const API_URL = process.env.WELOVEDEVS_API_URL;
const API_KEY = process.env.WELOVEDEVS_API_KEY;

export const fetchJobs = async () => {
  const response = await axios.get(`${API_URL}/jobs`, {
    headers: {
      'x-api-key': API_KEY,
    },
  });

  return response.data;
};
