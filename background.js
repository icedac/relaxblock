let relaxTimer = null
chrome.runtime.onInstalled.addListener(()=>{initStorageIfEmpty()})
chrome.runtime.onStartup.addListener(()=>{initStorageIfEmpty()})
function initStorageIfEmpty(){
 chrome.storage.local.get(["blockedDomains","relaxModeUntil"],(res)=>{
  if(!Array.isArray(res.blockedDomains)) chrome.storage.local.set({blockedDomains:[]})
  if(!res.relaxModeUntil) chrome.storage.local.set({relaxModeUntil:0})
 })
}
chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
 if(msg.type==="START_RELAX"){
  let now=Date.now()
  let relaxDuration=msg.duration||30
  let until=now+relaxDuration*60000
  chrome.storage.local.set({relaxModeUntil:until})
  if(relaxTimer) clearTimeout(relaxTimer)
  relaxTimer=setTimeout(()=>{chrome.storage.local.set({relaxModeUntil:0})},relaxDuration*60000)
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
  chrome.storage.local.set({blockedDomains:msg.blockedList},()=>{sendResponse({success:true})})
  return true
 }
 return true
})
