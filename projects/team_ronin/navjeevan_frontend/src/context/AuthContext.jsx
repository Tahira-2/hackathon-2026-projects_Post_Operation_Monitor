import { createContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthStorage, getStoredAuthState, persistAuthStorage } from '../utils/authStorage';

const initialAuthState = {
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
};

export const AuthContext = createContext({
  ...initialAuthState,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(() => getStoredAuthState(initialAuthState));

  const login = (token, role, userData) => {
    persistAuthStorage(token, role, userData);

    setAuthState({
      user: userData || null,
      token,
      role,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    clearAuthStorage();

    setAuthState(initialAuthState);

    navigate('/login');
  };

  const value = useMemo(
    () => ({
      ...authState,
      login,
      logout,
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
