import { test, expect } from '@playwright/test';

test.describe('Trends Page', () => {
  test('should display filter buttons', async ({ page }) => {
    await page.goto('/trends');
    
    // Check filter buttons are visible
    await expect(page.getByRole('button', { name: 'Compare Periods' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Single Biomarker' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Multi-Biomarker' })).toBeVisible();
  });

  test('should switch to multi-biomarker mode', async ({ page }) => {
    await page.goto('/trends');
    
    // Click Multi-Biomarker button
    await page.getByRole('button', { name: 'Multi-Biomarker' }).click();
    
    // Check that biomarker checkboxes appear
    await expect(page.getByText('CRP')).toBeVisible();
    await expect(page.getByText('IL6')).toBeVisible();
    await expect(page.getByText('LEPTIN')).toBeVisible();
    await expect(page.getByText('PROINSULIN')).toBeVisible();
    await expect(page.getByText('BDNF')).toBeVisible();
  });

  test('should display empty state when no data available', async ({ page }) => {
    await page.goto('/trends');
    
    // Check for empty state message
    await expect(page.getByText('No measurement data available')).toBeVisible();
  });

  test('should have back button', async ({ page }) => {
    await page.goto('/trends');
    
    // Check back button exists
    const backButton = page.getByRole('button', { name: 'Back' });
    await expect(backButton).toBeVisible();
    
    // Click back button
    await backButton.click();
    
    // Should navigate to home page (which redirects to demo for unauthenticated users)
    await expect(page).toHaveURL('/demo');
  });
});
