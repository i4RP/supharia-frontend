# DXS Swap - 機能仕様書

> BSV Mainnet 上の DSTAS トークンによる分散型トークンスワップ
> フロントエンド: React + Vite / バックエンド API: `https://api.molt4x.com`

---

## 1. アーキテクチャ概要

```
frontend/          React SPA (Vite 7, React 19)
  src/
    App.tsx         単一ファイルアプリ (~4800行), 全21タブ
    App.css         スタイル (ダーク/ライトテーマ)
    amm-api.ts      バックエンドAPIクライアント (68関数以上)
    swap-service.ts オンチェーン BSV トランザクションビルダー (dxs-stas-sdk)
    i18n.ts         EN/JA 翻訳 (210キー)
    wallet-connect/ DXS Wallet Extension プロトコル
    main.tsx        エントリーポイント
  public/
    manifest.json   PWA マニフェスト
    sw.js           Service Worker
```

### 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | React 19.2 + TypeScript 5.9 |
| ビルドツール | Vite 7.3 |
| SDK | dxs-stas-sdk 2.0 (ローカル) |
| API | REST (api.molt4x.com) |
| ブロックチェーン | Bitcoin SV (WhatsOnChain API) |
| PWA | manifest.json + Service Worker |

---

## 2. 共通機能

### 2.1 ウォレット接続

モーダルのタブで選択可能な3つの接続方式:

| 方式 | 方法 | 詳細 |
|------|------|------|
| **DXS Wallet Extension** | `window.dxsWallet` | ブラウザ拡張機能。`postMessage`プロトコルで通信。`sign_transaction`, `sign_message`, `get_address`, `get_balance` に対応。セッションは localStorage に保存。 |
| **WIF 秘密鍵** | 直接インポート | ユーザーが WIF キーを貼り付け。`getAddressFromWif()` でアドレスを導出。 |
| **ニーモニックフレーズ** | BIP39 12単語 | ユーザーが12単語のニーモニックを入力。`getAddress()` でアドレスを導出。 |

**ウォレット生成**: 「ウォレット作成」ボタンで新規 BIP39 ニーモニック + WIF を生成。バックアップ警告あり。

**セッション**: ウォレット状態は React state に保持 (`address`, `mnemonic`, `wifKey`, `mode`)。

### 2.2 多言語対応 (i18n)

| 言語 | コード | ラベル |
|------|--------|--------|
| 英語 | `en` | EN |
| 日本語 | `ja` | JA |

全UIラベル・トースト通知・エラーメッセージを含む210個の翻訳キー。ヘッダーのトグルボタンで切替。

### 2.3 テーマ

- **ダークモード** (デフォルト): CSSカスタムプロパティ (`--bg-primary`, `--text-primary` 等)
- **ライトモード**: ヘッダーの太陽/月ボタンで切替

### 2.4 ネットワーク切替

| ネットワーク | ID | 種別 |
|-------------|-----|------|
| BSV Mainnet | `bsv-mainnet` | 本番 |
| BSV Testnet | `bsv-testnet` | テストネット |

ヘッダーのドロップダウンで選択。変更時に `switchNetwork()` API を呼び出し。

### 2.5 PWA

- `manifest.json`: アプリ名 "DXS Swap", アイコン 192/512px
- Service Worker (`sw.js`) によるオフラインキャッシュ
- インストール促進プロンプト（「Install」/「Later」ボタン）
- `apple-mobile-web-app-capable: yes` 対応

### 2.6 利用規約

- 初回アクセス時にモーダルで利用規約を表示
- 「Skip」/「Next」/「I Agree to the Terms」ボタン
- 同意しないとアプリを利用できない

### 2.7 リアルタイム更新

- `amm-api.ts` 内の `RealtimePoller` クラスが SSE (Server-Sent Events) を使用
- イベント種別: `swap`, `price_change`, `liquidity_change`, `new_pool`
- 接続状態インジケーター: 「LIVE」(緑) / 「OFF」(赤)
- 自動更新トグル (3秒間隔)

### 2.8 レスポンシブデザイン

