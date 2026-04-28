import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'vaxnepal_token';
const ROLE_KEY = 'vaxnepal_role';
const USER_KEY = 'vaxnepal_user';

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
};

export const persistAuthStorage = (token, role, userData) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(USER_KEY, JSON.stringify(userData || {}));
};

export const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  try {
    const decoded = jwtDecode(token);
    if (!decoded?.exp) {
      return false;
    }

    return decoded.exp * 1000 <= Date.now();
  } catch (_error) {
    return true;
  }
};

export const getStoredAuthState = (initialState) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const role = localStorage.getItem(ROLE_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  if (!token || !role || isTokenExpired(token)) {
    clearAuthStorage();
    return initialState;
  }

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch (_error) {
      user = null;
    }
  }

  return {
    user,
    token,
    role,
    isAuthenticated: true,
  };
};
