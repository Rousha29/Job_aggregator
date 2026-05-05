import axios from 'axios';

const apiClient = axios.create({
  baseURL: "https://remotive.com/api/remote-jobs",
  timeout: 5000,
});

export const fetchRemotiveJobs = async () => {
  try {
    const response = await apiClient.get("/");
    return response.data.jobs; // Remotive renvoie { jobs: [] }
  } catch (error) {
    console.error("Remotive API error:", error.message);
    throw new Error("Failed to fetch Remotive jobs");
  }
};