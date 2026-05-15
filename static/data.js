// 郵資費率表 (單位：元/張)
// 根據中華郵政國際明信片資費更新：美國 11 元，日本及韓國 (亞洲) 10 元
let fareTable = {
    'TW-TW': 5,    // 台灣國內
    'TW-US': 11,
    'TW-JP': 10,
    'TW-KR': 10,
    'TW-EU': 12, // 歐洲
    'TW-HK': 6,  // 香港
    'TW-CA': 11, // 加拿大
    'TW-DE': 12, // 德國 (同歐洲費率)
    'US-US': 0.61, // 美國國內
    'US-TW': 1.70,
    'US-JP': 1.70,
    'US-KR': 1.70,
    'US-EU': 1.70,
    'US-HK': 1.70,
    'US-CA': 1.70,
    'US-DE': 1.70,
    'JP-JP': 85,   // 日本國內
    'JP-TW': 100,
    'JP-US': 100,
    'JP-KR': 100,
    'JP-EU': 100,
    'JP-HK': 100,
    'JP-CA': 100,
    'JP-DE': 100,
    'KR-KR': 400,  // 韓國國內
    'KR-TW': 430,
    'KR-US': 430,
    'KR-JP': 430,
    'KR-EU': 430,
    'KR-HK': 430,
    'KR-CA': 430,
    'KR-DE': 430,
    'CA-CA': 1.44, // 加拿大國內 (2026 標準郵資)
    'CA-TW': 3.65, // 加拿大寄國際
    'CA-US': 1.75, // 加拿大寄美國
    'CA-JP': 3.65,
    'CA-KR': 3.65,
    'CA-EU': 3.65,
    'CA-HK': 3.65,
    'CA-DE': 3.65,
    'DE-DE': 0.95, // 德國國內明信片
    'DE-TW': 1.25, // 德國寄國際明信片
    'DE-US': 1.25,
    'DE-JP': 1.25,
    'DE-KR': 1.25,
    'DE-EU': 1.25,
    'DE-HK': 1.25,
    'DE-CA': 1.25,
    'EU-EU': 1.20, // 歐洲境內 (預設參考)
    'HK-HK': 2.4   // 香港國內
};
const defaultFare = 10; // 找不到對應航線時的預設費率

