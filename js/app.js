/**
 * app.js — エントリーポイント
 * 全モジュールを初期化し、定期更新を開始
 */

(async () => {
  // ===== 初期化 =====
  const map = MapModule.init();
  UIModule.init();
  BotModule.init();

  // ===== 初回データ取得 =====
  BotModule.log('info', '初回データ取得中...');
  await DataModule.fetchAll();
  BotModule.log('ok', '初回データ取得完了');

  // ===== ニュース初期取得 =====
  setTimeout(() => NewsModule.fetch(), 1000);

  // ===== 定期更新 =====
  let fetchTimer   = setInterval(() => DataModule.fetchAll(), CONFIG.BOT.FETCH_INTERVAL);
  let newsTimer    = setInterval(() => NewsModule.fetch(),    CONFIG.BOT.NEWS_INTERVAL);
  let botLogTimer  = setInterval(() => BotModule.periodicLog(), 300000); // 5分ごと

  // ===== Bot停止/再開時にタイマー制御 =====
  const origToggle = document.getElementById('botToggle');
  origToggle?.addEventListener('click', () => {
    if (BotModule.isRunning()) {
      clearInterval(fetchTimer);
      clearInterval(newsTimer);
      clearInterval(botLogTimer);
    } else {
      fetchTimer  = setInterval(() => DataModule.fetchAll(), CONFIG.BOT.FETCH_INTERVAL);
      newsTimer   = setInterval(() => NewsModule.fetch(),    CONFIG.BOT.NEWS_INTERVAL);
      botLogTimer = setInterval(() => BotModule.periodicLog(), 300000);
    }
  });

  // ===== ページ非表示時は更新を抑制 =====
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(fetchTimer);
    } else {
      DataModule.fetchAll();
      fetchTimer = setInterval(() => DataModule.fetchAll(), CONFIG.BOT.FETCH_INTERVAL);
    }
  });

  // ===== キーボードショートカット =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'r' && !e.ctrlKey) DataModule.fetchAll();
    if (e.key === 'f') MapModule.resetView();
  });

  console.log('%c🗾 JISHIN.WATCH', 'font-size:24px;color:#e85d3a;font-weight:bold;');
  console.log('%cリアルタイム地震監視システム起動完了', 'color:#8b93ae;');
  console.log('%cデータソース: P2P地震情報 / USGS', 'color:#4e566b;');
})();
