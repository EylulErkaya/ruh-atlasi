// ═══════════════════════════════════════════════════════════════
//  SCRIPT.JS — Ruh Hali Takibi
//  login.html + index.html için tüm fonksiyonlar
// ═══════════════════════════════════════════════════════════════
const FAKE_USER = {
  email: "test@test.com",
  password: "123456",
  name: "Eylül"
};

// ─── HELPERS ────────────────────────────────────────────────────
function load(k, def) {
  try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
}
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ─── DETECT WHICH PAGE WE'RE ON ────────────────────────────────
const IS_LOGIN_PAGE = !!document.getElementById('page-landing');
const IS_APP_PAGE   = !!document.getElementById('screen-mood');

// ═══════════════════════════════════════════════════════════════
//  LOGIN.HTML — SAYFA GEÇİŞLERİ & AUTH
// ═══════════════════════════════════════════════════════════════
if (IS_LOGIN_PAGE) {

  // ─── ONBOARDING STATE ────────────────────────────────────────
  let currentSlide = 0;
  const TOTAL_SLIDES = 3;

  // ─── SAYFA GEÇİŞ FONKSİYONLARI ──────────────────────────────
  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active', 'out');
    });
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  }

  function goOnboard() {
    currentSlide = 0;
    updateSlide();
    showPage('page-onboard');
  }

  function goAuth(tab) {
    showPage('page-auth');
    switchAuth(tab || 'login');
  }

  function goBack() {
    showPage('page-landing');
  }

  function goApp() {
    window.location.href = 'index.html';
  }

  function skipOnboard() {
    goAuth('register');
  }

  // ─── ONBOARDING SLIDES ───────────────────────────────────────
  function nextSlide() {
    if (currentSlide < TOTAL_SLIDES - 1) {
      currentSlide++;
      updateSlide();
    } else {
      goAuth('register');
    }
  }

  function updateSlide() {
    const slides = document.getElementById('onboard-slides');
    if (slides) slides.style.transform = `translateX(-${currentSlide * 33.333}%)`;

    document.querySelectorAll('.dot-ind').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });

    const nextBtn = document.getElementById('onboard-next');
    if (nextBtn) {
      nextBtn.textContent = currentSlide === TOTAL_SLIDES - 1 ? 'Başla →' : 'Devam →';
    }
  }

  // ─── AUTH TABS ───────────────────────────────────────────────
  function switchAuth(tab) {
    const isLogin = tab === 'login';
    document.getElementById('tab-login').classList.toggle('active', isLogin);
    document.getElementById('tab-register').classList.toggle('active', !isLogin);
    document.getElementById('form-login').style.display = isLogin ? 'block' : 'none';
    document.getElementById('form-register').style.display = isLogin ? 'none' : 'block';
    document.getElementById('auth-headline').textContent = isLogin ? 'Hoş geldin' : 'Hesap oluştur';
    document.getElementById('auth-sub').textContent = isLogin ? 'Hesabına giriş yap' : 'Ücretsiz başla';
  }

  // ─── FORM HATA TEMİZLE ───────────────────────────────────────
  function clearError(fieldId) {
    const f = document.getElementById(fieldId);
    if (f) f.classList.remove('error');
  }

  function setError(fieldId) {
    const f = document.getElementById(fieldId);
    if (f) f.classList.add('error');
  }

  function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.toggle('loading', loading);
    btn.disabled = loading;
  }

  // ─── ŞİFRE GÜCÜ ─────────────────────────────────────────────
  function checkStrength(val) {
    const fill = document.getElementById('strength-fill');
    if (!fill) return;
    let score = 0;
    if (val.length >= 8)  score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const pct  = (score / 4) * 100;
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#10B981'];
    fill.style.width = pct + '%';
    fill.style.background = colors[Math.max(0, score - 1)];
  }

  // ─── LOGIN ───────────────────────────────────────────────────
  function doLogin() {
  let ok = true;
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;

  if (!email) { setError('f-login-email'); ok = false; }
  if (!pass)  { setError('f-login-pass'); ok = false; }
  if (!ok) return;

  setLoading('btn-login', true);

  setTimeout(() => {
    setLoading('btn-login', false);

    // 🔥 SAHTE LOGIN KONTROL
    if (email === FAKE_USER.email && pass === FAKE_USER.password) {
      localStorage.setItem('loggedUser', JSON.stringify(FAKE_USER));
      goApp(); // direkt indexe git
    } else {
      showToast("Yanlış giriş (test@test.com / 123456)");
    }

  }, 500);
}

  // ─── REGISTER ────────────────────────────────────────────────
  function doRegister() {
    let ok = true;
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass  = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;

    if (!name)                          { setError('f-reg-name');  ok = false; }
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('f-reg-email'); ok = false; }
    if (pass.length < 8)                { setError('f-reg-pass');  ok = false; }
    if (pass !== pass2)                 { setError('f-reg-pass2'); ok = false; }
    if (!ok) return;

    setLoading('btn-register', true);
    setTimeout(() => {
      setLoading('btn-register', false);

      const users = load('registeredUsers', []);
      if (users.find(u => u.email === email)) {
        setError('f-reg-email');
        showToast('Bu e-posta zaten kayıtlı');
        return;
      }

      // Kullanıcı Adı oluştur
      const nick = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
                   Math.floor(Math.random() * 90 + 10);

      const user = { id: Date.now(), name, email, password: pass, nick };
      users.push(user);
      save('registeredUsers', users);
      save('loggedUser', user);
      save('userNick', nick);

      showWelcome(user);
    }, 800);
  }

  // ─── SOSYAL GİRİŞ (Demo) ─────────────────────────────────────
  function doSocial(provider) {
    showToast(provider + ' ile giriş simüle ediliyor...');
    setTimeout(() => {
      const user = {
        id: Date.now(),
        name: provider + ' Kullanıcısı',
        email: provider.toLowerCase() + '@demo.com',
        nick: String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
              Math.floor(Math.random() * 90 + 10)
      };
      save('loggedUser', user);
      save('userNick', user.nick);
      showWelcome(user);
    }, 1000);
  }

  // ─── WELCOME BACK SAYFASI ────────────────────────────────────
  function showWelcome(user) {
    document.getElementById('welcome-name').textContent = 'Merhaba, ' + user.name + '!';
    document.getElementById('welcome-sub').textContent =
      'Bugün nasıl hissediyorsun?\nRuh halini kaydetmeye devam et.';

    // Streak hesapla
    const history = load('moodHistory', []);
    const { current, best } = calcStreak(history);
    document.getElementById('welcome-streak').textContent = current;

    // Bu haftanın en çok tekrar eden ruh hali
    const freq = {};
    history.forEach(e => { freq[e.mood] = (freq[e.mood] || 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('welcome-best-mood').textContent =
      top ? (MOOD_META[top[0]]?.emoji + ' ' + MOOD_META[top[0]]?.label) : '—';

    showPage('page-welcome');
  }

  function logOut() {
    localStorage.removeItem('loggedUser');
    showPage('page-landing');
    showToast('Çıkış yapıldı');
  }

  // ─── BAŞLANGIÇ: Daha önce giriş yapıldıysa welcome sayfasına git
  (function initLogin() {
    const logged = load('loggedUser', null);
    if (logged) {
      showWelcome(logged);
    }
  })();

  // Global erişim için window'a aktar
  window.goOnboard    = goOnboard;
  window.goAuth       = goAuth;
  window.goBack       = goBack;
  window.goApp        = goApp;
  window.skipOnboard  = skipOnboard;
  window.nextSlide    = nextSlide;
  window.switchAuth   = switchAuth;
  window.clearError   = clearError;
  window.checkStrength= checkStrength;
  window.doLogin      = doLogin;
  window.doRegister   = doRegister;
  window.doSocial     = doSocial;
  window.logOut       = logOut;
}

// ═══════════════════════════════════════════════════════════════
//  SHARED DATA (her iki sayfadan erişilebilir)
// ═══════════════════════════════════════════════════════════════
const MOOD_META = {
  happy:   { label: 'Mutlu',     emoji: '😊', color: '#F59E0B' },
  excited: { label: 'Heyecanlı', emoji: '🤩', color: '#10B981' },
  relaxed: { label: 'Rahat',     emoji: '😌', color: '#3B82F6' },
  neutral: { label: 'Nötr',      emoji: '😐', color: '#8B5CF6' },
  sad:     { label: 'Üzgün',     emoji: '😢', color: '#6366F1' },
  stressed:{ label: 'Stresli',   emoji: '😰', color: '#EC4899' },
  angry:   { label: 'Kızgın',    emoji: '😠', color: '#EF4444' },
  tired:   { label: 'Yorgun',    emoji: '😴', color: '#9CA3AF' },
  anxious: { label: 'Endişeli',  emoji: '😟', color: '#F97316' },
};

const SUGGESTIONS = {
  happy: [
    { icon: '🎵', bg: '#FEF3C7', title: 'Enerjik Playlist',   text: 'Mutluluğunu yüksek tut — dans müziği listeni aç!' },
    { icon: '📸', bg: '#ECFDF5', title: 'Anı yakala',         text: 'Bugünü fotoğrafla veya günlüğe not al.' },
    { icon: '🫂', bg: '#EFF6FF', title: 'Sevdiklerinle bağlan', text: 'Bu enerjiyi biriyle paylaş — ara veya mesaj at.' },
  ],
  excited: [
    { icon: '🎯', bg: '#ECFDF5', title: 'Yeni bir hedef belirle', text: 'Heyecanını bir projeye yönlendir.' },
    { icon: '🎲', bg: '#FEF3C7', title: 'Yeni bir şey dene',      text: 'Merak ettiğin ama yapmadığın bir aktivite.' },
    { icon: '📝', bg: '#F5F3FF', title: 'Listeyi yap',            text: 'Yapmak istediğin her şeyi bir yere yaz.' },
  ],
  relaxed: [
    { icon: '📚', bg: '#EFF6FF', title: 'Kitap molası',      text: 'Bu sakin hisde okumak için mükemmel zaman.' },
    { icon: '🍵', bg: '#FEF3C7', title: 'Bir şeyler hazırla', text: 'Beğendiğin bir içecek yap, anı yaşa.' },
    { icon: '🧘', bg: '#ECFDF5', title: 'Meditasyon',         text: '5 dakikalık nefes egzersizi ile bu hissi derinleştir.' },
  ],
  neutral: [
    { icon: '🚶', bg: '#EFF6FF', title: 'Kısa bir yürüyüş',      text: '15 dakika dışarı çık, bakış açını değiştir.' },
    { icon: '🎧', bg: '#FEF3C7', title: 'Podcast dinle',          text: 'İlgini çeken bir konuyu keşfet.' },
    { icon: '💡', bg: '#F5F3FF', title: 'Küçük bir görev tamamla', text: 'Bekleyen küçük bir işi bitir, iyi hissettir.' },
  ],
  sad: [
    { icon: '🤗', bg: '#FEE2E2', title: 'Kendine iyi bak', text: 'Bir fincan sıcak içecek ve rahat bir köşe.' },
    { icon: '🎬', bg: '#EFF6FF', title: 'Hafif bir film',  text: 'Sevdiğin komediyi veya animasyonu aç.' },
    { icon: '✍️', bg: '#F5F3FF', title: 'Duygularını yaz', text: 'Ne hissettiğini bir kağıda dökmeyi dene.' },
    { icon: '📞', bg: '#ECFDF5', title: 'Birine ulaş',     text: 'Güvendiğin biriyle konuşmak iyi gelebilir.' },
  ],
  stressed: [
    { icon: '🌬️', bg: '#EFF6FF', title: '4-7-8 Nefes tekniği',  text: '4 say nefes al, 7 tut, 8 sayda ver. 3 kez tekrarla.' },
    { icon: '📋', bg: '#FEF3C7', title: 'Listeyi küçült',         text: 'Yapılacakları sırala, en önemlisini seç.' },
    { icon: '🚿', bg: '#ECFDF5', title: 'Sıcak duş',             text: 'Kısa bir duş stres hormonlarını düşürür.' },
    { icon: '🎵', bg: '#F5F3FF', title: 'Sakinleştirici müzik',  text: 'Lo-fi veya klasik müzik konsantrasyonu artırır.' },
  ],
  angry: [
    { icon: '🏃', bg: '#FEE2E2', title: 'Fiziksel hareket', text: '10 dakika koş veya atlama yap — enerjiyi boşalt.' },
    { icon: '✍️', bg: '#FEF3C7', title: 'Yazarak boşalt',   text: 'Kızgınlığını bir kağıda yaz, sonra parçala.' },
    { icon: '🌊', bg: '#EFF6FF', title: 'Soğuk su',         text: 'Yüzüne soğuk su çarp — anında sakinleştirici etki.' },
    { icon: '⏳', bg: '#F5F3FF', title: '10 dakika bekle',   text: 'Karar vermeden önce biraz zaman geçir.' },
  ],
  tired: [
    { icon: '😴', bg: '#F5F3FF', title: 'Şekerleme',                text: '20 dakikalık uyku vücut ve zihni yeniler.' },
    { icon: '💧', bg: '#EFF6FF', title: 'Su iç',                    text: 'Yorgunluğun sık sebebi dehidrasyondur.' },
    { icon: '🍌', bg: '#FEF3C7', title: 'Enerji verici atıştırmalık', text: 'Muz, fındık veya yulaf seni ayağa kaldırır.' },
  ],
  anxious: [
    { icon: '🌍', bg: '#ECFDF5', title: '5-4-3-2-1 Tekniği', text: '5 gördüğün, 4 dokunduğun, 3 duyduğun şeyi say.' },
    { icon: '🎵', bg: '#EFF6FF', title: 'Doğa sesleri',      text: 'Yağmur, dalgalar — anksiyeteyi azaltır.' },
    { icon: '📓', bg: '#FEF3C7', title: 'Endişeleri yaz',    text: 'Kafandakileri kağıda görmek daha yönetilebilir kılar.' },
    { icon: '👟', bg: '#F5F3FF', title: 'Yürüyüş',           text: 'Tempolu bir yürüyüş kortizol seviyesini düşürür.' },
  ],
};

const SAMPLE_POSTS = [
  { id: 's1', nick: 'B47', text: 'Bugün çok stresli bir gün geçirdim, iş yerinde baskı altındayım. Bazen nasıl başa çıkacağımı bilmiyorum.', time: 3600,  likes: 3, hearts: 5, liked: false, hearted: false },
  { id: 's2', nick: 'T59', text: 'Bugün harika bir gün geçirdim! Uzun zamandır ertelediğim hobime başladım ve çok mutluyum 🎉',             time: 10800, likes: 7, hearts: 4, liked: false, hearted: false },
  { id: 's3', nick: 'M82', text: 'Meditasyon yapmaya başladım ve uyku kalitem gerçekten arttı. Herkese tavsiye ederim.',                     time: 86400, likes: 5, hearts: 8, liked: false, hearted: false },
];

// ─── STREAK HESAPLA (her iki sayfa kullanır) ─────────────────
function calcStreak(historyArr) {
  const h = historyArr || load('moodHistory', []);
  if (!h.length) return { current: 0, best: 0 };

  const days = [...new Set(h.map(e => e.date))].sort().reverse();
  const today = todayStr();
  let tmp = 0, prev = null;

  for (const d of days) {
    if (!prev) {
      if (d === today || diffDays(d, today) === 1) { tmp = 1; prev = d; }
      else break;
    } else if (diffDays(d, prev) === 1) { tmp++; prev = d; }
    else break;
  }

  let best = 0, t2 = 0, p2 = null;
  for (const d of [...days].reverse()) {
    if (!p2) { t2 = 1; p2 = d; }
    else if (diffDays(p2, d) === 1) { t2++; p2 = d; }
    else { best = Math.max(best, t2); t2 = 1; p2 = d; }
  }
  best = Math.max(best, t2, tmp);
  return { current: tmp, best };
}

function todayStr() { return new Date().toISOString().split('T')[0]; }
function diffDays(a, b) { return Math.abs((new Date(b) - new Date(a)) / 86400000); }

// ═══════════════════════════════════════════════════════════════
//  INDEX.HTML — ANA UYGULAMA
// ═══════════════════════════════════════════════════════════════
if (IS_APP_PAGE) {

  let pendingMood = null;

  function getHistory()  { return load('moodHistory', []); }
  function getPosts()    { return load('communityPosts', SAMPLE_POSTS); }
  function getNick() {
    let n = load('userNick', null);
    if (!n) {
      n = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Math.floor(Math.random() * 90 + 10);
      save('userNick', n);
    }
    return n;
  }

  // ─── TABS ────────────────────────────────────────────────────
  function switchTab(btn, screenId, title) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(screenId).classList.add('active');
    document.getElementById('header-title').textContent = title;
    if (screenId === 'screen-history')   renderHistory();
    if (screenId === 'screen-community') renderCommunity();
    if (screenId === 'screen-profile')   renderProfile();
  }

  // ─── MOOD EKRANI ─────────────────────────────────────────────
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      pendingMood = btn.dataset.mood;
      openDetailModal(btn.dataset.mood);
    });
  });

  function checkTodayEntry() {
    const h = getHistory();
    const todayEntry = h.find(e => e.date === todayStr());
    document.getElementById('today-banner').style.display = todayEntry ? 'flex' : 'none';
  }

  function openDetailModal(mood) {
    document.getElementById('detail-title').textContent = MOOD_META[mood].emoji + ' ' + MOOD_META[mood].label;
    document.getElementById('detail-reason').value = '';
    document.getElementById('detail-intensity').value = 3;
    document.getElementById('detail-modal').classList.add('open');
  }

  function closeDetailModal() {
    document.getElementById('detail-modal').classList.remove('open');
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  }

  function saveMoodEntry() {
    const mood      = pendingMood;
    const reason    = document.getElementById('detail-reason').value.trim();
    const intensity = parseInt(document.getElementById('detail-intensity').value);
    const entry = { id: Date.now(), mood, reason, intensity, date: todayStr(), ts: new Date().toISOString() };
    const h = getHistory();
    h.push(entry);
    save('moodHistory', h);
    closeDetailModal();
    showToast('Ruh halin kaydedildi! ' + MOOD_META[mood].emoji);
    updateStreak();
    showSuggestions(mood);
    checkTodayEntry();
  }

  function showSuggestions(mood) {
    document.getElementById('mood-grid').style.display = 'none';
    const area = document.getElementById('suggestions-area');
    area.style.display = 'block';
    document.getElementById('sug-mood-badge').textContent = MOOD_META[mood].emoji + ' ' + MOOD_META[mood].label;
    const sugs = SUGGESTIONS[mood] || [];
    document.getElementById('suggestions-list').innerHTML = sugs.map(s => `
      <div class="sug-card">
        <div class="sug-icon" style="background:${s.bg}">${s.icon}</div>
        <div>
          <h3>${s.title}</h3>
          <p>${s.text}</p>
        </div>
      </div>
    `).join('');
  }

  function resetMoodScreen() {
    document.getElementById('mood-grid').style.display = 'grid';
    document.getElementById('suggestions-area').style.display = 'none';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  }

  // ─── GEÇMİŞ ──────────────────────────────────────────────────
  const MOOD_SCORE = { happy: 5, excited: 5, relaxed: 4, neutral: 3, sad: 2, stressed: 2, angry: 1, tired: 2, anxious: 2 };

  function renderHistory() {
    const h = getHistory();
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const barsEl = document.getElementById('chart-bars');
    barsEl.innerHTML = days.map(d => {
      const entries = h.filter(e => e.date === d);
      const avg = entries.length ? entries.reduce((a, e) => a + (MOOD_SCORE[e.mood] || 3), 0) / entries.length : 0;
      const pct   = Math.round((avg / 5) * 100);
      const color = avg >= 4 ? '#10B981' : avg >= 3 ? '#3B82F6' : avg >= 2 ? '#F59E0B' : '#EF4444';
      const day   = new Date(d).getDay();
      return `<div class="bar-wrap">
        <div class="bar" style="height:${pct}%;background:${avg ? color : 'var(--border)'}"></div>
        <div class="bar-day">${dayNames[day]}</div>
      </div>`;
    }).join('');

    const listEl = document.getElementById('history-list');
    if (!h.length) {
      listEl.innerHTML = '<div class="empty"><i class="fas fa-clipboard-list"></i><p>Henüz kayıt yok</p></div>';
      return;
    }
    const sorted = [...h].reverse().slice(0, 20);
    listEl.innerHTML = sorted.map(e => `
      <div class="history-item">
        <div class="history-emoji">${MOOD_META[e.mood]?.emoji || '❓'}</div>
        <div class="history-info">
          <div class="history-mood">${MOOD_META[e.mood]?.label || e.mood}
            <small style="color:var(--text3);font-size:11px">· ${'★'.repeat(e.intensity || 3)}</small>
          </div>
          ${e.reason ? `<div class="history-note">${e.reason.slice(0, 60)}${e.reason.length > 60 ? '…' : ''}</div>` : ''}
          <div class="history-date">${formatDate(e.date)}</div>
        </div>
      </div>
    `).join('');
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' });
  }

  // ─── TOPLULUK ─────────────────────────────────────────────────
  function renderCommunity() {
    const posts = getPosts();
    const el = document.getElementById('community-list');
    if (!posts.length) {
      el.innerHTML = '<div class="empty"><i class="fas fa-users"></i><p>Henüz paylaşım yok. İlk sen paylaş!</p></div>';
      return;
    }
    el.innerHTML = [...posts].reverse().map(p => `
      <div class="post-card">
        <div class="post-header">
          <span class="post-nick">${p.nick}</span>
          <span class="post-time">${relTime(p.time)}</span>
        </div>
        <div class="post-text">${escHtml(p.text)}</div>
        <div class="post-actions">
          <button class="react-btn ${p.liked ? 'thumbed' : ''}" onclick="reactPost('${p.id}','like')">
            <i class="${p.liked ? 'fas' : 'far'} fa-thumbs-up"></i> ${p.likes}
          </button>
          <button class="react-btn ${p.hearted ? 'liked' : ''}" onclick="reactPost('${p.id}','heart')">
            <i class="${p.hearted ? 'fas' : 'far'} fa-heart"></i> ${p.hearts}
          </button>
        </div>
      </div>
    `).join('');
  }

  function relTime(s) {
    if (typeof s === 'number') {
      if (s < 3600)  return Math.round(s / 60) + ' dk önce';
      if (s < 86400) return Math.round(s / 3600) + ' saat önce';
      return Math.round(s / 86400) + ' gün önce';
    }
    const diff = (Date.now() - new Date(s)) / 1000;
    if (diff < 60)    return 'Az önce';
    if (diff < 3600)  return Math.round(diff / 60) + ' dk önce';
    if (diff < 86400) return Math.round(diff / 3600) + ' saat önce';
    return Math.round(diff / 86400) + ' gün önce';
  }

  function escHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  function reactPost(id, type) {
    const posts = getPosts();
    const p = posts.find(x => x.id === id);
    if (!p) return;
    if (type === 'like') { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; }
    else { p.hearted = !p.hearted; p.hearts += p.hearted ? 1 : -1; }
    save('communityPosts', posts);
    renderCommunity();
  }

  function openNewPost() {
    document.getElementById('post-nick-label').textContent = getNick();
    document.getElementById('post-text').value = '';
    document.getElementById('post-modal').classList.add('open');
  }

  function closePostModal() {
    document.getElementById('post-modal').classList.remove('open');
  }

  function submitPost() {
    const text = document.getElementById('post-text').value.trim();
    if (!text) { showToast('Bir şeyler yaz!'); return; }
    const posts = getPosts();
    posts.push({
      id: 'u' + Date.now(), nick: getNick(), text,
      time: new Date().toISOString(),
      likes: 0, hearts: 0, liked: false, hearted: false
    });
    save('communityPosts', posts);
    closePostModal();
    renderCommunity();
    showToast('Paylaşımın yayında! ✨');
  }

  // ─── PROFİL ───────────────────────────────────────────────────
  function renderProfile() {
    const nick = getNick();
    document.getElementById('profile-nick').textContent = nick;
    document.getElementById('nick-display').textContent  = nick;
    document.getElementById('post-nick-label').textContent = nick;

    const { current, best } = calcStreak();
    const h = getHistory();
    document.getElementById('stat-total').textContent  = h.length;
    document.getElementById('stat-streak').textContent = current;
    document.getElementById('stat-best').textContent   = best;

    const freq = {};
    h.forEach(e => { freq[e.mood] = (freq[e.mood] || 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('stat-top-mood').textContent =
      top ? MOOD_META[top[0]]?.emoji + ' ' + MOOD_META[top[0]]?.label : '—';

    document.getElementById('notif-time').value    = load('notifTime', '20:00');
    document.getElementById('notif-toggle').checked = load('notifEnabled', true);
  }

  function saveNotifTime(v)  { save('notifTime', v);    showToast('Bildirim saati: ' + v); }

  function applyNotifTime() {
    const enabled = load('notifEnabled', true);

    // 🔴 Bildirim kapalıysa engelle
    if (!enabled) {
      showToast("Saat kaydetmek için bildirimleri açman gerekiyor 🔔");
      return;
    }

    const val = document.getElementById('notif-time').value;

    if (!val) {
      showToast("Saat seç");
      return;
    }

    save('notifTime', val);
    showToast("Bildirim saati kaydedildi: " + val);
  }
  function saveNotifPref(v)  { save('notifEnabled', v); showToast(v ? 'Bildirimler açık' : 'Bildirimler kapalı'); }

  function changeNickname() {
  const modal = document.getElementById('nick-modal');
  const input = document.getElementById('nick-input');

  input.value = load('userNick', '');
  modal.classList.add('open');
}

  function saveNickname() {
  const input = document.getElementById('nick-input');
  const val = input.value.trim();

  if (!val) {
    showToast("Kullanıcı Adı boş olamaz");
    return;
  }

  save('userNick', val.slice(0, 5));
  renderProfile();
  closeNickModal();
  showToast("Kullanıcı Adı güncellendi!");
}
  function closeNickModal() {
    document.getElementById('nick-modal').classList.remove('open');
}

  function clearAllData() {
    document.getElementById('delete-modal').classList.add('open');
}

  function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('open');
}

  function confirmDelete() {
    ['moodHistory', 'communityPosts', 'userNick', 'notifTime', 'notifEnabled']
      .forEach(k => localStorage.removeItem(k));

    closeDeleteModal();
    showToast('Tüm veriler silindi');
    renderProfile();
  }

  function logoutApp() {
  localStorage.removeItem('loggedUser');

  showToast("Çıkış yapıldı 👋");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 800);
}

window.logoutApp = logoutApp;

  // ─── STREAK & TOAST ───────────────────────────────────────────
  function updateStreak() {
  const el = document.getElementById('streak-count');
  if (!el) return; // 💥 crash engelle

  const { current } = calcStreak();
  el.textContent = current;
}

  // ─── INIT ─────────────────────────────────────────────────────
  (function init() {
  try {
    getNick();
    updateStreak();
    checkTodayEntry();
  } catch (e) {
    console.error("INIT ERROR:", e);
  }
})();

  // Global erişim
  window.switchTab       = switchTab;
  window.closeDetailModal= closeDetailModal;
  window.saveMoodEntry   = saveMoodEntry;
  window.resetMoodScreen = resetMoodScreen;
  window.reactPost       = reactPost;
  window.openNewPost     = openNewPost;
  window.closePostModal  = closePostModal;
  window.submitPost      = submitPost;
  window.saveNotifTime   = saveNotifTime;
  window.saveNotifPref   = saveNotifPref;
  window.changeNickname  = changeNickname;
  window.clearAllData    = clearAllData;
}