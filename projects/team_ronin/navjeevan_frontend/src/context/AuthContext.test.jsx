import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from './AuthContext';

const createTokenWithExp = (exp) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp }));
  return `${header}.${payload}.signature`;
};

function AuthStateProbe() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{auth.isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="auth-role">{auth.role || 'none'}</span>
    </div>
  );
}

describe('AuthProvider token handling', () => {
  test('clears expired stored token state on startup', () => {
    localStorage.setItem('vaxnepal_token', createTokenWithExp(Math.floor(Date.now() / 1000) - 30));
    localStorage.setItem('vaxnepal_role', 'user');
    localStorage.setItem('vaxnepal_user', JSON.stringify({ name: 'Old User' }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthStateProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('no');
    expect(localStorage.getItem('vaxnepal_token')).toBeNull();
  });

  test('keeps valid token state on startup', () => {
    localStorage.setItem('vaxnepal_token', createTokenWithExp(Math.floor(Date.now() / 1000) + 1200));
    localStorage.setItem('vaxnepal_role', 'healthcare');
    localStorage.setItem('vaxnepal_user', JSON.stringify({ name: 'Valid User' }));

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthStateProbe />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('yes');
    expect(screen.getByTestId('auth-role')).toHaveTextContent('healthcare');
  });
});
