# DXS Swap アーキテクチャ

## 概要

DXS Swapは、Bitcoin SV (BSV) Mainnet上で動作する分散型取引所（DEX）のフロントエンドUIです。Nuxt 4.2.2で構築されたモジュラー・モノリス構造を採用しています。

## 技術スタック

| 技術 | バージョン | 用途 |
|---|---|---|
| Nuxt | 4.2.2 | フレームワーク |
| Vue | 3.5+ | UIライブラリ |
| Tailwind CSS | 4 | スタイリング |
| Pinia | latest | 状態管理 |
| vue-chartjs | latest | チャート（Recharts代替） |
| chart.js | latest | チャートエンジン |
| lucide-vue-next | latest | アイコン |
| date-fns | latest | 日付処理 |

## ディレクトリ構造

```
dex/
├── app/
│   ├── app.vue                    # ルートコンポーネント（テーマクラス設定）
│   ├── assets/css/                # CSS（Tailwind v4、フォント、テーマ変数）
│   ├── layouts/default.vue        # デフォルトレイアウト（Header + モーダル + MobileNav）
│   ├── pages/                     # 22ページ（Nuxtファイルベースルーティング）
│   ├── components/
│   │   ├── layout/                # AppHeader, MobileNav
│   │   ├── modal/                 # WalletModal, ToSModal, TokenSelectorModal
│   │   └── chart/                 # CandlestickCanvas, VolumeCanvas, チャートウィジェット
│   ├── composables/               # useTheme, useWallet, useMobile, useGameStream, useGameCanvas
│   ├── stores/                    # Pinia（app, wallet, game）
│   ├── utils/                     # cn()ユーティリティ
│   ├── types/                     # TypeScript型定義（13ファイル）
│   └── constants/                 # 定数・モックデータ（7ファイル）
├── server/
│   └── api/game/                  # SSE価格ストリームエンドポイント
├── llm/                           # LLM用ドキュメント
└── public/                        # 静的アセット
```

## 状態管理

### Piniaストア

**AppStore** (`app/stores/app.ts`)
- `theme`: ダーク/ライトモード
- `language`: EN/JA切替
- `network`: Mainnet/Testnet
- `tos_agreed`: 利用規約同意状態
- `is_live`: ライブ接続状態
- `is_dark`: テーマの計算プロパティ

**WalletStore** (`app/stores/wallet.ts`)
- `wallet_connected`: 接続状態
- `wallet_address`: ウォレットアドレス
- `show_wallet_modal`: モーダル表示状態

**GameStore** (`app/stores/game.ts`)
- `price_history`: リアルタイム価格履歴（最大600件）
- `current_price`: 現在価格
- `orders`: 注文リスト
- `balance`: ゲーム残高
- `is_connected`: SSE接続状態
- `is_running`: ゲーム実行状態

### Composables

- `useTheme()`: テーマ依存のCSSクラスを提供（bg, border, text, text_muted, hover_bg, input_cls）
- `useWallet()`: WalletStoreのラッパー
- `useMobile()`: メディアクエリによるモバイル判定
- `useGameStream()`: SSE接続管理（EventSource、自動再接続）
- `useGameCanvas()`: Canvas描画エンジン（rAFループ、グリッド/注文/価格線描画）

## ページ一覧

### Trade（取引）
| パス | ページ | 説明 |
|---|---|---|
| `/swap` | swap.vue | トークンスワップ |
| `/limit-orders` | limit-orders.vue | 指値注文 |
| `/partial-fill` | partial-fill.vue | 分割注文 |
| `/routing` | routing.vue | マルチホップルーティング |

### Earn（収益）
| パス | ページ | 説明 |
|---|---|---|
| `/pool` | pool.vue | 流動性プール（5サブタブ） |
| `/rewards` | rewards.vue | LP報酬 |
| `/farming` | farming.vue | ファーミング |

### Explore（探索）
| パス | ページ | 説明 |
|---|---|---|
| `/explorer` | explorer.vue | BSVエクスプローラー |
| `/tokens` | tokens.vue | STASトークンレジストリ |
| `/analytics` | analytics.vue | プロトコル分析 |
| `/charts` | charts.vue | ローソク足チャート（Canvas） |
| `/portfolio` | portfolio.vue | ポートフォリオ |
| `/history` | history.vue | 取引履歴 |

### Standalone（スタンドアロン）
| パス | ページ | 説明 |
|---|---|---|
| `/game` | game.vue | 取引予測ゲーム（Canvas全画面、SSEリアルタイム価格） |

### More（その他）
| パス | ページ | 説明 |
|---|---|---|
| `/bridge` | bridge.vue | クロスチェーンブリッジ |
| `/s402` | s402.vue | AIエージェント決済 |
| `/docs` | docs.vue | ドキュメント |
| `/launchpad` | launchpad.vue | トークンローンチパッド |
| `/governance` | governance.vue | ガバナンス投票 |
| `/notifications` | notifications.vue | 通知 |
| `/security` | security.vue | セキュリティ |
| `/admin` | admin.vue | 管理ダッシュボード |

## テーマシステム

CSS変数ベースのダーク/ライトモード。`.dark`クラスをHTML要素に適用して切替。Tailwind v4の`@custom-variant dark`を使用。

## データ

現在すべてのデータはモック。定数ファイル（`constants/`）にハードコードされたモックデータを使用。ゲームページのみSSEエンドポイント（`server/api/game/price-stream.get.ts`）からリアルタイムデータを配信。

## サーバーサイド

Nitroサーバールート（`server/`ディレクトリ）。

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/game/price-stream` | GET (SSE) | ランダムウォーク価格ストリーム（500ms間隔） |

## ルーティング

Nuxtファイルベースルーティングを使用。`/`は`/swap`にリダイレクト。ナビゲーションは`navigateTo()`と`<NuxtLink>`を使用。
