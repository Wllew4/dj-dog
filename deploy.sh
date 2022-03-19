# Deploy
# Install deps
chmod -R +x /scripts
./scripts/install-node.sh
./scripts/install-python.sh
./scripts/install-ffmpeg.sh
# Build bot
source ~/.bashrc
./scripts/build.sh
# Run
node build/index.js