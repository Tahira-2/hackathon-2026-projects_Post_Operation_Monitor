// Side Panel JavaScript
console.log('Policy Pilot: Side panel loaded');

// Global variables
let analysisResult = null;
let lastAnalysis = null;
let currentWebsiteInfo = null;

// DOM elements - wrapped in DOMContentLoaded for safety
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing side panel...');
  
  const loadingEl = document.getElementById('loading');
  const noDataEl = document.getElementById('no-data');
  const resultsEl = document.getElementById('results');
  const clearBtn = document.getElementById('clear-btn');
  const analyzeBtn = document.getElementById('analyze-btn');
  const debugCard = document.getElementById('debug-card');
  const debugContent = document.getElementById('debug-content');
  const toggleDebugBtn = document.getElementById('toggle-debug');
  const debugBasic = document.getElementById('debug-basic');
  const debugContentText = document.getElementById('debug-content-text');
  
  // Verify elements exist
  console.log('Elements found:', {
    loading: !!loadingEl,
    noData: !!noDataEl,
    results: !!resultsEl,
    clearBtn: !!clearBtn,
    analyzeBtn: !!analyzeBtn,
    debugCard: !!debugCard,
    debugContent: !!debugContent,
    toggleDebugBtn: !!toggleDebugBtn,
    debugContentText: !!debugContentText
  });
  
  // Store globally for other functions
  window.policyPilotElements = {
    loadingEl,
    noDataEl,
    resultsEl,
    clearBtn,
    analyzeBtn,
    debugCard,
    debugContent,
    toggleDebugBtn,
    debugBasic,
    debugContentText
  };
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize
  loadResult();
});

// Load analysis result from storage
async function loadResult() {
  try {
    const data = await chrome.storage.local.get(['analysisResult', 'lastAnalysis', 'currentWebsiteInfo']);
    
    if (data.analysisResult) {
      analysisResult = data.analysisResult;
      lastAnalysis = data.lastAnalysis;
      displayResults();
      hideLoading();
    } else {
      hideLoading();
      showNoData();
    }
    
    // Update website info and button state
    if (data.currentWebsiteInfo) {
      currentWebsiteInfo = data.currentWebsiteInfo;
      updateAnalyzeButton();
    }
    
  } catch (error) {
    console.error('Error loading analysis result:', error);
    hideLoading();
    showNoData();
  }
}

// Display analysis results
function displayResults() {
  if (!analysisResult) {
    hideLoading();
    showNoData();
    return;
  }

  hideLoading();

  // Show last analysis info
  if (lastAnalysis) {
    const analysisInfo = document.getElementById('last-analysis');
    const url = new URL(lastAnalysis.url);
    analysisInfo.innerHTML = `
      <div class="label">Last Analysis:</div>
      <div class="url">${url.hostname}</div>
      <div>${new Date(lastAnalysis.timestamp).toLocaleString()}</div>
    `;
  }

  // Summary
  document.getElementById('summary-text').textContent = analysisResult.summary;

  // Match Checklist
  const checklistItems = document.getElementById('checklist-items');
  checklistItems.innerHTML = '';
  
  analysisResult.match_checklist.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'checklist-item';
    itemEl.innerHTML = `
      <span class="status">${item.status}</span>
      <div class="content">
        <div class="item-title">${item.item}</div>
        <div class="item-details">${item.details}</div>
      </div>
    `;
    checklistItems.appendChild(itemEl);
  });

  // Hide feasibility card (not in simplified API)
  const feasibilityCard = document.getElementById('feasibility-card');
  if (feasibilityCard) {
    feasibilityCard.style.display = 'none';
  }

  // Hide money saved card (not in simplified API)
  const savingsCard = document.getElementById('savings-card');
  if (savingsCard) {
    savingsCard.style.display = 'none';
  }

  // Benefit Details
  const benefitDetails = document.getElementById('benefit-details');
  const benefits = analysisResult.benefits_services;
  benefitDetails.innerHTML = `
    <div class="benefit-row">
      <span class="label">Service:</span>
      <span class="value">${benefits.service_name}</span>
    </div>
    <div class="benefit-row">
      <span class="label">Coverage:</span>
      <span class="value">${benefits.coverage_type}</span>
    </div>
    <div class="benefit-row">
      <span class="label">Co-pay:</span>
      <span class="value">${benefits.copay}</span>
    </div>
  `;

  // Recommendations
  const recommendationDetails = document.getElementById('recommendation-details');
  const recommendations = analysisResult.recommendations || [];
  if (recommendations.length > 0) {
    recommendationDetails.innerHTML = recommendations.map(rec => `
      <div class="recommendation-item">
        <span class="recommendation-icon">💡</span>
        <span class="recommendation-text">${rec}</span>
      </div>
    `).join('');
  } else {
    recommendationDetails.innerHTML = '<div class="no-recommendations">No specific recommendations available.</div>';
  }

  showResults();
}

