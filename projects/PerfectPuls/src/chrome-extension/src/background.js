// Policy Pilot Background Script - Service Worker
console.log('Policy Pilot: Background script loaded');

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/analyze';
const API_KEY = ''; // Add your API key here

// Call the analysis API
async function callAnalysisAPI(websiteData) {
  try {
    console.log('Sending data to API:', websiteData);
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` })
      },
      body: JSON.stringify(websiteData)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('API Response:', result);
    return result;
    
  } catch (error) {
    console.error('API call failed, using dummy data:', error);
    // Return dummy data for development
    return getDummyApiResponse(websiteData);
  }
}

// Dummy API response for development/fallback
function getDummyApiResponse(websiteData) {
  const siteName = websiteData.basic_info?.title || 'Health Service Provider';
  const domain = websiteData.basic_info?.domain || 'example.com';
  
  return {
    summary: `Analysis of ${siteName} shows potential insurance coverage for various health and wellness services. This provider offers services that may be partially or fully covered under different insurance plans.`,
    
    match_checklist: [
      { item: "Provider is in-network with major insurers", status: "✅", details: "Verified with Aetna, BCBS, UnitedHealth" },
      { item: "Services qualify for HSA/FSA reimbursement", status: "⚠️", details: "Physical therapy and medical massage covered" },
      { item: "Prior authorization required", status: "📋", details: "Submit PA form 48 hours before appointment" },
      { item: "Copay applies", status: "✅", details: "$25 copay for in-network services" }
    ],
    
    benefits_services: {
      service_name: "Physical Therapy & Wellness Services",
      coverage_type: "80% after deductible",
      copay: "$25 per visit"
    },

    recommendations: [
        "Based on the analysis, we recommend scheduling an appointment with this provider for your physical therapy needs.",
        "Ensure you submit the prior authorization form at least 48 hours before your visit to maximize insurance coverage.",
        "Check if pre-authorization is required for this specific service.",
        "Keep receipts for potential HSA/FSA reimbursement."
    ]
  };
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  if (message.action === 'analyze-website') {
    handleWebsiteAnalysis(message.data, sender.tab?.id)
      .then(result => {
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Analysis failed:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  } else if (message.action === 'health-website-detected') {
    // Store website info for side panel to access
    chrome.storage.local.set({
      'currentWebsiteInfo': {
        url: message.url,
        title: message.title,
        domain: message.domain,
        isHealthSite: true,
        timestamp: new Date().toISOString()
      }
    });
    sendResponse({ success: true });
  }
});

// Handle the website analysis workflow
async function handleWebsiteAnalysis(websiteData, tabId) {
  try {
    // Call API to analyze the scraped data
    const analysisResult = await callAnalysisAPI(websiteData);
    
    // Store result for side panel
    await chrome.storage.local.set({
      'analysisResult': analysisResult,
      'lastAnalysis': {
        timestamp: new Date().toISOString(),
        url: websiteData.basic_info?.url,
        tabId: tabId
      }
    });
    
    console.log('Analysis result stored:', analysisResult);
    
    return analysisResult;
    
  } catch (error) {
    console.error('Error in handleWebsiteAnalysis:', error);
    
    // Store error state for side panel to handle
    await chrome.storage.local.set({
      'analysisError': {
        message: error.message,
        timestamp: new Date().toISOString(),
        url: websiteData.basic_info?.url
      }
    });
    
    throw error;
  }
}

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Policy Pilot Extension installed');
  
  // Set up side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch(error => console.log('Side panel setup failed:', error));
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Policy Pilot Extension started');
});