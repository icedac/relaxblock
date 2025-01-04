(function(){
    let blocked=false
    let relaxMode=false
    chrome.storage.local.get(["blockedDomains","relaxModeUntil"],(res)=>{
     let domain=location.hostname.replace("www.","")
     let now=Date.now()
     relaxMode=(res.relaxModeUntil && now<res.relaxModeUntil)
     if(Array.isArray(res.blockedDomains) && res.blockedDomains.includes(domain) && !relaxMode){blockPage()}
    })
    chrome.storage.onChanged.addListener((changes,namespace)=>{
     if(changes.relaxModeUntil || changes.blockedDomains){
      let domain=location.hostname.replace("www.","")
      chrome.storage.local.get(["blockedDomains","relaxModeUntil"],(res)=>{
       let now=Date.now()
       let newRelaxMode=(res.relaxModeUntil && now<res.relaxModeUntil)
       let isBlocked=res.blockedDomains.includes(domain)&&!newRelaxMode
       if(isBlocked&&!blocked){blockPage()}
       else if(!isBlocked&&blocked){unblockPage()}
      })
     }
    })
    function blockPage(){
     blocked=true
     document.documentElement.style.filter="grayscale(100%)"
     document.body.addEventListener("click",stopEvent,true)
     document.body.addEventListener("keydown",stopEvent,true)
    }
    function unblockPage(){
     blocked=false
     document.documentElement.style.filter=""
     document.body.removeEventListener("click",stopEvent,true)
     document.body.removeEventListener("keydown",stopEvent,true)
    }
    function stopEvent(e){e.stopPropagation();e.preventDefault()}
   })()