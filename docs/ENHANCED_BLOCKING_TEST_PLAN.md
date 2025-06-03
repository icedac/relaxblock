# Enhanced Full Screen Blocking Test Plan

## Overview
This test plan verifies the enhanced blocking functionality that ensures complete coverage of the entire viewport, with automatic grayscale filter and audio muting when sites are blocked or when the relax timer expires.

## Test Scenarios

### 1. Full Viewport Coverage
**Objective**: Ensure blocking overlay covers 100% of viewport

**Test Cases**:
1. **Basic Coverage**
   - Navigate to blocked site
   - Verify overlay covers entire viewport
   - Resize window and verify coverage maintains
   - Zoom in/out and verify coverage

2. **Scroll Test**
   - Navigate to long page with scroll
   - Scroll down/up
   - Verify overlay remains fixed and covers viewport

3. **Dynamic Content**
   - Visit site with popup modals
   - Visit site with sticky headers
   - Visit site with fixed sidebars
   - Verify all elements are covered

### 2. Audio/Video Muting
**Objective**: All media is muted when site is blocked

**Test Cases**:
1. **Existing Media**
   - Visit YouTube with video playing
   - Block the site
   - Verify video is paused and muted

2. **Dynamic Media**
   - Block site first
   - Navigate to site with autoplay video
   - Verify new media elements are muted

3. **Multiple Media Sources**
   - Test with multiple video/audio elements
   - Test with embedded players (Spotify, SoundCloud)

### 3. Timer Expiration Behavior
**Objective**: Immediate blocking when relax timer expires

**Test Cases**:
1. **During Video Playback**
   - Start relax mode
   - Play video on YouTube
   - Wait for timer expiration
   - Verify video stops and page becomes grayscale

2. **During Page Navigation**
   - Start relax mode
   - Navigate between pages
   - Timer expires during navigation
   - Verify new page loads blocked

3. **Notification Display**
   - Verify user sees timer expiration notice
   - Check notification is visible over blocked content

### 4. Enhanced CSS Implementation
**Objective**: Robust blocking that can't be bypassed

**Test Cases**:
1. **Z-index Testing**
   - Test with sites using high z-index values
   - Verify overlay remains on top

2. **Important Rules**
   - Test with sites using !important CSS
   - Verify blocking styles take precedence

3. **Root Element Blocking**
   - Verify HTML element has blocked-site class
   - Test pointer-events: none on root

### 5. iframe Handling
**Objective**: Block content in iframes

**Test Cases**:
1. **Same-origin iframes**
   - Test with embedded same-origin content
   - Verify blocking applies inside iframe

2. **Cross-origin iframes**
   - Test with YouTube embeds
   - Test with social media embeds
   - Verify appropriate handling

### 6. Performance Testing
**Objective**: Blocking doesn't impact performance

**Test Cases**:
1. **CPU Usage**
   - Monitor CPU with blocking active
   - Test on heavy sites (news sites with ads)

2. **Memory Usage**
   - Check for memory leaks
   - Test with long browsing sessions

## Browser Compatibility
Test on:
- Chrome (latest)
- Edge (latest)
- Different OS: Windows, macOS, Linux

## Acceptance Criteria
- [ ] Overlay covers 100% viewport in all scenarios
- [ ] No page elements can appear above overlay
- [ ] All audio/video is muted when blocked
- [ ] Timer expiration triggers immediate blocking
- [ ] Performance impact is minimal
- [ ] Works across different websites consistently

## Manual Test Steps

### Setup
1. Install extension
2. Add test domains to block list:
   - youtube.com
   - spotify.com
   - news site with videos
   - site with popups

### Test Execution
1. **Full Coverage Test**
   ```
   - Navigate to each blocked domain
   - Check: Full gray overlay visible
   - Check: Cannot click any elements
   - Check: Cannot select text
   ```

2. **Audio Test**
   ```
   - Go to YouTube
   - Start playing video
   - Add youtube.com to block list
   - Check: Video paused
   - Check: Audio stopped
   ```

3. **Timer Test**
   ```
   - Block youtube.com
   - Start 1-minute relax mode
   - Play a video
   - Wait for timer to expire
   - Check: Video stops
   - Check: Page turns gray
   - Check: Notification appears
   ```

## Automated Test Considerations
- Use Puppeteer tests from test/e2e/
- Add specific tests for audio muting
- Add viewport coverage tests
- Mock timer for faster testing