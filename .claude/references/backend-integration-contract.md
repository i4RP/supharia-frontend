# Backend Integration Contract (for Claude Code / Devin)

## 0. 目的
この文書は、`llm/docs/i4rp-repomix-output.xml`（別リポジトリの統合スナップショット）から抽出した  
バックエンド連携の事前知識を、外部エンジニア委譲時に使える形で固定するためのものです。

## 0.1 Repomix参照ポリシー
1. 正本は `llm/docs/i4rp-repomix-output.xml`
2. 旧配置 `repomix-output.xml` が存在する場合のみフォールバックとして扱う
3. 大容量ファイルのため、常に部分抽出（path指定、`rg`、`awk`）で読む

## 1. 前提と適用範囲
1. 対象は DSTAS AMM 系の API 連携
2. 実態は Rust バックエンド実装が最優先
3. OpenAPI は一部ドリフトしているため補助情報として扱う

## 2. 仕様優先順位（厳守）
1. `backend/dstas-amm/src/main.rs`（Router定義と request/response struct）
2. `frontend/src/amm-api.ts`（実クライアント）
3. `backend/dstas-amm/openapi.yaml`（要差分確認）

## 3. API共通レスポンス
実装の共通ラッパー:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

エラー:

```json
{
  "success": false,
  "data": null,
  "error": "message"
}
```

## 4. 実装起点の主要ルート（main.rs）
### 基本
1. `GET /health`
2. `GET /status`
3. `GET|POST /pools`
4. `GET /pools/:pool_id`
5. `POST /pools/:pool_id/quote`
6. `POST /pools/:pool_id/swap`
7. `POST /pools/:pool_id/swap-partial`
8. `POST /pools/:pool_id/add-liquidity`
9. `POST /pools/:pool_id/remove-liquidity`
10. `GET /pools/:pool_id/lp/:address`
11. `GET /pools/:pool_id/transactions`
12. `GET /pools/:pool_id/onchain-balance`
13. `POST /pools/:pool_id/settle`
14. `GET /pools/:pool_id/settlement-status/:txid`
15. `POST /pools/:pool_id/cleanup-pending`
16. `GET /pools/:pool_id/reconciliation`
17. `GET /pools/:pool_id/price-history`
18. `GET /pools/:pool_id/ohlc`
19. `GET /pools/:pool_id/advanced-chart`
20. `GET /analytics`
21. `POST /route`
22. `GET|POST /pools/:pool_id/proposals`
23. `POST /pools/:pool_id/proposals/:proposal_id/vote`
24. `POST /pools/:pool_id/proposals/:proposal_id/execute`
25. `GET|POST /pools/:pool_id/limit-orders`
26. `POST /pools/:pool_id/limit-orders/:order_id/cancel`
27. `POST /pools/:pool_id/limit-orders/check`
28. `GET /pools/:pool_id/rewards`
29. `GET /pools/:pool_id/lp/:address/rewards`
30. `GET /pools/:pool_id/farming`
31. `POST /pools/:pool_id/farming/stake`
32. `POST /pools/:pool_id/farming/unstake`
33. `GET /pools/:pool_id/farming/:address`
34. `POST /pools/:pool_id/farming/:address/harvest`
35. `GET /subscribe`
36. `GET /networks`
37. `POST /networks/switch`

### ブリッジ
1. `GET /bridge/deposit-info`
2. `POST /bridge/wrap`
3. `POST /bridge/unwrap`
4. `GET /bridge/transactions`
5. `GET /bridge/transactions/:tx_id`
6. `GET /bridge/stats`
7. `GET /bridge/supported-tokens`
8. `GET /bridge/dynamic-fees`
9. `POST /bridge/auto-check`

### ポートフォリオ/通知/セキュリティ
1. `GET /portfolio/:address`
2. `GET /notifications/:address`
3. `POST /notifications/:address/:notif_id/read`
4. `POST /alerts`
5. `GET /alerts/:address`
6. `DELETE /alerts/:address/:alert_id`
7. `GET /rate-limit`
8. `GET /security/status`
9. `POST /security/validate-address`

### 管理系
`/admin/*` は `x-admin-api-key` 必須（Bearer ではない）

### Launchpad
1. `GET|POST /launchpad/tokens`
2. `GET /launchpad/tokens/:token_id`
3. `POST /launchpad/tokens/:token_id/pool`

### S402
1. `GET /s402/protocol`
2. `GET /s402/requirements`
3. `POST /s402/verify`
4. `GET /s402/dashboard`
5. `GET /s402/payments`
6. `GET|POST /s402/config`
7. `GET|POST /s402/pricing`
8. `POST /s402/agent/register`
9. `GET /s402/agent/:agent_id`
10. `POST /s402/agent/:agent_id/pay`
11. `GET /s402/premium/example`

## 5. 高頻度で壊れる契約ポイント
### 5.1 OpenAPI とのドリフト
1. 提案系パス
`openapi`: `/proposals`
`実装`: `/pools/:pool_id/proposals`
2. farming パス
`openapi`: `/farming/{pool_id}/...`
`実装`: `/pools/:pool_id/farming/...`
3. realtime パス
`openapi`: `/realtime`
`実装`: `/subscribe`
4. route body
`openapi`: `input_token`, `output_token`
`実装`: `input_token_id`, `output_token_id`
5. 認証
`openapi`: Bearer 前提の設計方針が見える
`実装`: `/admin/*` は `x-admin-api-key`、S402 は `X-STAS-PAYMENT` など
6. Launchpad/S402 系は openapi 未反映箇所がある

