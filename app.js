/* ======================
  REKLAMA MODAL
====================== */
const adModal = document.createElement('div');
adModal.id = 'adModal';
adModal.style.cssText = `
  position: fixed;
  top:0; left:0;
  width:100%; height:100%;
  background: rgba(0,0,0,0.6);
  display:flex; justify-content:center; align-items:center;
  z-index:9999; display:none;
`;
adModal.innerHTML = `
  <div style="background:#fff;color:#123;padding:20px;border-radius:12px;width:300px;text-align:center;">
    <h3>Reklama</h3>
    <p>Iltimos, reklama ko‘ring va keyin testni boshlash mumkin.</p>
    <button id="closeAdBtn" style="background:#0ea5e9;color:#fff;padding:10px 16px;border:none;border-radius:8px;margin-top:12px;cursor:pointer;">Ko‘rish tugmasi</button>
  </div>
`;
document.body.appendChild(adModal);

const closeAdBtn = document.getElementById('closeAdBtn');

function showAdModal() {
  adModal.style.display = 'flex';
}

function hideAdModal() {
  adModal.style.display = 'none';
  startQuizBtn.disabled = false; // endi testni boshlash mumkin
}

// show ad modal 1 martada step2 ga kirganda
startQuizBtn.addEventListener('click', (e) => {
  // avval testni boshlashni to‘xtatamiz
  e.preventDefault();

  // agar foydalanuvchi reklama ko‘rmagan bo‘lsa
  const adSeen = localStorage.getItem('adSeenToday');
  const today = new Date().toISOString().slice(0,10);
  if (adSeen !== today) {
    showAdModal();
  } else {
    // agar reklama allaqachon ko‘rilgan bo‘lsa, testni boshlash
    proceedToQuiz();
  }
});

// reklama tugmasi bosilganda
closeAdBtn.addEventListener('click', () => {
  const today = new Date().toISOString().slice(0,10);
  localStorage.setItem('adSeenToday', today); // foydalanuvchi reklama ko‘rdi
  hideAdModal();
  proceedToQuiz();
});

// asl start quiz funksiyasi
function proceedToQuiz() {
  subject = subjectSelect.value;
  qcount = parseInt(qcountSelect.value, 10) || 10;
  const bank = BANK[subject] || [];
  pool = shuffle(bank).slice(0, Math.min(qcount, bank.length));
  index = 0; score = 0; chosen = new Array(pool.length).fill(null);
  totalCountEl.textContent = pool.length;
  metaSubject.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
  goto(3);
  startTimerAndRender();
    }