// Show/hide different states
function hideLoading() {
  const { loadingEl } = window.policyPilotElements || {};
  if (loadingEl) loadingEl.style.display = 'none';
}

function showLoading() {
  const { loadingEl } = window.policyPilotElements || {};
  if (loadingEl) loadingEl.style.display = 'block';
}

function showNoData() {
  const { noDataEl, resultsEl } = window.policyPilotElements || {};
  
  if (noDataEl) {
    // Reset to original content
    noDataEl.innerHTML = `
      <div class="icon-large">🏥</div>
      <h2>Policy Pilot</h2>
      <p>Visit a health or wellness website and analyze your coverage.</p>
      <button id="analyze-btn" class="analyze-button" disabled>
        🏥 Analyze Current Page
      </button>
      <div class="tip">
        <strong>Tip:</strong> Look for services like acupuncture, massage, physical therapy, or gym memberships.
      </div>
    `;
    
    // Re-bind the analyze button since we replaced the HTML
    const newAnalyzeBtn = document.getElementById('analyze-btn');
    if (newAnalyzeBtn) {
      window.policyPilotElements.analyzeBtn = newAnalyzeBtn;
      newAnalyzeBtn.addEventListener('click', analyzeCurrentWebsite);
      updateAnalyzeButton(); // Update button state based on current website info
    }
    
    noDataEl.style.display = 'block';
  }
  
  if (resultsEl) {
    resultsEl.style.display = 'none';
  }
}

function showResults() {
  const { noDataEl, resultsEl, analyzeBtn } = window.policyPilotElements || {};
  if (noDataEl) noDataEl.style.display = 'none';
  if (resultsEl) resultsEl.style.display = 'block';
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '🏥 Analyze Current Page';
  }
}

function hideResults() {
  const { resultsEl } = window.policyPilotElements || {};
  if (resultsEl) resultsEl.style.display = 'none';
}

// Update analyze button based on current website
function updateAnalyzeButton() {
  const { analyzeBtn } = window.policyPilotElements || {};
  if (currentWebsiteInfo && analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = `🏥 Analyze ${currentWebsiteInfo.domain}`;
  } else if (analyzeBtn) {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🏥 Visit a health website first';
  }
}

// Analyze current website
function analyzeCurrentWebsite() {
  const { analyzeBtn } = window.policyPilotElements || {};
  
  if (!currentWebsiteInfo) {
    console.log('No website info available');
    alert('Please visit a health or wellness website first');
    return;
  }

  if (!analyzeBtn) {
    console.error('Analyze button not found');
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.innerHTML = '<div class="spinner-small"></div> Analyzing...';
  hideResults();
  showLoading();

  // Ask content script to scrape the current page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'scrape-website' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          resetAnalyzeButton();
          hideLoading();
          showNoData();
          return;
        }
        
        if (response?.success) {
          // Show debug data
          showDebugData(response.data);
          
          // Send scraped data to background for analysis
          chrome.runtime.sendMessage({
            action: 'analyze-website',
            data: response.data
          }, (result) => {
            if (chrome.runtime.lastError) {
              console.error('Analysis message error:', chrome.runtime.lastError);
              resetAnalyzeButton();
              hideLoading();
              showApiErrorWithDebug(); // Keep debug data visible
            }
            // Result will be handled by storage listener
          });
        } else {
          console.error('Failed to scrape website:', response?.error);
          resetAnalyzeButton();
          hideLoading();
          showNoData();
        }
      });
    } else {
      console.error('No active tab found');
      resetAnalyzeButton();
      hideLoading();
      showNoData();
    }
  });
}

function resetAnalyzeButton() {
  const { analyzeBtn } = window.policyPilotElements || {};
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '🏥 Analyze Current Page';
  }
}

