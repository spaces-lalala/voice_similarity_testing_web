// 實驗配置
const EXPERIMENT_CONFIG = {
    totalBlocks: 10,
    pairsPerBlock: 5,
    breakDuration: 60, // 秒
    googleFormUrl: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse', // 請替換為實際的Google表單URL
    // Google表單欄位名稱（需要根據實際表單調整）
    formFields: {
        participantId: 'entry.123456789',
        age: 'entry.987654321',
        gender: 'entry.111111111',
        nativeLanguage: 'entry.222222222',
        blockNumber: 'entry.333333333',
        pairNumber: 'entry.444444444',
        originalAudio: 'entry.555555555',
        shadowingAudio: 'entry.666666666',
        rating: 'entry.777777777',
        timestamp: 'entry.888888888'
    }
};

// 實驗狀態
class ExperimentState {
    constructor() {
        this.currentBlock = 1;
        this.currentPair = 1;
        this.participantData = {};
        this.ratings = [];
        this.startTime = null;
        this.audioData = this.generateAudioData();
    }

    // 生成音檔數據（示例結構）
    generateAudioData() {
        const audioData = [];
        for (let block = 1; block <= EXPERIMENT_CONFIG.totalBlocks; block++) {
            const blockData = [];
            for (let pair = 1; pair <= EXPERIMENT_CONFIG.pairsPerBlock; pair++) {
                blockData.push({
                    original: `audio/block${block}/original_${pair}.flac`,
                    shadowing: `audio/block${block}/shadowing_${pair}.flac`,
                    id: `B${block}P${pair}`
                });
            }
            audioData.push(blockData);
        }
        return audioData;
    }

    getCurrentAudioPair() {
        return this.audioData[this.currentBlock - 1][this.currentPair - 1];
    }

    getTotalProgress() {
        const totalPairs = EXPERIMENT_CONFIG.totalBlocks * EXPERIMENT_CONFIG.pairsPerBlock;
        const completedPairs = (this.currentBlock - 1) * EXPERIMENT_CONFIG.pairsPerBlock + (this.currentPair - 1);
        return (completedPairs / totalPairs) * 100;
    }

    addRating(rating) {
        const currentAudioPair = this.getCurrentAudioPair();
        this.ratings.push({
            block: this.currentBlock,
            pair: this.currentPair,
            audioId: currentAudioPair.id,
            originalAudio: currentAudioPair.original,
            shadowingAudio: currentAudioPair.shadowing,
            rating: rating,
            timestamp: new Date().toISOString()
        });
    }

    nextPair() {
        if (this.currentPair < EXPERIMENT_CONFIG.pairsPerBlock) {
            this.currentPair++;
        } else if (this.currentBlock < EXPERIMENT_CONFIG.totalBlocks) {
            this.currentBlock++;
            this.currentPair = 1;
            return 'break'; // 需要休息
        } else {
            return 'complete'; // 實驗完成
        }
        return 'continue';
    }

    isLastPair() {
        return this.currentBlock === EXPERIMENT_CONFIG.totalBlocks && 
               this.currentPair === EXPERIMENT_CONFIG.pairsPerBlock;
    }
}

// 實驗控制器
class ExperimentController {
    constructor() {
        this.state = new ExperimentState();
        this.currentRating = null;
        this.breakTimer = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.showScreen('welcome-screen');
        console.log('Shadowing實驗系統初始化完成');
    }

