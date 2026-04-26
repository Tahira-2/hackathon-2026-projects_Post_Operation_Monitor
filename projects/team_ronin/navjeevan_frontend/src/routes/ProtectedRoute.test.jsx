import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

const renderWithAuth = (authValue, role = 'user') => {
  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role={role}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized Screen</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
};

describe('ProtectedRoute', () => {
  test('redirects unauthenticated users to login', () => {
    renderWithAuth({
      isAuthenticated: false,
      role: null,
    });

    expect(screen.getByText('Login Screen')).toBeInTheDocument();
  });

  test('redirects users with wrong role to unauthorized page', () => {
    renderWithAuth({
      isAuthenticated: true,
      role: 'healthcare',
    });

    expect(screen.getByText('Unauthorized Screen')).toBeInTheDocument();
  });

  test('renders content for authenticated users with matching role', () => {
    renderWithAuth({
      isAuthenticated: true,
      role: 'user',
    });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
