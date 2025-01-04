let relaxTimer = null
let contextInterval = null
let countdownInterval = null

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
  startCountdown(relaxDuration*60)
  sendResponse({success:true})
 }
 else if(msg.type==="STOP_RELAX"){
  chrome.storage.local.set({relaxModeUntil:0})
  if(relaxTimer) clearTimeout(relaxTimer)
    startCountdown(0)
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

function startCountdown(durationSec){
    let remainSec = durationSec
    let blink = false
  
    // 혹시 기존 인터벌 있으면 제거
    if(countdownInterval) clearInterval(countdownInterval)
  
    // OffscreenCanvas (128x128)
    const canvas = new OffscreenCanvas(128, 128)
    const ctx = canvas.getContext('2d')
  
    countdownInterval = setInterval(() => {
      remainSec--
      blink = !blink
  
      // 남은 분 계산
      let remainMin = Math.floor(remainSec / 60)
      if(remainMin < 0) {
        // 예: 끝나면 아이콘 메시지 제거 or 초기 아이콘 복원
        chrome.action.setIcon({ path: "icons/icon_128.png" })
        clearInterval(countdownInterval)
        return
      }
  
      // 깜박이 표현 → 언더스코어(_)
      let textToShow = remainMin
  
      // 1) 배경 지우기
      ctx.clearRect(0,0,128,128)
  
      // 2) 배경색 or 원 그리기 (원하는대로)
      ctx.fillStyle = (blink ? "#333" : "#f00")
      ctx.beginPath()
      ctx.arc(64,64,60,0,2*Math.PI)
      ctx.fill()
  
      // 3) 남은 분 텍스트
      ctx.fillStyle = (blink ? "#fee" : "#0fc")
      ctx.font = "60px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(textToShow, 64, 64)
  
      // 4) 아이콘 업데이트
      chrome.action.setIcon({
        imageData: {
          "128": ctx.getImageData(0,0,128,128)
        }
      })
    }, 1000)
  }
