/**
 * news.js — 地震関連ニュースフィード
 * P2P地震情報 + 気象庁発表をパース
 */

window.NewsModule = (() => {

  const RSS_PROXIES = [
    // CORS対応のRSSプロキシ (自分でデプロイ推奨)
    // 気象庁地震情報フィード (RSS2.0)
    { name: '気象庁', url: 'https://www.jma.go.jp/bosai/quake/data/quake_rss.xml' },
  ];

  let newsItems = [];

  // ===== ニュース取得 =====
  async function fetch() {
    const feed = document.getElementById('newsFeed');
    if (!feed) return;

    // P2P地震情報から記事生成（リアルタイム）
    await buildFromP2P();

    // フォールバック: 固定ニュース表示
    if (!newsItems.length) {
      buildFallbackNews();
    }

    render();
  }

  // ===== P2P地震情報をニュース化 =====
  async function buildFromP2P() {
    try {
      const res = await window.fetch(
        'https://api.p2pquake.net/v2/history?codes=551&limit=20',
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const data = await res.json();

      newsItems = data
        .filter(d => d.earthquake)
        .map(d => {
          const eq = d.earthquake;
          const hy = eq.hypocenter || {};
          const mag = parseFloat(eq.magnitude) || 0;
          const time = new Date(eq.time);
          const isLarge = mag >= 5;
          const isTsunami = d.issue?.type === 'Tsunami';

          return {
            source: '気象庁',
            time: time,
            title: buildTitle(eq, hy, mag),
            body: buildBody(eq, hy, mag),
            tag: isTsunami ? 'tsunami' : isLarge ? 'major' : mag >= 4 ? 'warning' : 'normal',
            link: null,
          };
        });
    } catch(e) {
      console.warn('P2Pニュース取得失敗:', e);
    }
  }

  function buildTitle(eq, hy, mag) {
    if (mag >= 6) return `【速報】M${mag.toFixed(1)} ${hy.name || ''}で強い地震`;
    if (mag >= 5) return `【地震情報】${hy.name || ''}でM${mag.toFixed(1)}の地震`;
    return `${hy.name || '地震'}でM${mag.toFixed(1)}の地震を観測`;
  }

  function buildBody(eq, hy, mag) {
    const parts = [];
    if (hy.name) parts.push(`震源: ${hy.name}`);
    if (hy.depth != null) parts.push(`深さ: ${hy.depth}km`);
    if (eq.maxScale) parts.push(`最大震度: ${scaleLabel(eq.maxScale)}`);
    if (mag >= 5) parts.push('広い範囲で揺れが観測されました。');
    return parts.join(' ／ ');
  }

  // ===== フォールバック (オフライン時サンプル) =====
  function buildFallbackNews() {
    newsItems = [
      {
        source: 'システム',
        time: new Date(),
        title: 'リアルタイムデータを取得中です',
        body: 'インターネット接続を確認してください。接続後、自動的にニュースが更新されます。',
        tag: 'normal',
      },
      {
        source: '気象庁',
        time: new Date(Date.now() - 3600000),
        title: '地震に関する情報の取得方法',
        body: '気象庁のウェブサイト(www.jma.go.jp)では最新の地震情報をご確認いただけます。',
        tag: 'normal',
      },
    ];
  }

  // ===== 表示 =====
  function render() {
    const feed = document.getElementById('newsFeed');
    if (!feed) return;

    if (!newsItems.length) {
      feed.innerHTML = '<div class="loading-pulse">ニュースなし</div>';
      return;
    }

    feed.innerHTML = newsItems.map(n => {
      const ago = timeAgo(n.time);
      const tagClass = `tag-${n.tag}`;
      const tagText = { major: '大規模地震', tsunami: '津波情報', warning: '注意', normal: '地震情報' }[n.tag] || '';
      return `
        <div class="news-item" ${n.link ? `onclick="window.open('${n.link}','_blank')"` : ''}>
          <div class="news-meta">
            <span class="news-source">${escapeHtml(n.source)}</span>
            <span class="news-time">${ago}</span>
          </div>
          <div class="news-title">${escapeHtml(n.title)}</div>
          <div class="news-body">${escapeHtml(n.body)}</div>
          <span class="news-tag ${tagClass}">${tagText}</span>
        </div>
      `;
    }).join('');
  }

  function scaleLabel(s) {
    const map = { 10:'1', 20:'2', 30:'3', 40:'4', 45:'5弱', 50:'5強', 55:'6弱', 60:'6強', 70:'7' };
    return map[s] || String(s);
  }

  function timeAgo(t) {
    const sec = Math.floor((Date.now() - new Date(t).getTime()) / 1000);
    if (sec < 60)    return `${sec}秒前`;
    if (sec < 3600)  return `${Math.floor(sec/60)}分前`;
    if (sec < 86400) return `${Math.floor(sec/3600)}時間前`;
    return `${Math.floor(sec/86400)}日前`;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { fetch };
})();