- **デスクトップ**: ホバーで開くドロップダウンナビゲーショングループ
- **モバイル**: ボトムナビゲーションバー (5アイコン: Trade, Earn, Bridge, Explore, More) + ハンバーガーメニュー

---

## 3. ナビゲーション構造

```
Trade ▾ (トレード)
  ├── Swap              (スワップ, デフォルトタブ)
  ├── Limit Orders      (指値注文)
  ├── Partial Fill      (分割約定)
  └── Routing           (ルーティング)

Earn ▾ (稼ぐ)
  ├── Pool              (流動性プール)
  ├── Rewards           (報酬)
  └── Farming           (ファーミング)

Bridge (ブリッジ)

Explore ▾ (探索)
  ├── Explorer          (エクスプローラー)
  ├── Tokens            (トークン)
  ├── Analytics         (分析)
  ├── Charts            (チャート)
  ├── Portfolio         (ポートフォリオ)
  └── History           (履歴)

More ▾ (その他)
  ├── s402              (AIエージェント決済)
  ├── Docs              (ドキュメント)
  ├── Launchpad         (ランチパッド)
  ├── Governance        (ガバナンス)
  ├── Notifications     (通知)
  ├── Security          (セキュリティ)
  └── Admin             (管理)
```

---

## 4. 機能詳細

### 4.1 スワップ (Trade > Swap)

**概要**: BSV Mainnet AMM によるトークン間スワップ。

**UI要素**:
- 送信元トークンセレクター (検索付きモーダル)
- 送信先トークンセレクター (検索付きモーダル)
- 金額入力 (サニタイズ済み: 最大 1,000,000,000 / 小数点以下8桁)
- スワップ方向切替ボタン
- スリッページ許容範囲設定: 0.1% / 0.5% / 1.0% / 3.0% / カスタム (5%超で警告表示)
- 「Connect Wallet」/「Enter amount」/「Swap」ボタン (状態に応じて動的変化)

**詳細表示パネル** (展開可能):
- 交換レート (1 A = X B)
- 価格影響 (Price Impact %)
- ネットワーク手数料 (~0.00001 BSV, 0.1 sat/byte)
- 最小受取量 (金額 * 0.995)
- スリッページ許容範囲
- ルート表示 (シングルホップ or Dijkstra経由マルチホップ)
- ホップ詳細 (ペア名, 各ホップの入出力金額)
- 支出タイプ: DSTAS Swap (type=4)
- ネットワーク: BSV Mainnet

**プロトコル統計バー** (アナリティクスデータ読込時に表示):
- 総ロック価値 (Total TVL)
- 24時間取引高
- 総プール数

**スワップ実行フロー**:
1. AMM API からスワップ見積りを取得
2. `swap-service.ts` 経由でオンチェーン DSTAS スワップトランザクションをビルド
3. BSV ネットワークにブロードキャスト
4. プログレスインジケーターでステータスメッセージ表示
5. 成功/失敗時にトースト通知

**API**: `POST /pools/{id}/quote`, `POST /pools/{id}/swap`

**オンチェーン**: dxs-stas-sdk の `BuildDstasSwapFlowTx` を使用

---

### 4.2 指値注文 (Trade > Limit Orders)

**概要**: 目標価格での注文発注。市場価格が目標に達した時点で自動執行。

**UI要素**:
- プール選択ドロップダウン
- 現在価格表示
- 方向選択 (Token A を売る / Token B を売る)
- 金額入力
- 目標価格入力
- 有効期限入力 (時間単位, デフォルト: 24時間)
- 「Place Limit Order」ボタン
- 「Check Price Match」ボタン (現在価格との一致確認)
- オープンオーダー一覧 (キャンセルボタン付き)

**注文カードの表示内容**:
- ペア (入力トークン → 出力トークン)
- ステータス (open / filled / cancelled / expired)
- 金額, 目標価格, 約定済み金額
- 作成日時 / 有効期限

**API**: `POST /pools/{id}/limit-orders`, `GET /pools/{id}/limit-orders`, `DELETE /pools/{id}/limit-orders/{orderId}`, `POST /pools/{id}/limit-orders/check`

