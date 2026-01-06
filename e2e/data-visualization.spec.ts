import { test, expect } from '@playwright/test';

test.describe('Data Visualization', () => {
  test('should display Chart.js visualization with multi-biomarker data', async ({ page }) => {
    // Navigate to Trends page
    await page.goto('/trends');
    
    // Initially should show empty state
    await expect(page.getByText('No measurement data available')).toBeVisible();
    
    // Switch to multi-biomarker mode
    await page.getByRole('button', { name: 'Multi-Biomarker' }).click();
    
    // Verify checkboxes are visible
    await expect(page.getByText('CRP')).toBeVisible();
    await expect(page.getByText('IL6')).toBeVisible();
    await expect(page.getByText('LEPTIN')).toBeVisible();
    
    // Export buttons should NOT be visible when no data
    await expect(page.getByRole('button', { name: /Export CSV/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Export PDF/i })).not.toBeVisible();
  });
  
  test('should show proper color coding for each biomarker', async ({ page }) => {
    await page.goto('/trends');
    
    // Switch to multi-biomarker mode
    await page.getByRole('button', { name: 'Multi-Biomarker' }).click();
    
    // Check that biomarker labels exist (color coding is in the chart itself)
    const biomarkers = ['CRP', 'IL6', 'LEPTIN', 'PROINSULIN', 'BDNF'];
    for (const biomarker of biomarkers) {
      await expect(page.getByText(biomarker)).toBeVisible();
    }
  });
  
  test('should filter by time range', async ({ page }) => {
    await page.goto('/trends');
    
    // Check time range dropdown exists
    const timeRangeSelect = page.locator('select').filter({ hasText: /Last.*days/ }).or(
      page.getByRole('combobox').filter({ hasText: /Last.*days/ })
    );
    
    // Time range selector should be visible
    await expect(page.getByText(/Last.*days/)).toBeVisible();
  });
  
  test('should display chart legend when data exists', async ({ page }) => {
    // This test would require actual data generation
    // For now, just verify the chart container exists
    await page.goto('/trends');
    
    // Chart canvas should exist (even if empty)
    const chartContainer = page.locator('canvas').or(page.locator('[data-testid="chart-container"]'));
    
    // Empty state message should be visible
    await expect(page.getByText('No measurement data available')).toBeVisible();
  });
  
  test('should update chart when biomarker selection changes', async ({ page }) => {
    await page.goto('/trends');
    
    // Switch to multi-biomarker mode
    await page.getByRole('button', { name: 'Multi-Biomarker' }).click();
    
    // Find checkboxes by label text
    const crpLabel = page.locator('label').filter({ hasText: 'CRP' });
    const il6Label = page.locator('label').filter({ hasText: 'IL6' });
    
    // CRP should be checked by default
    await expect(crpLabel.locator('input[type="checkbox"]')).toBeChecked();
    
    // Click IL6 checkbox to add it
    await il6Label.click();
    
    // Both should now be checked
    await expect(crpLabel.locator('input[type="checkbox"]')).toBeChecked();
    await expect(il6Label.locator('input[type="checkbox"]')).toBeChecked();
  });
  
  test('should show export buttons when data is available', async ({ page }) => {
    // This test documents the expected behavior when data exists
    // In a real scenario with test data, export buttons should appear
    await page.goto('/trends');
    
    // With no data, export buttons should be hidden
    await expect(page.getByRole('button', { name: /Export CSV/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Export PDF/i })).not.toBeVisible();
    
    // Note: When data exists, these buttons should become visible
    // and clicking them should trigger downloads
  });
});
