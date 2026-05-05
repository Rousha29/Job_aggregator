import axios from "axios";

const API_URL = process.env.WELOVEDEVS_API_URL ?? "https://epi-api.welovedevs.com";
const API_KEY = process.env.WELOVEDEVS_API_KEY;

const normalizedBaseUrl = API_URL.replace(/\/+$/, "");
const apiBaseUrl = normalizedBaseUrl.endsWith("/v1")
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/v1`;

// axios configurée
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "X-API-Key": API_KEY,
  },
  timeout: 5000, // évite les blocages
});

/**
 * Récupère les jobs depuis l'API
 */
export const fetchJobs = async ({ page = 0, size = 10 } = {}) => {
  try {
    const response = await apiClient.get("", {
      params: { page, size },
    });

    return response.data;
  } catch (error) {
    const status = error.response?.status;

    if (error.response?.status === 403) {
      console.error("WeLoveDevs API key rejected (403). Check WELOVEDEVS_API_KEY and request a fresh key from the official form.");
    }

    // gestion d'erreur
    console.error("WeLoveDevs API error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    const apiError = new Error("Failed to fetch jobs from WeLoveDevs API");
    apiError.status = status;
    apiError.code = error.code;
    throw apiError;
  }
};
