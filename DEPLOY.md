# RelaxBlock Extension Deployment Guide

## Quick Deploy Steps

### 1. Build the Extension
```bash
npm run build
# This creates build/relaxblock.zip
```

### 2. Chrome Web Store Deployment

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
2. Click "New Item" or update existing item
3. Upload `build/relaxblock.zip`
4. Fill in required store listing details:
   - Description (Korean): "차단 도메인을 효율적으로 관리하고, 원하는 시간 동안 잠시 해제하는 기능을 제공."
   - Category: Productivity
   - Language: Korean (primary)
5. Add screenshots (1280x800 or 640x400)
6. Submit for review

### 3. Manual Installation (for testing)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project directory (not the zip)

## Pre-deployment Checklist

- [x] Run tests: `npm test`
- [x] Run linter: `npm run lint`
- [x] Build package: `npm run build`
- [x] Version in manifest.json: 1.0.1
- [x] Extension size: ~14KB (well under 2MB limit)

## What's Included

- Background service worker for domain blocking
- Enhanced full-screen blocking with audio muting
- Popup UI for quick controls
- Options page for domain management
- Content script for page blocking

## Notes

- Extension uses Manifest V3
- All required permissions are declared
- No external dependencies or API calls
- Privacy-focused (no data collection)