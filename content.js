(function(){
    let blocked = false
    let relaxMode = false
    let blockOverlay = null
  
    // Re-check domain logic for storage changes or forced re-check
    function recheckDomain() {
      let domain = location.hostname.replace("www.","")
      chrome.storage.local.get(["blockedDomains", "relaxModeUntil"], (res) => {
        let now = Date.now()
        let newRelaxMode = (res.relaxModeUntil && now < res.relaxModeUntil)
        let isBlocked = Array.isArray(res.blockedDomains) && res.blockedDomains.includes(domain) && !newRelaxMode
        if (isBlocked && !blocked) {
          blockPage()
        } else if (!isBlocked && blocked) {
          unblockPage()
        }
      })
    }
  
    chrome.storage.local.get(["blockedDomains","relaxModeUntil"], (res) => {
      let now = Date.now()
      let domain = location.hostname.replace("www.","")
      relaxMode = (res.relaxModeUntil && now < res.relaxModeUntil)
      if (Array.isArray(res.blockedDomains) && res.blockedDomains.includes(domain) && !relaxMode) {
        blockPage()
      }
    })
  
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.relaxModeUntil || changes.blockedDomains) {
        recheckDomain()
      }
    })
  
    // 2) NEW: handle forced re-check
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "FORCE_CHECK") {
        recheckDomain()
      }
    })
  
    function blockPage(){
      blocked = true
      document.documentElement.style.filter = "grayscale(100%)"
  
      // block all interactions
      document.body.addEventListener("click", stopEvent, true)
      document.body.addEventListener("keydown", stopEvent, true)
      document.body.addEventListener("wheel", stopEvent, { capture: true, passive: false })
      document.body.addEventListener("mousedown", stopEvent, true)
      document.body.addEventListener("auxclick", stopEvent, true)
      window.addEventListener("popstate", stopEvent, true)
  
      // overlay to show "blocked"
      blockOverlay = document.createElement("div")
      blockOverlay.innerText = "This site is blocked. (Double-click to open options)"
      blockOverlay.style.position = "fixed"
      blockOverlay.style.top = "0"
      blockOverlay.style.left = "0"
      blockOverlay.style.width = "100%"
      blockOverlay.style.height = "100%"
      blockOverlay.style.display = "flex"
      blockOverlay.style.alignItems = "center"
      blockOverlay.style.justifyContent = "center"
      blockOverlay.style.fontSize = "24px"
      blockOverlay.style.backgroundColor = "rgba(0,0,0,0.3)"
      blockOverlay.style.color = "#fff"
      blockOverlay.style.textAlign = "center"
      blockOverlay.style.zIndex = "999999"
  
      // double-click => openOptions
      blockOverlay.addEventListener("dblclick",(e)=>{
        e.preventDefault()
        e.stopPropagation()
        chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" })
      }, true)
  
      document.body.appendChild(blockOverlay)
    }
  
    function unblockPage(){
      blocked = false
      document.documentElement.style.filter = ""
      document.body.removeEventListener("click", stopEvent, true)
      document.body.removeEventListener("keydown", stopEvent, true)
      document.body.removeEventListener("wheel", stopEvent, { capture: true })
      document.body.removeEventListener("mousedown", stopEvent, true)
      document.body.removeEventListener("auxclick", stopEvent, true)
      window.removeEventListener("popstate", stopEvent, true)
  
      if (blockOverlay){
        blockOverlay.remove()
        blockOverlay = null
      }
    }
  
    function stopEvent(e){
      e.stopPropagation()
      e.preventDefault()
    }
  })()
  