---

### 4.3 分割約定 (Trade > Partial Fill)

**概要**: 大口注文を複数回の実行に分割し、価格への影響を軽減。

**UI要素**:
- プール選択
- 入力トークンフィールド
- 金額入力
- 分割数 (2〜10)
- 「Execute Partial Fill」ボタン

**結果表示**:
- 合計入力 / 合計出力 / 合計手数料 (3カラムグリッド)
- 分割リスト: 各分割の入力 → 出力, 手数料, 価格影響%
- トランザクションID (WhatsOnChain へのリンク付き)

**API**: `POST /pools/{id}/swap-partial`

---

### 4.4 ルーティング (Trade > Routing)

**概要**: Dijkstra アルゴリズムによる全流動性プール横断の最適マルチホップルート探索。

**UI要素**:
- 入力トークンID
- 出力トークンID
- 金額
- 「Find Best Route」ボタン

**結果表示**:
- サマリー: 合計入力 / 合計出力 / 合計手数料 / 価格影響 (4カラムグリッド)
- パス可視化: トークンバッジを矢印で接続
- ホップリスト: 各ホップの入出力トークン, 金額, プールID, 手数料, 価格影響

**API**: `POST /route`

---

### 4.5 流動性プール (Earn > Pool)

**概要**: AMM 流動性プールの完全なCRUD管理。

**サブタブ**: Dashboard | Swap | Add Liquidity | Remove

#### プール一覧
- TVL表示付きプール選択ボタン
- お気に入りプール (星トグル, 上位にソート)
- リアルタイムインジケーター (LIVE/OFF)
- 自動更新トグル
- 「+ New Pool」ボタン

#### ダッシュボード
- 統計グリッド: Token A リザーブ, Token B リザーブ, TVL, 総LPシェア, 手数料率, 24時間取引高, プールアドレス
- LPポジション (ウォレット接続時): シェア数, プール占有率%, 預入量, 現在価値, 獲得手数料
- 価格チャートキャンバス (price / TVL / volume メトリクス)
- オンチェーン残高検証
- 照合レポート: オフチェーン vs オンチェーン残高, 保留中/確認済み/失敗した決済件数
- プールトランザクションテーブル: 種別, 入力, 出力, 手数料, ステータス, タイムスタンプ

#### プール内スワップ
- 方向トグル (A→B / B→A)
- 金額入力
- 見積り表示: 出力量, 手数料, 価格影響, 最小受取量
- 「Swap via Pool」ボタン

#### 流動性追加
- 金額A / 金額B 入力
- 現在のリザーブ表示
- 「Add Liquidity」ボタン

#### 流動性削除
- パーセンテージスライダー/入力
- 確認ステップ (二重クリック防止)
- 「Remove Liquidity」ボタン

#### プール作成
- Token A シンボル / ID
- Token B シンボル / ID
- 手数料率: 1% (固定, LP報酬としてプール内に留まる)
- 「Create Pool」ボタン

**API**: `GET /pools`, `GET /pools/{id}`, `POST /pools`, `POST /pools/{id}/swap`, `POST /pools/{id}/add-liquidity`, `POST /pools/{id}/remove-liquidity`, `GET /pools/{id}/lp/{address}`, `GET /pools/{id}/transactions`, `GET /pools/{id}/onchain-balance`, `GET /pools/{id}/reconciliation`, `POST /pools/{id}/settle`, `GET /pools/{id}/price-history`

---

### 4.6 報酬 (Earn > Rewards)

**概要**: LP報酬の発生状況確認 (1% APY)。

**UI要素**:
- プール選択
- サマリーカード: APY, LPプロバイダー数, 総LPシェア, 総分配量 (トークンA/B)
- 自分の報酬: LPシェア, プール占有率%, 提供期間 (時間), 累積報酬 (A/B), 獲得手数料 (A/B), 合計 (A/B)
- 全プロバイダー一覧: アドレス, シェア, プール占有率%, 期間, 報酬

**API**: `GET /pools/{id}/rewards`, `GET /pools/{id}/rewards/{address}`

