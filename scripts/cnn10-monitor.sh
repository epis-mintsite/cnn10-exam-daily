#!/bin/bash
# CNN10 Daily Monitor - Checks if the daily task ran, re-runs if not, and reports
# Runs at 8:30 AM, after the 7:03 scheduled task

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
export HOME="/Users/yamayahajime"

TODAY=$(date +%Y-%m-%d)
CONTENT_FILE="$HOME/my-next-app/content/$TODAY.md"
LOG_DIR="$HOME/cnn10-exam-daily/logs"
MONITOR_LOG="$LOG_DIR/monitor-$TODAY.log"
TASK_LOG="$LOG_DIR/$TODAY.log"

mkdir -p "$LOG_DIR"

echo "=== CNN10 Monitor Started: $(date) ===" >> "$MONITOR_LOG"

# Check if today's content file exists
if [ -f "$CONTENT_FILE" ]; then
    echo "[OK] Today's content exists: $CONTENT_FILE" >> "$MONITOR_LOG"
    echo "=== Monitor Complete: No action needed ===" >> "$MONITOR_LOG"
    exit 0
fi

# Content not found - task did not run
echo "[ALERT] Today's content NOT found: $CONTENT_FILE" >> "$MONITOR_LOG"
echo "[INFO] Investigating cause..." >> "$MONITOR_LOG"

# Check 1: Was launchd agent loaded?
LAUNCHD_STATUS=$(launchctl list | grep cnn10.daily-exam-picks 2>&1)
if [ -z "$LAUNCHD_STATUS" ]; then
    echo "[CAUSE] launchd agent not loaded. Re-registering..." >> "$MONITOR_LOG"
    launchctl bootstrap gui/$(id -u) "$HOME/Library/LaunchAgents/com.cnn10.daily-exam-picks.plist" 2>> "$MONITOR_LOG"
else
    echo "[INFO] launchd agent is loaded: $LAUNCHD_STATUS" >> "$MONITOR_LOG"
fi

# Check 2: Did the task script run but fail?
if [ -f "$TASK_LOG" ]; then
    echo "[INFO] Task log exists but content was not created. Script ran but failed." >> "$MONITOR_LOG"
    echo "[INFO] Last 20 lines of task log:" >> "$MONITOR_LOG"
    tail -20 "$TASK_LOG" >> "$MONITOR_LOG"
else
    echo "[CAUSE] No task log found. The script did not run at all." >> "$MONITOR_LOG"
fi

# Check 3: Is claude CLI available?
if ! command -v claude &> /dev/null; then
    echo "[CAUSE] claude CLI not found in PATH" >> "$MONITOR_LOG"
    echo "=== Monitor Complete: Cannot recover - claude CLI missing ===" >> "$MONITOR_LOG"
    exit 1
fi

# Re-run the daily task
echo "[ACTION] Re-running the daily task..." >> "$MONITOR_LOG"
SKILL_FILE="$HOME/.claude/scheduled-tasks/cnn10-exam-picks/SKILL.md"
PROMPT="Read the file $SKILL_FILE and execute ALL steps defined in it autonomously. Do not ask for confirmation."

claude --print --allowedTools '*' -p "$PROMPT" >> "$TASK_LOG" 2>&1
TASK_EXIT=$?

# Verify the re-run succeeded
if [ -f "$CONTENT_FILE" ]; then
    echo "[RECOVERED] Task re-run succeeded. Content created: $CONTENT_FILE" >> "$MONITOR_LOG"
    RESULT_STATUS="recovered"
else
    echo "[FAILED] Task re-run also failed. Manual intervention needed." >> "$MONITOR_LOG"
    RESULT_STATUS="failed"
fi

# Generate a report for Claude to analyze on next interactive session
REPORT_FILE="$LOG_DIR/incident-$TODAY.md"
cat > "$REPORT_FILE" << EOF
# CNN10 定期実行 障害レポート - $TODAY

## ステータス: $( [ "$RESULT_STATUS" = "recovered" ] && echo "自動復旧済み" || echo "要対応" )

## 検出時刻
$(date)

## 原因調査
$(grep "\[CAUSE\]" "$MONITOR_LOG" | sed 's/\[CAUSE\] /- /')

## launchd 状態
$LAUNCHD_STATUS

## タスクログ有無
$( [ -f "$TASK_LOG" ] && echo "あり（スクリプトは実行されたが失敗）" || echo "なし（スクリプト自体が起動しなかった）" )

## 再実行結果
- 終了コード: $TASK_EXIT
- コンテンツ生成: $( [ -f "$CONTENT_FILE" ] && echo "成功" || echo "失敗" )

## 対処が必要な場合
\`\`\`bash
# 手動でタスクを実行
bash ~/my-next-app/scripts/cnn10-daily.sh

# launchd を再登録
launchctl bootout gui/\$(id -u) ~/Library/LaunchAgents/com.cnn10.daily-exam-picks.plist
launchctl bootstrap gui/\$(id -u) ~/Library/LaunchAgents/com.cnn10.daily-exam-picks.plist

# モニターログを確認
cat ~/cnn10-exam-daily/logs/monitor-$TODAY.log
\`\`\`
EOF

echo "[INFO] Incident report saved: $REPORT_FILE" >> "$MONITOR_LOG"
echo "=== Monitor Complete: $RESULT_STATUS ===" >> "$MONITOR_LOG"

exit 0