### 5.2 フロント SDK と実装のドリフト（重要）
1. `setS402Pricing`
`frontend`: `endpoint_pattern`
`backend`: `path_pattern`
2. `s402AgentPay`
`frontend`: `{ endpoint, amount_sats }`
`backend`: `{ agent_wif, endpoint }`
3. `BridgeTransaction` 型
`frontend` 型定義と `backend` 応答フィールド構造が一致しない（`token_id/token_symbol` vs `token`, `amount` 型など）
4. `registerS402Agent`
`frontend` は `{ name }`、`backend` は `{ agent_name? }`（optionalのため動くが名称伝播に注意）

## 6. リクエスト契約（実装優先）
### swap quote
`POST /pools/:pool_id/quote`

```json
{
  "input_token": "wBTC or token_id",
  "input_amount": 1000
}
```

### swap execute
`POST /pools/:pool_id/swap`

```json
{
  "user_wif": "<WIF>",
  "input_token": "wBTC or token_id",
  "input_amount": 1000,
  "min_output_amount": 990
}
```

### partial swap
`POST /pools/:pool_id/swap-partial`

```json
{
  "user_wif": "<WIF>",
  "input_token": "wBTC or token_id",
  "input_amount": 1000,
  "min_output_amount": 990,
  "split_count": 3
}
```

### add/remove liquidity
`POST /pools/:pool_id/add-liquidity`

```json
{
  "user_wif": "<WIF>",
  "amount_a": 5000,
  "amount_b": 5000
}
```

`POST /pools/:pool_id/remove-liquidity`

```json
{
  "user_wif": "<WIF>",
  "lp_share_percent": 50
}
```

### route
`POST /route`

```json
{
  "input_token_id": "tokenA",
  "output_token_id": "tokenB",
  "input_amount": 1000
}
```

### governance
`POST /pools/:pool_id/proposals`

```json
{
  "proposer": "1abc...",
  "title": "fee update",
  "description": "raise fee",
  "param_key": "fee_rate",
  "param_value": 0.012
}
```

`POST /pools/:pool_id/proposals/:proposal_id/vote`

```json
{
  "voter": "1abc...",
  "vote": "for or against"
}
```

### farming
`POST /pools/:pool_id/farming/stake`
`POST /pools/:pool_id/farming/unstake`

```json
{
  "user_address": "1abc...",
  "lp_shares": 123.45
}
```

### bridge
`POST /bridge/wrap`

```json
{
  "from_address": "1abc...",
  "token_id": "token_id",
  "amount": 1000,
  "user_wif": "<WIF>",
  "eth_tx_hash": "0x...",
  "eth_network": "mainnet or sepolia"
}
```

`POST /bridge/unwrap`

```json
{
  "from_address": "1abc...",
  "token_id": "token_id",
  "amount": 1000,
  "user_wif": "<WIF>",
  "dest_eth_address": "0x...",
  "eth_network": "mainnet or sepolia"
}
```

### launchpad
`POST /launchpad/tokens`

```json
{
  "user_wif": "<WIF>",
  "name": "Token Name",
  "symbol": "TKN",
  "total_supply": 1000000,
  "freeze": false,
  "decimals": 0
}
```

### s402 verify
`POST /s402/verify` は以下のどちらか
1. `X-STAS-PAYMENT` ヘッダ
2. JSON body: `tx_hex`, `nonce`, `scheme?`

## 7. 状態遷移と整合性の注意点
1. Pool 更新は `update_pool_optimistic`（version比較）で競合時 409 を返す
2. on-chain settlement 失敗時でも tx は `pending-*` で保存される
3. `settlement_status` は実装上 `broadcast` が使われる
4. `POST /pools/:pool_id/cleanup-pending` は `pending-*` を `failed` に落とす

## 8. フロント実装上の通信仕様
1. `API_BASE = "https://api.molt4x.com"`
2. 429 と 5xx はリトライ
3. バックオフは `1s -> 2s -> 4s`
4. 通常 timeout は 15s、swap/liquidity は 30s

## 9. 認証・CORS
1. `/admin/*` は `x-admin-api-key`
2. S402 は `X-STAS-PAYMENT` または verify body
3. CORS 許可元は `ALLOWED_ORIGINS`（デフォルトあり）

## 10. 環境変数（連携影響が大きいもの）
1. `POOL_MASTER_SEED`
2. `ACTIVE_NETWORK`
3. `ALLOWED_ORIGINS`
4. `ADMIN_API_KEY`
5. `BRIDGE_ETH_SECRET_ID`
6. `ETHERSCAN_API_KEY`
7. `ETH_NETWORK`
8. `S402_RECIPIENT_WIF`
9. `S402_ENABLED`
10. `S402_DEFAULT_PRICE`
11. `S402_ACCEPTED_TOKENS`
12. `TX_BUILDER_FUNCTION`

## 11. 外部エンジニア委譲テンプレート
以下を常にセットで渡す:
1. 対象 endpoint 一覧（実装パスベース）
2. リクエスト例 JSON（main.rs struct 名と対応）
3. 期待レスポンス例（`success/data/error`）
4. 失敗ケース
`400`: バリデーション
`404`: pool/tx 不在
`409`: optimistic lock 競合
`429`: レート制限
`500+`: 一時障害
5. 必須 env vars と認証方法

## 12. 変更時の最低要件
1. `main.rs` のルート/構造体を変えたら `frontend/src/amm-api.ts` も同期
2. `openapi.yaml` は遅れていてもよいが、乖離を放置せず差分を明記
3. 外部委譲向けの「どこが破壊的か」を明確化
