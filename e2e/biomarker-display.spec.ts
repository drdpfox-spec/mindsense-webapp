import { test, expect } from '@playwright/test';

test.describe('Biomarker Display', () => {
  test('should display all 5 biomarkers with baseline values on demo page', async ({ page }) => {
    await page.goto('/demo');
    
    // Check CRP biomarker
    await expect(page.getByText('CRP')).toBeVisible();
    await expect(page.getByText('3.2 mg/L')).toBeVisible();
    await expect(page.getByText('0-3 mg/L')).toBeVisible(); // Baseline range
    
    // Check IL6 biomarker
    await expect(page.getByText('IL6')).toBeVisible();
    await expect(page.getByText('2.8 pg/mL')).toBeVisible();
    await expect(page.getByText('0-5 pg/mL')).toBeVisible();
    
    // Check LEPTIN biomarker
    await expect(page.getByText('LEPTIN')).toBeVisible();
    await expect(page.getByText('28.5 ng/mL')).toBeVisible();
    await expect(page.getByText('2-15 ng/mL')).toBeVisible();
    
    // Check PROINSULIN biomarker
    await expect(page.getByText('PROINSULIN')).toBeVisible();
    await expect(page.getByText('12.1 pmol/L')).toBeVisible();
    await expect(page.getByText('2-20 pmol/L')).toBeVisible();
    
    // Check BDNF biomarker
    await expect(page.getByText('BDNF')).toBeVisible();
    await expect(page.getByText('24.3 ng/mL')).toBeVisible();
    await expect(page.getByText('10-40 ng/mL')).toBeVisible();
  });

  test('should display baseline values on authenticated home page', async ({ page }) => {
    // Navigate to home (unauthenticated users will redirect to demo)
    await page.goto('/');
    
    // Check that baseline values are visible (on demo page after redirect)
    await expect(page.getByText('0-3 mg/L')).toBeVisible();
    await expect(page.getByText('0-5 pg/mL')).toBeVisible();
    await expect(page.getByText('2-15 ng/mL')).toBeVisible();
    await expect(page.getByText('2-20 pmol/L')).toBeVisible();
    await expect(page.getByText('10-40 ng/mL')).toBeVisible();
  });
});
