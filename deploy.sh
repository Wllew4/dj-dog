# Deploy
# Install deps
chmod -r +x ./scripts
./scripts/install-node.sh
./scripts/install-python.sh
./scripts/install-ffmpeg.sh
./scripts/build.sh
# Run
node build/index.js