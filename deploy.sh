cd ~/app
npm ci
./node_modules/.bin/tsc -p tsconfig.json
tmux kill-session -t "djdog"
tmux new-session -d -s "djdog" start.sh