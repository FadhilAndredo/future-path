/** Shared navigation and footer. The active page is declared in body[data-page]. */
(() => {
  'use strict';
  const { $, $$ } = window.FP;
  const page = document.body.dataset.page;
  const logo = '<span class="brandmark">f<span>↗</span></span>FUTURE<span>PATH</span>';
  const link = (file, label) => `<a href="${file}.html" ${page === file ? 'class="active" aria-current="page"' : ''}>${label}</a>`;
  const exploring = ['sma', 'smk', 'skills'].includes(page);

  $('#siteHeader').innerHTML = `
    <a class="brand" href="index.html" aria-label="FUTUREPATH Beranda">${logo}</a>
    <button class="menu" aria-label="Buka navigasi" aria-expanded="false" aria-controls="mainNav">☰</button>
    <nav id="mainNav" aria-label="Navigasi utama">
      ${link('index', 'Beranda')}${link('explore', 'Kenali Diri')}
      <details class="nav-dropdown ${exploring ? 'current-group' : ''}">
        <summary>Eksplorasi <span aria-hidden="true">⌄</span></summary>
        <div class="dropdown-content">
          ${link('sma', 'SMA / MA')}${link('smk', 'SMK / MAK')}${link('skills', 'Keterampilan')}
        </div>
      </details>
      ${link('careers', 'Profesi')}${link('universities', 'Pendidikan')}${link('pathways', 'Jalur Masa Depan')}
    </nav>
    <button class="saved-btn" id="savedOpen">♡ <span>Simpananku</span> <b id="savedCount">0</b></button>`;

  $('#siteFooter').innerHTML = `
    <a class="brand" href="index.html">${logo}</a>
    <p>Explore your potential. Discover your future.</p>
    <span>Prototipe edukasi · Bukan asesmen psikologis</span>
    <button class="plain" id="about">Tentang & referensi ↗</button>
    <small>Tanpa akun. Pilihan tersimpan hanya pada browser ini.</small>`;

  $('.menu').addEventListener('click', () => {
    const expanded = $('#mainNav').classList.toggle('open');
    $('.menu').setAttribute('aria-expanded', String(expanded));
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-dropdown')) $('.nav-dropdown').open = false;
    if (!event.target.closest('#siteHeader')) {
      $('#mainNav').classList.remove('open');
      $('.menu').setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    $('.nav-dropdown').open = false;
    $('#mainNav').classList.remove('open');
    $('.menu').setAttribute('aria-expanded', 'false');
  });
  $$('#mainNav a').forEach((anchor) => anchor.addEventListener('click', () => {
    $('#mainNav').classList.remove('open');
    $('.menu').setAttribute('aria-expanded', 'false');
  }));
  window.FP.updateCount();
})();
