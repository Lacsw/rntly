import { formatCurrency, formatDate, initials } from './format';

describe('formatCurrency', () => {
  it('formats positive whole dollars with US locale', () => {
    expect(formatCurrency(1850)).toBe('$1,850');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });

  it('rounds fractional cents to the nearest whole dollar', () => {
    expect(formatCurrency(1850.75)).toBe('$1,851');
  });
});

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    expect(formatDate('2026-04-15T00:00:00Z')).toMatch(/Apr/);
  });

  it('returns an empty string for non-date input', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('returns an empty string for empty input', () => {
    expect(formatDate('')).toBe('');
  });
});

describe('initials', () => {
  it('returns uppercased first letter of each name', () => {
    expect(initials('Sarah', 'Johnson')).toBe('SJ');
  });

  it('handles an empty first name', () => {
    expect(initials('', 'Johnson')).toBe('J');
  });

  it('handles an empty last name', () => {
    expect(initials('Sarah', '')).toBe('S');
  });

  it('returns an empty string when both names are empty', () => {
    expect(initials('', '')).toBe('');
  });
});
