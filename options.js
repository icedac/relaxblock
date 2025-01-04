let domainInput=document.getElementById("domainInput")
let addBtn=document.getElementById("addBtn")
let blockedListEl=document.getElementById("blockedList")
let exportBtn=document.getElementById("exportBtn")
let importFile=document.getElementById("importFile")
function renderList(blocked){blockedListEl.innerHTML=""
 blocked.forEach((d,i)=>{let li=document.createElement("li")
  li.textContent=d
  li.onclick=()=>{blocked.splice(i,1);saveBlocked(blocked)}
  blockedListEl.appendChild(li)
 })}
function loadBlocked(){chrome.runtime.sendMessage({type:"GET_BLOCKED"},(res)=>{renderList(res.blocked)})}
function saveBlocked(blocked){chrome.runtime.sendMessage({type:"SET_BLOCKED",blockedList:blocked},()=>{renderList(blocked)})}
addBtn.onclick=()=>{let domain=domainInput.value.trim();if(domain){chrome.runtime.sendMessage({type:"GET_BLOCKED"},(res)=>{
  let newList=res.blocked
  if(!newList.includes(domain)) newList.push(domain)
  saveBlocked(newList)
  domainInput.value=""
 })}}
exportBtn.onclick=()=>{chrome.runtime.sendMessage({type:"GET_BLOCKED"},(res)=>{
 let data=JSON.stringify(res.blocked,null,2)
 let blob=new Blob([data],{type:"application/json"})
 let url=URL.createObjectURL(blob)
 let a=document.createElement("a")
 a.href=url
 a.download="blockedDomains.json"
 a.click()
 URL.revokeObjectURL(url)
})}
importFile.onchange=(e)=>{
 let file=e.target.files[0]
 if(!file)return
 let reader=new FileReader()
 reader.onload=function(event){
  try{let imported=JSON.parse(event.target.result)
   if(Array.isArray(imported)) saveBlocked(imported)
  }catch(err){}
 }
 reader.readAsText(file)
}
loadBlocked()
