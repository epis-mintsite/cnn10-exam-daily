#!/bin/bash
# CNN10 Daily Exam Prep - Automated task runner
# Runs claude with the SKILL.md prompt to fetch, analyze, save, and deploy

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

SKILL_FILE="$HOME/.claude/scheduled-tasks/cnn10-exam-picks/SKILL.md"
LOG_DIR="$HOME/cnn10-exam-daily/logs"
LOG_FILE="$LOG_DIR/$(date +%Y-%m-%d).log"

mkdir -p "$LOG_DIR"

echo "=== CNN10 Daily Task Started: $(date) ===" >> "$LOG_FILE"

# Read SKILL.md and pass as prompt to claude (non-interactive, auto-accept)
PROMPT="Read the file $SKILL_FILE and execute ALL steps defined in it autonomously. Do not ask for confirmation."

claude --print --allowedTools '*' -p "$PROMPT" >> "$LOG_FILE" 2>&1

EXIT_CODE=$?
echo "=== CNN10 Daily Task Finished: $(date), exit code: $EXIT_CODE ===" >> "$LOG_FILE"

exit $EXIT_CODE
