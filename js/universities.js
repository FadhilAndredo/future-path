/** Education examples are maintained in data/universities.json. */
(async () => {
  'use strict';
  const { $, $$, escapeHTML: esc, loadData, showLoadError } = window.FP;
  const container = $('#educationContent');
  if (!container) return;
  let education;
  try { education = await loadData('universities.json'); }
  catch { showLoadError(container); return; }

  function render(category) {
    container.innerHTML = `<div class="edu-grid">${education[category].map(({ name, meta, description, url }) => `
      <article class="edu-card"><span class="campus-icon" aria-hidden="true">▥</span>
        <div class="eyebrow">${esc(meta)}</div><h3>${esc(name)}</h3><p>${esc(description)}</p>
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">Kunjungi situs resmi ↗</a>` :
          '<a class="detail-btn" href="skills.html">Coba tantangan belajar ↗</a>'}
      </article>`).join('')}</div>`;
  }
  $('#eduTabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-edu]');
    if (!button) return;
    $$('[data-edu]').forEach((item) => {
      item.classList.toggle('selected', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    render(button.dataset.edu);
  });
  render('akademik');
})();