---

### 4.7 ファーミング (Earn > Farming)

**概要**: LPシェアをステーキングしてイールドファーミング報酬を獲得 (5% APY)。

**UI要素**:
- プール選択
- サマリー: ファーミングAPY, 総ステーク量, 総ステーカー数
- 自分のポジション: ステーク済みLPシェア, 保留報酬, 総収穫済み, ステーク開始日時
- アンステーク: 金額入力 + ボタン
- 報酬収穫ボタン (保留報酬が0の場合は無効)
- ステーク: 金額入力 + ボタン
- 全ステーカー一覧

**API**: `POST /pools/{id}/farming/stake`, `POST /pools/{id}/farming/unstake`, `POST /pools/{id}/farming/harvest`, `GET /pools/{id}/farming/{address}`, `GET /pools/{id}/farming/summary`

---

### 4.8 ブリッジ (Bridge)

**概要**: Sepolia/ETH と BSV 間のクロスチェーンブリッジ。

**ネットワークモード**:
- Mainnet (ETH ↔ BSV)
- Testnet (Sepolia ↔ BSV)

**方向**:
- Wrap (Sepolia → BSV): ETH側トークンをバーンし、BSV上にラップドSTASトークンをミント
- Unwrap (BSV → Sepolia): STASトークンをバーンし、ETH側でリリース

**対応トークン**:
- Sepolia: SepoliaETH, rUSD
- Mainnet: ETH, USDC

**UI要素**:
- ネットワークセレクター (Mainnet / Testnet)
- 方向トグル (Wrap / Unwrap)
- トークン選択 (ネットワークに応じて ETH/rUSD または ETH/USDC)
- 金額入力
- ETHトランザクションハッシュ入力 (Wrap時) / 送信先アドレス入力 (Unwrap時)
- 動的手数料表示
- 対応トークン一覧
- ブリッジ統計: 総ラップ量/総アンラップ量, 総取引高, トランザクション数
- ブリッジトランザクション履歴

**API**: `POST /bridge/wrap`, `POST /bridge/unwrap`, `GET /bridge/deposit-info/{token}`, `GET /bridge/stats`, `GET /bridge/transactions`, `GET /bridge/dynamic-fees`, `GET /bridge/supported-tokens`

---

### 4.9 エクスプローラー (Explore > Explorer)

**概要**: DXS アプリレベルのデータオーバーレイ付き BSV ブロックチェーンエクスプローラー。

**検索**: TxID (64文字16進数) または BSV アドレスを入力。自動的に種別を判定。

**サブタブ**: Overview | UTXOs | Transactions | App Data

#### Overview - トランザクション
- TxID, 承認数, ブロック高, サイズ
- インプットリスト (txid:vout またはcoinbase)
- アウトプットリスト (金額 + アドレス/スクリプトタイプ)
- WhatsOnChain リンク

#### Overview - アドレス
- アドレス, 残高 (BSV), 未承認残高
- UTXO数, トランザクション履歴数
- WhatsOnChain リンク

#### UTXOs (アドレスのみ)
- テーブル: TxHash, インデックス, 金額 (sats), ブロック高
- ページネーション (50件/ページ)

#### Transactions (アドレスのみ)
- テーブル: TxHash, ブロック高
- クリックでトランザクション詳細に遷移
- ページネーション (50件/ページ)

#### App Data (アプリデータ)
- 関連プール: ペア, リザーブ, 手数料, アドレス
- スワップトランザクション: 種別, 入出力, 手数料, ステータス, 時刻
- LPポジション: プール, シェア, 預入量
- ブリッジトランザクション: 方向, 金額, トークン, ステータス
- s402 支払い: エンドポイント, 金額 (sats)

**API**: `GET /explorer/tx/{txid}` (+ WhatsOnChain), `GET /explorer/address/{address}` (+ WhatsOnChain UTXOs/履歴), プール/スワップ/LP/ブリッジ/s402 からのアプリコンテキスト集約

---

### 4.10 トークン (Explore > Tokens)

**概要**: Mainnet 発行済み STAS トークンの一覧表示。

