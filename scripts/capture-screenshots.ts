import { chromium } from '@playwright/test';

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Screenshot 1: Demo page with biomarker cards
    console.log('Capturing demo page...');
    await page.goto(`${baseUrl}/demo`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'screenshots/demo-homepage.png',
      fullPage: true
    });
    
    // Screenshot 2: Trends page
    console.log('Capturing trends page...');
    await page.goto(`${baseUrl}/trends`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'screenshots/trends-page.png',
      fullPage: true
    });
    
    // Screenshot 3: Multi-biomarker mode
    console.log('Capturing multi-biomarker view...');
    await page.getByRole('button', { name: 'Multi-Biomarker' }).click();
    await page.waitForTimeout(500);
    await page.screenshot({ 
      path: 'screenshots/multi-biomarker-view.png',
      fullPage: true
    });
    
    console.log('✅ All screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
