import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation', () => {
  test('should navigate between pages using bottom nav tabs', async ({ page }) => {
    // Start at demo page
    await page.goto('/demo');
    
    // Click Trends tab
    await page.getByRole('link', { name: 'Trends', exact: true }).click();
    await expect(page).toHaveURL('/trends');
    
    // Click Home tab
    await page.getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    
    // Click Device tab
    await page.getByRole('link', { name: 'Device', exact: true }).click();
    await expect(page).toHaveURL('/device');
    
    // Click Alerts tab
    await page.getByRole('link', { name: 'Alerts', exact: true }).click();
    await expect(page).toHaveURL('/alerts');
    
    // Click Journal tab
    await page.getByRole('link', { name: 'Journal', exact: true }).click();
    await expect(page).toHaveURL('/journal');
    
    // Click Meds tab
    await page.getByRole('link', { name: 'Meds', exact: true }).click();
    await expect(page).toHaveURL('/medications');
    
    // Click Insights tab
    await page.getByRole('link', { name: 'Insights', exact: true }).click();
    await expect(page).toHaveURL('/insights');
    
    // Click Appointments tab
    await page.getByRole('link', { name: 'Appointments', exact: true }).click();
    await expect(page).toHaveURL('/appointments');
    
    // Click Profile tab
    await page.getByRole('link', { name: 'Profile', exact: true }).click();
    await expect(page).toHaveURL('/profile');
  });

  test('should highlight active tab', async ({ page }) => {
    await page.goto('/trends');
    
    // Trends tab should have active styling
    const trendsTab = page.getByRole('link', { name: 'Trends', exact: true });
    await expect(trendsTab).toHaveClass(/text-primary/);
    await expect(trendsTab).toHaveClass(/border-primary/);
  });
});
