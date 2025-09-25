# GitHub Pages 部署指南

## 快速部署步驟

### 第一步：創建 GitHub 倉庫
1. 登入 [GitHub](https://github.com)
2. 點擊右上角的 `+` → `New repository`
3. 倉庫名稱建議：`voice-similarity-experiment` 或 `shadowing-experiment`
4. 設為 **Public**（GitHub Pages 免費版需要公開倉庫）
5. 勾選 `Add a README file`
6. 點擊 `Create repository`

### 第二步：上傳網站文件
1. 在倉庫頁面點擊 `uploading an existing file`
2. 將整個 `voice_test_web` 資料夾中的所有文件拖拽上傳
3. 或使用 Git 命令：
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   # 複製所有文件到此目錄
   git add .
   git commit -m "Add shadowing experiment website"
   git push
   ```

### 第三步：啟用 GitHub Pages
1. 進入倉庫 → `Settings` 標籤
2. 左側選單找到 `Pages`
3. **Source** 選擇 `Deploy from a branch`
4. **Branch** 選擇 `main` 和 `/ (root)`
5. 點擊 `Save`
6. 等待幾分鐘後，您的網站將可以在以下網址存取：
   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## 進階設定

### 自訂網域（可選）
如果您有自己的網域：
1. 在倉庫根目錄創建 `CNAME` 文件
2. 文件內容只需一行：`your-domain.com`
3. 在網域服務商設定 DNS CNAME 記錄指向 `YOUR_USERNAME.github.io`

### SSL 憑證
GitHub Pages 自動提供 HTTPS，建議：
1. 在 Pages 設定中勾選 `Enforce HTTPS`
2. 等待憑證生效（可能需要24小時）

## Google 表單設定

### 創建表單
1. 前往 [Google Forms](https://forms.google.com)
2. 創建新表單：「Shadowing 語音相似度評分實驗」
3. 按照 `google-form-setup.js` 中的欄位清單新增問題

### 欄位設定詳細說明
請依照以下順序和設定創建表單欄位：

1. **參與者編號**
   - 類型：簡答
   - 必填：是
   - 說明：請輸入您的參與者編號

2. **年齡**
   - 類型：簡答
   - 必填：是
   - 驗證：數字，範圍 18-100

3. **性別**
   - 類型：選擇題
   - 選項：男、女、其他
   - 必填：是

4. **母語**
   - 類型：簡答
   - 必填：是

5. **區塊編號**
   - 類型：簡答
   - 說明：系統自動填入

6. **音檔對編號**
   - 類型：簡答
   - 說明：系統自動填入

7. **原始音檔路徑**
   - 類型：簡答
   - 說明：系統自動填入

8. **Shadowing音檔路徑**
   - 類型：簡答
   - 說明：系統自動填入

9. **相似度評分**
   - 類型：簡答
   - 驗證：數字，範圍 1-7
   - 說明：1=完全不相似，7=完全相似

10. **評分時間戳記**
    - 類型：簡答
    - 說明：系統自動填入

### 取得表單整合資訊
1. 完成表單創建後，點擊右上角「傳送」
2. 選擇 `<>` (嵌入程式碼) 標籤
3. 複製 iframe 中的 `src` 網址
4. 將網址中的 `/viewform` 替換為 `/formResponse`

### 取得欄位名稱
1. 在表單編輯頁面按 F12 開啟開發者工具
2. 切換到 `Network` 標籤
3. 填寫表單並點擊提交
4. 在 Network 面板中找到 `formResponse` 請求
5. 點擊該請求，查看 `Form Data`
6. 記錄所有 `entry.xxxxxxxx` 的數字部分

### 更新程式碼
編輯 `js/experiment.js` 文件，在 `EXPERIMENT_CONFIG` 中：
1. 更新 `googleFormUrl` 為您的表單提交網址
2. 更新 `formFields` 中所有的 entry 編號

## 音檔準備與上傳

### 音檔規格
- **格式**：MP3（推薦）或 WAV
- **位元率**：128-320 kbps
- **取樣率**：44.1 kHz 或 48 kHz
- **聲道**：單聲道或立體聲
- **長度**：建議 10-30 秒
- **音量**：標準化處理，避免音量差異過大

### 命名規則
嚴格按照以下格式：
```
audio/
├── block1/
│   ├── original_1.mp3
│   ├── shadowing_1.mp3
│   ├── original_2.mp3
│   ├── shadowing_2.mp3
│   ├── ...
│   ├── original_5.mp3
│   └── shadowing_5.mp3
├── block2/
│   └── ... (相同結構)
└── ...
```

### 上傳方式
1. **GitHub 網頁界面**：適合少量文件
2. **Git 命令行**：適合大量文件
   ```bash
   git add audio/
   git commit -m "Add experiment audio files"
   git push
   ```
3. **GitHub Desktop**：圖形化界面

## 測試與驗證

### 本地測試
在部署前建議本地測試：
1. 使用 Live Server 或類似工具
2. 測試所有功能：
   - 音檔播放
   - 評分功能
   - 進度條
   - 休息計時器

### 線上測試
部署後進行完整測試：
1. 完成一次完整的實驗流程
2. 檢查 Google 表單是否正確接收數據
3. 測試不同瀏覽器和設備
4. 驗證響應式設計

### 常見問題排除
1. **音檔無法播放**：檢查路徑和格式
2. **Google 表單無法提交**：檢查 CORS 設定和欄位名稱
3. **頁面載入緩慢**：優化音檔大小和圖片
4. **手機版顯示異常**：檢查 CSS 響應式設計

## 維護與更新

### 定期檢查
- 監控 Google 表單回應
- 檢查網站訪問統計
- 更新實驗說明或參數

### 備份策略
- 定期下載 Google 表單數據
- 保存原始程式碼備份
- 記錄實驗版本變更

### 安全性考量
- 定期檢查倉庫是否被意外修改
- 保護參與者隱私資料
- 遵守研究倫理規範

---

## 聯絡資訊
如有技術問題，請聯絡：
- 電子郵件：your-email@nccu.edu.tw
- 機構：國立政治大學語言學研究所

**祝您實驗順利！** 🎯