**トークンカードの表示内容**:
- アイコン (先頭文字の色付き円)
- シンボル / フルネーム
- Token ID (短縮表示)
- 発行TX (WhatsOnChain リンク付き)
- Satoshis
- フリーズ状態 (有効/無効)
- 残高 (ウォレット接続時)

**登録済みトークン** (10種):

| シンボル | 名前 | Token ID | フリーズ |
|---------|------|----------|---------|
| BSV | Bitcoin SV | (ネイティブ) | - |
| wBTC | Wrapped Bitcoin | 5fd9dad9... | 有効 |
| wUSDC | Wrapped USDC | 114111bc... | 有効 |
| DSTAS | DSTAS Token | 3f13332c... | 有効 |
| STAS | STAS Token | 7c2213b3... | 有効 |
| DXS | DXS Utility | 1f112423... | 有効 |
| GOLD | Gold Token | 527c158e... | 無効 |
| USD | USD Stablecoin | 890c1241... | 無効 |
| ACC2-A | Account2 Token A | f436fbbe... | 有効 |
| ACC2-B | Account2 Token B | 223b179f... | 有効 |

---

### 4.11 分析 (Explore > Analytics)

**概要**: プロトコル全体のメトリクスとプールランキング。

**サマリーカード** (5枚):
- 総ロック価値 (Total TVL)
- 24時間取引高
- 24時間手数料
- 総プール数
- 総トランザクション数

**プールランキングテーブル**:
- カラム: #, ペア, TVL, 24時間取引高, 24時間手数料, 価格, 24時間変動率(%), トランザクション数
- 価格変動の色分け (上昇: 緑 / 下落: 赤)

**API**: `GET /analytics`

---

### 4.12 チャート (Explore > Charts)

**概要**: テクニカル指標付きローソク足チャート。

**時間足**: 1m, 5m, 15m, 1h, 4h, 1d

**テクニカル指標** (5種):
- SMA (単純移動平均線)
- EMA (指数移動平均線)
- ボリンジャーバンド
- RSI (相対力指数)
- MACD (移動平均収束拡散法)

**UI要素**:
- 時間足ボタン
- 指標ボタン
- ローソク足チャート (Canvas ベースのカスタムレンダラー)
- ローソク足下の出来高バーチャート
- 指標チャートパネル

**API**: `GET /pools/{id}/advanced-chart?interval={interval}`

---

### 4.13 ポートフォリオ (Explore > Portfolio)

**概要**: ウォレット資産の概要と損益追跡。

**サマリーカード** (5枚):
- 総資産額 (USD)
- トークン価値 (USD)
- LP価値 (USD)
- 24時間損益 (金額 + パーセンテージ)
- トランザクション数

**トークンテーブル**: シンボル, 残高, 価格, 価値 (USD), 24時間変動率(%)

**LPポジションテーブル**: プール, LPシェア, 占有率%, 価値 (USD), APY

**API**: `GET /portfolio/{address}`

---

### 4.14 履歴 (Explore > History)

**概要**: AMM操作とMainnetオペレーションの完全なトランザクション履歴。

**機能**:
- AMMトランザクション: スワップ / 流動性追加 / 流動性削除 (金額付き)
- Mainnet TX履歴: Issue, Transfer, Split, Freeze, Unfreeze, Swap 操作
- ステータスバッジ: 確認済み (緑) / 失敗 (赤)
- TXリンク (WhatsOnChain)
- エクスポート: CSV / JSON (全履歴) + プールTX CSV / プールTX JSON

**データソース**: AMM API (`GET /pools/{id}/transactions`) + ハードコードされたMainnet TX記録 (28件の履歴トランザクション)

---

### 4.15 s402 AIエージェント決済 (More > s402)

**概要**: 自律型AIエージェント向け STAS/BSV マイクロペイメントプロトコル。

**セクション**:

#### プロトコル情報
- プロトコル名, バージョン, 説明, 対応メソッド
- エンドポイント一覧 (sats単位の価格設定)

#### ダッシュボード
- 総エージェント数, 総支払件数, 総収益, アクティブエンドポイント数

