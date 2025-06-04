(function(){
  let blocked = false;
  let relaxMode = false;
  let blockOverlay = null;
  let mediaObserver = null;
  const mutedElements = new WeakSet();
  let blockPageFn, unblockPageFn;
  
  // Enhanced domain checking with timer expiration handling
  function recheckDomain() {
    const domain = location.hostname.replace('www.','');
    chrome.storage.local.get(['blockedDomains', 'relaxModeUntil'], (res) => {
      const now = Date.now();
      const previousRelaxMode = relaxMode;
      relaxMode = res.relaxModeUntil && now < res.relaxModeUntil;
      const isBlocked = Array.isArray(res.blockedDomains) && res.blockedDomains.includes(domain) && !relaxMode;
  
      // Check if relax mode just expired
      if (previousRelaxMode && !relaxMode && res.blockedDomains && res.blockedDomains.includes(domain)) {
        showTimerExpiredNotification();
        blockPageFn();
      } else if (isBlocked && !blocked) {
        blockPageFn();
      } else if (!isBlocked && blocked) {
        unblockPageFn();
      } else if (isBlocked && blocked) {
        // Re-apply blocking if overlay was removed
        if(!blockOverlay || !document.body.contains(blockOverlay)){
          blockPageFn();
        }
      }
    });
  }
  
  // Enhanced blockPage with full coverage
  function blockPage() {
    blocked = true;
    
    // Apply grayscale and blocking to root element
    document.documentElement.classList.add('blocked-site');
    document.documentElement.style.cssText = `
      filter: grayscale(100%) !important;
      pointer-events: none !important;
      user-select: none !important;
    `;
  
    // 혹시 기존에 리스너가 풀렸다면 다시 등록
    document.body.addEventListener('click', stopEvent, true);
    document.body.addEventListener('keydown', stopEvent, true);
    document.body.addEventListener('wheel', stopEvent, { capture: true, passive: false });
    document.body.addEventListener('mousedown', stopEvent, true);
    document.body.addEventListener('auxclick', stopEvent, true);
    window.addEventListener('popstate', stopEvent, true);
  
    // 오버레이 다시 만들거나 재할당
    if(blockOverlay) {blockOverlay.remove();}
    blockOverlay = document.createElement('div');
    blockOverlay.innerText = 'This site is blocked. (Double-click to open options)';
    blockOverlay.className = 'block-overlay';
    blockOverlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 24px !important;
      background-color: rgba(0,0,0,0.3) !important;
      color: #fff !important;
      text-align: center !important;
      z-index: 2147483647 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    `;
  
    blockOverlay.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({type: 'OPEN_OPTIONS'});
    }, true);
  
    document.body.appendChild(blockOverlay);
    
    // Mute all media elements
    muteAllMedia();
  }
  
  // Enhanced unblockPage
  function unblockPage() {
    blocked = false;
    document.documentElement.classList.remove('blocked-site');
    document.documentElement.style.cssText = '';
    document.body.removeEventListener('click', stopEvent, true);
    document.body.removeEventListener('keydown', stopEvent, true);
    document.body.removeEventListener('wheel', stopEvent, { capture: true });
    document.body.removeEventListener('mousedown', stopEvent, true);
    document.body.removeEventListener('auxclick', stopEvent, true);
    window.removeEventListener('popstate', stopEvent, true);
  
    if(blockOverlay){
      blockOverlay.remove();
      blockOverlay = null;
    }
    
    // Stop media observer
    if(mediaObserver) {
      mediaObserver.disconnect();
      mediaObserver = null;
    }
    
    // Unmute previously muted elements (optional)
    // Note: We don't unmute because user might have muted them intentionally
  }
  
  function stopEvent(e){
    e.stopPropagation();
    e.preventDefault();
  }
  
  // Mute all audio/video elements
  function muteAllMedia() {
    // Mute existing media elements
    document.querySelectorAll('audio, video').forEach(media => {
      media.muted = true;
      media.pause();
      mutedElements.add(media);
    });
    
    // Monitor for new media elements
    if(mediaObserver) {mediaObserver.disconnect();}
    
    mediaObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if(node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO') {
            node.muted = true;
            node.pause();
            mutedElements.add(node);
          }
          // Check descendants
          if(node.querySelectorAll) {
            node.querySelectorAll('audio, video').forEach(media => {
              media.muted = true;
              media.pause();
              mutedElements.add(media);
            });
          }
        });
      });
    });
    
    mediaObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Show notification when timer expires
  function showTimerExpiredNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background-color: #ff4444 !important;
      color: white !important;
      padding: 20px 40px !important;
      border-radius: 8px !important;
      font-size: 20px !important;
      font-weight: bold !important;
      z-index: 2147483647 !important;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
      animation: fadeInOut 3s ease-in-out !important;
    `;
    notification.textContent = 'Relax time expired! Site is now blocked.';
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 3000);
  }
  
  // Handle iframe context
  function isInIframe() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
  
  // In main frame, send messages to iframes
  function notifyIframes(shouldBlock) {
    if (!isInIframe()) {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        try {
          iframe.contentWindow.postMessage({
            type: shouldBlock ? 'RELAXBLOCK_IFRAME_BLOCK' : 'RELAXBLOCK_IFRAME_UNBLOCK'
          }, '*');
        } catch (e) {
          // Cross-origin iframe, can't communicate
        }
      });
    }
  }
  
  // Create wrapper functions for iframe support
  function blockPageWithIframes() {
    blockPage();
    notifyIframes(true);
  }
  
  function unblockPageWithIframes() {
    unblockPage();
    notifyIframes(false);
  }
  
  // Setup proper function references
  if (isInIframe()) {
    // In iframe context, we need to communicate with parent
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'RELAXBLOCK_IFRAME_BLOCK') {
        blockPage();
      } else if (event.data && event.data.type === 'RELAXBLOCK_IFRAME_UNBLOCK') {
        unblockPage();
      }
    });
    blockPageFn = blockPage;
    unblockPageFn = unblockPage;
  } else {
    // In main frame, use wrapper functions
    blockPageFn = blockPageWithIframes;
    unblockPageFn = unblockPageWithIframes;
  }
  
  // 처음 로딩 시점에 도메인 체크
  recheckDomain();
  
  // storage 변화 감지
  chrome.storage.onChanged.addListener((changes, _namespace) => {
    if(changes.relaxModeUntil || changes.blockedDomains){
      recheckDomain();
    }
  });
  
  // ------------------------------
  // [추가 1] 페이지 로드 완료 시 재확인
  // ------------------------------
  window.addEventListener('load', () => {
    recheckDomain();
  });
  
  // ------------------------------
  // [추가 2] DOM 변경 감시 (MutationObserver)
  // ------------------------------
  const observer = new MutationObserver(() => {
    // DOM에 변화 발생 시 재확인
    recheckDomain();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Check timer status every second
  setInterval(recheckDomain, 1000);

})();