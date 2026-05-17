@AGENTS.md

# CNN10 自動配信パイプライン 運用ルール

## Git リモート設定（毎セッション必須）

パイプライン実行前に必ずこのコマンドでリモートURLをトークン付きに設定する：

```bash
git remote set-url origin https://${GITHUB_TOKEN}@github.com/epis-mintsite/cnn10-exam-daily.git
```

`GITHUB_TOKEN` は環境変数または Vercel の Secret に設定されているトークンを使用する。環境のデフォルトリモート（ローカルプロキシ）はプッシュ権限がないため、このコマンドを省略すると push が 403 で失敗する。

トークンが環境変数にない場合は、パイプライン冒頭でセッション設定やシークレットストアから取得すること。

## プッシュ先は必ず `main`

Vercel は `main` ブランチを監視して自動デプロイする。開発ブランチへのプッシュでは本番に反映されない。

```bash
git push origin main   # 正しい
# git push origin claude/... は本番に届かない
```

セッション設定で別ブランチが指定されていても、**コンテンツファイル（content/*.md）は必ず main にプッシュする**こと。

## YouTube RSS 取得失敗時のフォールバック

`https://www.youtube.com/feeds/videos.xml?...` がネットワークポリシーでブロックされる場合（Host not in allowlist）、STEP 2 をスキップして既存の `data/video-pool.tsv` のまま続行する。エラーで停止しない。

## 配信失敗の検出と補完

`content/` ディレクトリに前日分（TODAY-1）のファイルが存在しない場合、当日分と合わせて2日分を作成・コミットしてから push する。
