#!/bin/bash

# Configuration
WATCH_DIR="/Users/adarshchauhan/Desktop/AI-industrial"
REPO_DIR="/Users/adarshchauhan/Desktop/AI-industrial/backend_repo"
SYNC_INTERVAL=60

echo "Starting Active Monitor and Auto-Push script..."
echo "Syncing changes from root to backend_repo every $SYNC_INTERVAL seconds."

while true; do
  # Sync frontend, admin, data, packages to backend_repo
  rsync -a --exclude="node_modules" --exclude=".next" --exclude=".expo" \
    "$WATCH_DIR/mobile" "$WATCH_DIR/admin" "$WATCH_DIR/data" "$WATCH_DIR/packages" "$WATCH_DIR/package.json" \
    "$REPO_DIR/"
  
  # Check if there are changes in backend_repo
  cd "$REPO_DIR" || exit
  
  if [[ -n $(git status --porcelain) ]]; then
    echo "Changes detected! Committing and pushing..."
    git add .
    
    # Get a list of changed files for the commit message
    CHANGED_FILES=$(git diff --cached --name-only | tr '\n' ', ' | sed 's/, $//')
    
    git commit -m "chore(auto): update $CHANGED_FILES"
    git push fork main
    echo "Push successful at $(date)"
  fi
  
  # Wait for the next cycle
  sleep $SYNC_INTERVAL
done
