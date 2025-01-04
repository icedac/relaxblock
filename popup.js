let relaxBtn = document.getElementById("relaxBtn")
let blockCurrentSiteBtn = document.getElementById("blockCurrentSiteBtn")

// Interval for countdown
let timerInterval = setInterval(updateRelaxUI, 1000)

// New immediate UI update call after "START_RELAX" or "STOP_RELAX"
function updateRelaxUI(){
  chrome.storage.local.get("relaxModeUntil", (res)=>{
    let until = res.relaxModeUntil || 0
    let now = Date.now()
    let remain = until - now
    if (remain > 0) {
      let seconds = Math.floor(remain / 1000)
      let mm = String(Math.floor(seconds / 60)).padStart(2, "0")
      let ss = String(seconds % 60).padStart(2, "0")
      relaxBtn.textContent = `Stop Relax Mode - ${mm}m ${ss}s left`
    } else {
      relaxBtn.textContent = "Start Relax Mode (30 min)"
    }
  })
}

relaxBtn.onclick = () => {
  chrome.storage.local.get("relaxModeUntil", (res)=>{
    let until = res.relaxModeUntil || 0
    let now = Date.now()
    if (until > now) {
      // if active => STOP
      chrome.runtime.sendMessage({type: "STOP_RELAX"}, ()=>{
        // immediately force an update so the label changes now
        updateRelaxUI()
      })
    } else {
      // if inactive => START
      chrome.runtime.sendMessage({type: "START_RELAX", duration: 30}, ()=>{
        // immediately set label to something like 30:00
        relaxBtn.textContent = "Stop Relax Mode - 30m 00s left"
      })
    }
  })
}

// Block current domain
blockCurrentSiteBtn.onclick = () => {
  chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
    if(!tabs || !tabs.length) return
    let currentUrl = tabs[0].url
    if(!currentUrl) return
    let domain = new URL(currentUrl).hostname.replace("www.","")

    chrome.runtime.sendMessage({type:"GET_BLOCKED"}, (res) => {
      let blockedList = res.blocked || []
      if(!blockedList.includes(domain)){
        blockedList.push(domain)
        chrome.runtime.sendMessage({type:"SET_BLOCKED", blockedList}, ()=>{
          alert(`"${domain}" has been added to the block list.`)
        })
      } else {
        alert(`"${domain}" is already in the block list.`)
      }
    })
  })
}

// Update blockCurrentSiteBtn label for the active tab
chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
  if(tabs && tabs.length){
    let domain = new URL(tabs[0].url).hostname.replace("www.","")
    blockCurrentSiteBtn.textContent = `Block Current Domain - ${domain}`
  }
})
