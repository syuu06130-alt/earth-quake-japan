# 🗾 JISHIN.WATCH — 日本地震リアルタイム監視システム

> **リアルタイムで日本の地震を監視するWebアプリケーション**  
> P2P地震情報・USGSの公開APIを使用した無料・サーバーレスの地震情報サイト

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 📋 機能一覧

| 機能 | 説明 |
|------|------|
| 🗺️ **インタラクティブ地図** | Leaflet.js + OpenStreetMap / 衛星写真 / 地形図 切替 |
| ⚡ **リアルタイム更新** | 30秒ごとに自動取得・地図マーカー更新 |
| 🌐 **波紋アニメーション** | 地震発生箇所から波紋が広がる視覚表現 |
| 🤖 **地震監視Bot** | 新着地震の検知・ログ・ブラウザ通知 |
| 📊 **統計グラフ** | M分布・時間別件数・震源深度の可視化 |
| 📰 **ニュースフィード** | 気象庁発表をリアルタイム表示 |
| 🔔 **アラート機能** | M5以上でバナー表示・M3以上でBotログ |
| 🔥 **密度ヒートマップ** | 地震多発地域を視覚化 |
| 🏔️ **断層帯・プレート境界表示** | 主要活断層とプレート境界のオーバーレイ |
| 📱 **レスポンシブ対応** | スマートフォン・タブレット対応 |

---

## 🚀 セットアップ

### ローカルで起動

```bash
git clone https://github.com/YOUR_USERNAME/jishin-watch.git
cd jishin-watch

# 静的ファイルサーバーで起動 (Python)
python3 -m http.server 8080

# または Node.js の場合
npx serve .
```

ブラウザで `http://localhost:8080` を開く

### GitHub Pages で公開

1. GitHub にリポジトリを作成
2. `Settings` → `Pages` → `Source: main branch` に設定
3. `https://YOUR_USERNAME.github.io/jishin-watch` でアクセス可能

---

## ⚙️ 設定 (js/config.js)

```javascript
window.CONFIG = {
  // Google Maps APIキー (衛星写真レイヤーに使用)
  GOOGLE_MAPS_API_KEY: 'YOUR_API_KEY',

  // Bot自動更新間隔
  BOT: {
    FETCH_INTERVAL: 30000,  // 30秒
    ALERT_MAG_BANNER: 5.0,  // M5以上でバナー
  }
};
```

### Google Maps APIキー取得方法

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. `Maps JavaScript API` を有効化
4. `認証情報` → `APIキー` を作成
5. `js/config.js` の `GOOGLE_MAPS_API_KEY` に設定

> **注意**: APIキーは `.gitignore` で管理するか、GitHub Secrets を使用してください

---

## 📡 使用データソース

| ソース | 説明 | CORS |
|--------|------|------|
| [P2P地震情報](https://www.p2pquake.net/) | 日本国内の地震情報（気象庁データ） | ✅ |
| [USGS](https://earthquake.usgs.gov/fdsnws/event/1/) | 全世界の地震データ | ✅ |
| [気象庁](https://www.jma.go.jp/bosai/quake/) | 公式地震情報 | ⚠️ プロキシ推奨 |

---

## 🗂️ ファイル構成

```
jishin-watch/
├── index.html          # メインHTML
├── css/
│   └── style.css       # スタイルシート
├── js/
│   ├── config.js       # 設定ファイル
│   ├── map.js          # 地図モジュール (Leaflet)
│   ├── data.js         # データ取得・管理
│   ├── bot.js          # 監視Botモジュール
│   ├── charts.js       # 統計グラフ
│   ├── news.js         # ニュースフィード
│   ├── ui.js           # UI操作
│   └── app.js          # エントリーポイント
└── README.md
```

---

## 🌊 震度スケール対応表

| 震度 | 区分 | 状況 |
|------|------|------|
| 7   | 激震 | ほとんどの建物が倒壊 |
| 6強 | 烈震 | 多くの建物が倒壊 |
| 6弱 | 烈震 | 立つことが困難 |
| 5強 | 強震 | 家具が転倒する |
| 5弱 | 強震 | 棚の食器が落ちる |
| 4   | 中震 | 眠っている人が目覚める |
| 3   | 弱震 | 棚の食器が揺れる |
| 2   | 軽震 | 電灯などが揺れる |
| 1   | 微震 | 屋内で静かな人が感じる |

---

## ⌨️ キーボードショートカット

| キー | 操作 |
|------|------|
| `R` | データを手動更新 |
| `F` | 日本全体を表示 |
| `Esc` | モーダルを閉じる |

---

## 📜 ライセンス

MIT License — 自由に使用・改変・配布できます

---

## 🤝 コントリビュート

Pull Request 歓迎！  
Issues でバグ報告や機能要望をどうぞ

---

*データは気象庁・USGS の公開情報に基づきます。緊急時は公式機関の情報をご確認ください。*
