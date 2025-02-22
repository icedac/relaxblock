let domainInput = document.getElementById("domainInput")
let addBtn = document.getElementById("addBtn")
let blockedListEl = document.getElementById("blockedList")
let exportBtn = document.getElementById("exportBtn")
let importFile = document.getElementById("importFile")

function renderList(blocked) {
  blockedListEl.innerHTML = ""
  blocked.forEach((d, i) => {
    let li = document.createElement("li")

    // 도메인 텍스트
    let spanDomain = document.createElement("span")
    spanDomain.textContent = d

    // 차단 해제 버튼
    let unblockBtn = document.createElement("button")
    unblockBtn.textContent = "차단 해제"
    unblockBtn.style.marginLeft = "10px"
    unblockBtn.onclick = () => {
      blocked.splice(i, 1)
      saveBlocked(blocked)
    }

    li.appendChild(spanDomain)
    li.appendChild(unblockBtn)
    blockedListEl.appendChild(li)
  })
}

function loadBlocked() {
  chrome.runtime.sendMessage({ type: "GET_BLOCKED" }, (res) => {
    renderList(res.blocked)
  })
}

function saveBlocked(blocked) {
  chrome.runtime.sendMessage({ type: "SET_BLOCKED", blockedList: blocked }, () => {
    renderList(blocked)
  })
}

addBtn.onclick = () => {
  let domain = domainInput.value.trim()
  if (!domain) return

  chrome.runtime.sendMessage({ type: "GET_BLOCKED" }, (res) => {
    let newList = res.blocked
    if (!newList.includes(domain)) {
      newList.push(domain)
    }
    saveBlocked(newList)
    domainInput.value = ""
  })
}

exportBtn.onclick = () => {
  chrome.runtime.sendMessage({ type: "GET_BLOCKED" }, (res) => {
    let data = JSON.stringify(res.blocked, null, 2)
    let blob = new Blob([data], { type: "application/json" })
    let url = URL.createObjectURL(blob)
    let a = document.createElement("a")
    a.href = url
    a.download = "blockedDomains.json"
    a.click()
    URL.revokeObjectURL(url)
  })
}

importFile.onchange = (e) => {
  let file = e.target.files[0]
  if (!file) return

  let reader = new FileReader()
  reader.onload = function(event) {
    try {
      let imported = JSON.parse(event.target.result)
      if (Array.isArray(imported)) {
        saveBlocked(imported)
      }
    } catch (err) {
      console.error("Invalid JSON file for import.", err)
    }
  }
  reader.readAsText(file)
}

// 페이지 로드 시점에 목록 불러오기
loadBlocked()