#### エージェント管理
- エージェント登録 (名前 → agent_id, アドレス, 残高)
- IDによるエージェント検索
- エージェントカード: ID, 名前, アドレス, 残高, 総支払回数, 作成日

#### エージェント決済
- エンドポイント入力 (デフォルト: `/api/premium`)
- 「Pay」ボタン
- 支払い後の残高更新

#### 価格設定管理
- エンドポイント入力
- 価格 (sats) 入力
- 「Set Pricing」ボタン

**API**: `GET /s402/protocol`, `GET /s402/dashboard`, `POST /s402/agents/register`, `GET /s402/agents/{id}`, `POST /s402/agents/{id}/pay`, `POST /s402/pricing`

---

### 4.16 ドキュメント (More > Docs)

**概要**: s402 プロトコルドキュメント。

**レイアウト**: サイドバーナビゲーション + メインコンテンツエリア

**セクション** (複数, `DOCS_SECTIONS` 定数で定義):
- 各セクション: アイコン, ラベル, ID を保持
- `renderDocsContent()` でコンテンツをレンダリング
- フッター: "s402 Protocol v1.0 - molt4x.com"

---

### 4.17 ランチパッド (More > Launchpad)

**概要**: トークン作成と自動プール生成。

**トークン作成フォーム**:
- トークン名 (テキスト)
- シンボル (テキスト, 自動大文字変換)
- 総供給量 (数値)
- カラー (カラーピッカー)
- 説明 (任意テキスト)
- フリーズ有効 (チェックボックス)
- 「Launch Token」ボタン

**ワークフロー**:
1. ユーザーのWIFで `launchToken()` を呼び出し
2. 成功時に `createTokenPool()` を自動呼び出しして BSV/{シンボル} プールを作成
3. 「ローンチ済みトークン」一覧にトークンが表示される

**ローンチ済みトークン一覧**:
- アイコン (色付き), シンボル, 名前
- 供給量, 作成者アドレス
- プールID (作成済みの場合)
- ステータスバッジ (active/pending)

**API**: `POST /tokens/launch`, `GET /tokens/launched`, `POST /tokens/{id}/pool`

---

### 4.18 ガバナンス (More > Governance)

**概要**: プールパラメータ変更のためのオンチェーンガバナンス。

**UI要素**:
- プール選択
- 「+ New Proposal」ボタン

**提案作成フォーム**:
- タイトル (必須)
- 説明 (任意, テキストエリア)
- パラメータ: 手数料率 (数値, 0-10%)
- 「Submit Proposal」ボタン

**提案カード**:
- タイトル + ステータスバッジ (active / executed / rejected / expired)
- 説明文
- 手数料率 → 新しい値
- 有効期限
- 投票バー (賛成/反対の割合をビジュアル表示)
- 投票数 (賛成 / 反対)
- アクション: 「Vote For」 / 「Vote Against」 / 「Execute」 (条件を満たした場合)
- 完了した提案の結果表示

**API**: `GET /pools/{id}/governance/proposals`, `POST /pools/{id}/governance/proposals`, `POST /pools/{id}/governance/proposals/{id}/vote`, `POST /pools/{id}/governance/proposals/{id}/execute`

---

### 4.19 通知 (More > Notifications)

**概要**: 価格アラート付き通知センター。

**前提条件**: ウォレット接続が必要

**サマリー**: 未読数, 合計数

**フィルター**: 全件 / 未読のみ + 「Mark All Read」ボタン

**価格アラート**:
- 作成: しきい値 % 入力 + 「Add Alert」ボタン
- 一覧: アラートタイプ, しきい値, 有効/無効ステータス, 削除ボタン

**通知リスト**:
- タイプバッジ (色分け)
- タイムスタンプ
- タイトル + メッセージ
- クリックで既読にする

**API**: `GET /notifications/{address}`, `POST /notifications/{address}/read/{id}`, `POST /alerts/{address}`, `GET /alerts/{address}`, `DELETE /alerts/{address}/{id}`

---

### 4.20 セキュリティ (More > Security)