// Show scraped data in debug container
function showDebugData(scrapedData) {
  const { debugCard, debugBasic, debugContentText, debugContent, toggleDebugBtn } = window.policyPilotElements || {};
  
  if (debugCard && debugBasic && debugContentText) {
    // Show the debug card
    debugCard.style.display = 'block';
    
    // Auto-expand the debug container
    if (debugContent && toggleDebugBtn) {
      debugContent.style.display = 'block';
      toggleDebugBtn.textContent = '[Hide]';
    }
    
    // Display basic info
    debugBasic.textContent = JSON.stringify(scrapedData.basic_info, null, 2);
    
    // Display page content (first 1000 chars for readability)
    const pageContent = scrapedData.page_content || '';
    const truncatedContent = pageContent.length > 1000 ? 
      pageContent.substring(0, 1000) + '\n\n... (content truncated)' : 
      pageContent;
    debugContentText.textContent = truncatedContent;
    
    console.log('Debug data displayed:', scrapedData);
  }
}

// Toggle debug container visibility
function toggleDebugContainer() {
  const { debugContent, toggleDebugBtn } = window.policyPilotElements || {};
  
  if (debugContent && toggleDebugBtn) {
    const isVisible = debugContent.style.display !== 'none';
    debugContent.style.display = isVisible ? 'none' : 'block';
    toggleDebugBtn.textContent = isVisible ? '[Show]' : '[Hide]';
  }
}

// Show API error message while keeping debug data visible
function showApiErrorWithDebug() {
  const { noDataEl, resultsEl, debugCard } = window.policyPilotElements || {};
  
  // Hide the no-data section first
  if (noDataEl) {
    noDataEl.style.display = 'none';
  }
  
  // Show results container with debug data
  if (resultsEl) {
    resultsEl.style.display = 'block';
    
    // Add error message to top of results
    const existingError = resultsEl.querySelector('.api-error-message');
    if (existingError) {
      existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'api-error-message card';
    errorDiv.style.background = '#fef2f2';
    errorDiv.style.borderColor = '#fca5a5';
    errorDiv.style.borderLeft = '4px solid #ef4444';
    errorDiv.innerHTML = `
      <h3 style="color: #dc2626;"><span class="icon">⚠️</span> API Connection Failed</h3>
      <p style="color: #dc2626; margin-bottom: 8px;">Could not connect to Graph RAG backend at localhost:8000</p>
      <p style="color: #374151; font-size: 14px;"><strong>Scraping successful!</strong> Debug data shown below.</p>
    `;
    
    resultsEl.insertBefore(errorDiv, resultsEl.firstChild);
  }
}

// Show API error message
function showApiError() {
  const { noDataEl } = window.policyPilotElements || {};
  
  if (noDataEl) {
    noDataEl.innerHTML = `
      <div class="icon-large">⚠️</div>
      <h2>API Connection Failed</h2>
      <p>Could not connect to the Graph RAG backend at localhost:8000</p>
      <p><strong>Scraping successful!</strong> Check the debug data below to see what was extracted.</p>
      <div class="tip">
        <strong>Note:</strong> The scraped data is shown in the debug container for development purposes.
      </div>
    `;
    noDataEl.style.display = 'block';
  }
}

// Clear analysis
function clearAnalysis() {
  const { debugCard } = window.policyPilotElements || {};
  
  chrome.storage.local.clear().then(() => {
    analysisResult = null;
    lastAnalysis = null;
    currentWebsiteInfo = null;
    
    // Hide debug container
    if (debugCard) {
      debugCard.style.display = 'none';
    }
    
    showNoData();
    hideLoading();
    updateAnalyzeButton();
  });
}

// Listen for storage changes (new analysis results)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.analysisResult) {
    analysisResult = changes.analysisResult.newValue;
    displayResults();
  }
  if (changes.lastAnalysis) {
    lastAnalysis = changes.lastAnalysis.newValue;
  }
  if (changes.currentWebsiteInfo) {
    currentWebsiteInfo = changes.currentWebsiteInfo.newValue;
    updateAnalyzeButton();
  }
  if (changes.analysisError) {
    console.error('Analysis error received:', changes.analysisError.newValue);
    resetAnalyzeButton();
    hideLoading();
    
    // Show both error message AND debug data
    showApiErrorWithDebug();
  }
});

// Event listeners - set up after DOM is ready
function setupEventListeners() {
  const { clearBtn, analyzeBtn, toggleDebugBtn } = window.policyPilotElements || {};
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAnalysis);
  }
  
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeCurrentWebsite);
  }
  
  if (toggleDebugBtn) {
    toggleDebugBtn.addEventListener('click', toggleDebugContainer);
  }
  
  console.log('Event listeners set up');
}