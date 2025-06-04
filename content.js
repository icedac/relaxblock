(function(){
  let blocked = false;
  // const relaxMode = false; // Currently unused
  let blockOverlay = null;
  
  // 도메인 재확인용 (기존 함수와 동일하거나 비슷)
  function recheckDomain() {
    const domain = location.hostname.replace('www.','');
    chrome.storage.local.get(['blockedDomains', 'relaxModeUntil'], (res) => {
      const now = Date.now();
      const newRelaxMode = res.relaxModeUntil && now < res.relaxModeUntil;
      const isBlocked = Array.isArray(res.blockedDomains) && res.blockedDomains.includes(domain) && !newRelaxMode;
  
      if (isBlocked && !blocked) {
        blockPage();
      } else if (!isBlocked && blocked) {
        unblockPage();
      } else if (isBlocked && blocked) {
        // 이미 blocked 상태이지만,
        // 혹시 오버레이나 이벤트가 풀렸는지 다시 확인
        if(!blockOverlay || !document.body.contains(blockOverlay)){
          // 다시 blockPage() 호출
          blockPage();
        }
      }
    });
  }
  
  // 기존 blockPage
  function blockPage() {
    blocked = true;
    document.documentElement.style.filter = 'grayscale(100%)';
  
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
    blockOverlay.style.position = 'fixed';
    blockOverlay.style.top = '0';
    blockOverlay.style.left = '0';
    blockOverlay.style.width = '100%';
    blockOverlay.style.height = '100%';
    blockOverlay.style.display = 'flex';
    blockOverlay.style.alignItems = 'center';
    blockOverlay.style.justifyContent = 'center';
    blockOverlay.style.fontSize = '24px';
    blockOverlay.style.backgroundColor = 'rgba(0,0,0,0.3)';
    blockOverlay.style.color = '#fff';
    blockOverlay.style.textAlign = 'center';
    blockOverlay.style.zIndex = '999999';
  
    blockOverlay.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      chrome.runtime.sendMessage({type: 'OPEN_OPTIONS'});
    }, true);
  
    document.body.appendChild(blockOverlay);
  }
  
  // 기존 unblockPage
  function unblockPage() {
    blocked = false;
    document.documentElement.style.filter = '';
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
  }
  
  function stopEvent(e){
    e.stopPropagation();
    e.preventDefault();
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
  
})();
  