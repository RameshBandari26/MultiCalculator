import { test, expect } from '@playwright/test';

test('home loads with all calculators and passing self-test', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Master Calculator' })).toBeVisible();
  await expect(page.getByTestId('self-test')).toContainText('14/14 passed');
});

test('legacy #emi links and direct calculator URLs work', async ({ page }) => {
  await page.goto('/#emi');
  await expect(page.getByTestId('main-result')).toHaveText('₹16,606.68');
  await page.goto('/#/gst');
  await expect(page.getByTestId('main-result')).toHaveText('₹1,180.00');
});

test('search intent prefills and calculates', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox').fill('increase 2500 by 18 percent');
  await page.getByRole('combobox').press('Enter');
  await expect(page.getByTestId('main-result')).toHaveText('2,950');
});

test('invalid input shows an error and no result', async ({ page }) => {
  await page.goto('/#/emi');
  await page.getByLabel(/Loan amount/).fill('-5');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await expect(page.getByRole('alert')).toContainText('Loan amount must be greater than 0');
});

test('history, favourites and theme survive a reload', async ({ page }) => {
  await page.goto('/#/sip');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await page.getByRole('button', { name: /Favourite/ }).click();
  await page.getByRole('button', { name: /Switch to dark theme/ }).click();
  await page.goto('/');
  await page.reload();
  await expect(page.getByText(/SIP projection → ₹11,61,695.38/)).toBeVisible();
  await expect(page.getByLabel('Favourite')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('mobile viewport has no horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto('/#/pricing-flow');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
