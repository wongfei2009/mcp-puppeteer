#!/usr/bin/env node

// Simple test script to verify connection to Chrome
import puppeteer from 'puppeteer';

async function main() {
  console.log('Starting test script');
  
  try {
    console.log('Attempting to connect to Chrome at http://localhost:9222');
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: null
    });
    
    console.log('Successfully connected to Chrome');
    
    const pages = await browser.pages();
    console.log(`Found ${pages.length} pages`);
    
    if (pages.length > 0) {
      console.log('First page URL:', pages[0].url());
    } else {
      console.log('Creating a new page');
      const page = await browser.newPage();
      await page.goto('https://example.com');
      console.log('Navigated to example.com');
    }
    
    console.log('Disconnecting from browser');
    await browser.disconnect();
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

main().catch(console.error);
