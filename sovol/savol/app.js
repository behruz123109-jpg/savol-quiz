/* ======================
   STATE & ELEMENTS
====================== */
const stepEls = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3'),
    4: document.getElementById('resultStep')
};

const nameInput = document.getElementById('name');
const groupInput = document.getElementById('group');
const subjectSelect = document.getElementById('subject');
const qcountSelect = document.getElementById('qcount');

const toStep2Btn = document.getElementById('toStep2');
const back1Btn = document.getElementById('back1');
const startQuizBtn = document.getElementById('startQuiz');

const quizEl = document.getElementById('quiz');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const timerEl = document.getElementById('timer');
const totalCountEl = document.getElementById('totalCount');

const metaSubject = document.getElementById('metaSubject');
const metaName = document.getElementById('metaName');

const resultEmoji = document.getElementById('resultEmoji');
const resultTitle = document.getElementById('resultTitle');
const resultText = document.getElementById('resultText');
const resultDetails = document.getElementById('resultDetails');
const sendTelegramResultBtn = document.getElementById('sendTelegramResult');
const retryBtn = document.getElementById('retry');

const showHistoryBtn = document.getElementById('showHistory');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const closeHistoryBtn = document.getElementById('closeHistory');
const clearHistoryBtn = document.getElementById('clearHistory');
const exportCSVBtn = document.getElementById('exportCSV');

const progressEl = document.getElementById('progress');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext?.('2d');

const adModal = document.getElementById('adModal');
const seeAdBtn = document.getElementById('seeAdBtn');

let userName = '', userGroup = '', subject = '', qcount = 10;
let pool = [], index = 0, score = 0, chosen = [];
let timer = null, timeLeft = 0;
let confettiParticles = [];
let balance = +localStorage.getItem('balance') || 0;

/* ======================
   UTILS
====================== */
function goto(step) {
    Object.values(stepEls).forEach(el => el.classList.remove('active'));
    stepEls[step].classList.add('active');
}

function fmtTime(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
}

function shuffle(a) { return a.slice().sort(() => Math.random() - 0.5); }

function saveHistory(entry) {
    const h = JSON.parse(localStorage.getItem('quiz_history_v2') || '[]');
    h.unshift(entry);
    localStorage.setItem('quiz_history_v2', JSON.stringify(h.slice(0, 200)));
}

function getHistory() { return JSON.parse(localStorage.getItem('quiz_history_v2') || '[]'); }

function resizeCanvas() { if (!ctx) return; confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ======================
   ADVERTISEMENT
====================== */
function checkAd() {
    if (localStorage.getItem('ad_seen')) return;
    adModal.classList.remove('hidden');
}

seeAdBtn?.addEventListener('click', () => {
    balance += 100;
    localStorage.setItem("balance", balance);
    document.getElementById("balance").textContent = balance;

    adModal.classList.add('hidden');
    localStorage.setItem('ad_seen', '1');

    alert('Reklama ko‘rildi, 100 so‘m qo‘shildi!');
});

/* ======================
   NAVIGATION
====================== */
toStep2Btn.addEventListener('click', () => {
    userName = nameInput.value.trim();
    userGroup = groupInput.value.trim();
    if (!userName || !userGroup) { return alert('Iltimos, ism va guruhni kiriting.'); }
    metaName.textContent = userName;
    goto(2);
});
back1Btn?.addEventListener('click', () => goto(1));

startQuizBtn.addEventListener('click', () => {
    subject = subjectSelect.value;
    qcount = parseInt(qcountSelect.value, 10) || 10;
    const bank = BANK[subject] || [];
    pool = shuffle(bank).slice(0, Math.min(qcount, bank.length));
    index = 0; score = 0; chosen = new Array(pool.length).fill(null);
    totalCountEl.textContent = pool.length;
    metaSubject.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
    goto(3);
    startTimerAndRender();
});

/* ======================
   TIMER & RENDER
====================== */
function startTimerAndRender() {
    timeLeft = Math.max(60, pool.length * 30);
    timerEl.textContent = '⏰ ' + fmtTime(timeLeft);
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = '⏰ ' + fmtTime(timeLeft);
        if (timeLeft <= 0) { clearInterval(timer); alert('⏰ Vaqt tugadi'); finishTest(); }
    }, 1000);
    renderQuestion();
}

function renderQuestion() {
    const item = pool[index];
    quizEl.innerHTML = '';
    const qdiv = document.createElement('div');
    qdiv.className = 'question';
    qdiv.innerHTML = `<p><strong>${index + 1}.</strong> ${item.q}</p>`;
    quizEl.appendChild(qdiv);

    item.a.forEach((opt, i) => {
        const lbl = document.createElement('label');
        lbl.innerHTML = `<input type="radio" name="opt" value="${i}" ${chosen[index] === i ? 'checked' : ''}> ${opt}`;
        lbl.addEventListener('click', () => selectOption(i, lbl));
        quizEl.appendChild(lbl);
    });

    progressEl.style.width = ((index / pool.length) * 100) + '%';
    prevBtn.classList.toggle('hidden', index === 0);
    nextBtn.classList.toggle('hidden', index >= pool.length - 1);
    submitBtn.classList.toggle('hidden', index < pool.length - 1);
}

