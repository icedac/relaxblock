const domainInput = document.getElementById('domainInput');
const addBtn = document.getElementById('addBtn');
const blockedListEl = document.getElementById('blockedList');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

function renderList(blocked) {
  blockedListEl.innerHTML = '';
  blocked.forEach((d, i) => {
    const li = document.createElement('li');

    // 도메인 텍스트
    const spanDomain = document.createElement('span');
    spanDomain.textContent = d;

    // 차단 해제 버튼
    const unblockBtn = document.createElement('button');
    unblockBtn.textContent = '차단 해제';
    unblockBtn.style.marginLeft = '10px';
    unblockBtn.onclick = () => {
      blocked.splice(i, 1);
      saveBlocked(blocked);
    };

    li.appendChild(spanDomain);
    li.appendChild(unblockBtn);
    blockedListEl.appendChild(li);
  });
}

function loadBlocked() {
  chrome.runtime.sendMessage({ type: 'GET_BLOCKED' }, (res) => {
    renderList(res.blocked);
  });
}

function saveBlocked(blocked) {
  chrome.runtime.sendMessage({ type: 'SET_BLOCKED', blockedList: blocked }, () => {
    renderList(blocked);
  });
}

addBtn.onclick = () => {
  const domain = domainInput.value.trim();
  if (!domain) {return;}

  chrome.runtime.sendMessage({ type: 'GET_BLOCKED' }, (res) => {
    const newList = res.blocked;
    if (!newList.includes(domain)) {
      newList.push(domain);
    }
    saveBlocked(newList);
    domainInput.value = '';
  });
};

exportBtn.onclick = () => {
  chrome.runtime.sendMessage({ type: 'GET_BLOCKED' }, (res) => {
    const data = JSON.stringify(res.blocked, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockedDomains.json';
    a.click();
    URL.revokeObjectURL(url);
  });
};

importFile.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) {return;}

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        saveBlocked(imported);
      }
    } catch (err) {
      alert('Invalid JSON file. Please check the file format.');
    }
  };
  reader.readAsText(file);
};

// 페이지 로드 시점에 목록 불러오기
loadBlocked();
