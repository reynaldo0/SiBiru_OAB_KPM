const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('sibiru_user_id') || 'usr_mhs_01'; // Fallback demo
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Header autentikasi backend SIBIRU
  if (token) {
    headers.set('X-User-Id', token);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseText = await response.text();
  let responseData: any;
  try {
    responseData = responseText ? JSON.parse(responseText) : {};
  } catch {
    responseData = responseText;
  }

  if (!response.ok) {
    const errorMsg =
      (responseData && (responseData.detail?.message || responseData.detail || responseData.message)) ||
      `HTTP Error ${response.status}`;
    throw new ApiError(response.status, errorMsg, responseData);
  }

  return responseData as T;
}
