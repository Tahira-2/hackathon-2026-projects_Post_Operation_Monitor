# Chrome Extension Setup & Testing

## Quick Setup

### 1. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select this folder: `src/chrome-extension/`
5. The extension should now be loaded

### 2. Enable Side Panel
1. Click the Policy Pilot extension icon in the toolbar
2. Or right-click the extension icon and select "Open side panel"
3. The side panel should open on the right side

### 3. Test with Backend
1. **Start your backend server first:**
   ```bash
   cd backend
   .venv\Scripts\activate
   python main.py
   ```
   Server should be running on `http://localhost:8000`

2. **Visit a health website** (or create a test page):
   - Navigate to any health/wellness website
   - Or create a simple HTML file with content like:
     ```html
     <!DOCTYPE html>
     <html>
     <head><title>Test Wellness Center</title></head>
     <body>
       <h1>Downtown Wellness Center</h1>
       <p>We offer acupuncture, massage therapy, and physical therapy services.</p>
       <ul>
         <li>Acupuncture - $120/session</li>
         <li>Deep Tissue Massage - $95/session</li>
         <li>Physical Therapy - $150/session</li>
       </ul>
     </body>
     </html>
     ```

3. **Click "Analyze Current Page"** in the side panel
4. The extension should scrape the page content and send it to your backend
5. Results should appear in the side panel

## Expected Flow

```
📱 Chrome Extension → 🌐 Website Scraping → 🤖 Backend RAG → 📊 Results Display
```

## API Format (Simplified)

The extension now expects this format from your `/api/analyze` endpoint:
```json
{
  "summary": "Analysis text...",
  "match_checklist": [
    {"item": "Service name", "status": "✅", "details": "Coverage details"}
  ],
  "benefits_services": {
    "service_name": "Acupuncture",
    "coverage_type": "80% after deductible", 
    "copay": "$25"
  },
  "recommendations": ["Tip 1", "Tip 2", "Tip 3"]
}
```

## Troubleshooting

### ❌ Extension Not Loading
- Check Chrome console for errors
- Make sure Developer mode is enabled
- Verify all files are present in chrome-extension folder

### ❌ API Connection Failed  
- Check if backend is running on `localhost:8000`
- Look at browser Network tab for failed requests
- Extension will show debug data even if API fails

### ❌ No Website Detected
- Extension looks for health keywords in page content
- Try pages with words like: acupuncture, massage, therapy, wellness, clinic

### ❌ Side Panel Won't Open
- Try clicking the extension icon
- Or right-click icon → "Open side panel"
- Check if Chrome supports side panel (Chrome 114+)

## Files Updated for New API Format

✅ **background.js**: Updated dummy response format
✅ **sidepanel.js**: Removed `feasibility` and `money_saved` display logic
✅ **API compatibility**: Extension now matches your simplified backend

## Next Steps

1. Test the full flow: Website → Extension → Backend → Results
2. Add more health keywords to content script if needed
3. Customize the UI styling in `sidepanel.css`
4. Add more detailed error handling if desired

Your extension should now work perfectly with your RAG backend! 🚀