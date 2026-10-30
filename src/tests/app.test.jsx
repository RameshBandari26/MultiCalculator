import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../App.jsx';
import { CALCULATORS } from '../calculators/index.js';

const renderAt = (path = '/') => render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>);

describe('app integration', () => {
  it('home lists every calculator and shows empty states', () => {
    renderAt('/');
    for (const c of CALCULATORS) expect(screen.getByRole('link', { name: new RegExp(c.name.replace(/[()/]/g, '.')) })).toBeInTheDocument();
    expect(screen.getByText(/No favourites yet/)).toBeInTheDocument();
    expect(screen.getByText(/No calculations yet/)).toBeInTheDocument();
    expect(screen.getByTestId('self-test')).toHaveTextContent('Self-test: 14/14 passed');
  });

  it('a calculator URL shows the result, formula and assumptions on load', () => {
    renderAt('/emi');
    expect(screen.getByTestId('main-result')).toHaveTextContent('₹16,606.68');
    expect(screen.getByText('Formula')).toBeInTheDocument();
    expect(screen.getByText(/Assumptions/)).toBeInTheDocument();
  });

  it('shows an accessible validation error instead of a result', () => {
    renderAt('/emi');
    fireEvent.change(screen.getByLabelText(/Loan amount/), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Loan amount must be greater than 0');
    expect(screen.queryByTestId('main-result')).not.toBeInTheDocument();
  });

  it('saves successful calculations to history and favourites to localStorage', () => {
    renderAt('/gst');
    fireEvent.click(screen.getByRole('button', { name: 'Calculate' }));
    fireEvent.click(screen.getByRole('button', { name: /Favourite/ }));
    expect(JSON.parse(window.localStorage.getItem('mc.hist'))[0].s).toBe('GST calculator → ₹1,180.00');
    expect(JSON.parse(window.localStorage.getItem('mc.fav'))).toEqual(['gst']);
  });

  it('home reads persisted history and favourites after a reload, and clears history', () => {
    window.localStorage.setItem('mc.fav', JSON.stringify(['sip']));
    window.localStorage.setItem('mc.hist', JSON.stringify([{ id: 'emi', s: 'Loan EMI → ₹16,606.68' }]));
    renderAt('/');
    expect(screen.getByText('Loan EMI → ₹16,606.68')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Favourite').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Clear history' }));
    expect(screen.getByText(/No calculations yet/)).toBeInTheDocument();
    expect(window.localStorage.getItem('mc.hist')).toBe('[]');
  });

  it('search: "18 percent of 2500" opens the percentage calculator prefilled with 450', async () => {
    renderAt('/');
    const box = screen.getByRole('combobox');
    fireEvent.change(box, { target: { value: '18 percent of 2500' } });
    expect(screen.getByRole('option', { name: /Understood: 18% of 2500/ })).toBeInTheDocument();
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(screen.getByTestId('main-result')).toHaveTextContent('450'));
    expect(screen.getByLabelText('Percentage (%)')).toHaveValue('18');
    expect(JSON.parse(window.localStorage.getItem('mc.hist'))).toHaveLength(1);
  });

  it('search: unsupported query shows an honest empty state', () => {
    renderAt('/');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'tell me a joke' } });
    expect(screen.getByRole('status')).toHaveTextContent('No matching calculator');
  });

  it('search is keyboard navigable (ArrowDown + Enter)', async () => {
    renderAt('/');
    const box = screen.getByRole('combobox');
    fireEvent.change(box, { target: { value: 'gst' } });
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(box).toHaveAttribute('aria-activedescendant', 'opt-0');
    fireEvent.keyDown(box, { key: 'Enter' });
    await waitFor(() => expect(screen.getByRole('heading', { name: 'GST calculator' })).toBeInTheDocument());
  });

  it('unknown calculator id shows a not-found state', () => {
    renderAt('/nope');
    expect(screen.getByRole('alert')).toHaveTextContent('Calculator not found');
  });

  it('theme toggle applies and persists the theme', () => {
    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: /Switch to dark theme/ }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('mc.theme')).toBe('"dark"');
  });
});