    bindEvents() {
        // 參與者同意書檢查
        document.getElementById('consent').addEventListener('change', (e) => {
            document.getElementById('start-experiment').disabled = !e.target.checked;
        });

        // 開始實驗
        document.getElementById('start-experiment').addEventListener('click', () => {
            if (this.validateParticipantInfo()) {
                this.startExperiment();
            }
        });

        // 評分按鈕
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectRating(parseInt(e.currentTarget.dataset.rating));
            });
        });

        // 下一對按鈕
        document.getElementById('next-pair').addEventListener('click', () => {
            this.nextPair();
        });

        // 音頻重播按鈕
        document.querySelectorAll('.replay-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const audioType = e.currentTarget.dataset.audio;
                this.replayAudio(audioType);
            });
        });

        // 順序播放按鈕
        document.getElementById('play-both').addEventListener('click', () => {
            this.playBothAudios();
        });

        // 同時播放按鈕
        document.getElementById('play-simultaneously').addEventListener('click', () => {
            this.playSimultaneously();
        });

        // 下載數據備份
        document.getElementById('download-data').addEventListener('click', () => {
            this.downloadDataBackup();
        });
    }

    validateParticipantInfo() {
        const form = document.getElementById('participant-form');
        const formData = new FormData(form);
        
        for (let [key, value] of formData.entries()) {
            if (!value.trim() && key !== 'consent') {
                alert(`請填寫${this.getFieldLabel(key)}`);
                return false;
            }
        }

        if (!document.getElementById('consent').checked) {
            alert('請勾選同意參與實驗');
            return false;
        }

        // 保存參與者資訊
        this.state.participantData = {
            participantId: formData.get('participantId'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            nativeLanguage: formData.get('nativeLanguage'),
            startTime: new Date().toISOString()
        };

        return true;
    }

    getFieldLabel(fieldName) {
        const labels = {
            'participantId': '參與者編號',
            'age': '年齡',
            'gender': '性別',
            'nativeLanguage': '母語'
        };
        return labels[fieldName] || fieldName;
    }

    startExperiment() {
        this.state.startTime = new Date();
        this.showScreen('experiment-screen');
        this.loadCurrentAudioPair();
        this.updateProgress();
        console.log('實驗開始', this.state.participantData);
    }

    loadCurrentAudioPair() {
        const currentAudioPair = this.state.getCurrentAudioPair();
        
        // 更新音檔
        const originalAudio = document.getElementById('original-audio');
        const shadowingAudio = document.getElementById('shadowing-audio');
        
        originalAudio.src = currentAudioPair.original;
        shadowingAudio.src = currentAudioPair.shadowing;

        // 重設評分
        this.currentRating = null;
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.getElementById('selected-score').textContent = '尚未評分';
        document.getElementById('next-pair').disabled = true;

        // 音檔載入錯誤處理（開發階段）
        [originalAudio, shadowingAudio].forEach(audio => {
            audio.addEventListener('error', () => {
                console.warn(`音檔載入失敗: ${audio.src}`);
                // 在實際部署時，這裡應該有實際的音檔文件
            });
        });

        console.log(`載入音檔對: Block ${this.state.currentBlock}, Pair ${this.state.currentPair}`, currentAudioPair);
    }

    updateProgress() {
        document.getElementById('current-block').textContent = `區塊 ${this.state.currentBlock}`;
        document.getElementById('current-pair').textContent = `第 ${this.state.currentPair} 對`;
        document.getElementById('progress-fill').style.width = `${this.state.getTotalProgress()}%`;
    }

    selectRating(rating) {
        this.currentRating = rating;
        
        // 更新視覺狀態
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelector(`[data-rating="${rating}"]`).classList.add('selected');
        
        // 更新顯示文字
        const labels = ['', '完全不相似', '不相似', '普通', '相似', '完全相似'];
        document.getElementById('selected-score').textContent = `${rating} - ${labels[rating]}`;
        
        // 啟用下一對按鈕
        document.getElementById('next-pair').disabled = false;

        console.log(`選擇評分: ${rating}`);
    }

    async nextPair() {
        if (this.currentRating === null) {
            alert('請先選擇評分');
            return;
        }

        // 記錄評分
        this.state.addRating(this.currentRating);

        // 檢查是否為最後一對
        if (this.state.isLastPair()) {
            this.completeExperiment();
            return;
        }

        // 移到下一對
        const nextAction = this.state.nextPair();

        if (nextAction === 'break') {
            this.showBreakScreen();
        } else if (nextAction === 'complete') {
            this.completeExperiment();
        } else {
            this.loadCurrentAudioPair();
            this.updateProgress();
        }
    }

    showBreakScreen() {
        document.getElementById('completed-block').textContent = this.state.currentBlock - 1;
        this.showScreen('break-screen');
        this.startGameLoadingScreen();
    }

    startGameLoadingScreen() {
        // 顯示隨機小知識和冷笑話
        this.displayRandomContent();
        
        // 載入進度條動畫
        this.animateLoadingProgress();
        
        // 開始倒數計時器
        this.startBreakTimer();
    }

    displayRandomContent() {
        // 實驗小知識庫
        const facts = [
            "Shadowing技術最初由語言學家Alexander Arguelles提出，是一種同步跟讀的語言學習方法。研究發現，這種技術不僅能提升語言流暢度，還能改善語音感知能力！",
            "人類大腦處理語音的速度約為每秒20-30個音素，而Shadowing練習可以提高這個處理速度，增強語音工作記憶！",
            "研究顯示，定期進行Shadowing練習的人在語音識別測試中的準確率可以提升25%以上！",
            "Shadowing不只是模仿，它涉及複雜的認知過程：聽覺輸入、語音分析、記憶存儲和語音輸出的同步進行！",
            "有趣的事實：專業同聲傳譯員經常使用Shadowing技術來訓練，因為它能提高語音處理的流暢度和準確性！"
        ];

        // 冷笑話庫
        const jokes = [
            "為什麼語音學家從不說謊？因為他們總是要「實話實說」(phonetically speaking)！ 😄",
            "語言學家的最愛運動是什麼？語音體操！因為要練習各種「音」體美姿勢！ 🤸‍♀️",
            "為什麼電腦學不會Shadowing？因為它只會「複製貼上」，不會「聽音跟讀」！ 💻",
            "語音實驗室最受歡迎的飲料是什麼？「音」料（飲料）！特別是「聲」啤酒！ 🍺",
            "為什麼Shadowing練習這麼累？因為要一邊聽一邊說，根本是「一心二用」的極限運動！ 🏃‍♂️",
            "語言學教授為什麼總是很忙？因為他們要處理各種「語音」公事！ 📚"
        ];

        // 隨機選擇內容
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

        document.getElementById('experiment-fact').textContent = randomFact;
        document.getElementById('random-joke').textContent = randomJoke;
    }

    animateLoadingProgress() {
        const progressBar = document.getElementById('loading-progress');
        const progressPercentage = document.getElementById('loading-percentage');
        let progress = 0;

        const progressInterval = setInterval(() => {
            // 模擬載入進度（稍微不規則的增長）
            const increment = Math.random() * 3 + 1;
            progress += increment;
            
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            progressPercentage.textContent = Math.floor(progress) + '%';

            if (progress >= 100) {
                clearInterval(progressInterval);
                // 進度條完成後稍微延遲
                setTimeout(() => {
                    progressPercentage.textContent = '準備完成！';
                }, 500);
            }
        }, 50);
    }

    startBreakTimer() {
        let timeLeft = EXPERIMENT_CONFIG.breakDuration;
        const timerElement = document.getElementById('timer');
        
        timerElement.textContent = timeLeft;
        
        this.breakTimer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                this.skipBreak();
            }
        }, 1000);
    }

    skipBreak() {
        if (this.breakTimer) {
            clearInterval(this.breakTimer);
            this.breakTimer = null;
        }
        
        this.showScreen('experiment-screen');
        this.loadCurrentAudioPair();
        this.updateProgress();
    }

    async completeExperiment() {
        this.showScreen('completion-screen');
        
        // 計算實驗總時間
        const endTime = new Date();
        const totalMinutes = Math.round((endTime - this.state.startTime) / 60000);
        document.getElementById('total-time').textContent = totalMinutes;

        // 上傳數據到Google表單
        await this.uploadToGoogleForm();
    }

    async uploadToGoogleForm() {
        const uploadStatus = document.getElementById('upload-status');
        
        try {
            // 準備數據
            const experimentData = {
                participantData: this.state.participantData,
                ratings: this.state.ratings,
                completionTime: new Date().toISOString(),
                totalDuration: Math.round((new Date() - this.state.startTime) / 60000)
            };

            // 模擬上傳過程（實際使用時需要實現真實的Google表單提交）
            await this.simulateUpload(experimentData);
            
            uploadStatus.innerHTML = '<i class="fas fa-check-circle"></i> 數據上傳成功！';
            uploadStatus.className = 'upload-status success';
            
            // 顯示下載備份按鈕
            document.getElementById('download-data').style.display = 'inline-flex';
            
        } catch (error) {
            console.error('上傳失敗:', error);
            uploadStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 上傳失敗，請聯繫研究人員';
            uploadStatus.className = 'upload-status error';
            
            // 自動顯示下載備份按鈕
            document.getElementById('download-data').style.display = 'inline-flex';
        }
    }

    async simulateUpload(data) {
        // 模擬上傳延遲
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 這裡應該實現實際的Google表單提交邏輯
        // 可以使用 fetch API 發送 POST 請求到 Google 表單
        console.log('準備上傳的數據:', data);
        
        // 示例：實際的Google表單提交（需要根據實際表單調整）
        /*
        const formData = new FormData();
        formData.append(EXPERIMENT_CONFIG.formFields.participantId, data.participantData.participantId);
        formData.append(EXPERIMENT_CONFIG.formFields.age, data.participantData.age);
        // ... 添加其他欄位
        
        await fetch(EXPERIMENT_CONFIG.googleFormUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
        */
    }

    downloadDataBackup() {
        const data = {
            participantData: this.state.participantData,
            ratings: this.state.ratings,
            experimentConfig: EXPERIMENT_CONFIG,
            completionTime: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `shadowing_experiment_${this.state.participantData.participantId}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    replayAudio(audioType) {
        const audioElement = document.getElementById(`${audioType}-audio`);
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.warn('音頻播放失敗:', e));
    }

    async playBothAudios() {
        const originalAudio = document.getElementById('original-audio');
        const shadowingAudio = document.getElementById('shadowing-audio');
        
        try {
            // 播放原始音檔
            originalAudio.currentTime = 0;
            await originalAudio.play();
            
            // 等待原始音檔播放完成
            await new Promise(resolve => {
                originalAudio.addEventListener('ended', resolve, { once: true });
            });
            
            // 短暫間隔
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 播放shadowing音檔
            shadowingAudio.currentTime = 0;
            await shadowingAudio.play();
            
        } catch (error) {
            console.warn('順序播放失敗:', error);
        }
    }

    async playSimultaneously() {
        const originalAudio = document.getElementById('original-audio');
        const shadowingAudio = document.getElementById('shadowing-audio');
        
        try {
            // 重置播放位置
            originalAudio.currentTime = 0;
            shadowingAudio.currentTime = 0;
            
            // 同時開始播放
            const playPromises = [
                originalAudio.play(),
                shadowingAudio.play()
            ];
            
            await Promise.all(playPromises);
            
        } catch (error) {
            console.warn('同時播放失敗:', error);
            alert('同時播放失敗，請檢查音檔是否已載入完成');
        }
    }

    showScreen(screenId) {
        // 隱藏所有螢幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none';
        });
        
        // 顯示目標螢幕
        const targetScreen = document.getElementById(screenId);
        if (screenId === 'break-screen') {
            targetScreen.style.display = 'flex';
        } else {
            targetScreen.style.display = 'flex';
        }
        targetScreen.classList.add('active');
        
        // 強制重新渲染以確保完全切換
        setTimeout(() => {
            if (targetScreen.scrollTop !== undefined) {
                targetScreen.scrollTop = 0;
            }
        }, 50);
        
        console.log(`切換到頁面: ${screenId}`);
    }
}

// 初始化實驗
document.addEventListener('DOMContentLoaded', () => {
    window.experiment = new ExperimentController();
});

// 防止意外離開頁面
window.addEventListener('beforeunload', (e) => {
    if (window.experiment && window.experiment.state.startTime && 
        !window.experiment.state.isLastPair()) {
        e.preventDefault();
        e.returnValue = '實驗尚未完成，確定要離開嗎？';
    }
});

// 錯誤處理
window.addEventListener('error', (e) => {
    console.error('實驗系統錯誤:', e.error);
});

// 導出給其他腳本使用
window.EXPERIMENT_CONFIG = EXPERIMENT_CONFIG;