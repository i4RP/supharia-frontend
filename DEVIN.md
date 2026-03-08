# Devin運用ガイド（Auto-Subagent代替）

## 目的
Devinには Claude Code の subagent 自動委譲がない。  
このガイドで「毎回同じ事前知識を先に読ませる」運用を固定し、  
API連携の仕様ドリフトを抑える。

## フロントエンドデザイン保護
1. 明示的な依頼がない限り、フロントエンドの見た目を大幅に変更しない
2. 許可する変更は、文言修正・不具合修正・アクセシビリティ改善・既存デザイン準拠の最小調整のみ
3. 配色、タイポグラフィ、レイアウト、余白体系、主要コンポーネント配置の全面変更を禁止する
4. UI変更が必要な場合は、実装前に「目的・対象画面・最小差分」を先に提示する

## 0. ブート運用（推奨）
1. API連携や委譲タスクを始めるときは、`llm/docs/devin-bootstrap-prompt.ja.md` の利用を推奨
2. 文脈が大きく混ざる場合はスレッドを分割する
3. スレッドを分けた場合は、必要に応じてブートプロンプトを再送する

## 0.1 自動化コマンド
1. `npm run devin:bootstrap`
起動用プロンプトを生成し、クリップボードへコピーする
2. `npm run devin:bootstrap:template`
起動用プロンプトに委譲テンプレートを連結してコピーする
3. `npm run devin:bootstrap:print`
コピーせずに標準出力へ表示する（CIや確認用）

## 0.2 運用メモ
1. 上記コマンドは「手動トリガー」であり、Devin起動時に自動実行はされない
2. 実運用では、Devinスレッド開始時に `npm run devin:bootstrap` を1回実行する
3. より詳細な指示が必要なタスクのみ `npm run devin:bootstrap:template` を使う

## 1. 優先参照ファイル（必要に応じて）
1. `DEVIN.md`
2. `.claude/references/backend-integration-contract.md`
3. `backend/dstas-amm/src/main.rs`
4. `frontend/src/amm-api.ts`
5. `backend/dstas-amm/openapi.yaml`
6. `llm/docs/i4rp-repomix-output.xml`（詳細調査が必要なときのみ部分抽出で参照）

## 2. 仕様の優先順位
1. `backend/dstas-amm/src/main.rs` の Router / request / response struct
2. `frontend/src/amm-api.ts` のクライアント契約
3. `backend/dstas-amm/openapi.yaml`（補助）

OpenAPI単体で endpoint や payload を断定しない。

## 3. Devinの初手確認（推奨）
着手前に、必要であれば短い `Contract Snapshot` を返す:
1. 対象 endpoint / method
2. request fields（名前と型）
3. response fields（`success` / `data` / `error` を含む）
4. auth / headers（`x-admin-api-key`、`X-STAS-PAYMENT` など）
5. 影響 env vars
6. OpenAPIとの差分有無

## 4. 実装時のガードレール
1. `/admin/*` は `x-admin-api-key` を前提にする
2. S402 は `X-STAS-PAYMENT` または verify body を考慮する
3. 409競合（optimistic lock）の可能性を考慮する
4. settlementの `pending` / `broadcast` / `confirmed` を混同しない
5. route / farming / realtime / s402 / bridge はドリフト前提で確認する
6. フロントエンド変更時はデザイン凍結を優先し、見た目改変より接続性維持を優先する

## 5. 変更提案時の推奨出力
1. 変更対象 endpoint
2. リクエスト/レスポンスの Before/After
3. 破壊的変更の有無
4. 外部エンジニア向け実行例（curl か JSON）
5. 必須環境変数

## 6. 外部委譲で使うテンプレート
1. 起動時: `llm/docs/devin-bootstrap-prompt.ja.md`
2. 依頼時: `llm/docs/devin-delegation-template.ja.md`
