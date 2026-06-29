/**
 * ui.js — UI操作モジュール
 * タブ、フィルター、時計
 */

window.UIModule = (() => {

  function init() {
    bindTabs();
    bindFilter();
    startClock();
    bindRefresh();
  }

  // ===== タブ切替 =====
  function bindTabs() {
    document.querySelectorAll('.tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + target)?.classList.add('active');

        // 統計タブ表示時にグラフ更新
        if (target === 'stats') {
          window.ChartModule?.update(window.DataModule?.getQuakes() || []);
        }
        // ニュースタブ表示時に取得
        if (target === 'news') {
          window.NewsModule?.fetch();
        }
      });
    });
  }

  // ===== フィルター =====
  function bindFilter() {
    const slider = document.getElementById('magFilter');
    const valEl  = document.getElementById('magVal');
    slider?.addEventListener('input', () => {
      if (valEl) valEl.textContent = parseFloat(slider.value).toFixed(1);
    });

    document.getElementById('applyFilter')?.addEventListener('click', () => {
      window.DataModule?.fetchAll();
    });
  }

  // ===== リアルタイム時計 =====
  function startClock() {
    function tick() {
      const el = document.getElementById('liveTime');
      if (el) {
        el.textContent = new Date().toLocaleString('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }) + ' JST';
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  // ===== 更新ボタン =====
  function bindRefresh() {
    document.getElementById('refreshBtn')?.addEventListener('click', async () => {
      const btn = document.getElementById('refreshBtn');
      if (btn) { btn.classList.add('spinning'); btn.disabled = true; }
      await window.DataModule?.fetchAll();
      if (btn) { btn.classList.remove('spinning'); btn.disabled = false; }
    });
  }

  return { init };
})();
