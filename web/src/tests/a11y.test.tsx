import { render, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import AppRoutes from '@/app/routes';

expect.extend(toHaveNoViolations);

describe('a11y smoke', () => {
  it('Dashboard renders with no axe-detectable violations', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
