/** Pathway details and one replaceable PDF download, without generating TXT files. */
(async () => {
  'use strict';
  const { $, $$, escapeHTML: esc, loadData, showLoadError, guideURL } = window.FP;
  const container = $('#pathwayContent');
  if (!container) return;
  let pathways;
  try { pathways = await loadData('pathways.json'); }
  catch { showLoadError(container); return; }

  function render(id, shouldScroll = false) {
    const pathway = pathways.find((item) => item.id === id);
    if (!pathway) return;
    $$('[data-path]').forEach((button) => {
      const selected = button.dataset.path === id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    container.innerHTML = `<article class="path-detail"><div class="eyebrow">LANGKAH YANG BISA DICOBA</div>
      <h2>${esc(pathway.title)}</h2><ol>${pathway.steps.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>
      <p>${esc(pathway.note)}</p><a class="primary" href="${guideURL}" download>Unduh panduan lengkap PDF ↓</a></article>`;
    if (shouldScroll) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $$('[data-path]').forEach((button) => button.addEventListener('click', () => render(button.dataset.path, true)));
  render('kuliah');
})();
