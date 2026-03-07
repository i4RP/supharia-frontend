# Devin委譲テンプレート（外部エンジニア向け）

以下を埋めてDevinに渡す:

```text
[Task]
<やってほしいことを1-2行で明記>

[Scope]
- 変更対象ファイル:
- 変更してはいけない範囲:

[API Contract Targets]
- endpoint:
- method:
- request fields:
- response fields:
- auth/header:
（API以外のタスクでは必要項目のみ記入）

[Acceptance Criteria]
1.
2.
3.

[Known Risks]
- openapi と実装のドリフト有無:
- 破壊的変更の許可有無:

[Frontend Guardrail]
- デザイン大幅変更の可否（原則: 不可）:
- 変更許可範囲（文言/バグ修正/最小調整など）:
- 変更禁止範囲（配色/タイポ/レイアウト全面変更など）:

[Deliverables]
1) 変更サマリ
2) Before/After契約差分
3) 実行例（curlまたはJSON）
4) 必須環境変数
5) 外部委譲メモ
```

## 推奨運用
1. まず `llm/docs/devin-bootstrap-prompt.ja.md` を送る
2. 次にこのテンプレートを送る
3. API契約が重要な作業では、初手で `Contract Snapshot` を返してもらう
