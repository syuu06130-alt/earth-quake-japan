/**
 * map.js — 地図初期化・描画モジュール
 * Leaflet.js + Google Maps Satellite / OpenStreetMap
 */

window.MapModule = (() => {
  let map, currentTileLayer, heatLayer;
  let epicenterLayer, waveLayer, intensityLayer, faultLayer, plateLayer;
  let isHeatmap = false;
  let markers = [];

  // ===== 地図初期化 =====
  function init() {
    map = L.map('map', {
      center: CONFIG.MAP.CENTER,
      zoom: CONFIG.MAP.ZOOM,
      zoomControl: true,
      attributionControl: true,
    });

    // デフォルトタイル（ダーク調OpenStreetMap）
    currentTileLayer = L.tileLayer(CONFIG.MAP.TILES.dark, {
      attribution: '© OpenStreetMap contributors, Stadia Maps',
      maxZoom: 18,
    }).addTo(map);

    // レイヤーグループ
    epicenterLayer = L.layerGroup().addTo(map);
    waveLayer      = L.layerGroup().addTo(map);
    intensityLayer = L.layerGroup().addTo(map);
    faultLayer     = L.layerGroup();
    plateLayer     = L.layerGroup();

    // 断層帯・プレート境界を描画
    drawFaultLines();
    drawPlateBoundaries();

    // ツールバーイベント
    bindToolbar();

    // フィルターチェックボックス
    bindLayerToggles();

    return map;
  }

  // ===== タイル切替 =====
  function switchTile(type) {
    if (currentTileLayer) map.removeLayer(currentTileLayer);
    const url = CONFIG.MAP.TILES[type] || CONFIG.MAP.TILES.dark;
    let attr = '© OpenStreetMap contributors';
    if (type === 'satellite') attr = '© Esri, Maxar, GeoEye';
    if (type === 'terrain')   attr = '© OpenTopoMap, SRTM';
    currentTileLayer = L.tileLayer(url, { attribution: attr, maxZoom: 18 }).addTo(map);
  }

  // ===== 地震マーカー描画 =====
  function drawQuakes(quakes, options = {}) {
    epicenterLayer.clearLayers();
    waveLayer.clearLayers();
    markers = [];

    const showEpicenter  = document.getElementById('showEpicenter')?.checked !== false;
    const showWave       = document.getElementById('showWave')?.checked !== false;
    const showIntensity  = document.getElementById('showIntensity')?.checked !== false;

    quakes.forEach((q, i) => {
      const lat = q.lat, lng = q.lng, mag = q.mag;
      if (!lat || !lng) return;

      // 波紋アニメーション（最新5件）
      if (showWave && i < 5) {
        drawWave(lat, lng, mag, i);
      }

      // 震源地マーカー
      if (showEpicenter) {
        const r = CONFIG.MAG_RADIUS(mag);
        const color = CONFIG.MAG_COLOR(mag);
        const circle = L.circleMarker([lat, lng], {
          radius: r,
          fillColor: color,
          color: '#fff',
          weight: mag >= 5 ? 2 : 1,
          fillOpacity: 0.85,
          opacity: 0.9,
        });

        circle.bindPopup(buildPopupHtml(q), {
          maxWidth: 240,
          className: 'eq-popup',
        });

        circle.on('click', () => showModal(q));
        epicenterLayer.addLayer(circle);
        markers.push({ circle, q });
      }
    });
  }

  // ===== 波紋アニメーション =====
  function drawWave(lat, lng, mag, index) {
    const delay = index * 300;
    const waves = mag >= 5 ? 3 : 2;
    for (let w = 0; w < waves; w++) {
      setTimeout(() => {
        const maxR = CONFIG.MAG_RADIUS(mag) * (4 + w * 2);
        const color = CONFIG.MAG_COLOR(mag);
        let opacity = 0.6;
        let curR = 0;
        const duration = 2000 + w * 500;
        const steps = 50;
        const stepR = maxR / steps;
        const stepO = opacity / steps;

        const interval = setInterval(() => {
          if (curR >= maxR) {
            clearInterval(interval);
            return;
          }
          curR += stepR;
          opacity -= stepO;
          if (opacity < 0) opacity = 0;

          const waveCircle = L.circleMarker([lat, lng], {
            radius: curR,
            fillColor: 'transparent',
            color: color,
            weight: 2,
            opacity: opacity,
            interactive: false,
          });
          waveLayer.addLayer(waveCircle);
          setTimeout(() => waveLayer.removeLayer(waveCircle), 200);
        }, duration / steps);
      }, delay + w * 400);
    }
  }

  // ===== ポップアップHTML =====
  function buildPopupHtml(q) {
    const color = CONFIG.MAG_COLOR(q.mag);
    const scaleHtml = q.maxIntensity
      ? `<div class="popup-row">最大震度 <span>${q.maxIntensity}</span></div>` : '';
    const tsunamiHtml = q.tsunami
      ? `<div style="color:#e85d3a;font-weight:700;margin-top:4px;">🌊 ${q.tsunami}</div>` : '';
    return `
      <div>
        <div class="popup-mag" style="color:${color}">M${q.mag.toFixed(1)}</div>
        <div class="popup-place">${q.place || '不明'}</div>
        <div class="popup-row">深さ <span>${q.depth != null ? q.depth + 'km' : '不明'}</span></div>
        ${scaleHtml}
        <div class="popup-row">発生時刻 <span>${formatTime(q.time)}</span></div>
        ${tsunamiHtml}
      </div>
    `;
  }

  // ===== 断層帯（主要活断層） =====
  function drawFaultLines() {
    // 主要活断層の簡略座標（実際の公開データに置き換え推奨）
    const faults = [
      { name: '中央構造線', coords: [[33.5,130.3],[33.8,131.0],[34.2,132.0],[34.6,133.5],[34.9,135.0],[35.0,136.2]] },
      { name: '糸魚川-静岡構造線', coords: [[36.8,137.9],[35.8,138.1],[35.2,138.4],[34.9,138.6]] },
      { name: '野島断層', coords: [[34.6,134.9],[34.8,135.1]] },
      { name: '有馬-高槻断層帯', coords: [[34.8,135.2],[34.9,135.6]] },
      { name: '上町断層帯', coords: [[34.6,135.5],[34.8,135.5]] },
    ];

    faults.forEach(f => {
      L.polyline(f.coords, {
        color: '#ff4444',
        weight: 2,
        opacity: 0.7,
        dashArray: '6,4',
      }).bindTooltip(`断層: ${f.name}`, { sticky: true })
        .addTo(faultLayer);
    });
  }

  // ===== プレート境界 =====
  function drawPlateBoundaries() {
    // 日本周辺のプレート境界（簡略版）
    const plates = [
      {
        name: '太平洋プレート境界',
        coords: [[45,150],[42,145],[38,142],[35,142],[33,142],[30,140],[28,138]],
        color: '#3b82f6',
      },
      {
        name: 'フィリピン海プレート境界',
        coords: [[35,140],[34,138],[33,136],[32,133],[31,131],[30,128]],
        color: '#a855f7',
      },
    ];

    plates.forEach(p => {
      L.polyline(p.coords, {
        color: p.color,
        weight: 3,
        opacity: 0.5,
        dashArray: '10,6',
      }).bindTooltip(p.name, { sticky: true })
        .addTo(plateLayer);
    });
  }

  // ===== ヒートマップ切替 =====
  function toggleHeatmap(quakes) {
    if (!isHeatmap) {
      epicenterLayer.clearLayers();
      // シンプルな密度表現（Leaflet.heat非依存）
      quakes.forEach(q => {
        if (!q.lat || !q.lng) return;
        const r = CONFIG.MAG_RADIUS(q.mag) * 2.5;
        L.circleMarker([q.lat, q.lng], {
          radius: r,
          fillColor: CONFIG.MAG_COLOR(q.mag),
          color: 'transparent',
          fillOpacity: 0.15,
          interactive: false,
        }).addTo(epicenterLayer);
      });
      isHeatmap = true;
      document.getElementById('btnHeatmap').classList.add('active');
    } else {
      isHeatmap = false;
      document.getElementById('btnHeatmap').classList.remove('active');
      if (window.DataModule) window.DataModule.redraw();
    }
  }

  // ===== 日本全体に戻す =====
  function resetView() {
    map.setView(CONFIG.MAP.CENTER, CONFIG.MAP.ZOOM);
  }

  // ===== 特定の地震にフォーカス =====
  function focusQuake(lat, lng, mag) {
    const zoom = mag >= 6 ? 8 : mag >= 5 ? 7 : 6;
    map.setView([lat, lng], zoom);
  }

  // ===== ツールバーイベント =====
  function bindToolbar() {
    const buttons = document.querySelectorAll('.map-btn');
    document.getElementById('btn2d').addEventListener('click', () => {
      switchTile('dark');
      setActive('btn2d');
    });
    document.getElementById('btnSatellite').addEventListener('click', () => {
      switchTile('satellite');
      setActive('btnSatellite');
    });
    document.getElementById('btnTerrain').addEventListener('click', () => {
      switchTile('terrain');
      setActive('btnTerrain');
    });
    document.getElementById('btnReset').addEventListener('click', resetView);
    document.getElementById('btnHeatmap').addEventListener('click', () => {
      if (window.DataModule) toggleHeatmap(window.DataModule.getQuakes());
    });

    function setActive(id) {
      ['btn2d','btnSatellite','btnTerrain'].forEach(b => {
        document.getElementById(b)?.classList.remove('active');
      });
      document.getElementById(id)?.classList.add('active');
    }
  }

  // ===== レイヤートグル =====
  function bindLayerToggles() {
    document.getElementById('showFault')?.addEventListener('change', (e) => {
      if (e.target.checked) faultLayer.addTo(map);
      else map.removeLayer(faultLayer);
    });
    document.getElementById('showPlate')?.addEventListener('change', (e) => {
      if (e.target.checked) plateLayer.addTo(map);
      else map.removeLayer(plateLayer);
    });
    document.getElementById('showEpicenter')?.addEventListener('change', () => {
      if (window.DataModule) window.DataModule.redraw();
    });
    document.getElementById('showWave')?.addEventListener('change', () => {
      if (window.DataModule) window.DataModule.redraw();
    });
  }

  // ===== 日時フォーマット =====
  function formatTime(t) {
    if (!t) return '不明';
    const d = new Date(t);
    return `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  return { init, drawQuakes, focusQuake, resetView, toggleHeatmap, formatTime };
})();
