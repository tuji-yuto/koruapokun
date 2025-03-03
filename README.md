# こるあぽくん🐤📞
![ヘッダー画像背景付きコメント付き](https://github.com/user-attachments/assets/198f0b2d-1137-4793-9fac-50402631e163)


## 〇私の前職での経験
私は高校を卒業してからの約５年間フリーランスの営業マンとして活動し、  
主にコールセンターでの営業業務に従事してきました。  
そのうち2年間お世話になった現場では、営業だけでなく新人育成などの業務にも携わる機会をいただきました。  

## 〇現場の課題
その現場では営業の成績管理が個人任せで、統一フォーマットがありませんでした。  
そのため、自作のExcel、紙のノート、教育係から共有されたExcelなど  
各自が異なる方法で記録しており、以下の問題が生じていました。
1. データ分析の知識がない人は数字を活用する習慣がなく、部署内の営業成績に大きな格差が生じてしまっていた。  
2. 共通の基準がないため教育係が変わったときに引継ぎがうまくできない。  
3. 統一された基準がないことで、新人同士が互いの成績を比較して切磋琢磨することが難しい。  

## 〇解決したい問題
これらの問題を解決するために以下のようなツールが必要だと考えました。
1. PCに不慣れな人でも簡単に入力でき、営業に必要な数値を取得できる
2. 全員が同じフォーマットを使用できる

## 〇こるあぽくん開発の目的
このサービスは単なるマネジメント向上だけでなく、上司や先輩がいなくても新人たち自身がそれぞれの数値を確認し合い、  
成長しやすい環境づくりにつながると考え、開発に至りました。

## 〇サービスURL
https://koruapokun4.vercel.app/  

↓アプリの動作を確認するためのテストアカウントがありますのでご自由にお使いください！↓  

| ユーザー名 | パスワード |
| ------- | ------- |
| テストユーザー | PASSword@1 |

※このサービスは現在無料サーバーを使っているため、一定時間使われないとサーバーがスリープ状態になります。  
そのためリンクをクリックした後、しばらく（約30秒）待ってからページを更新すると、アプリが正常に動作しログインできるようになります。


## 〇機能一覧
| ⓵ウェルカムページ | 
| ------- |
| <img src="https://github.com/user-attachments/assets/b806c0fa-c12d-4aaf-8714-380740902efa" width="400"> |
|  ログイン画面、新規会員登録画面に、<br>遷移できるようになっています  |   

| ⓶新規会員登録 | ⓶ログインページ |
| ------- | ------- |
| <img src="https://github.com/user-attachments/assets/288d86bc-7475-4590-9da2-376513315788" width="400"> | <img src="https://github.com/user-attachments/assets/7c22c40e-ea49-4790-a217-7edb33dc9a63" width="400"> |
|  ユーザー名とパスワードを入力し会員登録ができます。<br>パスワードの入力状況も確認できるようになっています。  |  ユーザー名とパスワードを入力してログインができます。  | 

| ⓷日次データ入力 | 
| ------- |
| <img src="https://github.com/user-attachments/assets/7c2d543e-3666-454e-8173-c64e3063085f" width="860"> | 
|  一日の営業データを入力することができます。  | 

| ⓷当月の目標 | 
| ------- |
| <img src="https://github.com/user-attachments/assets/704c2358-49bc-4a93-afff-70104d31f123" width="860"> | 
|  目標獲得数の🖊をクリックしたら当月の目標件数を変更できます。目標件数に基づいた様々な指標が表示されます。  | 

| ⓷当日データ | 
| ------- |
| <img src="https://github.com/user-attachments/assets/c2308b71-73a9-44f7-9678-1a44fc6656e4" width="860"> | 
|  入力された当日のデータが表示されます。電話対応数と獲得数は目標に対して必要数に足りているのか表示されます。  | 

| ⓷月間累計データ | 
| ------- |
| <img src="https://github.com/user-attachments/assets/59851dce-12ff-4dde-9a00-365f0ce679a3" width="860"> | 
|  月間の累計のデータが表示されます。グラフはカーソルを合わせることで数値を確認することができます。  | 

| ⓷月間累計データ | 
| ------- |
| <img src="https://github.com/user-attachments/assets/8d067932-7b44-4726-9085-bebf88ce9ddd" width="860"> | 
|  月間の累計のデータが折れ線グラフで表示されます。<br>グラフはカーソルを合わせることでその日の数値を確認することができます。  | 

## 〇システムフローチャート  (ログイン)
フロントエンド：青赤　バックエンド：黄色　データベース：赤色  
![ログイン遷移 (3)](https://github.com/user-attachments/assets/475b264b-90ba-4d1a-bd41-2044f059a656)

## 〇システムフローチャート　（ホーム画面）
フロントエンド：青赤　バックエンド：黄色　データベース：赤色  
![HomeDashboard js画面遷移 (2)](https://github.com/user-attachments/assets/96b2f677-d3a4-4962-96bd-7d758c767b94)


## ⚪︎ 主な使用技術  
**フロントエンド**  
| カテゴリ |　技術スタック |
| ------- | ------- |
| フレームワーク | React 19, Next.js 15 | React 19, Next.js 15 |
| UI | Material UI (MUI) v6 |
| UI データピッカー | @mui/x-date-pickers |
| UI アイコン | @mui/icons-material |
| アニメーション | Framer Motion |
| フォーム管理 |  React Hook Form, Zod |  

**バックエンド**  
| カテゴリ |　技術スタック |
| ------- | ------- |
| フレームワーク | Django |
| フレームワーク（API開発） | Django REST Framework |
| データベース |PostgreSQL (AWS RDS) |  

**インフラストラクチャー**  
| カテゴリ | 技術スタック |
| ------- | ------- |
| フロントエンド | Vercel |
| バックエンド | Render |

## ⚪︎ 技術選定理由  
**・React Next.js**  
React / Next.js は、フロントエンドで最も現場で広く使われている技術スタックであり、  
実務で触る可能性が高いことと、情報が豊富で学びやすいことから、今回の開発で採用しました。  
また、バックエンドに Django を使用しているため、API との連携がスムーズに行える点も選定理由のひとつです。  

**・MUI**  
MUI はデザイン済みのコンポーネントが豊富で UI をすばやく構築できるだけでなく、  
Material Design に準拠しているためデザインの統一感を出しやすいメリットがあります。  
そのためTailwind CSS ではなく MUI を選択しました。  

**・Django**  
Django は標準機能が豊富なだけでなく、現場でも広く使われているフレームワークです。  
また、Django REST Framework（DRF）を使うことで、React / Next.js との API 連携もスムーズに行えます。  
これらのメリットに加え、pythonを学んでみたいという気持ちがありDjangoを選定しました。  

**・PostgerSQL（AWS RDS）**  
Django は公式で PostgreSQL を推奨しており、実際の開発現場でも広く使われています。  
また、Heroku などの小規模開発の環境ではなく、実際の現場で使われる AWS RDS 上で運用することで  
実務に近い形でのデータベース管理を経験したいと考えました。  
AWS は企業でも広く利用されており、クラウド環境でのデータベース運用に慣れるために採用しました。  

