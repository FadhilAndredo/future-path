/** Five activity questions, result summary, and browser-local history. */
(() => {
  'use strict';
  const { $, escapeHTML: esc, writeStorage, scoreRows, quizLabels } = window.FP;
  const panel = $('#quizPanel');
  if (!panel) return;
  const questions = [
  [
    "Saat ada proyek kelas, kamu paling tertarik…",
    [
      [
        "Membuat aplikasi atau mencari cara kerja alat",
        "tech"
      ],
      [
        "Mendesain poster dan menyusun ide visual",
        "creative"
      ],
      [
        "Mengatur rencana dan anggaran",
        "business"
      ],
      [
        "Mendampingi teman dan menjelaskan materi",
        "social"
      ]
    ]
  ],
  [
    "Kegiatan yang ingin kamu coba di waktu luang…",
    [
      [
        "Eksperimen atau tantangan logika",
        "tech"
      ],
      [
        "Menggambar, menulis, atau membuat karya",
        "creative"
      ],
      [
        "Menjual produk atau mengelola acara",
        "business"
      ],
      [
        "Relawan atau kegiatan lingkungan dan kesehatan",
        "social"
      ]
    ]
  ],
  [
    "Masalah yang bikin kamu penasaran…",
    [
      [
        "Kenapa perangkat ini tidak bekerja?",
        "tech"
      ],
      [
        "Bagaimana membuat pesan lebih menarik?",
        "creative"
      ],
      [
        "Bagaimana kegiatan ini lebih efisien?",
        "business"
      ],
      [
        "Bagaimana membantu orang merasa lebih baik?",
        "social"
      ]
    ]
  ],
  [
    "Cara belajar yang paling ingin kamu coba…",
    [
      [
        "Menguji solusi dan melihat hasilnya",
        "tech"
      ],
      [
        "Membuat prototipe atau karya bebas",
        "creative"
      ],
      [
        "Menyusun target dan mencoba strategi",
        "business"
      ],
      [
        "Diskusi dan belajar bersama orang lain",
        "social"
      ]
    ]
  ],
  [
    "Proyek kecil yang ingin kamu mulai…",
    [
      [
        "Website sederhana atau simulasi sains",
        "tech"
      ],
      [
        "Komik, foto, atau desain kampanye",
        "creative"
      ],
      [
        "Rencana usaha atau catatan keuangan",
        "business"
      ],
      [
        "Kelas berbagi atau kegiatan kepedulian",
        "social"
      ]
    ]
  ]
];
  let answers = [];
  let current = 0;

  function showWelcome() {
    panel.innerHTML = `<div class="eyebrow">5 PERTANYAAN / TANPA JAWABAN SALAH</div>
      <h2>Apa yang membuatmu penasaran?</h2>
      <p>Pilih aktivitas yang paling ingin kamu lakukan saat ini. Hasilnya memberi ide bidang untuk ditelusuri, tanpa membatasi pilihanmu.</p>
      <ul><li>Tidak memerlukan nama atau akun.</li><li>Kamu bisa kembali ke pertanyaan sebelumnya.</li>
      <li>Hasil terakhir disimpan pada browser ini.</li></ul>
      <div class="button-row"><button class="primary" id="startQuiz">Mulai eksplorasi ↗</button>
      <button class="detail-btn" data-last-quiz>Lihat hasil terakhir</button></div>`;
    $('#startQuiz').addEventListener('click', () => { answers = []; current = 0; renderQuestion(); });
  }

  function renderQuestion() {
    const [question, options] = questions[current];
    panel.innerHTML = `<div class="eyebrow">PERTANYAAN ${current + 1} DARI ${questions.length}</div>
      <div class="quiz-progress" role="progressbar" aria-label="Kemajuan eksplorasi"
        aria-valuemin="0" aria-valuemax="5" aria-valuenow="${current}">
        <span style="width:${current / questions.length * 100}%"></span></div>
      <h2 tabindex="-1" id="questionTitle">${esc(question)}</h2>
      <p>Pilih yang paling ingin kamu lakukan saat ini.</p>
      <div class="quiz-options">${options.map(([text, key]) => `<button data-answer="${key}"
        ${answers[current] === key ? 'class="previous-answer"' : ''}>${esc(text)} <span aria-hidden="true">→</span></button>`).join('')}</div>
      <div class="button-row">${current ? '<button class="plain" id="quizBack">← Pertanyaan sebelumnya</button>' : ''}
      <button class="plain" id="quizRestart">Mulai ulang</button></div>
      <p class="source-note">Eksplorasi ringan, bukan tes psikologi. Minat bisa berkembang seiring pengalamanmu.</p>`;
    panel.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => {
      answers[current] = button.dataset.answer;
      current += 1;
      if (current === questions.length) showResult();
      else renderQuestion();
    }));
    if ($('#quizBack')) $('#quizBack').addEventListener('click', () => { current -= 1; renderQuestion(); });
    $('#quizRestart').addEventListener('click', showWelcome);
    $('#questionTitle').focus({ preventScroll: true });
  }

  function showResult() {
    const score = { tech: 0, creative: 0, business: 0, social: 0 };
    answers.forEach((answer) => { score[answer] += 1; });
    const highest = Math.max(...Object.values(score));
    const top = Object.keys(score).filter((key) => score[key] === highest);
    writeStorage('fp-quiz', { score, date: new Date().toISOString() });
    panel.innerHTML = `<div class="eyebrow">SELESAI / LANGKAH AWALMU</div>
      <h2 tabindex="-1" id="resultTitle">Ada rasa ingin tahu di sini ✦</h2>
      <p>Dalam pilihan aktivitasmu kali ini, <strong>${top.map((key) => esc(quizLabels[key])).join(' dan ')}</strong>
      paling sering muncul. Coba telusuri bidang ini, lalu jelajahi juga pilihan lain.</p>
      ${scoreRows(score)}<h3>Coba jelajahi berikutnya</h3><div class="chips">
      ${top.map((key) => `<a class="detail-btn" href="sma.html?field=${encodeURIComponent(quizLabels[key])}">${esc(quizLabels[key])} ↗</a>`).join('')}</div>
      <p>Hasil ini bukan ukuran kemampuan, diagnosis, atau jaminan kecocokan karier. Diskusikan pengalaman dan pilihanmu dengan guru BK atau orang yang kamu percaya.</p>
      <div class="button-row"><a class="primary" href="careers.html">Kenali contoh profesi ↗</a>
      <button class="plain" id="quizAgain">Ulangi eksplorasi</button></div>`;
    $('#quizAgain').addEventListener('click', showWelcome);
    $('#resultTitle').focus({ preventScroll: true });
  }

  showWelcome();
})();
