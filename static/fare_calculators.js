// 郵資費率表 (單位：元/張)
// 根據中華郵政國際明信片資費更新：美國 11 元，日本及韓國 (亞洲) 10 元
const fareTable = {
    'TW-US': 11,
    'TW-JP': 10,
    'TW-KR': 10
};
const defaultFare = 10; // 找不到對應航線時的預設費率

function getCountryName(code) {
    const names = {
        'TW': '台灣',
        'US': '美國',
        'JP': '日本',
        'KR': '韓國'
    };
    return names[code] || code;
}

// --- NEW: Function to calculate fare based on current inputs ---
function getFareFromInputs() {
    const originCountry = document.getElementById('originCountry').value;
    const destCountry = document.getElementById('destCountry').value;
    // Ensure quantity is a valid number, default to 1 if not.
    const quantity = parseInt(document.getElementById('quantity').value) || 1;

    const routeKey = `${originCountry}-${destCountry}`;
    const unitFare = fareTable[routeKey] !== undefined ? fareTable[routeKey] : defaultFare;
    return { fare: unitFare * quantity, quantity };
}

// --- NEW: Function to update only the preview text ---
function updatePreviewFare(event) {
    const originCountry = document.getElementById('originCountry').value;
    const destCountry = document.getElementById('destCountry').value;
    const calcBtn = document.getElementById('calcBtn');
    const fareResult = document.getElementById('fareResult');

    // 如果寄件地和收件地相同
    if (originCountry === destCountry) {
        // 只有在切換「國家」選單時才跳出 alert（避免改數量也狂跳）
        if (event && (event.target.id === 'originCountry' || event.target.id === 'destCountry')) {
            alert('提示：寄件地和收件地不可相同！');
        }
        calcBtn.disabled = true;
        calcBtn.classList.add('opacity-50', 'cursor-not-allowed');
        fareResult.textContent = '⚠️ 寄件地和收件地不可相同';
        fareResult.classList.remove('text-teal-700');
        fareResult.classList.add('text-rose-600');
        return;
    } else {
        calcBtn.disabled = false;
        calcBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        fareResult.classList.remove('text-rose-600');
        fareResult.classList.add('text-teal-700');
    }

    const { fare } = getFareFromInputs();
    fareResult.textContent = `預估郵資: $${fare}`;
}

function calculateFare() {
    // --- 信封飛出動畫效果 ---
    // (This function is now for adding to history and triggering the animation)
    const { fare, quantity } = getFareFromInputs();

    const envelope = document.getElementById('envelopeAnimation');
    if (envelope) {
        // 移除之前的動畫類別以確保動畫可以重新播放
        envelope.classList.remove('animate-fly-out');
        // 強制瀏覽器重繪 (reflow)，以確保動畫能從頭開始
        void envelope.offsetWidth;
        
        envelope.classList.remove('opacity-0', 'pointer-events-none');
        envelope.classList.add('animate-fly-out');

        // 動畫結束後隱藏信封
        envelope.addEventListener('animationend', () => {
            envelope.classList.remove('animate-fly-out');
            envelope.classList.add('opacity-0', 'pointer-events-none');
        }, { once: true }); // 確保事件監聽器只執行一次
    }
    // --- 信封飛出動畫效果結束 ---

    // 歷史紀錄邏輯
    const historyList = document.getElementById('historyList');
    const emptyMsg = document.getElementById('emptyMsg');
    if (emptyMsg) { emptyMsg.remove(); }

    const originCountry = document.getElementById('originCountry').value;
    const destCountry = document.getElementById('destCountry').value;
    const originName = getCountryName(originCountry);
    const destName = getCountryName(destCountry);

    const listItem = document.createElement('li');
    // 套用收據樣式，包含撕邊效果的 class
    listItem.className = 'receipt animate-slide-in bg-gray-50 p-4 pb-6 rounded-t-lg shadow-sm border-x border-t border-gray-200';
    
    listItem.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div class="font-mono text-xs text-slate-500 flex flex-col gap-1">
                <span>${originName} &rarr; ${destName}</span>
                <span>${new Date().toLocaleString()}</span>
            </div>
            <button class="delete-btn text-slate-400 hover:text-rose-500 transition-colors p-1 -mt-1 -mr-1 text-sm leading-none" title="刪除此紀錄">
                &#10005;
            </button>
        </div>
        <div class="flex justify-between items-end">
            <div class="font-mono text-sm text-slate-700">
                <p>明信片數量:</p>
                <p class="font-bold">總計:</p>
            </div>
            <div class="text-right">
                <p class="font-mono text-sm text-slate-700">${quantity}</p>
                <p class="font-bold text-lg text-blue-800">$${fare}</p>
            </div>
        </div>
    `;

    // 綁定單筆刪除事件
    listItem.querySelector('.delete-btn').addEventListener('click', function() {
        listItem.remove();
        // 如果刪除後沒有其他紀錄，則重新顯示「尚無查詢紀錄」
        if (historyList.children.length === 0) {
            historyList.innerHTML = '<li id="emptyMsg" class="text-slate-400 text-center italic mt-4">尚無查詢紀錄</li>';
        }
    });

    historyList.prepend(listItem);
}

function clearHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '<li id="emptyMsg" class="text-slate-400 text-center italic mt-4">尚無查詢紀錄</li>';
}

// --- NEW: Add event listeners for real-time updates ---
document.addEventListener('DOMContentLoaded', () => {
    const controls = [
        document.getElementById('originCountry'),
        document.getElementById('destCountry'),
        document.getElementById('quantity')
    ];

    controls.forEach(control => {
        control.addEventListener('input', updatePreviewFare);
    });

    // Initial calculation on page load
    updatePreviewFare();
});