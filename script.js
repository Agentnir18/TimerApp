let totalTime = 0;
let remainingTime = 0;
let warningTime = 0;
let isRunning = false;
let lastTimestamp = null;
let hasWarned = false;

const progressCircle = document.querySelector('.progress');
const ringWrapper = document.getElementById('ringWrapper');
const timerText = document.getElementById('timer-text');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsForm = document.getElementById('settingsForm');

const totalMinutesInput = document.getElementById('totalMinutes');
const totalSecondsInput = document.getElementById('totalSeconds');
const warningMinutesInput = document.getElementById('warningMinutes');
const warningSecondsInput = document.getElementById('warningSeconds');

const radius = 100;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = 0;

function formatTime(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function updateRing() {
    const percent = remainingTime / (totalTime * 1000);
    const offset = circumference * (1 - percent);
    progressCircle.style.strokeDashoffset = offset;

    if ((remainingTime / 1000) <= warningTime && warningTime !== 0) {
        ringWrapper.classList.add('warning');
    } else {
        ringWrapper.classList.remove('warning');
    }

    timerText.textContent = formatTime(remainingTime);
}

function animateTimer(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (isRunning && remainingTime > 0) {
        remainingTime -= delta;
        if (!hasWarned && remainingTime <= warningTime * 1000 && remainingTime + delta > warningTime * 1000) {
            hasWarned = true;
            playAudioBeep(2);
        }

        if (remainingTime <= 0) {
            remainingTime = 0;
            isRunning = false;
            startPauseBtn.textContent = "▶ Start";
            playAudioBeep(4);
        }

        updateRing();
    }

    if (isRunning || remainingTime > 0) {
        requestAnimationFrame(animateTimer);
    }
}

function toggleTimer() {
    if (!isRunning) {
        if (remainingTime <= 0) {
            if (!setTimeFromInputs()) return;
            remainingTime = totalTime * 1000;
        }

        isRunning = true;
        hasWarned = false; // Reset warning flag
        startPauseBtn.textContent = "⏸ Pause";
        lastTimestamp = null;
        requestAnimationFrame(animateTimer);
    } else {
        isRunning = false;
        startPauseBtn.textContent = "▶ Start";
    }
}

function resetTimer() {
    isRunning = false;
    setTimeFromInputs();
    remainingTime = totalTime * 1000;
    hasWarned = false; // Reset warning flag
    ringWrapper.classList.remove('warning');
    updateRing();
    startPauseBtn.textContent = "▶ Start";
}

function setTimeFromInputs() {
    const tMin = parseInt(totalMinutesInput.value) || 0;
    const tSec = parseInt(totalSecondsInput.value) || 0;
    const wMin = parseInt(warningMinutesInput.value) || 0;
    const wSec = parseInt(warningSecondsInput.value) || 0;

    totalTime = tMin * 60 + tSec;
    warningTime = wMin * 60 + wSec;

    if (totalTime <= 0) {
        alert("Enter a valid total time.");
        return false;
    }

    return true;
}

let audioCtx;

function ensureAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playAudioBeep(times = 1) {
    const audio = document.getElementById('beepSound');
    let count = 0;

    function playNext() {
        if (count >= times) return;
        count++;

        // Clone to allow quick replay
        const clone = audio.cloneNode();
        clone.play();
        clone.onended = playNext;
    }

    playNext();
}


// Tab functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Event listeners
startPauseBtn.addEventListener('click', () => {
    toggleTimer();
});
resetBtn.addEventListener('click', resetTimer);
settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    resetTimer();
    document.querySelector('[data-tab="timerTab"]').click();
});

// Initialize
resetTimer();
