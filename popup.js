let relaxBtn=document.getElementById("relaxBtn")
let stopRelaxBtn=document.getElementById("stopRelaxBtn")
relaxBtn.onclick=()=>{chrome.runtime.sendMessage({type:"START_RELAX",duration:30},(res)=>{})}
stopRelaxBtn.onclick=()=>{chrome.runtime.sendMessage({type:"STOP_RELAX"},(res)=>{})}
