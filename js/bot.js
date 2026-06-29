/**
 * bot.js — 地震監視Bot
 * リアルタイム検知・ログ・アラート通知
 */

window.BotModule = (() => {
  let running = true;
  let logCount = 0;
  let audioCtx = null;

  // ===== 初期化 =====
  function init() {
    bindControls();
    log('ok', 'Bot起動 — 地震データ監視を開始');
    log('info', `更新間隔: ${CONFIG.BOT.FETCH_INTERVAL/1000}秒`);
    log('info', `M${CONFIG.BOT.ALERT_MAG_LOG}以上の地震を検知します`);
  }

  // ===== 新着地震を受け取る =====
  function onNewQuake(q) {
    if (!running) return;
    if (q.mag < CONFIG.BOT.ALERT_MAG_LOG) return;

    const type = q.mag >= 6 ? 'warn' : q.mag >= 4 ? 'detect' : 'info';
    log(type, `M${q.mag.toFixed(1)} ${q.place} 深さ${q.depth}km`);

    if (q.tsunami) {
      log('warn', `🌊 津波情報: ${q.tsunami}`);
    }

    if (q.mag >= CONFIG.BOT.ALERT_MAG_BANNER) {
      log('warn', `⚠️ 強い地震を検知 — M${q.mag.toFixed(1)}`);
    }

    // 音声アラート
    if (document.getElementById('alertSound')?.checked) {
      playAlert(q.mag);
    }

    // ブラウザ通知
    if (q.mag >= CONFIG.BOT.ALERT_MAG_BANNER && 'Notification' in window) {
      sendNotification(q);
    }
  }

  // ===== ログ追加 =====
  function log(type, msg) {
    const el = document.getElementById('botLog');
    if (!el) return;

    const time = new Date().toLocaleTimeString('ja-JP');
    const typeLabels = {
      detect: '検知',
      info:   'INFO',
      warn:   '警告',
      ok:     'OK',
    };

    const entry = document.createElement('div');
    entry.className = 'bot-entry';
    entry.innerHTML = `<span class="be-time">${time}</span> <span class="be-type be-${type}">${typeLabels[type] || type}</span> ${escapeHtml(msg)}`;
    el.insertBefore(entry, el.firstChild);

    logCount++;
    // 最大500件
    while (el.children.length > 500) el.removeChild(el.lastChild);
  }

  // ===== ブラウザ通知 =====
  function sendNotification(q) {
    if (Notification.permission === 'granted') {
      new Notification(`🚨 地震速報 M${q.mag.toFixed(1)}`, {
        body: `${q.place}\n深さ${q.depth}km${q.tsunami ? '\n🌊 ' + q.tsunami : ''}`,
        icon: 'https://twemoji.maxcdn.com/v/latest/svg/1f6a8.svg',
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') sendNotification(q);
      });
    }
  }

  // ===== Web Audio ビープ音 =====
  function playAlert(mag) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = mag >= 6 ? 880 : mag >= 5 ? 660 : 440;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(audioCtx.currentTime + (mag >= 6 ? 1.5 : 0.5));
    } catch(e) { /* 無視 */ }
  }

  // ===== コントロールバインド =====
  function bindControls() {
    const toggle = document.getElementById('botToggle');
    const clear  = document.getElementById('botClear');
    const status = document.getElementById('botStatus');

    toggle?.addEventListener('click', () => {
      running = !running;
      toggle.textContent = running ? 'Bot 停止' : 'Bot 開始';
      toggle.classList.toggle('active', running);
      if (status) {
        status.textContent = running ? '稼働中' : '停止中';
        status.className = running ? 'bot-status' : 'bot-status offline';
      }
      log('info', running ? 'Bot を再開しました' : 'Bot を停止しました');
    });

    clear?.addEventListener('click', () => {
      const el = document.getElementById('botLog');
      if (el) el.innerHTML = '';
      logCount = 0;
      log('ok', 'ログをクリアしました');
    });

    // ブラウザ通知許可ボタン（M5設定から）
    document.getElementById('alertM5')?.addEventListener('change', (e) => {
      if (e.target.checked && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(p => {
          log('info', `ブラウザ通知: ${p === 'granted' ? '許可' : '拒否'}`);
        });
      }
    });
  }

  // ===== 定期ステータスログ =====
  function periodicLog() {
    if (!running) return;
    const stats = window.DataModule?.getStats();
    if (stats) {
      log('ok', `定期チェック完了 — 24h: ${stats.count24h}件, 最大M${stats.maxMag}`);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function isRunning() { return running; }

  return { init, onNewQuake, log, periodicLog, isRunning };
})();
