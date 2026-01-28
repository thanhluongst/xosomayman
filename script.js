// Background Particles
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }
    draw() {
        ctx.fillStyle = `rgba(0, 210, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Lucky Draw Logic
const displayContainer = document.getElementById('display');
const spinBtn = document.getElementById('spin-btn');
const winnerModal = document.getElementById('winner-modal');
const finalNumberDisplay = document.getElementById('final-number');
const closeBtn = document.getElementById('close-modal');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const remainingCountDisplay = document.getElementById('remaining-count');
const resetBtn = document.getElementById('reset-btn');
const toggleDashboardBtn = document.getElementById('toggle-dashboard-btn');
const dashboard = document.querySelector('.dashboard');
const winnersList = document.getElementById('winners-list');
const poolDisplay = document.getElementById('pool-display');

// Settings Elements
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettings = document.getElementById('close-settings');
const saveConfig = document.getElementById('save-config');
const configStart = document.getElementById('config-start');
const configEnd = document.getElementById('config-end');

// Full List Elements
const viewAllBtn = document.getElementById('view-all-btn');
const fullListModal = document.getElementById('full-list-modal');
const masterListContainer = document.getElementById('master-list-container');
const closeFullList = document.getElementById('close-full-list');

// History Screen Elements
const viewHistoryBtn = document.getElementById('view-history-btn');
const historyScreenModal = document.getElementById('history-screen-modal');
const historyGridDisplay = document.getElementById('history-grid-display');
const closeHistoryScreen = document.getElementById('close-history-screen');
const resetWinnersBtn = document.getElementById('reset-winners-btn');

// Custom Confirm Elements
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');

// Prize Elements
const prizeSelect = document.getElementById('prize-select');
const currentPrizeName = document.getElementById('current-prize-name');

// Batch Spin Elements
const batchSpinSelect = document.getElementById('batch-spin-select');

// Audio setup with local assets
const spinSound = new Audio('Lucky whel.mp3');
const winSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
const tickSound = new Audio('https://www.soundjay.com/communication/sounds/digital-clock-ticking-1.mp3');
const bgMusic = new Audio('NhacNen.mp3');

// Background Music Elements
const bgMusicBtn = document.getElementById('bg-music-btn');
const bgVolumeSlider = document.getElementById('bg-volume');

bgMusic.loop = true;
bgMusic.volume = 0.5;
let bgMusicPlaying = false;

let audioDuration = 15; // Set a longer default 15s
spinSound.addEventListener('loadedmetadata', () => {
    if (spinSound.duration > 0) {
        audioDuration = spinSound.duration;
        console.log("Audio duration detected:", audioDuration);
    }
});

spinSound.loop = false; // Don't loop if we match duration
winSound.volume = 0.8;
tickSound.volume = 0.2;

// Initialize Available Numbers and Winners History
let config = JSON.parse(localStorage.getItem('luckyDrawConfig')) || { start: 1, end: 10000 };
let availableNumbers = JSON.parse(localStorage.getItem('luckyDrawPool'));
let winnersHistory = JSON.parse(localStorage.getItem('luckyDrawWinners')) || [];

if (!availableNumbers) {
    initPool();
}

function showConfirm(message) {
    return new Promise((resolve) => {
        confirmMessage.innerText = message;
        confirmModal.style.display = 'flex';

        const handleYes = () => {
            confirmModal.style.display = 'none';
            cleanup();
            resolve(true);
        };
        const handleNo = () => {
            confirmModal.style.display = 'none';
            cleanup();
            resolve(false);
        };
        const cleanup = () => {
            confirmYes.removeEventListener('click', handleYes);
            confirmNo.removeEventListener('click', handleNo);
        };

        confirmYes.addEventListener('click', handleYes);
        confirmNo.addEventListener('click', handleNo);
    });
}
function initPool() {
    const start = parseInt(config.start);
    const end = parseInt(config.end);
    availableNumbers = [];
    for (let i = start; i <= end; i++) {
        availableNumbers.push(i);
    }
    shuffleArray(availableNumbers); // Shuffle the pool immediately
    localStorage.setItem('luckyDrawPool', JSON.stringify(availableNumbers));
    localStorage.setItem('luckyDrawConfig', JSON.stringify(config));
    initDigitBoxes();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

window.removeWinner = async function (index) {
    const winner = winnersHistory[index];
    if (!winner) return;

    const confirmed = await showConfirm(`Xác nhận số ${winner.number} vắng mặt? Số này sẽ bị loại bỏ vĩnh viễn khỏi danh sách tập trung.`);

    if (confirmed) {
        winnersHistory.splice(index, 1);
        localStorage.setItem('luckyDrawWinners', JSON.stringify(winnersHistory));
        updateUI();
    }
}

function initDigitBoxes() {
    const digitCount = config.end.toString().length;
    displayContainer.innerHTML = '';

    for (let i = 0; i < digitCount; i++) {
        const box = document.createElement('div');
        box.className = 'digit-box';
        const strip = document.createElement('div');
        strip.className = 'digit-strip';
        strip.id = `strip-${i}`;

        let content = '';
        for (let j = 0; j < 150; j++) { // Increase to 150 for 12s spin
            for (let k = 0; k <= 9; k++) {
                content += `<div class="digit">${k}</div>`;
            }
        }
        strip.innerHTML = content;
        box.appendChild(strip);
        displayContainer.appendChild(box);
    }
}

function updateUI() {
    const total = (config.end - config.start + 1);
    const digitCount = config.end.toString().length;
    remainingCountDisplay.innerText = availableNumbers.length.toLocaleString();

    const rangeInfo = document.querySelector('.range-info');
    if (rangeInfo && rangeInfo.childNodes[2]) {
        rangeInfo.childNodes[2].textContent = ` / ${total.toLocaleString()} vé | `;
    }

    // Update Winners List (Grouped by Prize)
    const groupedWinners = winnersHistory.reduce((acc, win, index) => {
        const prize = win.prize || 'Quà tặng';
        if (!acc[prize]) acc[prize] = [];
        acc[prize].push({ ...win, originalIndex: index });
        return acc;
    }, {});

    const prizeOrder = ['Giải Đặc Biệt', 'Giải Nhất', 'Giải Nhì', 'Giải Ba', 'Giải Khuyến Khích'];
    const sortedPrizes = Object.keys(groupedWinners).sort((a, b) => {
        const idxA = prizeOrder.indexOf(a);
        const idxB = prizeOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    winnersList.innerHTML = sortedPrizes.map(prize => `
        <div class="prize-group">
            <h4 class="prize-header">${prize}</h4>
            <ul class="prize-inner-list">
                ${groupedWinners[prize].map((win) => `
                    <li>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.9rem; color: var(--primary-color); font-weight: bold;">#${win.number}</span>
                            <span style="font-size: 0.65rem; opacity: 0.6;">${win.time}</span>
                        </div>
                        <button onclick="removeWinner(${win.originalIndex})" class="btn-absent">Vắng mặt</button>
                    </li>
                `).reverse().join('')}
            </ul>
        </div>
    `).join('');

    // Update Full Screen History Board
    if (historyScreenModal.style.display === 'flex') {
        historyGridDisplay.innerHTML = sortedPrizes.map(prize => `
            <div class="prize-group" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,215,0,0.3);">
                <h4 style="font-size: 1.5rem; color: #ffea00; margin-bottom: 20px; border-bottom: 2px solid #ffea00; padding-bottom: 10px;">${prize}</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px;">
                    ${groupedWinners[prize].map((win) => `
                        <div style="background: rgba(0,210,255,0.1); border: 1px solid var(--primary-color); border-radius: 12px; padding: 12px; text-align: center; position: relative; transition: all 0.3s ease;" class="history-item-large">
                            <span style="font-size: 1.5rem; font-weight: bold; color: white; display: block; margin-bottom: 5px;">${win.number}</span>
                            <span style="font-size: 0.7rem; opacity: 0.6; display: block; margin-bottom: 10px;">${win.time}</span>
                            <button onclick="removeWinner(${win.originalIndex})" class="btn-absent" style="width: 100%; border-radius: 6px; font-size: 0.6rem; padding: 5px 0;">VẮNG MẶT</button>
                        </div>
                    `).reverse().join('')}
                </div>
            </div>
        `).join('');
    }

    const preview = availableNumbers.slice(0, 100);
    poolDisplay.innerHTML = preview.map(n => `<div class="pool-item">${n.toString().padStart(digitCount, '0')}</div>`).join('');
    if (availableNumbers.length > 100) {
        poolDisplay.innerHTML += `<div class="pool-item">...</div>`;
    }
}

function updateMasterList() {
    const start = config.start;
    const end = config.end;
    const digitCount = end.toString().length;
    let html = '';
    const availableSet = new Set(availableNumbers);

    for (let i = start; i <= end; i++) {
        const isAvailable = availableSet.has(i);
        const numStr = i.toString().padStart(digitCount, '0');
        html += `<div class="pool-item ${isAvailable ? 'available' : 'won'}">${numStr}</div>`;
    }
    masterListContainer.innerHTML = html;
}


// Logic moved up for global availability

initDigitBoxes();
updateUI();

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Lỗi khi vào chế độ toàn màn hình: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Background Music Events
bgMusicBtn.addEventListener('click', () => {
    if (!bgMusicPlaying) {
        bgMusic.play().then(() => {
            bgMusicPlaying = true;
            bgMusicBtn.innerText = '🔊';
        }).catch(err => {
            console.error("Lỗi phát nhạc nền:", err);
            alert("Vui lòng tương tác với trang web trước khi bật nhạc.");
        });
    } else {
        bgMusic.pause();
        bgMusicPlaying = false;
        bgMusicBtn.innerText = '🔇';
    }
});

bgVolumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
    if (bgMusic.volume > 0 && !bgMusicPlaying) {
        // Option to auto-start if volume is increased
    } else if (bgMusic.volume == 0) {
        bgMusicBtn.innerText = '🔇';
    } else {
        bgMusicBtn.innerText = '🔊';
    }
});

resetBtn.addEventListener('click', async () => {
    if (await showConfirm('Làm mới toàn bộ danh sách và lịch sử quay?')) {
        winnersHistory = [];
        localStorage.setItem('luckyDrawWinners', JSON.stringify(winnersHistory));
        initPool();
        updateUI();
        spinBtn.innerText = 'QUAY NGAY';
        spinBtn.disabled = false;
    }
});

settingsBtn.addEventListener('click', () => {
    configStart.value = config.start;
    configEnd.value = config.end;
    settingsModal.style.display = 'flex';
});

closeSettings.addEventListener('click', () => { settingsModal.style.display = 'none'; });

saveConfig.addEventListener('click', () => {
    const start = parseInt(configStart.value);
    const end = parseInt(configEnd.value);
    if (isNaN(start) || isNaN(end) || start >= end || (end - start) > 50000) {
        alert('Vui lòng nhập dải số hợp lệ.');
        return;
    }
    if (confirm('Thay đổi cài đặt? Toàn bộ lịch sử sẽ bị xóa.')) {
        config = { start, end };
        winnersHistory = [];
        localStorage.setItem('luckyDrawWinners', JSON.stringify(winnersHistory));
        initPool();
        updateUI();
        settingsModal.style.display = 'none';
        spinBtn.innerText = 'QUAY NGAY';
        spinBtn.disabled = false;
    }
});

prizeSelect.addEventListener('change', () => {
    const selectedOption = prizeSelect.options[prizeSelect.selectedIndex];
    currentPrizeName.innerText = selectedOption.text.split(' (')[0];
});

viewAllBtn.addEventListener('click', () => {
    updateMasterList();
    fullListModal.style.display = 'flex';
});

closeFullList.addEventListener('click', () => { fullListModal.style.display = 'none'; });

// History Screen Events
viewHistoryBtn.addEventListener('click', () => {
    historyScreenModal.style.display = 'flex';
    updateUI();
});

closeHistoryScreen.addEventListener('click', () => {
    historyScreenModal.style.display = 'none';
});

resetWinnersBtn.addEventListener('click', async () => {
    if (await showConfirm('Bạn có chắc chắn muốn XÓA TOÀN BỘ danh sách trúng giải và ĐƯA SỐ VỀ THÙNG PHIẾU không?')) {
        // Return won numbers to pool
        winnersHistory.forEach(win => {
            const num = parseInt(win.number);
            if (!availableNumbers.includes(num)) {
                availableNumbers.push(num);
            }
        });
        shuffleArray(availableNumbers);
        winnersHistory = [];
        localStorage.setItem('luckyDrawWinners', JSON.stringify(winnersHistory));
        localStorage.setItem('luckyDrawPool', JSON.stringify(availableNumbers));
        updateUI();
    }
});

toggleDashboardBtn.addEventListener('click', () => {
    if (dashboard.style.display === 'none') {
        dashboard.style.display = 'grid';
        toggleDashboardBtn.innerText = 'ẨN DANH SÁCH & QUẢN LÝ';
        toggleDashboardBtn.style.background = 'rgba(255,0,118,0.2)';
    } else {
        dashboard.style.display = 'none';
        toggleDashboardBtn.innerText = 'HIỆN DANH SÁCH & QUẢN LÝ';
        toggleDashboardBtn.style.background = 'rgba(255,255,255,0.1)';
    }
});

let isSpinning = false;

async function spin() {
    if (isSpinning) return;
    const batchCount = parseInt(batchSpinSelect.value);
    if (availableNumbers.length < batchCount) {
        alert('Không đủ vé!');
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;

    const digitCount = config.end.toString().length;
    const selectedOption = prizeSelect.options[prizeSelect.selectedIndex];
    const prizeName = selectedOption.text.split(' (')[0];

    const batchWinners = [];
    for (let i = 0; i < batchCount; i++) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const winner = availableNumbers[randomIndex];
        const winnerStr = winner.toString().padStart(digitCount, '0');
        availableNumbers.splice(randomIndex, 1);
        const winObj = { number: winnerStr, prize: prizeName, time: new Date().toLocaleTimeString() };
        batchWinners.push(winObj);
        winnersHistory.push(winObj);
    }

    localStorage.setItem('luckyDrawPool', JSON.stringify(availableNumbers));
    localStorage.setItem('luckyDrawWinners', JSON.stringify(winnersHistory));

    if (batchCount === 1) {
        spinBtn.innerText = 'ĐANG QUAY...';
        spinSound.currentTime = 0;
        spinSound.play().catch(e => { });
        const winnerStr = batchWinners[0].number;
        const strips = document.querySelectorAll('.digit-strip');

        // --- RESET STEP ---
        // Reset all strips to top instantly so they all spin the same distance/speed every time
        strips.forEach(strip => {
            strip.style.transition = 'none';
            strip.style.transform = 'translateY(0)';
            strip.classList.remove('stopping');
            strip.classList.remove('spinning');
        });

        // Force browser to apply the 'none' transition before we start the real animation
        displayContainer.offsetHeight;

        // Precise timing calculation - Detect from audio or use 15s default
        const totalAnimationDuration = (audioDuration > 5) ? audioDuration : 15;
        const totalWaitTime = totalAnimationDuration * 1000;

        // Final stop delay for staggered effect
        const finalStopDelay = 2.0;
        const baseDuration = totalAnimationDuration - finalStopDelay;

        strips.forEach((strip, index) => {
            const targetDigit = parseInt(winnerStr[index]);
            const digitHeight = strip.querySelector('.digit').offsetHeight;

            // Increase cycles for higher speed: 100-140 cycles to avoid short spin
            const cycles = 100 + index * 10;
            const targetPos = (cycles * 10 + targetDigit) * digitHeight;

            // Sync tick sounds with strip starts
            setTimeout(() => {
                const s = tickSound.cloneNode();
                s.play().catch(e => { });
            }, index * 200);

            // Give each strip a slightly different duration for staggered stopping
            const staggerDelay = (index / (strips.length - 1)) * finalStopDelay;
            const duration = baseDuration + staggerDelay;

            strip.classList.add('spinning');
            strip.classList.remove('stopping');

            // Using a very smooth ease-out for a long 12s spin
            strip.style.transition = `transform ${duration}s cubic-bezier(0.15, 0, 0.05, 1)`;
            strip.style.transform = `translateY(-${targetPos}px)`;
        });

        // Set 'stopping' class slightly before each strip hits its final position
        setTimeout(() => {
            strips.forEach(s => {
                s.classList.remove('spinning');
                s.classList.add('stopping');
            });
        }, totalWaitTime - 2000);

        await new Promise(r => setTimeout(r, totalWaitTime));
        spinSound.pause();
        winSound.currentTime = 0;
        winSound.play().catch(e => { });
        finalNumberDisplay.innerText = winnerStr;
        winnerModal.style.display = 'flex';
        createConfetti();
    } else {
        spinBtn.innerText = `BỐC ${batchCount} SỐ...`;
        spinSound.currentTime = 0;
        spinSound.play().catch(e => { });

        // --- ADD ANIMATION FOR BATCH MODE TOO ---
        const strips = document.querySelectorAll('.digit-strip');
        const winnerStr = batchWinners[0].number; // Show first winner on main display for effect

        strips.forEach(strip => {
            strip.style.transition = 'none';
            strip.style.transform = 'translateY(0)';
        });
        displayContainer.offsetHeight;

        const totalAnimationDuration = (audioDuration > 5) ? audioDuration : 15;

        strips.forEach((strip, index) => {
            const cycles = 100 + index * 10;
            const targetPos = (cycles * 10 + parseInt(winnerStr[index])) * strip.querySelector('.digit').offsetHeight;
            strip.style.transition = `transform ${totalAnimationDuration}s cubic-bezier(0.15, 0, 0.05, 1)`;
            strip.style.transform = `translateY(-${targetPos}px)`;
            strip.classList.add('spinning');
        });

        // Wait for music
        await new Promise(r => setTimeout(r, totalAnimationDuration * 1000));

        spinSound.pause();
        winSound.currentTime = 0;
        winSound.play().catch(e => { });

        strips.forEach(s => s.classList.remove('spinning'));

        finalNumberDisplay.innerHTML = `<div style="text-align:center; color:#ffea00; font-size:1.5rem; margin-bottom:15px; border-bottom:1px solid rgba(255,234,0,0.3); padding-bottom:10px;">DANH SÁCH TRÚNG GIẢI</div>
        <div style="font-size: 2rem; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            ${batchWinners.map(w => `<span style="background: rgba(0,210,255,0.1); border: 1px solid var(--primary-color); border-radius: 8px; padding: 5px; color:white;">${w.number}</span>`).join('')}
        </div>`;
        winnerModal.style.display = 'flex';
        createConfetti();
    }

    updateUI();
    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.innerText = 'QUAY TIẾP';
}

function createConfetti() {
    for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.style.left = Math.random() * 100 + 'vw';
        div.style.backgroundColor = ['#ff0076', '#00d2ff', '#ffea00', '#00ff00'][Math.floor(Math.random() * 4)];
        div.style.width = div.style.height = Math.random() * 10 + 5 + 'px';
        div.style.position = 'fixed';
        div.style.top = '-10px';
        div.style.zIndex = '101';
        div.style.borderRadius = '50%';
        document.body.appendChild(div);
        div.animate([{ transform: 'translateY(0) rotate(0)', opacity: 1 }, { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }], { duration: Math.random() * 2000 + 1000 }).onfinish = () => div.remove();
    }
}

spinBtn.addEventListener('click', spin);
closeBtn.addEventListener('click', () => { winnerModal.style.display = 'none'; });
