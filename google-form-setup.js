/* Google 表單整合設定檔 */

/*
這是設定 Google 表單整合的範例文件。
請依照以下步驟設定您的 Google 表單：

1. 創建 Google 表單
   - 前往 https://forms.google.com
   - 建立新表單
   - 標題：Shadowing 語音相似度評分實驗數據

2. 新增以下欄位（依序）：
   a) 參與者編號（短答）
   b) 年齡（短答）  
   c) 性別（選擇題：男/女/其他）
   d) 母語（短答）
   e) 區塊編號（短答）
   f) 音檔對編號（短答）
   g) 原始音檔路徑（短答）
   h) Shadowing音檔路徑（短答）
   i) 相似度評分（短答）
   j) 評分時間戳記（短答）

3. 取得表單提交URL：
   - 點擊表單右上角「傳送」
   - 選擇「<>」（嵌入程式碼）
   - 複製 iframe 中的 src 網址
   - 將網址中的 /viewform 改為 /formResponse
   
4. 取得欄位名稱：
   - 在表單編輯頁面按F12開啟開發者工具
   - 切換到 Network 標籤
   - 測試填寫並提交表單
   - 在 Network 中找到 formResponse 請求
   - 查看 Form Data，複製所有 entry.xxxxxxxx

5. 更新 experiment.js 中的設定：
   - 更新 googleFormUrl
   - 更新 formFields 對象中的所有 entry 編號

範例設定（請替換成您的實際值）：
*/

const GOOGLE_FORM_CONFIG = {
    // 替換為您的實際表單提交URL
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc[YOUR_FORM_ID]/formResponse',
    
    // 替換為您實際的欄位名稱
    fields: {
        participantId: 'entry.123456789',      // 參與者編號
        age: 'entry.987654321',               // 年齡
        gender: 'entry.111111111',            // 性別
        nativeLanguage: 'entry.222222222',    // 母語
        blockNumber: 'entry.333333333',       // 區塊編號
        pairNumber: 'entry.444444444',        // 音檔對編號
        originalAudio: 'entry.555555555',     // 原始音檔路徑
        shadowingAudio: 'entry.666666666',    // Shadowing音檔路徑
        rating: 'entry.777777777',            // 相似度評分
        timestamp: 'entry.888888888'          // 評分時間戳記
    }
};

/*
注意事項：
1. 確保表單設定為「任何人皆可填寫」
2. 建議在表單中新增說明文字
3. 可以在表單設定中啟用「收集電子郵件地址」功能
4. 定期檢查表單回應以確保數據正確收集
5. 考慮設定表單回應通知

隱私權考量：
- 請確保符合您機構的研究倫理規定
- 考慮在表單中加入隱私權聲明
- 妥善保護收集到的個人資料
*/