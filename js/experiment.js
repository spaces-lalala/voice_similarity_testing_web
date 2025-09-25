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
                    original: `audio/block${block}/original_${pair}.mp3`,
                    shadowing: `audio/block${block}/shadowing_${pair}.mp3`,
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

        // 跳過休息
        document.getElementById('skip-break').addEventListener('click', () => {
            this.skipBreak();
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
        this.startBreakTimer();
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

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
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