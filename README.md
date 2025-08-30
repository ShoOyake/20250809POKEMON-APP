# 20250809POKEMON-APP
自己開発シリーズ第一弾

まずは、最低限の機能でリリースする
--------------
---gitの基本---
--------------
1⃣pull
・今いるブランチを確認（featureブランチにいることを確認）
git branch

・develop ブランチの最新情報を取得
git fetch origin

・develop を feature にマージ
git merge origin/develop

＜番外編＞
ローカルで物理的にディレクトリ構成を変更して失敗したとき、リモートリポジトリの元の状態にローカルを戻す方法　(ローカル編集した分すべて消えるので、事前にスタッシュしておくと良いかも)

git fetch origin

git reset --hard origin/develop

git clean -fd

2⃣push
・今いるブランチを確認（featureブランチにいることを確認）
git branch

・すべての修正したファイルをステージング
git add .
 
・ステージングしたファイルをコミット
git commit -m "任意のコメント"

・リモートリポジトリへプッシュ 
git push origin feature/Oyake 

3⃣スタッシュ
・今の変更内容を一時的に退避する
git stash save "任意のコメント（一時的な作業内容）"

・スタッシュを確認する
git stash list
2-2. スタッシュの詳細を確認する
git stash show -p
git stash show -p stash@{任意のインデックス}

・スタッシュを適用する
git stash apply
git stash apply stash@{任意のインデックス} 

-----------------
---開発のルール---
-----------------


