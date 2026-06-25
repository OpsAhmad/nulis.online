const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Helper to get the saved authorization token
 */
export const getToken = () => localStorage.getItem('nulis_token');

/**
 * Save token and user details
 */
export const saveAuth = (token, user) => {
  localStorage.setItem('nulis_token', token);
  localStorage.setItem('nulis_user', JSON.stringify(user));
};

/**
 * Remove authorization tokens
 */
export const clearAuth = () => {
  localStorage.removeItem('nulis_token');
  localStorage.removeItem('nulis_user');
};

/**
 * Get current saved user
 */
export const getSavedUser = () => {
  const user = localStorage.getItem('nulis_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Fetch wrapper that automatically adds Auth headers
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Log out user if token is expired/invalid (401)
    if (response.status === 401 && token) {
      clearAuth();
      window.dispatchEvent(new Event('auth-change'));
      window.location.href = '/login';
      return { error: 'Session expired. Please log in again.' };
    }

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Something went wrong', errors: data.errors || null, status: response.status };
    }

    return { data, error: null };
  } catch (err) {
    console.error('API Request Failure:', err);
    return { error: 'Network error. Please make sure the backend is running.', errors: null };
  }
}

export const api = {
  // Auth endpoints
  getChallenge: () => request('/challenge'),
  login: (payload) => request('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  register: (payload) => request('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  logout: () => {
    const res = request('/logout', { method: 'POST' });
    clearAuth();
    window.dispatchEvent(new Event('auth-change'));
    return res;
  },
  getMe: () => request('/me'),

  // Articles
  getArticles: (page = 1) => request(`/articles?page=${page}`),
  getFollowingArticles: (page = 1) => request(`/articles/feed/following?page=${page}`),
  getArticle: (slug, source = null) => {
    const query = source ? `?source=${source}` : '';
    return request(`/articles/${slug}${query}`);
  },
  createArticle: (payload) => request('/articles', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateArticle: (id, payload) => request(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  uploadImage: (formData) => request('/articles/upload', {
    method: 'POST',
    body: formData,
  }),

  // Users & Profiles
  getUserProfile: (id) => request(`/users/${id}`),
  updateProfile: (payload) => {
    const res = request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    // Update stored user details if it succeeded
    res.then(outcome => {
      if (outcome.data && outcome.data.user) {
        localStorage.setItem('nulis_user', JSON.stringify(outcome.data.user));
        window.dispatchEvent(new Event('auth-change'));
      }
    });
    return res;
  },
  toggleFollow: (id) => request(`/users/${id}/follow`, { method: 'POST' }),

  // Analytics
  getAnalytics: () => request('/user/analytics'),
};
