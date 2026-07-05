import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const client = axios.create({ baseURL: API_BASE_URL });

function getTokens() {
  return {
    access: localStorage.getItem("gosmart_access"),
    refresh: localStorage.getItem("gosmart_refresh"),
  };
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("gosmart_access", access);
  if (refresh) localStorage.setItem("gosmart_refresh", refresh);
}

export function clearTokens() {
  localStorage.removeItem("gosmart_access");
  localStorage.removeItem("gosmart_refresh");
}

client.interceptors.request.use((config) => {
  const { access } = getTokens();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let refreshPromise = null;

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const { refresh } = getTokens();

    if (
      error.response?.status === 401 &&
      refresh &&
      !original._retry &&
      !original.url?.includes("/auth/login")
    ) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/login/refresh/`, { refresh })
            .then((res) => res.data)
            .finally(() => {
              refreshPromise = null;
            });
        }
        const data = await refreshPromise;
        setTokens({ access: data.access });
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch (refreshError) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  const firstKey = Object.keys(data)[0];
  if (firstKey) {
    const val = data[firstKey];
    const msg = Array.isArray(val) ? val[0] : val;
    return `${firstKey}: ${msg}`;
  }
  return fallback;
}

export default client;