**概要**: システムセキュリティ状態とユーティリティ。

**セキュリティステータスグリッド**:
- CORS (有効/無効)
- レート制限 (アクティブ/非アクティブ)
- 入力バリデーション (有効/無効)
- SQLインジェクション対策 (保護済み/脆弱)
- XSS対策 (有効/無効)
- APIバージョン

**システム統計**: 稼働時間 (時間/分), 総リクエスト数, ブロック済みリクエスト数

**レート制限**: ビジュアルプログレスバー, 残り/総リクエスト数, リセット時刻

**アドレスバリデーター**: 入力フィールド + 「Validate」ボタン → 有効/無効 + フォーマットタイプ

**API**: `GET /security/status`, `GET /security/rate-limit`, `POST /security/validate-address`

---

### 4.21 管理 (More > Admin)

**概要**: プラットフォーム管理用ダッシュボード。

**サブタブ**: 概要 | ユーザー | ログ | トークン

#### 概要
- システムヘルスメトリクス (`getAdminDashboard()` から取得)

#### ユーザー
- ユーザー一覧: アドレス, スワップ回数, LP価値, 最終アクティブ日時
- `getAdminUsers()` で読込

#### ログ
- システムログエントリ
- `getAdminLogs()` で読込

#### トークン
- 許可リスト / 拒否リストへの追加フォーム: Token ID, シンボル, 理由
- 許可リストテーブル (削除ボタン付き)
- 拒否リストテーブル (削除ボタン付き)
- トークン表示/非表示トグル (UI上での表示制御)
- 「全て表示」/「全て非表示」一括操作

**API**: `GET /admin/dashboard`, `GET /admin/users`, `GET /admin/logs`, `GET /admin/token-lists`, `POST /admin/allowlist`, `POST /admin/denylist`, `DELETE /admin/allowlist/{id}`, `DELETE /admin/denylist/{id}`

---

## 5. API概要

**ベースURL**: `https://api.molt4x.com`

**リクエスト形式**: JSON (`Content-Type: application/json`)

**レスポンス形式**:
```json
{
  "success": boolean,
  "data": T | null,
  "error": string | null
}
```

**リトライポリシー**: 最大3回、指数バックオフ (1秒, 2秒, 4秒)。429 および 5xx でリトライ実行。404 はリトライしない。

**タイムアウト**: デフォルト 15秒 / スワップ・流動性操作は 30秒。

**エクスポート済みAPI関数**: 68個

### エンドポイントカテゴリ

| カテゴリ | 数 | 主要エンドポイント |
|---------|-----|-------------------|
| プール CRUD | 6 | `/pools`, `/pools/{id}`, 作成, 見積り, スワップ |
| 流動性 | 3 | add-liquidity, remove-liquidity, LP情報 |
| プールデータ | 5 | transactions, onchain-balance, reconciliation, settle, price-history |
| 分析 | 1 | `/analytics` |
| ガバナンス | 4 | 提案CRUD, 投票, 実行 |
| 指値注文 | 4 | 作成, 一覧, キャンセル, チェック |
| 報酬 | 2 | プール報酬, LP報酬 |
| ファーミング | 5 | ステーク, アンステーク, 収穫, ステーク取得, サマリー |
| リアルタイム | 1 | SSEストリーム |
| ネットワーク | 2 | 一覧, 切替 |
| ブリッジ | 7 | wrap, unwrap, deposit-info, stats, transactions, dynamic-fees, supported-tokens |
| チャート | 2 | OHLC, advanced-chart |
| ポートフォリオ | 1 | アドレスでポートフォリオ取得 |
| 通知 | 5 | 取得, 既読, アラート作成, アラート一覧, アラート削除 |
| セキュリティ | 3 | ステータス, レート制限, アドレス検証 |
| 管理 | 7 | ダッシュボード, ユーザー, ログ, トークンリスト, 許可/拒否リストCRUD |
| ルーティング | 1 | ルート検索 |
| 分割約定 | 1 | swap-partial |
| ランチパッド | 4 | ローンチ, 一覧, 取得, プール作成 |
| s402 | 7 | プロトコル, ダッシュボード, 登録, エージェント取得, 支払い, 価格設定, プレミアム |
| エクスプローラー | 2 | TX検索, アドレス検索 |
| ヘルスチェック | 1 | `/health` |

