const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "tarif-evim-access-token";
const REFRESH_TOKEN_KEY = "tarif-evim-refresh-token";

const buildUrl = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = API_BASE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
};

const parseJson = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY) || "",
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY) || "",
  setTokens: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

const refreshAccessToken = async () => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(buildUrl("/auth/refresh-token"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const body = await parseJson(response);
  if (!response.ok || !body?.accessToken) return null;

  tokenStorage.setTokens({ accessToken: body.accessToken });
  return body.accessToken;
};

export const apiRequest = async (
  path,
  { method = "GET", data, headers = {}, auth = false, retry = true } = {},
) => {
  const reqHeaders = { ...headers };

  if (typeof data !== "undefined" && !reqHeaders["Content-Type"]) {
    reqHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      reqHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: reqHeaders,
    body: typeof data !== "undefined" ? JSON.stringify(data) : undefined,
  });

  if (response.status === 401 && auth && retry) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiRequest(path, { method, data, headers, auth, retry: false });
    }
    tokenStorage.clear();
  }

  const body = await parseJson(response);

  if (!response.ok) {
    const error = new Error(body?.message || "Istek basarisiz");
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
};

export const apiClient = {
  get: (path, options = {}) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, data, options = {}) => apiRequest(path, { ...options, method: "POST", data }),
  put: (path, data, options = {}) => apiRequest(path, { ...options, method: "PUT", data }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: "DELETE" }),
};
