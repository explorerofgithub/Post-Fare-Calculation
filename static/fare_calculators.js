let currentLang = 'zh';

function getCountryName(code) {
    return countryNames[currentLang][code] || code;
}

function getCurrencySymbol(code) {
    const symbols = {
        'TW': 'NT$',
        'US': '$',
        'JP': '¥',
        'KR': '₩',
        'EU': '€',
        'HK': 'HK$',
        'CA': 'C$',
        'DE': '€'
    };
    return symbols[code] || '$';
}

// --- NEW: Function to calculate fare based on current inputs ---
function getFareFromInputs() {
    const originCountry = document.getElementById('originCountry').value;
    const destCountry = document.getElementById('destCountry').value;
    // Ensure quantity is a valid number, default to 1 if not.
    const quantity = parseInt(document.getElementById('quantity').value) || 1;

    const routeKey = `${originCountry}-${destCountry}`;
    const unitFare = fareTable[routeKey] !== undefined ? fareTable[routeKey] : defaultFare;
    
    // 處理小數點，確保美金費率 (如 1.70) 能正確顯示，同時解決 JavaScript 的浮點數誤差
    let totalFare = unitFare * quantity;
    totalFare = Number.isInteger(totalFare) ? totalFare : totalFare.toFixed(2);

    const currencySymbol = getCurrencySymbol(originCountry);

    return { fare: totalFare, quantity, currencySymbol };
}

// --- NEW: Function to update only the preview text ---
function updatePreviewFare(event) {
    const originCountry = document.getElementById('originCountry').value;
    const destCountry = document.getElementById('destCountry').value;
    const calcBtn = document.getElementById('calcBtn');
    const fareResult = document.getElementById('fareResult');

    // 移除限制：現在允許寄件地與收件地相同，以計算國內郵資
    calcBtn.disabled = false;
    calcBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    fareResult.classList.remove('text-rose-600');
    fareResult.classList.add('text-emerald-800');

    const { fare, currencySymbol } = getFareFromInputs();
    fareResult.textContent = `${translations[currentLang]['preview_fare']} ${currencySymbol}${fare}`;
}

function calculateFare() {
    // --- 信封飛出動畫效果 ---
    // (This function is now for adding to history and triggering the animation)
    const { fare, quantity, currencySymbol } = getFareFromInputs();

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
    listItem.className = 'receipt animate-slide-in bg-stone-100 p-4 pb-6 rounded-t-lg shadow-sm border-x border-t border-stone-300';
    
    listItem.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div class="font-mono text-xs text-stone-500 flex flex-col gap-1">
                <span class="route-text" data-origin="${originCountry}" data-dest="${destCountry}">${originName} &rarr; ${destName}</span>
                <span>${new Date().toLocaleString()}</span>
            </div>
            <button class="delete-btn text-stone-400 hover:text-orange-600 transition-colors p-1 -mt-1 -mr-1 text-sm leading-none" title="${translations[currentLang]['delete_title']}" data-i18n-title="delete_title">
                &#10005;
            </button>
        </div>
        <div class="flex justify-between items-end">
            <div class="font-mono text-sm text-stone-700">
                <p data-i18n="qty_text">${translations[currentLang]['qty_text']}</p>
                <p class="font-bold" data-i18n="total_text">${translations[currentLang]['total_text']}</p>
            </div>
            <div class="text-right">
                <p class="font-mono text-sm text-stone-700">${quantity}</p>
                <p class="font-bold text-lg text-emerald-700">${currencySymbol}${fare}</p>
            </div>
        </div>
    `;

    // 綁定單筆刪除事件
    listItem.querySelector('.delete-btn').addEventListener('click', function() {
        listItem.remove();
        // 如果刪除後沒有其他紀錄，則重新顯示「尚無查詢紀錄」
        if (historyList.children.length === 0) {
                historyList.innerHTML = `<li id="emptyMsg" class="text-stone-500 text-center italic mt-4" data-i18n="empty_msg">${translations[currentLang]['empty_msg']}</li>`;
        }
    });

    historyList.prepend(listItem);
}

function clearHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = `<li id="emptyMsg" class="text-stone-500 text-center italic mt-4" data-i18n="empty_msg">${translations[currentLang]['empty_msg']}</li>`;
}

function updateLanguage() {
    // 翻譯一般文字
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) el.textContent = translations[currentLang][key];
    });

    // 翻譯輸入框佔位符
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) el.placeholder = translations[currentLang][key];
    });
    
    // 翻譯 Hover 的標題提醒
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (translations[currentLang][key]) el.title = translations[currentLang][key];
    });

    // 紀錄當前下拉選單的選取值並重新渲染
    const originSelect = document.getElementById('originCountry');
    const destSelect = document.getElementById('destCountry');
    const currentOrigin = originSelect.value;
    const currentDest = destSelect.value;

    originSelect.innerHTML = '';
    destSelect.innerHTML = '';

    for (const code in countryNames[currentLang]) {
        const option1 = document.createElement('option');
        option1.value = code;
        option1.textContent = countryNames[currentLang][code];
        originSelect.appendChild(option1);

        const option2 = option1.cloneNode(true);
        destSelect.appendChild(option2);
    }

    if (currentOrigin) originSelect.value = currentOrigin;
    if (currentDest) destSelect.value = currentDest;

    // 翻譯歷史紀錄中的航線名稱
    document.querySelectorAll('.route-text').forEach(el => {
        const origin = el.getAttribute('data-origin');
        const dest = el.getAttribute('data-dest');
        el.innerHTML = `${getCountryName(origin)} &rarr; ${getCountryName(dest)}`;
    });
    
    // 更新語言切換按鈕本身文字
    const langBtn = document.getElementById('langToggleBtn');
    if(langBtn) langBtn.textContent = translations[currentLang]['lang_toggle'];

    updatePreviewFare();
}

function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    updateLanguage();
}

// --- NEW: Add event listeners for real-time updates ---
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();

    const controls = [
        document.getElementById('originCountry'),
        document.getElementById('destCountry'),
        document.getElementById('quantity')
    ];

    controls.forEach(control => {
        control.addEventListener('input', updatePreviewFare);
    });
});