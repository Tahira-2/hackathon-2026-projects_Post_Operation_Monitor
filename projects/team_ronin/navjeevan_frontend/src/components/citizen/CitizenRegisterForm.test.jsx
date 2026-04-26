import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import CitizenRegisterForm from './CitizenRegisterForm';

vi.mock('../../api/citizenAuth', () => ({
  registerUser: vi.fn(),
}));

describe('CitizenRegisterForm', () => {
  test('shows required-field validation errors on submit', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CitizenRegisterForm />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Submit Registration' }));

    expect(await screen.findByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
    expect(screen.getByText('District is required')).toBeInTheDocument();
  });
});
