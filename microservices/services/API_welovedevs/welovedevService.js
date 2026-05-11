import axios from "axios";

const API_URL = process.env.WELOVEDEVS_API_URL ?? "https://epi-api.welovedevs.com";
const API_KEY = process.env.WELOVEDEVS_API_KEY;
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.WELOVEDEVS_TIMEOUT_MS ?? '15000', 10);

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
  timeout: Number.isFinite(REQUEST_TIMEOUT_MS) && REQUEST_TIMEOUT_MS > 0 ? REQUEST_TIMEOUT_MS : 15000,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Récupère les jobs depuis l'API
 */
export const fetchJobs = async ({ page = 10, size = 50 } = {}) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await apiClient.get("", {
        params: { page, size },
      });

      return response.data;
    } catch (error) {
      const status = error.response?.status;

      if (status === 429 && attempt < maxAttempts) {
        const backoffMs = attempt * 3000;
        console.warn(`WeLoveDevs API rate limited, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await delay(backoffMs);
        continue;
      }

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
  }

  throw new Error("Failed to fetch jobs from WeLoveDevs API");
};
