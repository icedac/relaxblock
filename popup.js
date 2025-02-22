// 새로 추가된 버튼들
let blockCurrentSiteBtn = document.getElementById("blockCurrentSiteBtn")
let relax60Btn = document.getElementById("relax60Btn")
let relax30Btn = document.getElementById("relax30Btn")
let relax15Btn = document.getElementById("relax15Btn")
let relax10Btn = document.getElementById("relax10Btn")
let relax5Btn = document.getElementById("relax5Btn")
let stopRelaxBtn = document.getElementById("stopRelaxBtn")
let countdownDisplay = document.getElementById("countdownDisplay")
let buttons = [ relax30Btn, relax60Btn, relax15Btn, relax10Btn, relax5Btn ];

// 도메인이 차단 목록에 있는지 판단 후, 버튼 노출 제어
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs || !tabs.length) return
  let currentUrl = tabs[0].url
  if (!currentUrl) return

  let domain = new URL(currentUrl).hostname.replace(/^www\./, "")
  // Block 버튼 라벨 표기
  blockCurrentSiteBtn.textContent = `Block Current Domain - ${domain}`

  // 실제 차단 여부 확인
  chrome.storage.local.get(["blockedDomains"], (res) => {
    let blockedDomains = res.blockedDomains || []
    let isBlocked = blockedDomains.includes(domain)

    // (2) 현재 도메인이 차단되어 있다면 -> Relax Mode 버튼 보여주기
    //     현재 도메인이 차단되어 있지 않다면 -> Relax Mode 버튼 숨기기
    let relaxContainer = document.getElementById("relaxButtonsContainer")
    if (isBlocked) {
      relaxContainer.style.display = "block"
      blockCurrentSiteBtn.style.display = "none"
    } else {
      relaxContainer.style.display = "none"
      blockCurrentSiteBtn.style.display = "block"
    }
  })
})

// (3) 현재 도메인이 블럭중이 아닐 때만 표시되는 block 버튼 기능
blockCurrentSiteBtn.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs.length) return
    let currentUrl = tabs[0].url
    if (!currentUrl) return

    let domain = new URL(currentUrl).hostname.replace(/^www\./, "")
    chrome.runtime.sendMessage({ type: "GET_BLOCKED" }, (res) => {
      let blockedList = res.blocked || []
      if (!blockedList.includes(domain)) {
        blockedList.push(domain)
        chrome.runtime.sendMessage({ type: "SET_BLOCKED", blockedList }, () => {
          alert(`"${domain}" has been added to the block list.`)
        })
      } else {
        alert(`"${domain}" is already in the block list.`)
      }
    })
  })
}

// 4가지 버튼 각각을 누르면 다른 duration(분)으로 Relax 모드 시작
relax60Btn.onclick = () => startRelax(60)  // 1시간 30분
relax30Btn.onclick = () => startRelax(30)  // 1시간 30분
relax15Btn.onclick = () => startRelax(15)
relax10Btn.onclick = () => startRelax(10)
relax5Btn.onclick = () => startRelax(5)

// Relax Mode 시작
function startRelax(durationMinutes) {
  chrome.runtime.sendMessage({
    type: "START_RELAX",
    duration: durationMinutes
  }, () => {
    // 즉시 UI 업데이트
    updateUI()
  })
}

// Relax Mode 중단
stopRelaxBtn.onclick = () => {
  chrome.runtime.sendMessage({ type: "STOP_RELAX" }, () => {
    updateUI()
  })
}

// Relax Mode 남은 시간 표시를 위해 주기적으로 UI 업데이트
let timerInterval = setInterval(updateUI, 1000)
function updateUI() {
  chrome.storage.local.get("relaxModeUntil", (res) => {
    let until = res.relaxModeUntil || 0
    let now = Date.now()
    let remain = until - now

    if (remain > 0) {
      // Relax Mode가 동작 중이면 Stop 버튼 표시
      stopRelaxBtn.style.display = "block"

      // 남은 시간 계산
      let seconds = Math.floor(remain / 1000)
      let mm = String(Math.floor(seconds / 60)).padStart(2, "0")
      let ss = String(seconds % 60).padStart(2, "0")
      countdownDisplay.textContent = `${mm}:${ss}`

      buttons.forEach(b => b.style.display = "none");
    } else {
      // Relax Mode가 꺼져 있으면 Stop 버튼 숨김
      buttons.forEach(b => b.style.display = "inline");
      stopRelaxBtn.style.display = "none"
      countdownDisplay.textContent = ""
    }
  })
}
