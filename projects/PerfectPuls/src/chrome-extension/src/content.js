// Policy Pilot Content Script - Vanilla JavaScript
console.log('Policy Pilot: Content script loaded');

// Health-related keywords to identify relevant websites
const HEALTH_KEYWORDS = [
  'appointment', 'treatment', 'therapy', 'massage', 'chiropractic', 
  'acupuncture', 'physiotherapy', 'counseling', 'nutrition', 'wellness',
  'fitness', 'gym', 'yoga', 'meditation', 'clinic', 'doctor', 'health',
  'medical', 'dental', 'vision', 'mental health', 'alternative medicine'
];

// Check if current website is health-related
function isHealthWebsite() {
  const pageText = document.body.innerText.toLowerCase();
  const pageTitle = document.title.toLowerCase();
  const url = window.location.href.toLowerCase();
  
  return HEALTH_KEYWORDS.some(keyword => 
    pageText.includes(keyword) || 
    pageTitle.includes(keyword) || 
    url.includes(keyword)
  );
}

// Simple function to scrape raw website data
function scrapeWebsiteData() {
  // Get basic page info
  const basicInfo = {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    timestamp: new Date().toISOString()
  };

  // Get all visible text from the page (clean and simple)
  const bodyText = document.body.innerText || document.body.textContent || '';
  
  // Get meta description if available
  const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  
  // Combine all text content
  const fullText = `${document.title}\n\n${metaDescription}\n\n${bodyText}`;
  
  // Return simple structure
  return {
    basic_info: basicInfo,
    page_content: fullText.trim()
  };
}

// Expose scraping functions to background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape-website') {
    try {
      const websiteData = scrapeWebsiteData();
      sendResponse({ success: true, data: websiteData });
    } catch (error) {
      console.error('Error scraping website:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open for async response
  }
});

// Initialize when page loads - just log if health website detected
function init() {
  if (isHealthWebsite()) {
    console.log('Policy Pilot: Health website detected');
    // Store website info for side panel to access
    chrome.runtime.sendMessage({
      action: 'health-website-detected',
      url: window.location.href,
      title: document.title,
      domain: window.location.hostname
    });
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}