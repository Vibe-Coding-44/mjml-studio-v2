/* アセットライブラリ — manifest.json を読んでグリッド表示 */
(function () {
  const MANIFEST_URL = 'assets/images/manifest.json';

  // ── タブ切り替え ──
  document.querySelectorAll('.db-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.db-tab').forEach(b => b.classList.remove('db-tab--active'));
      btn.classList.add('db-tab--active');
      document.getElementById('tab-templates').classList.toggle('hidden', target !== 'templates');
      document.getElementById('tab-assets').classList.toggle('hidden', target !== 'assets');
      if (target === 'assets') loadAssets();
    });
  });

  let loaded = false;

  async function loadAssets() {
    if (loaded) return;
    loaded = true;

    const container = document.getElementById('assets-container');
    try {
      const res  = await fetch(MANIFEST_URL + '?t=' + Date.now());
      const data = await res.json();
      const base = data.base;

      container.innerHTML = data.groups.map(g => `
        <div class="db-asset-group">
          <div class="db-asset-group__title">${g.label}</div>
          <div class="db-asset-grid">
            ${g.items.map(item => {
              const url  = base + item.path;
              const isLogo = item.path.startsWith('cxl/');
              const thumbClass = isLogo ? 'db-asset-thumb db-asset-thumb--logo' : 'db-asset-thumb';
              return `
                <div class="db-asset-card">
                  <div class="${thumbClass}">
                    <img src="assets/images/${item.path}" alt="${item.name}" loading="lazy">
                  </div>
                  <div class="db-asset-info">
                    <div class="db-asset-name">${item.name}</div>
                    <div class="db-asset-url" title="${url}">${item.path}</div>
                    <button class="db-asset-copy" data-url="${url}">URL をコピー</button>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      `).join('');

      // コピーボタン
      container.querySelectorAll('.db-asset-copy').forEach(btn => {
        btn.addEventListener('click', async () => {
          await navigator.clipboard.writeText(btn.dataset.url);
          btn.textContent = 'コピー済み ✓';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'URL をコピー';
            btn.classList.remove('copied');
          }, 2000);
        });
      });

    } catch (e) {
      container.innerHTML = `<p style="color:var(--error);padding:20px">読み込み失敗: ${e.message}</p>`;
    }
  }
})();
