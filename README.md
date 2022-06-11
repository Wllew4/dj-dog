# dj-dog 3.0 🐋
## Notable changes:
1. Back on Fedora 35
1. Running as a Docker container

## Get it running:
1. Clone
```sh
git clone https://github.com/Wllew4/dj-dog
cd dj-dog
```
2. Create `env` file with credentials. Don't use quotation marks.
```sh
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
YT_API_KEY=...
```
2. Build image
```sh
make docker
```
3. Run container
```sh
make
```
4. Stop container
```sh
make stop
```
5. Clean up
```sh
make clean
```