function selectOption(optIndex, labelEl) {
    if (chosen[index] !== null) return;
    chosen[index] = optIndex;
    const correctIdx = pool[index].correct;
    const labels = quizEl.querySelectorAll('label');
    labels.forEach((l, i) => {
        l.classList.remove('correct', 'wrong');
        const input = l.querySelector('input');
        input.disabled = true;
        if (i === correctIdx) l.classList.add('correct');
        if (i === optIndex && i !== correctIdx) l.classList.add('wrong');
    });
    if (optIndex === correctIdx) score += 1;
}

nextBtn.addEventListener('click', () => {
    if (chosen[index] === null) return alert('Iltimos, javobni tanlang.');
    if (index < pool.length - 1) { index++; renderQuestion(); }
});
prevBtn.addEventListener('click', () => {
    if (index > 0) { index--; renderQuestion(); }
});
submitBtn.addEventListener('click', finishTest);

/* ======================
   FINISH
====================== */
function finishTest() {
    clearInterval(timer);
    const percent = ((score / pool.length) * 100).toFixed(1);
    resultEmoji.textContent = percent >= 60 ? '🎉' : "🙂";
    resultTitle.textContent = percent >= 60 ? 'Tabriklaymiz!' : "Yaxshiroq tayyorgarlik kerak";
    resultText.textContent = `Siz ${subject} fanidan ${score}/${pool.length} (${percent}%) natija oldingiz.`;
    const dt = new Date();
    const dateStr = dt.toLocaleString();
    resultDetails.textContent = `Ism: ${userName} · Guruh: ${userGroup} · Sana: ${dateStr}`;
    goto(4);

    saveHistory({ name: userName, group: userGroup, subject, score, total: pool.length, percent, date: dateStr });

    const message = `🏁 Test yakunlandi
👤 Ism: ${userName}
🏫 Guruh: ${userGroup}
📘 Fan: ${subject}
✅ To'g'ri: ${score}/${pool.length} (${percent}%)
⏰ Tugatildi: ${dateStr}`;
    sendTelegramMessage(message);

    if (percent >= 50) startConfetti();
}

function sendTelegramMessage(text) {
    const TOKEN = "8226398562:AAEPiTFZIQp4VdixrDCJsqfIMv9dEipj0X8";
    const CHAT_ID = "8488028783";

    fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
    }).then(res => res.json()).catch(err => console.error(err));
}

/* ======================
   CONFETTI
====================== */
function startConfetti() {
    if (!ctx) return;
    confettiParticles = [];
    const colors = ['#ff0', '#f00', '#0f0', '#00f', '#ff8c00', '#ff1493', '#60a5fa', '#34d399'];
    for (let i = 0; i < 160; i++) {
        confettiParticles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * -confettiCanvas.height,
            r: Math.random() * 6 + 2,
            c: colors[Math.floor(Math.random() * colors.length)],
            s: Math.random() * 3 + 1,
            rot: Math.random() * 360
        });
    }
    requestAnimationFrame(confettiLoop);
    setTimeout(() => confettiParticles = [], 6000);
}

function confettiLoop() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
        p.y += p.s;
        p.rot += p.s * 2;
        if (p.y > confettiCanvas.height + 20) {
            p.y = -10 - Math.random() * 100;
            p.x = Math.random() * confettiCanvas.width;
        }
    });
    if (confettiParticles.length) requestAnimationFrame(confettiLoop);
}

/* ======================
   HISTORY
====================== */
showHistoryBtn.addEventListener('click', () => {
    populateHistory();
    historyPanel.classList.remove('hidden');
});
closeHistoryBtn.addEventListener('click', () => historyPanel.classList.add('hidden'));
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Haqiqatan ham tarixni tozalaysizmi?')) { localStorage.removeItem('quiz_history_v2'); populateHistory(); }
});
exportCSVBtn.addEventListener('click', () => {
    const arr = getHistory();
    if (!arr.length) return alert('Hech qanday tarix topilmadi');
    const csv = ['Ism,Guruh,Fan,Score,Total,Percent,Sana', ...arr.map(r => `${r.name},${r.group},${r.subject},${r.score},${r.total},${r.percent},${r.date}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'quiz_history.csv'; a.click(); URL.revokeObjectURL(url);
});

function populateHistory() {
    const arr = getHistory();
    historyList.innerHTML = '';
    if (!arr.length) { historyList.innerHTML = '<div class="small">Hech qanday natija topilmadi</div>'; return; }
    arr.forEach(it => {
        const el = document.createElement('div'); el.className = 'history-item';
        el.innerHTML = `<div><strong>${it.name}</strong><div class="small">${it.group} · ${it.subject}</div></div>
                        <div style="text-align:right"><div><strong>${it.score}/${it.total}</strong></div><div class="small">${it.percent}% · ${it.date}</div></div>`;
        historyList.appendChild(el);
    });
}

/* ======================
   INIT
====================== */
goto(1);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { historyPanel.classList.add('hidden'); } });
document.getElementById("balance").textContent = balance;
checkAd();
