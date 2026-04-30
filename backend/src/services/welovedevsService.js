import axios from 'axios';

const API_URL = process.env.WELOVDEVS_API_URL;
const API_KEY = process.env.WELOVDEVS_API_KEY;

export const fetchJobs = async () => {
  const response = await axios.get(`${API_URL}/jobs`, {
    headers: {
      'x-api-key': API_KEY,
    },
  });

  return response.data;
};
console.log('API_URL =', process.env.WELOVDEVS_API_URL);
console.log('API_KEY =', process.env.WELOVDEVS_API_KEY);