---

## 6. オンチェーン統合

### dxs-stas-sdk の利用

フロントエンドは `swap-service.ts` を通じてローカルの `dxs-stas-sdk` をインポート:

- **ウォレット**: BIP39 ニーモニック / WIF キー管理
- **UTXOスキャン**: `scanWalletUtxos()`, `scanSingleAddressUtxos()`
- **トランザクションビルド**: `BuildDstasTransferTx`, `BuildDstasSwapFlowTx`
- **ブロードキャスト**: WhatsOnChain API (`/tx/raw`) 経由
- **トランザクション読取**: `TransactionReader.readHex()`
- **暗号**: `hash160`, `sha256`, `bs58check`, `PrivateKey`

### WhatsOnChain 統合

- **開発モード**: Vite プロキシ (`/woc` → `https://api.whatsonchain.com/v1/bsv/main`)
- **本番モード**: 直接APIコール
- 用途: UTXO取得, TXブロードキャスト, TXヘックス取得, アドレス情報, 残高確認

---

## 7. データ型リファレンス

### コア型

```typescript
type Token = {
  symbol: string; name: string; color: string; balance: number;
  decimals: number; tokenId: string; issueTxId: string;
  satoshis: number; freeze: boolean;
}

type NavTab = 'swap' | 'pool' | 'tokens' | 'history' | 'analytics'
  | 'governance' | 'limit-orders' | 'rewards' | 'farming' | 'bridge'
  | 'charts' | 'portfolio' | 'notifications' | 'security' | 'admin'
  | 'partial-fill' | 'routing' | 'launchpad' | 's402' | 'docs' | 'explorer'
```

### ウォレット型

```typescript
type WalletProviderType = 'extension' | 'mnemonic' | 'wif'
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

interface WalletAccount {
  address: string; publicKey?: string; network: 'mainnet' | 'testnet';
}

interface IDxsWalletProvider {
  isAvailable(): boolean
  connect(): Promise<WalletAccount>
  disconnect(): Promise<void>
  getAddress(): Promise<string>
  getWif(): Promise<string>
  getBalance(): Promise<number>
  signTransaction(txHex: string): Promise<string>
  signMessage(message: string): Promise<string>
}
```

### 主要APIレスポンス型

```typescript
PoolInfo, SwapQuote, LpInfo, TransactionInfo,
OnChainBalanceResponse, ReconciliationReport,
PriceHistoryPoint, AnalyticsOverview,
ProposalInfo, RouteQuoteResponse, LimitOrderInfo,
PoolRewardsSummary, LpRewardsInfo,
FarmingStakeInfo, FarmingSummary,
NetworkConfig, BridgeStats, BridgeTransaction, BridgeDepositInfo,
AdvancedChartData, OhlcCandle,
PortfolioSummary, NotificationSummary, PriceAlert,
RateLimitInfo, SecurityStatus,
AdminDashboard, AdminUserInfo, AdminSystemLog, TokenListStatus,
PartialFillResponse, BridgeDynamicFeesInfo, BridgeSupportedTokenDetail,
LaunchedToken, S402ProtocolInfo, S402DashboardData, S402AgentWallet,
ExplorerSearchResult
```

---

## 8. バリデーションと安全性

| ルール | 値 |
|--------|-----|
| 最大金額 | 1,000,000,000 |
| 最大小数桁数 | 8 |
| 入力サニタイズ | 非数値文字の除去, 小数桁数の制限 |
| 金額バリデーション | > 0, <= 最大値, <= 残高 |
| スリッページ警告 | > 5% で警告表示 |
| リトライ (指数バックオフ) | 1秒 → 2秒 → 4秒 (最大3回) |
| リクエストタイムアウト | 15秒 (デフォルト) / 30秒 (スワップ操作) |
| レート制限対応 | HTTP 429 で自動リトライ |
