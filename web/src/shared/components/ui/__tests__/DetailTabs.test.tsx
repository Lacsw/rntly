import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetailTabs } from '../DetailTabs';

const tabs = [
  { id: 'overview', label: 'Overview', content: <div>overview-content</div> },
  { id: 'tenant', label: 'Tenant', content: <div>tenant-content</div> },
  { id: 'contracts', label: 'Contracts', content: <div>contracts-content</div> },
];

describe('DetailTabs', () => {
  it('renders all tab labels', () => {
    render(<DetailTabs tabs={tabs} activeId="overview" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tenant' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Contracts' })).toBeInTheDocument();
  });

  it('renders only the active tab content', () => {
    render(<DetailTabs tabs={tabs} activeId="tenant" onChange={() => {}} />);
    expect(screen.queryByText('overview-content')).not.toBeInTheDocument();
    expect(screen.getByText('tenant-content')).toBeInTheDocument();
    expect(screen.queryByText('contracts-content')).not.toBeInTheDocument();
  });

  it('marks the active tab with aria-selected', () => {
    render(<DetailTabs tabs={tabs} activeId="tenant" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Tenant' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange with tab id when a tab is clicked', async () => {
    const onChange = vi.fn();
    render(<DetailTabs tabs={tabs} activeId="overview" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Contracts' }));
    expect(onChange).toHaveBeenCalledWith('contracts');
  });

  it('falls back to the first tab when activeId does not match any tab', () => {
    render(<DetailTabs tabs={tabs} activeId="nonexistent" onChange={() => {}} />);
    expect(screen.getByText('overview-content')).toBeInTheDocument();
  });

  it('wires tabpanel to active tab via aria-labelledby', () => {
    render(<DetailTabs tabs={tabs} activeId="tenant" onChange={() => {}} />);
    const tabButton = screen.getByRole('tab', { name: 'Tenant' });
    const panel = screen.getByRole('tabpanel');
    expect(tabButton).toHaveAttribute('id');
    expect(panel).toHaveAttribute('aria-labelledby', tabButton.id);
  });

  it('uses roving tabindex so only the active tab is in the Tab sequence', () => {
    render(<DetailTabs tabs={tabs} activeId="tenant" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Tenant' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Contracts' })).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowRight moves to the next tab and calls onChange', async () => {
    const onChange = vi.fn();
    render(<DetailTabs tabs={tabs} activeId="overview" onChange={onChange} />);
    const first = screen.getByRole('tab', { name: 'Overview' });
    first.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('tenant');
  });

  it('ArrowLeft wraps from the first tab to the last', async () => {
    const onChange = vi.fn();
    render(<DetailTabs tabs={tabs} activeId="overview" onChange={onChange} />);
    screen.getByRole('tab', { name: 'Overview' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith('contracts');
  });

  it('Home jumps to the first tab, End to the last', async () => {
    const onChange = vi.fn();
    render(<DetailTabs tabs={tabs} activeId="tenant" onChange={onChange} />);
    screen.getByRole('tab', { name: 'Tenant' }).focus();
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('contracts');
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('overview');
  });
});
