/**
 * config.js — 設定ファイル
 * GitHubに公開する前にAPIキーを環境変数等で管理してください
 */

window.CONFIG = {
  // ========== Google Maps API ==========
  // https://console.cloud.google.com/ でAPIキーを取得してください
  GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',

  // ========== データソース ==========
  // 気象庁API (CORS制限のためProxyサーバー経由推奨)
  JMA_API_BASE: 'https://www.jma.go.jp/bosai/quake/data',
  // P2P地震情報 (無料, CORS対応)
  P2P_API: 'https://api.p2pquake.net/v2/history?codes=551&limit=100',
  // USGS API (世界の地震データ, CORS対応)
  USGS_API: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
  // NIED F-net (防災科学技術研究所)
  NIED_API: 'https://www.fnet.bosai.go.jp/event/joho.php',

  // ========== Bot設定 ==========
  BOT: {
    // 自動更新間隔 (ミリ秒)
    FETCH_INTERVAL: 30000,       // 30秒
    NEWS_INTERVAL:  120000,      // 2分
    // アラート閾値
    ALERT_MAG_BANNER: 5.0,       // バナー表示
    ALERT_MAG_SOUND:  4.0,       // 音声アラート
    ALERT_MAG_LOG:    3.0,       // ログ記録
  },

  // ========== 地図設定 ==========
  MAP: {
    // 日本全体の中心
    CENTER: [36.5, 136.0],
    ZOOM: 5,
    // タイル設定
    TILES: {
      standard:  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      terrain:   'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      dark:      'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    },
  },

  // ========== 震度カラー ==========
  SCALE_COLORS: {
    '7':  '#9b0000',
    '6+': '#e50000',
    '6-': '#ff2800',
    '5+': '#ff6900',
    '5-': '#ffa500',
    '4':  '#ffff00',
    '3':  '#7fff00',
    '2':  '#00e5ff',
    '1':  '#4fc3f7',
    '0':  '#888888',
  },

  // ========== マグニチュードカラー ==========
  MAG_COLOR: (m) => {
    if (m >= 7.0) return '#9b0000';
    if (m >= 6.0) return '#e50000';
    if (m >= 5.0) return '#ff6900';
    if (m >= 4.0) return '#ffa500';
    if (m >= 3.0) return '#3b82f6';
    return '#4fc3f7';
  },

  // ========== マグニチュード→サイズ ==========
  MAG_RADIUS: (m) => Math.max(4, Math.pow(2, m - 1) * 2),
};
