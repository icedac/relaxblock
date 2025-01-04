let relaxTimer = null
let contextInterval = null

chrome.runtime.onInstalled.addListener(()=>{
  initStorageIfEmpty()
  createContextMenu()
})
chrome.runtime.onStartup.addListener(()=>{
  initStorageIfEmpty()
  createContextMenu()
})

function initStorageIfEmpty(){
 chrome.storage.local.get(["blockedDomains","relaxModeUntil"],(res)=>{
  if(!Array.isArray(res.blockedDomains)) chrome.storage.local.set({blockedDomains:[]})
  if(!res.relaxModeUntil) chrome.storage.local.set({relaxModeUntil:0})
 })
}

function createContextMenu(){
 chrome.contextMenus.removeAll(()=>{
   chrome.contextMenus.create({
     id: "relaxMode",
     title: "릴랙스 모드",
     contexts: ["all"]
   })
 })
 // 기존에 interval 동작 중이면 정리
 if(contextInterval) clearInterval(contextInterval)
 // 새 interval 생성
 contextInterval = setInterval(updateContextMenu, 1000)
}

// 남은 시간 계산하여 Context Menu 제목 변경
function updateContextMenu(){
 chrome.storage.local.get("relaxModeUntil",(res)=>{
   let now = Date.now()
   let until = res.relaxModeUntil || 0
   let remain = Math.max(0, until - now)
   if(remain>0){
     let seconds = Math.floor(remain / 1000)
     let mm = String(Math.floor(seconds/60)).padStart(2,"0")
     let ss = String(seconds%60).padStart(2,"0")
     let title = `릴랙스 모드 (남은시간: ${mm}:${ss})`
     chrome.contextMenus.update("relaxMode",{title})
   } else {
     chrome.contextMenus.update("relaxMode",{title:"릴랙스 모드"})
   }
 })
}

chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
 if(msg.type==="START_RELAX"){
  let now=Date.now()
  let relaxDuration=msg.duration||30
  let until=now+relaxDuration*60000
  chrome.storage.local.set({relaxModeUntil:until})
  if(relaxTimer) clearTimeout(relaxTimer)
  relaxTimer=setTimeout(()=>{
    chrome.storage.local.set({relaxModeUntil:0})
  },relaxDuration*60000)
  sendResponse({success:true})
 }
 else if(msg.type==="STOP_RELAX"){
  chrome.storage.local.set({relaxModeUntil:0})
  if(relaxTimer) clearTimeout(relaxTimer)
  sendResponse({success:true})
 }
 else if(msg.type==="GET_BLOCKED"){
  chrome.storage.local.get("blockedDomains",(res)=>{sendResponse({blocked:res.blockedDomains})})
  return true
 }
 else if(msg.type==="SET_BLOCKED"){
    chrome.storage.local.set({ blockedDomains: msg.blockedList }, () => {
        sendResponse({ success: true })
  
        // 1) Force re-check on all tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(t => {
            chrome.tabs.sendMessage(t.id, { type: "FORCE_CHECK" })
          })
        })
      })
      return true
 }
 else if(msg.type==="OPEN_OPTIONS"){
  chrome.runtime.openOptionsPage()
  sendResponse({success:true})
 }
 return true
})
