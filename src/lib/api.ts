// API configuration for backend requests
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export { API_BASE_URL };

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith("/")
    ? `${API_BASE_URL}${endpoint}`
    : `${API_BASE_URL}/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response;
}

export async function apiCallWithAuth(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const finalToken = token || localStorage.getItem("token");

  return apiCall(endpoint, {
    ...options,
    headers: {
      Authorization: finalToken ? `Bearer ${finalToken}` : "",
      ...options.headers,
    },
  });
}
