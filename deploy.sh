cd ~/app
npm ci
./node_modules/.bin/tsc -p tsconfig.json
tmux kill-session -t djdog || true
tmux new-session -d -s djdog || true
tmux send-keys 'node build/index.js' C-m || true
tmux detach -s djdog || true