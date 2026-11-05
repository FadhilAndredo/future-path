/**
 * Shared utilities, JSON loading, local preferences, and detail dialogs.
 * Page-specific behavior lives in the other files inside js/.
 */
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
  const cache = new Map();
  const guideURL = 'assets/documents/panduan-futurepath.pdf';
  const modal = $('#modal');
  const content = $('#modalContent');
  let modalContext = null;
  let toastTimer;

  function readStorage(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      toast('Penyimpanan browser tidak tersedia. Pilihan hanya bertahan selama halaman ini terbuka.');
      return false;
    }
  }

  let saved = readStorage('fp-saved', []);
  if (!Array.isArray(saved)) saved = [];
  saved = [...new Set(saved.filter((id) => typeof id === 'string'))];

  /** Cache one request per JSON file, including requests from different pages' modules. */
  function loadData(filename) {
    if (!cache.has(filename)) {
      const request = fetch(`data/${filename}`).then((response) => {
        if (!response.ok) throw new Error(`Tidak dapat membaca ${filename}.`);
        return response.json();
      });
      cache.set(filename, request);
      request.catch(() => cache.delete(filename));
    }
    return cache.get(filename);
  }

  function showLoadError(container) {
    if (!container) return;
    container.innerHTML = '<div class="empty error-message"><h2>Data belum dapat dimuat.</h2>' +
      '<p>Jika membuka file langsung, jalankan folder ini melalui Live Server di VS Code ' +
      'atau server lokal. Jika sudah online, periksa koneksi lalu muat ulang halaman.</p>' +
      '<p>Panduan PDF tetap bisa diunduh melalui tombol di bawah halaman.</p></div>';
  }

  function toast(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3200);
  }

  function openModal(html, context = null) {
    modalContext = context;
    content.innerHTML = `<div class="modal">${html}</div>`;
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
  }

  $('#closeModal').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (event) => {
    if (event.target !== modal) return;
    const bounds = modal.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) modal.close();
  });

  function updateCount() {
    const badge = $('#savedCount');
    if (badge) badge.textContent = saved.length;
  }

  function isSaved(id) {
    return saved.includes(id);
  }

  function toggleSaved(id) {
    saved = isSaved(id) ? saved.filter((value) => value !== id) : [...saved, id];
    writeStorage('fp-saved', saved);
    updateCount();
    document.dispatchEvent(new CustomEvent('fp:saved-change'));
    toast(isSaved(id) ? 'Profesi masuk ke simpananmu.' : 'Profesi dihapus dari simpanan.');
  }

  async function showCareer(id) {
    const careers = await loadData('careers.json');
    const career = careers.find((item) => item.id === id);
    if (!career) return;
    openModal(`
      <div class="eyebrow">CAREER EXPLORER / ${escapeHTML(career.cat)}</div>
      <h2>${escapeHTML(career.name)}</h2>
      <p>${escapeHTML(career.desc)}</p>
      <h3>Apa yang dikerjakan?</h3><p>${escapeHTML(career.tasks)}</p>
      <h3>Bekal keterampilan</h3>
      <div class="chips">${career.skills.map((skill) => `<span>${escapeHTML(skill)}</span>`).join('')}</div>
      <h3>Pendidikan yang bisa ditelusuri</h3><p>${escapeHTML(career.study)}</p>
      <h3>Di mana berkarier?</h3><p>${escapeHTML(career.industry)}</p>
      <h3>Contoh perjalanan</h3><p>${escapeHTML(career.growth)}</p>
      <h3>Coba langkah kecil ini</h3><p>${escapeHTML(career.step)}</p>
      <button class="primary" data-save="${escapeHTML(id)}">
        ${isSaved(id) ? '♥ Tersimpan · klik untuk hapus' : '♡ Simpan profesi'}
      </button>
      <p class="source-note">Gambaran pengenalan profesi. Kualifikasi dapat berbeda menurut peran dan pemberi kerja.</p>
    `, { type: 'career', id });
  }

  async function showSaved() {
    const careers = await loadData('careers.json');
    const list = careers.filter((career) => isSaved(career.id));
    openModal(`
      <div class="eyebrow">KOLEKSI PRIBADIMU</div><h2>Simpananku (${list.length})</h2>
      <button class="detail-btn" data-last-quiz>Lihat hasil eksplorasi terakhir ↗</button>
      <p>Tersimpan hanya pada browser dan perangkat ini.</p>
      ${list.length ? list.map((career) => `
        <div class="saved-row"><button class="detail-btn" data-career="${escapeHTML(career.id)}">
          ${escapeHTML(career.name)} ↗</button>
          <button class="plain" data-save="${escapeHTML(career.id)}">Hapus</button></div>
      `).join('') : '<p>Koleksimu masih kosong. Tekan ikon hati pada profesi yang menarik perhatianmu.</p>'}
    `, { type: 'saved' });
  }

  const quizLabels = {
    tech: 'Sains & teknologi', creative: 'Seni & kreativitas',
    business: 'Ekonomi & bisnis', social: 'Sosial & humaniora',
  };

  function scoreRows(score) {
    return Object.entries(quizLabels).map(([key, label]) => {
      const count = Math.max(0, Math.min(5, Number(score[key]) || 0));
      return `<div class="result-row"><b>${escapeHTML(label)} · ${count} dari 5 pilihan</b>
        <div><i style="width:${count * 20}%"></i></div></div>`;
    }).join('');
  }

  function showLastQuiz() {
    const last = readStorage('fp-quiz', null);
    if (!last?.score) {
      openModal('<div class="eyebrow">KENALI MINATMU</div><h2>Belum ada hasil eksplorasi.</h2>' +
        '<p>Coba lima pertanyaan aktivitas untuk memulai.</p>' +
        '<a class="primary" href="explore.html">Mulai eksplorasi ↗</a>');
      return;
    }
    openModal(`<div class="eyebrow">HASIL EKSPLORASI TERAKHIR</div>
      <h2>Jejak rasa ingin tahumu</h2><p>Pilihan aktivitas pada eksplorasi terakhir:</p>
      ${scoreRows(last.score)}
      <p>Ini pengenalan minat, bukan pengukuran kemampuan atau asesmen psikologis.</p>
      <a class="primary" href="explore.html">Coba eksplorasi lagi ↗</a>`);
  }

  async function showField(id) {
    const [fields, careers] = await Promise.all([
      loadData('study-programs.json'), loadData('careers.json'),
    ]);
    const field = fields.find((item) => item.id === id || item.name === id);
    if (!field) return;
    const related = careers.filter((career) => field.career.includes(career.id));
    openModal(`
      <div class="eyebrow">${field.track === 'sma' ? 'BIDANG ILMU SMA / MA' : 'PROGRAM KEAHLIAN SMK / MAK'}</div>
      <h2>${escapeHTML(field.name)}</h2>
      <h3>Yang bisa kamu pelajari</h3><p>${escapeHTML(field.subjects)}</p>
      <h3>Pilihan pendidikan lanjutan</h3><p>${escapeHTML(field.studies)}</p>
      <h3>Keterampilan yang dilatih</h3><p>${escapeHTML(field.skills)}</p>
      <h3>Kenali contoh profesi</h3>
      ${related.length ? related.map((career) => `<p><button class="detail-btn"
        data-career="${escapeHTML(career.id)}">${escapeHTML(career.name)} ↗</button></p>`).join('') :
        '<p>Front office, layanan tamu, dan operasional perhotelan. Telusuri juga pelatihan pelayanan dan bahasa.</p>'}
      ${field.track === 'smk' ? '<h3>Kerja, usaha, dan pengembangan kompetensi</h3><p>Bangun portofolio dari proyek sekolah. Telusuri pelatihan dan sertifikasi yang relevan melalui lembaga resmi, lalu uji ide layanan atau usaha kecil sesuai kompetensimu.</p>' : ''}
      <h3>Mulai mencoba</h3><p>Buat proyek kecil, diskusikan dengan guru, dan catat hal yang ingin kamu pelajari berikutnya.</p>
      <a class="primary" href="pathways.html">Lihat pilihan jalur ↗</a>
    `);
  }

  async function showSkill(id) {
    const skills = await loadData('skills.json');
    const skill = skills.find((item) => item.id === id || item.name === id);
    if (!skill) return;
    openModal(`<div class="eyebrow">SKILL DEVELOPMENT / TANTANGAN KECIL</div>
      <h2>${escapeHTML(skill.name)}</h2><p>${escapeHTML(skill.challenge)}</p>
      <h3>Catatan refleksi</h3><ol><li>Apa yang kamu coba?</li>
      <li>Apa yang terasa mudah dan sulit?</li><li>Apa satu hal yang ingin diperbaiki?</li></ol>
      <p>Ulangi dengan proyek yang sedikit lebih menantang. Simpan hasil karyamu sebagai bukti perkembangan.</p>
      <a class="primary" href="${guideURL}" download>Unduh panduan lengkap PDF ↓</a>`);
  }

  function showAbout() {
    openModal(`<div class="eyebrow">TENTANG FUTUREPATH</div>
      <h2>Ruang untuk menemukan kemungkinan.</h2>
      <p>Prototipe eksplorasi pendidikan dan karier untuk siswa SMA/MA serta SMK/MAK, berdasarkan Panduan Pengembangan FUTUREPATH yang disediakan pengguna.</p>
      <p>Konten merupakan pengenalan awal. Materi perlu ditinjau bersama guru BK sebelum digunakan dalam kegiatan pembelajaran.</p>
      <h3>Referensi penelusuran lanjutan</h3><ul>
      <li><a href="https://www.ui.ac.id/" target="_blank" rel="noopener">Universitas Indonesia ↗</a></li>
      <li><a href="https://itb.ac.id/program-studi-sarjana" target="_blank" rel="noopener">Program studi ITB ↗</a></li>
      <li><a href="https://pmb.pens.ac.id/" target="_blank" rel="noopener">Penerimaan mahasiswa PENS ↗</a></li>
      <li><a href="https://pddikti.kemdiktisaintek.go.id/" target="_blank" rel="noopener">PDDikti ↗</a></li>
      <li><a href="https://bnsp.go.id/" target="_blank" rel="noopener">BNSP ↗</a></li></ul>
      <p>Referensi contoh kampus ditelusuri 4 November 2026. Cek informasi terbaru langsung pada sumber resmi. Situs ini tidak menampilkan biaya, kuota, atau jadwal penerimaan.</p>
      <h3>Privasi</h3><p>Tidak memerlukan akun atau data pribadi. Simpanan dan hasil terakhir berada di browser ini, tanpa sinkronisasi antarperangkat.</p>
      <button class="plain" data-clear-storage>Hapus simpanan dan hasil eksplorasi</button>`);
  }

  /** One delegated listener also covers controls rendered inside dialogs. */
  document.addEventListener('click', async (event) => {
    const target = event.target.closest('button, a');
    if (!target) return;
    try {
      if (target.dataset.href) location.href = target.dataset.href;
      else if (target.hasAttribute('data-career')) await showCareer(target.dataset.career);
      else if (target.hasAttribute('data-field')) await showField(target.dataset.field);
      else if (target.hasAttribute('data-skill')) await showSkill(target.dataset.skill);
      else if (target.hasAttribute('data-save')) {
        toggleSaved(target.dataset.save);
        if (modal.open && modalContext?.type === 'saved') await showSaved();
        else if (modal.open && modalContext?.type === 'career') await showCareer(modalContext.id);
      } else if (target.id === 'savedOpen') await showSaved();
      else if (target.hasAttribute('data-last-quiz')) showLastQuiz();
      else if (target.id === 'about') showAbout();
      else if (target.hasAttribute('data-clear-storage')) {
        saved = [];
        try { localStorage.removeItem('fp-saved'); localStorage.removeItem('fp-quiz'); } catch { /* No stored data is accessible. */ }
        updateCount();
        document.dispatchEvent(new CustomEvent('fp:saved-change'));
        modal.close();
        toast('Data eksplorasi pada browser ini dihapus.');
      }
    } catch {
      toast('Data belum dapat dibuka. Jalankan lewat server lokal dan coba lagi.');
    }
  });

  async function initFieldPage() {
    const container = $('#fieldGrid');
    if (!container) return;
    try {
      const allFields = await loadData('study-programs.json');
      const fields = allFields.filter((field) => field.track === container.dataset.track);
      container.innerHTML = fields.map((field, index) => `
        <article class="field-card ${field.track}">
          <span class="eyebrow">${String(index + 1).padStart(2, '0')} / ${field.track === 'sma' ? 'BIDANG ILMU' : 'PROGRAM KEAHLIAN'}</span>
          <h2>${escapeHTML(field.name)}</h2><p>${escapeHTML(field.subjects)}</p>
          <button class="detail-btn" data-field="${escapeHTML(field.id)}">Jelajahi bidang ini ↗</button>
        </article>`).join('');
      const selected = new URLSearchParams(location.search).get('field');
      if (selected) await showField(selected);
    } catch { showLoadError(container); }
  }

  async function initSkillPage() {
    const container = $('#skillGrid');
    if (!container) return;
    try {
      const skills = await loadData('skills.json');
      container.innerHTML = skills.map((skill, index) => `<article class="field-card">
        <span class="eyebrow">${String(index + 1).padStart(2, '0')} / KETERAMPILAN</span>
        <h2>${escapeHTML(skill.name)}</h2><p>${escapeHTML(skill.challenge)}</p>
        <button class="detail-btn" data-skill="${escapeHTML(skill.id)}">Lihat panduan refleksi ↗</button>
      </article>`).join('');
    } catch { showLoadError(container); }
  }

  window.FP = {
    $, $$, escapeHTML, loadData, showLoadError, openModal, toast,
    readStorage, writeStorage, isSaved, updateCount, scoreRows, quizLabels, guideURL,
  };
  initFieldPage();
  initSkillPage();
})();
