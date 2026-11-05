/** Career search, category filters, bookmarks, and side-by-side comparison. */
(async () => {
  'use strict';
  const { $, $$, escapeHTML: esc, loadData, showLoadError, isSaved, openModal, toast } = window.FP;
  const grid = $('#careerGrid');
  if (!grid) return;
  let careers;
  try { careers = await loadData('careers.json'); }
  catch { showLoadError(grid); return; }

  let filter = 'Semua';
  let query = '';
  let compared = [];

  function card(career) {
    const selected = isSaved(career.id);
    return `<article class="career">
      <div class="career-visual" style="--tint:${esc(career.tint)};--ink:${esc(career.ink)}">
        <span class="career-symbol" aria-hidden="true">${esc(career.icon)}</span>
        <button class="bookmark ${selected ? 'on' : ''}" data-save="${esc(career.id)}"
          aria-label="${selected ? 'Hapus simpanan' : 'Simpan'} ${esc(career.name)}" aria-pressed="${selected}">${selected ? '♥' : '♡'}</button>
      </div>
      <div class="career-body"><div class="eyebrow">${esc(career.cat)}</div>
        <h3>${esc(career.name)}</h3><p>${esc(career.desc)}</p>
        <div class="career-foot"><button class="detail-btn" data-career="${esc(career.id)}">Kenali profesi ↗</button>
          <label><input type="checkbox" data-compare="${esc(career.id)}"
            aria-label="Bandingkan ${esc(career.name)}" ${compared.includes(career.id) ? 'checked' : ''}> Bandingkan</label>
        </div>
      </div></article>`;
  }

  function render() {
    const list = careers.filter((career) => {
      const searchable = `${career.name} ${career.cat} ${career.skills.join(' ')} ${career.study}`.toLowerCase();
      return (filter === 'Semua' || career.cat === filter) && searchable.includes(query.toLowerCase());
    });
    grid.innerHTML = list.length ? list.map(card).join('') :
      '<p class="empty">Belum ada profesi yang cocok. Coba kata lain atau kategori Semua bidang.</p>';
    $('#compareBar').hidden = compared.length === 0;
    $('#compareCount').textContent = `${compared.length} dari 3 profesi dipilih`;
    $('#compareOpen').disabled = compared.length < 2;
    $('#compareOpen').title = compared.length < 2 ? 'Pilih minimal 2 profesi' : 'Buka perbandingan';
  }

  $('#filters').addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    $$('[data-filter]').forEach((item) => {
      item.classList.toggle('selected', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    render();
  });
  $('#careerSearch').addEventListener('input', (event) => { query = event.target.value.trim(); render(); });
  grid.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-compare]');
    if (!checkbox) return;
    const id = checkbox.dataset.compare;
    if (checkbox.checked && compared.length >= 3) {
      checkbox.checked = false;
      toast('Pilih maksimal 3 profesi untuk dibandingkan.');
      return;
    }
    compared = checkbox.checked ? [...compared, id] : compared.filter((item) => item !== id);
    render();
  });
  $('#compareReset').addEventListener('click', () => { compared = []; render(); });
  $('#compareOpen').addEventListener('click', () => {
    if (compared.length < 2) return;
    const selected = careers.filter((career) => compared.includes(career.id));
    const rows = [['Bidang', 'cat'], ['Aktivitas', 'tasks'], ['Keterampilan', 'skills'], ['Pendidikan', 'study'], ['Langkah awal', 'step']];
    openModal(`<div class="eyebrow">LIHAT PILIHAN BERDAMPINGAN</div><h2>Bandingkan profesi</h2>
      <div class="table-scroll" tabindex="0" aria-label="Tabel perbandingan, geser jika diperlukan">
        <table class="compare-table"><thead><tr><th scope="col">Aspek</th>
          ${selected.map((career) => `<th scope="col">${esc(career.name)}</th>`).join('')}
        </tr></thead><tbody>${rows.map(([label, key]) => `<tr><th scope="row">${label}</th>
          ${selected.map((career) => `<td>${esc(Array.isArray(career[key]) ? career[key].join(', ') : career[key])}</td>`).join('')}
        </tr>`).join('')}</tbody></table>
      </div>`);
  });
  document.addEventListener('fp:saved-change', render);
  render();
})();
