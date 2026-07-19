import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get auth token from persisted Zustand store
    const authStorage = localStorage.getItem('fitai-auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const token = state?.tokens?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // Corrupt storage — proceed unauthenticated
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Single-flight refresh: concurrent 401s share one refresh request.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // Dynamic import to avoid a circular dependency (authStore imports api)
  const { useAuthStore } = await import('../store/authStore');
  const tokens = useAuthStore.getState().tokens;
  if (!tokens?.refreshToken) return null;

  try {
    // Bare axios so this request skips the interceptors above
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      { refreshToken: tokens.refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    // Backend wraps responses as { data, timestamp, path }
    const payload = res.data?.data ?? res.data;
    if (!payload?.accessToken || !payload?.refreshToken) return null;

    useAuthStore.getState().setTokens({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    });
    return payload.accessToken;
  } catch {
    return null;
  }
}

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

// Response interceptor: silent token refresh on 401, logout when refresh fails
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;
    const url = original?.url ?? '';
    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout');

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthRoute
    ) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;

      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      const { useAuthStore } = await import('../store/authStore');
      await useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
