# こるあぽくん🐤📞
![ヘッダー画像背景付きコメント付き](https://github.com/user-attachments/assets/198f0b2d-1137-4793-9fac-50402631e163)


## 〇私の前職での経験🧑‍💼  

私は高校を卒業してからの約５年間フリーランスの営業マンとして活動し、  
主にコールセンターでの営業業務に従事してきました。  
そのうち約2年間お世話になった現場では、営業だけでなく新人育成などの業務にも携わる機会をいただきました。  

## 〇現場の課題🏢  

その現場では営業の成績管理が個人任せで、統一フォーマットがありませんでした。  
そのため、自作のExcel、紙のノート、教育係から共有されたツールなど  
各自が異なる方法で記録しており、以下の問題が生じていました。
1. データ分析の知識がない人は数字を活用する習慣がなく、部署内の営業成績に大きな格差が生じてしまっていた。  
2. 共通の基準がないため教育係が変わったときに引継ぎがうまくできない。  
3. 統一された基準がないことで、新人同士が互いの成績を比較して切磋琢磨することが難しい。  


## 〇解決したい問題☁️  

これらの問題を解決するために以下のようなツールが必要だと考えました。
1. PCに不慣れな人でも簡単に入力でき、営業に必要な数値を取得できる
2. 全員が同じフォーマットを使用できる


## 〇こるあぽくん開発の目的🎯  

このサービスは単なる営業成績向上だけでなく、上司や先輩がいなくても新人たち自身がそれぞれの数値を確認し合い、  
成長しやすい環境づくりにつながると考え、開発に至りました。


## 〇サービスURL🔗  

https://koruapokun4.vercel.app  

このアプリにはテスト用アカウントをご用意していますので、ご自由にご利用ください！  
ユーザー登録やデータの登録をしていただいても問題ございません。  

📌 メールアドレスや本名などの個人情報の登録は不要です。  
📌 パスワードはハッシュ化され、安全に保存されます。  

ぜひ実際に触って、機能をご確認ください！ 😊  

| ユーザー名 | パスワード |
| ------- | ------- |
| テストユーザー | PASSword@1 |

**※このサービスは現在無料サーバーを使っているため、一定時間使われないとサーバーがスリープ状態になります。  
ログインや会員登録のボタンをクリックしてもロードが終わらない場合はサーバーがスリープ状態です。  
その場合、リンクをクリックした後 しばらく（約30秒）待ってからページを更新すると、アプリが正常に動作しログインできるようになります。**

<br><br>

## 〇機能一覧📋  

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

<br><br>

## 〇システムフローチャート🔀  

### 〇ログイン  
フロントエンド：青赤　バックエンド：黄色　データベース：赤色  
![ログイン遷移 (3)](https://github.com/user-attachments/assets/475b264b-90ba-4d1a-bd41-2044f059a656)

### 〇ホーム画面  
フロントエンド：青赤　バックエンド：黄色　データベース：赤色  
![HomeDashboard js画面遷移 (2)](https://github.com/user-attachments/assets/96b2f677-d3a4-4962-96bd-7d758c767b94)

<br><br>

## 〇主な使用技術🛠️  

#### 〇フロントエンド  
| カテゴリ |　技術スタック |
| ------- | ------- |
| フレームワーク | React 19, Next.js 15 | React 19, Next.js 15 |
| UI | Material UI (MUI) v6 |
| UI データピッカー | @mui/x-date-pickers |
| UI アイコン | @mui/icons-material |
| アニメーション | Framer Motion |
| フォーム管理 |  React Hook Form, Zod |  

#### 〇バックエンド  
| カテゴリ |　技術スタック |
| ------- | ------- |
| フレームワーク | Django |
| フレームワーク（API開発） | Django REST Framework |
| データベース |PostgreSQL (AWS RDS) |  

#### 〇インフラストラクチャー  
| カテゴリ | 技術スタック |
| ------- | ------- |
| フロントエンド | Vercel |
| バックエンド | Render |

<br><br>

## 〇技術選定理由💡   

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

<br><br>

## 〇開発方法🏗️  

1. **ゼロからのスタート：基礎知識の習得 （２週間）**  
プログラミングや開発手法について全くの未経験だったため、まずは基礎固めからスタート。  
YouTubeでWebアプリ開発の解説動画を視聴しながら、  
実際にコードを書いて動かしてみることで、プログラミングの基礎を習得しました。  

2. **アイデアの整理：サービスの機能を書き出し （１週間）**  
開発するアプリの方向性を明確にするため、実装したい機能をリストアップしました。  
以下は、最初に書き出した機能一覧です。  
<details>
<summary>ホーム画面 要件定義書 ※現在の仕様とは一部異なります。</summary>

### **① KPIの可視化**  

💡 **デザイン**

- KPI（再コール率・見込み率など）は **円グラフ or 横棒グラフ** で視覚化
- 直感的に「どの割合が多いか」見えるようにする
- KPIごとに色分け（例：獲得率＝青、アプローチNG率＝赤）

🧮 **計算方法**

- **再コール率** = （再コール ÷ キャッチ数） × 100
- **見込み率** = （見込み ÷ キャッチ数） × 100
- **アプローチNG率** = （アプローチNG ÷ キャッチ数） × 100
- **商品説明後NG率** = （商品説明後NG ÷ キャッチ数） × 100
- **獲得率** = （獲得 ÷ キャッチ数） × 100

---

### **② 目標獲得数に対しての必要キャッチ数・コール数**

💡 **デザイン**

- **進捗バー** で「今のペース vs 目標のペース」を可視化
- 計算結果の数値は **色付きカード** に表示（緑＝達成可能、赤＝要改善）

🧮 **計算方法**

1. **一日に必要な獲得数**→ 目標件数 ÷ 稼働日数
2. **一日に必要なキャッチ数**→ (一日に必要な獲得数 × 100) ÷ 獲得率(％)

---

### **③ 進捗率**

💡 **デザイン**

- **円グラフ + 進捗バー**（達成率 〇〇％ / 目標〇〇件）
- 「進捗ペースに遅れている」「順調」などの **アラート表示** も追加

🧮 **計算方法**

1. **進捗率**→ (現在の獲得数合計 ÷ 目標数) × 100
2. **もし100％なら現在の予測獲得数**→ (現在の日付 ÷ 1か月の日数) × 目標数

---

### **④ 月末の獲得予測**

💡 **デザイン提案**

- **折れ線グラフ** で「現在のペース vs 目標ペース」を比較
- **進捗バー** をつけ、「目標達成可能？難しい？」が直感的にわかる

🧮 **計算方法**

1. **1日あたりの平均獲得数**→ 現在の累計獲得数 ÷ 経過日数
2. **月末獲得予測**→ 一日当たりの平均数 × 一か月の日数
   
---
  
</details>




3. **技術選定：最適な技術スタックを決定 （１週間）**  
アプリの要件を満たすために、最適な技術スタックの選定を行いました。  
具体的には、要件定義書をもとに Claude・ChatGPT・DeepSeek などのAIに相談し、得られた複数の提案を比較・分析。  
さらに、自分で調査を行い、最も適した技術を選定しました。  
※詳細な選定理由については [技術選定理由](#〇フロントエンド)に記載しています。  

4. **設計のブラッシュアップと開発準備 （１週間）**  
選定した技術を使用するために、必要な知識をYoutubeの動画やAIへの質問を活用し習得しました。  
APIの仕様を整理しながら [フローチャート](#〇ログイン)を作成。  

5. **コーディング開始：AIを活用した効率的な開発 （３週間）**  
設計に基づき、コーディングを開始。  
開発効率を高めるために Cursor（AI搭載コードエディター） を活用し、基本的なコードをAIに生成させながら、  
細かな部分を自分で調整。   
これにより、作業のスピードと精度を両立しつつ、実装を進めました。  

<br><br>

## 〇工夫した点🔍  

1. **パスワードセキュリティの強化**   
パスワードの強度をリアルタイムでチェックし、  
視覚的フィードバックを通じてユーザーが安全なパスワードを設定しやすいよう工夫しました。  

2. **認証の最適化**   
トークンを利用することで、高いセキュリティを確保しつつ、  
ユーザーにとってストレスなくスムーズに利用できるようにしました。  

3. **安定したデータ処理**   
計算処理とデータ保存のAPIを分離し、データの重複確認後に計算APIへリクエストを送ることで、  
エラーを防ぎつつ安定した処理フローを実現しました。  

4. **ユーザー操作の最適化**   
ロード中の読み込みアニメーションを実装し、処理完了前にボタンを押せないよう制御することで、  
ユーザー操作によるエラーを防ぎました。  

5. **デバイス対応**   
レスポンシブデザインを徹底し、グリッドシステムを活用した柔軟なレイアウトや、  
デバイスごとの適切なスタイル調整を行い、スマートフォンでも快適に操作できるよう工夫しました。  

6. **進捗管理の精度向上**   
時間経過に基づく目標達成率や理想的な進捗を算出し、  
月末獲得予測や必要獲得数の動的計算を行うことで、精度の高い進捗管理を実現しました。     

<br><br>

## 〇開発を通して学んだこと & 課題🎓  

### ✅ 良かった点
#### アプリ開発の一連の流れを実践的に学べた。
開発に必要なツールや技術（コードエディター, Git/GitHub, AWS, PostgreSQL, フローチャートの作成, AIの活用, 本番環境へのデプロイ）  
を実際に扱いながら、開発の流れを一から学ぶことができた。  
#### 完全に独学で開発を進めたことで、自走力が身についた。
メンターやプログラミングスクールを利用せず、自分で情報を調べながら設計書やフローチャートを作成し、  
問題を解決しながら開発を進め、サービスを完成させることができました。この経験を通じて、自走力が身についたと感じています。  

### ❌ 課題（改善したい点）
#### AIを多く活用したため、ゼロからの実装力が不足している。
AIを活用して効率的に開発を進められた反面、自分で設計・実装する力がまだ足りないと感じました。  
今後は、自分で一から設計・実装をする機会を増やしたいです。💪  

<br><br>

## 〇FAQ💬  

#### Q. 未経験から２か月でWEBアプリ開発は期間が短くないですか？  
A. 短期間で開発できた理由は、以下の2点です  
【💻PC操作や開発に慣れていたこと】  
小学生の頃から RPGツクール でゲームを作ったり、Bubble（ノーコードツール） を使って  
スマホアプリを開発した経験があり、元々ITツールの扱いに慣れていました。  
【🧑‍💻開発にフルコミットできたこと】  
フリーランスの営業活動をストップし、1日をフルに使って学習・開発に集中できたため、短期間で完成させることができました。  


#### Q. AIを多く活用していますが、自分で1から考えたり、1からコーディングしなかったのはなぜですか？  
A.  Webアプリ開発では適切なツールや技術を活用しながら開発を進めることが重要だと考えています。  
そのため、基礎的な技術理解を前提にAIを補助ツールとして活用しつつ、コードの調整や最適化を自分で行うという  
開発スタイルを採用しました。  

ただ、案件によっては セキュリティポリシーやプロジェクトの特性上、生成AIの使用が制限されるケースもあると耳にすることも多いので、  
AIに頼らず自分で設計・実装する力も必要だと考えています。  
そのため、次の機能実装では、AIを使わず1から設計・実装を行い、より実務的なスキルを高めることを目標としています。

#### Q. GitHubの履歴が途中からになっているのはなぜですか？  
A. GitとGitHubを初めて使用したため、操作に不慣れで履歴が途中からになってしまいました。  
具体的には、ブランチ上でアプリ開発を進めたものの、マージの際に問題が発生し、うまく統合できませんでした。  
そのため、一度Gitを削除して再設定したため、過去の履歴が残っていません。  

<br><br>

## 〇AIを使わずに一つ機能実装をしよう💪
ここにはAIを使わずに機能実装を進めていく過程を記録していこうと考えています！

※まだ何も手を付けられていません😢(3/5日)
<details>
<summary>ここに書いていく</summary>
</details>
