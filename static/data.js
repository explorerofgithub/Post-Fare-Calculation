// 郵資費率表 (單位：元/張)
// 根據中華郵政國際明信片資費更新：美國 11 元，日本及韓國 (亞洲) 10 元
const fareTable = {
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
    'HK-HK': 2.2   // 香港國內
};
const defaultFare = 10; // 找不到對應航線時的預設費率

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
        'lang_toggle': 'English'
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
        'lang_toggle': '中文'
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