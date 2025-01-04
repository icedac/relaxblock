# RelaxBlock

## Introduction
RelaxBlock is a Chrome extension that allows you to:
1. **Block specific domains** so you can’t interact with them (pages are rendered in grayscale, all clicks and key events are blocked).
2. **Enter a “Relax Mode”** for a set duration (default 30 minutes), during which all blocked domains are temporarily accessible.
3. **Import/Export** the list of blocked domains.
4. **Block the current domain** in one click from the extension popup.

## Installation
1. Clone or download this repository.
2. Go to `chrome://extensions` in your Chrome browser.
3. Enable **Developer Mode** (top-right switch).
4. Click **Load unpacked** and select this folder.  

## Usage
1. Click the extension icon to open the popup.
2. **Start Relax Mode (30 min)**: Unblock all domains for 30 minutes.
3. **Stop Relax Mode**: Immediately end Relax Mode.  
4. **Block Current Domain**: Quickly add the domain of your active tab to the block list.  

## Development & Testing
1. Install dependencies:  
   ```bash
   npm install
   ```
2. Run tests:  
   ```bash
   npm run test
   ```
3. Load the unpacked extension in Chrome to test locally.

## Publishing to Chrome Web Store
1. Zip the entire directory.
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. Submit a new item, upload the zip, and fill in all required details (icons, screenshots, description, etc.).
4. Publish and wait for the review process to complete.

### Microsoft Edge Add-ons
1. [Microsoft Edge Add-ons 등록 페이지](https://partner.microsoft.com/en-us/dashboard/microsoftedge)
2. 비슷한 절차로 확장 프로그램 zip 압축 업로드
3. 아이콘, 스크린샷, 설명 등록 후 제출
