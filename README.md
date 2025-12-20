# AuraTime Design Reference

AuraTime（マルチテナント型勤怠・給与管理システム）のUIデザインリファレンス実装です。

<img width="1433" height="853" alt="image" src="https://github.com/user-attachments/assets/72a13787-6bae-4cc7-8f06-63279aea348c" />


## 概要

本リポジトリは、[Bolt.new](https://bolt.new/)で生成されたAuraTimeのUIデザインリファレンスコードです。実際のAuraTimeプロジェクト（[AuraTime](https://github.com/mshrynzw/AuraTime)）のフロントエンド実装時の参考として使用します。

## 目的

- **デザインパターンの参考**: UIコンポーネントの構造とデザインパターンを確認
- **実装の参考**: 実際のAuraTimeプロジェクトに統合する際の実装方法の参考
- **デザインのバージョン管理**: デザインの変更履歴を追跡

## 技術スタック

- **Next.js 13.5.1** (App Router, TypeScript)
- **React 18.2.0**
- **Tailwind CSS 3.3.3**
- **Shadcn UI** (Radix UIベースのコンポーネントライブラリ)
- **Supabase** (認証用、参考実装)

## プロジェクト構造

```
AuraTime_design_reference/
├── app/ # Next.js App Router
│ ├── dashboard/ # ダッシュボード画面
│ ├── time-clock/ # 打刻画面
│ ├── attendance/ # 勤怠一覧画面
│ ├── leave-requests/ # 休暇申請画面
│ ├── approvals/ # 承認待ち一覧画面
│ ├── shifts/ # シフト管理画面
│ ├── payroll-periods/ # 給与期間管理画面
│ ├── payroll/ # 給与明細画面
│ ├── master/ # マスタ管理画面
│ ├── audit-logs/ # 監査ログ画面
│ └── login/ # ログイン画面
├── components/
│ ├── layout/ # レイアウトコンポーネント
│ │ ├── MainLayout.tsx # メインレイアウト
│ │ ├── Header.tsx # ヘッダー
│ │ └── Sidebar.tsx # サイドバー
│ └── ui/ # Shadcn UIコンポーネント
├── lib/ # ユーティリティ
│ ├── auth/ # 認証関連
│ └── utils.ts # 共通ユーティリティ
└── hooks/ # カスタムフック
```


## 主要画面

### 従業員向け画面
- **ダッシュボード**: クイック統計、打刻エリア、直近の打刻履歴
- **打刻画面**: 大きな時計表示、出勤/退勤/休憩入/休憩戻ボタン
- **勤怠一覧**: カレンダービュー、日別の労働時間表示
- **休暇申請**: 休暇申請フォーム、残数表示、申請履歴
- **給与明細**: 給与期間別の明細一覧、PDFダウンロード

### マネージャー向け画面
- **承認待ち一覧**: 承認待ちの申請一覧、承認/却下操作
- **シフト管理**: カレンダービューでのシフト表示、シフト割当

### 管理者向け画面
- **給与期間管理**: 給与期間一覧、締め操作、給与計算ジョブ実行
- **マスタ管理**: 従業員、グループ、シフトテンプレートの管理

### システム管理者向け画面
- **監査ログ**: ログ一覧、フィルタリング、詳細表示

## 使用方法

### セットアップ

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