async function updateDynamicFares() {
    // 從 Postcrossing 社區論壇抓取最新的郵資資訊，更新 fareTable
    const url = 'https://community.postcrossing.com/t/current-prices-of-stamps-for-postcards-in-all-countries-territories-wiki/125.json';

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch: HTTP ${response.status}`);
        }

        const data = await response.json();
        // Post [0] 包含HTML内容，從中提取郵資資訊
        const html = data.post_stream.posts[0].cooked;
        
        // 複製一份現有的費率表，以便更新
        let dynamicFares = { ...fareTable };

        // 定義一個通用的提取函數，根據正則表達式從 HTML 中提取費率
        const extract = (regex, isFloat = false) => {
            const match = html.match(regex);
            if (!match) return null;
            // Handle European formatting like "1,25 €"
            let val = match[1].replace(',', '.');
            return isFloat ? parseFloat(val) : parseInt(val, 10);
        };

        // 1. Taiwan
        const twDom = extract(/Taiwan[\s\S]*?Domestic:\s*NT\$(\d+)/i);
        const twHk = extract(/Taiwan[\s\S]*?HongKong.*?NT\$(\d+)/i);
        const twAsia = extract(/Taiwan[\s\S]*?Rest of Asia Pacific:\s*NT\$(\d+)/i);
        const twUsCa = extract(/Taiwan[\s\S]*?USA, Canada:\s*NT\$(\d+)/i);
        const twWorld = extract(/Taiwan[\s\S]*?Rest of the world:\s*NT\$(\d+)/i);
        
        if (twDom) dynamicFares['TW-TW'] = twDom;
        if (twHk) dynamicFares['TW-HK'] = twHk;
        if (twAsia) { dynamicFares['TW-JP'] = twAsia; dynamicFares['TW-KR'] = twAsia; }
        if (twUsCa) { dynamicFares['TW-US'] = twUsCa; dynamicFares['TW-CA'] = twUsCa; }
        if (twWorld) { dynamicFares['TW-EU'] = twWorld; dynamicFares['TW-DE'] = twWorld; }

        // 2. USA
        const usDom = extract(/United States[\s\S]*?Domestic Postcards.*?:\s*(\d+)¢/i);
        const usIntl = extract(/United States[\s\S]*?International:\s*\$(\d+\.\d+)/i, true);
        if (usDom) dynamicFares['US-US'] = usDom / 100; // Convert ¢ to $
        if (usIntl) {
            Object.keys(dynamicFares).forEach(key => {
                if (key.startsWith('US-') && key !== 'US-US') dynamicFares[key] = usIntl;
            });
        }

        // 3. Japan
        const jpDom = extract(/Japan[\s\S]*?Domestic.*?: ¥(\d+)/i);
        const jpIntl = extract(/Japan[\s\S]*?International.*?: \(air\) ¥(\d+)/i);
        if (jpDom) dynamicFares['JP-JP'] = jpDom;
        if (jpIntl) {
            Object.keys(dynamicFares).forEach(key => {
                if (key.startsWith('JP-') && key !== 'JP-JP') dynamicFares[key] = jpIntl;
            });
        }

        // 4. South Korea
        const krIntl = extract(/Korea \(South\)[\s\S]*?Air Mail: ₩(\d+)/i);
        if (krIntl) {
            Object.keys(dynamicFares).forEach(key => {
                if (key.startsWith('KR-') && key !== 'KR-KR') dynamicFares[key] = krIntl;
            });
        }

        // 5. Canada
        const caDom = extract(/Canada[\s\S]*?Domestic: \$(\d+\.\d+)/i, true);
        const caUs = extract(/Canada[\s\S]*?USA: \$(\d+\.\d+)/i, true);
        const caWorld = extract(/Canada[\s\S]*?World: \$(\d+\.\d+)/i, true);
        if (caDom) dynamicFares['CA-CA'] = caDom;
        if (caUs) dynamicFares['CA-US'] = caUs;
        if (caWorld) {
            Object.keys(dynamicFares).forEach(key => {
                if (key.startsWith('CA-') && key !== 'CA-CA' && key !== 'CA-US') dynamicFares[key] = caWorld;
            });
        }

        // 6. Germany
        const deDom = extract(/Germany[\s\S]*?Domestic.*?<\/td>\s*<td>(\d+,\d+)\s*€/i, true);
        const deIntl = extract(/Germany[\s\S]*?International.*?<\/td>\s*<td>(\d+,\d+)\s*€/i, true);
        if (deDom) dynamicFares['DE-DE'] = deDom;
        if (deIntl) {
            Object.keys(dynamicFares).forEach(key => {
                if (key.startsWith('DE-') && key !== 'DE-DE') dynamicFares[key] = deIntl;
            });
        }

        // 7. Hong Kong
        const hkDom = extract(/Hong Kong[\s\S]*?Domestic: (\d+\.\d+) HKD/i, true);
        if (hkDom) dynamicFares['HK-HK'] = hkDom;

        // 將更新後的動態費率表賦值回全局 fareTable
        fareTable = dynamicFares;

        console.log("=== DYNAMIC DATA FETCHED SUCCESSFULLY ===");
        console.log("For a future replacement of static data, use this:");
        console.log(JSON.stringify(fareTable, null, 4).replace(/"/g, "'"));

    } catch (error) {
        console.warn("Failed to fetch dynamic data. Utilizing static data as fallback.", error.message);
    }
}

// 頁面載入時立即更新動態費率
updateDynamicFares();

const translations = {
    'zh': {
        'app_title': '📮 即時明信片郵資換算',
        'origin_label': '寄件地:',
        'dest_label': '收件地:',
        'quantity_label': '明信片數量:',
        'quantity_placeholder': '請輸入數量',
        'calc_btn': '計算郵資',
        'history_title': '🗂️ 郵資查詢紀錄',
        'empty_msg': '尚無查詢紀錄',
        'clear_btn': '🗑️ 清除紀錄',
        'preview_fare': '預估郵資:',
        'qty_text': '明信片數量:',
        'total_text': '總計:',
        'delete_title': '刪除此紀錄',
        'lang_toggle': 'English',
        'view_size_btn': '📐 查看寄件地明信片尺寸',
        'hide_size_btn': '🔺 收起尺寸資訊',
        'stamp_hint': '※ 貼心提醒：國際郵件請將郵票貼於右上角',
        'recipient_address': '收件人地址'
    },
    'en': {
        'app_title': '📮 Instant Postcard Fare Calculator',
        'origin_label': 'Origin:',
        'dest_label': 'Destination:',
        'quantity_label': 'Quantity:',
        'quantity_placeholder': 'Enter quantity',
        'calc_btn': 'Calculate Fare',
        'history_title': '🗂️ Fare History',
        'empty_msg': 'No history yet',
        'clear_btn': '🗑️ Clear History',
        'preview_fare': 'Estimated Fare:',
        'qty_text': 'Quantity:',
        'total_text': 'Total:',
        'delete_title': 'Delete record',
        'lang_toggle': '中文',
        'view_size_btn': '📐 View Origin Postcard Size',
        'hide_size_btn': '🔺 Hide Size Info',
        'stamp_hint': '※ Note: Place the stamp in the top right corner',
        'recipient_address': 'Recipient Address'
    }
};

const postcardFormats = {
    'zh': {
        'TW': '10.5 x 14.8 cm (標準 A6)',
        'JP': '10.0 x 14.8 cm',
        'US': '8.9 x 12.7 cm ~ 10.8 x 15.2 cm',
        'KR': '10.5 x 14.8 cm (標準 A6)',
        'EU': '10.5 x 14.8 cm (標準 A6)',
        'HK': '9 x 14 cm ~ 12.2 x 23.5 cm',
        'CA': '最高 12 x 23.5 cm',
        'DE': '10.5 x 14.8 cm (標準 A6)'
    },
    'en': {
        'TW': '10.5 x 14.8 cm (Standard A6)',
        'JP': '10.0 x 14.8 cm',
        'US': '3.5" x 5" ~ 4.25" x 6"',
        'KR': '10.5 x 14.8 cm (Standard A6)',
        'EU': '10.5 x 14.8 cm (Standard A6)',
        'HK': '9 x 14 cm ~ 12.2 x 23.5 cm',
        'CA': 'Max 12 x 23.5 cm',
        'DE': '10.5 x 14.8 cm (Standard A6)'
    }
};

const countryNames = {
    'zh': {
        'TW': '台灣', 'US': '美國', 'JP': '日本', 'KR': '韓國',
        'EU': '歐洲', 'HK': '香港', 'CA': '加拿大', 'DE': '德國'
    },
    'en': {
        'TW': 'Taiwan', 'US': 'USA', 'JP': 'Japan', 'KR': 'South Korea',
        'EU': 'Europe', 'HK': 'Hong Kong', 'CA': 'Canada', 'DE': 'Germany'
    }
};