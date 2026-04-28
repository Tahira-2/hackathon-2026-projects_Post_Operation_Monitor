# Policy Pilot Chrome Extension - Setup Guide

## Quick Setup (Ready to Use!) 🚀

### 1. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right corner)
3. Click **"Load unpacked"**
4. Select this entire `chrome-extension` folder
5. Extension will appear in your extensions list ✅

### 2. Test the Extension
1. **Visit a health/wellness website**:
   - Search "acupuncture near me" and visit a clinic website
   - Visit local gym, massage therapy, or physical therapy websites
   - Try wellness centers, yoga studios, or chiropractic sites

2. **Open the side panel**:
   - Click the Policy Pilot extension icon in Chrome toolbar (opens side panel directly)
   - Side panel opens automatically when you click the extension

3. **Analyze coverage**:
   - Side panel will show "🏥 Analyze [domain]" button for health sites
   - Click the button to scrape the page and get coverage analysis
   - Results appear immediately with coverage details

## What You'll See

### For Health Websites:
- ✅ **Analyze button enabled**: "🏥 Analyze example-clinic.com"
- 🔄 **Loading state**: Spinner during analysis
- 📊 **Results display**: Complete coverage breakdown

### For Non-Health Websites:
- ❌ **Button disabled**: "🏥 Visit a health website first"
- 💡 **Helpful tips**: Suggests types of sites to visit

## Features Overview

### 🎯 **Smart Detection**
Automatically detects health and wellness websites using keyword matching:
- Medical services (acupuncture, massage, therapy)
- Fitness (gyms, yoga, pilates)
- Wellness (spas, nutrition, mental health)

### 📱 **Clean User Experience**
- No floating buttons cluttering web pages
- All functionality contained within side panel
- Instant analysis with loading states

### 📊 **Comprehensive Results**
- **Summary**: Plain English coverage explanation
- **Checklist**: Service coverage, network status, annual limits
- **Recommendation**: High/Medium/Low feasibility with reasoning
- **Cost Breakdown**: Session costs, co-pays, insurance coverage, potential savings
- **Benefit Details**: Service type, coverage category, renewal dates

### 🔧 **Developer Friendly**
- No build tools required - pure HTML/CSS/JavaScript
- Easy to modify and extend
- Comprehensive console logging for debugging
- Works offline with dummy data for development

## File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── src/
│   ├── content.js         # Website detection & scraping
│   └── background.js      # API communication
├── sidepanel.html         # Main UI
├── js/
│   └── sidepanel.js       # UI functionality
├── styles/
│   └── sidepanel.css      # Styling
└── README.md              # This setup guide
```

## Development & Customization

### Making Changes
1. Edit any file in the extension folder
2. Go to `chrome://extensions/`
3. Click the refresh icon on Policy Pilot extension
4. Changes take effect immediately

### API Configuration
The extension is configured to work with:
- **Primary API**: `http://localhost:8000/api/analyze`
- **Fallback**: Rich dummy data for development/demo

### Adding New Health Keywords
Edit `src/content.js` and add to the `HEALTH_KEYWORDS` array:
```javascript
const HEALTH_KEYWORDS = [
  'acupuncture', 'massage', 'your-new-keyword'
];
```

## Troubleshooting

### Extension Won't Load
- Ensure "Developer mode" is enabled
- Check that you selected the correct folder
- Look for errors in Chrome's extension management page

### Button Not Appearing
- Visit a health/wellness website with relevant keywords
- Check browser console (F12) for "Policy Pilot: Health website detected"
- Try refreshing the page

### Analysis Not Working
- Ensure the Graph RAG backend is running on `http://localhost:8000`
- Extension will use dummy data if API is unavailable
- Check browser console for error messages

### Side Panel Issues
- Make sure to click the extension icon to open side panel
- Try reloading the extension if side panel doesn't appear
- Check if Chrome supports side panels (Chrome 114+)

## Next Steps

Once the extension is working:
1. **Test with various health websites** to see different coverage scenarios
2. **Set up the Graph RAG backend** for real insurance data analysis
3. **Customize the UI** by editing `styles/sidepanel.css`
4. **Add new scraping selectors** in `src/content.js` for better data extraction

## Support

For issues or questions:
- Check browser console (F12) for error messages
- Review `extension-dev.md` for technical implementation details
- Ensure Chrome version supports Manifest V3 and side panels

- **No Build Process**: Pure HTML, CSS, JavaScript - edit and reload!
- **Dummy Data**: Works without backend API for immediate testing
- **Chrome Manifest V3**: Modern extension format
- **No Dependencies**: No npm, no complex tools, just Chrome APIs

## Configuration

Edit API endpoint in `src/background.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api/analyze';
```

## Reload Extension After Changes
1. Go to `chrome://extensions/`
2. Click the reload button (🔄) on Policy Pilot card
3. Refresh any open web pages to get updated content script

---
**Perfect for Hackathon**: Fast iteration, no build tools, works immediately! 🏆  
**Team**: Policy Pilot | **Developer**: Rajan | **Status**: Ready to Use!