import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PropertyCard } from '../PropertyCard';
import { createMockProperty } from '@/tests/msw/factories/property';

const property = createMockProperty();

const renderCard = () =>
  render(
    <MemoryRouter>
      <PropertyCard property={property} onDelete={vi.fn()} />
    </MemoryRouter>,
  );

const openMenu = () => {
  fireEvent.click(screen.getByRole('button', { name: /property actions/i }));
};

describe('PropertyCard kebab menu', () => {
  it('menu is closed by default', () => {
    renderCard();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('clicking the kebab button opens the menu', () => {
    renderCard();
    openMenu();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('clicking outside the menu closes it', () => {
    renderCard();
    openMenu();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('pressing Escape closes the menu', () => {
    renderCard();
    openMenu();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
