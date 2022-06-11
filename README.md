# dj-dog 3.0 🐋
## Notable changes:
1. Back on Fedora 35
1. Running as a Docker container

## Get it running:
1. Clone (you'll need credentials)
```sh
git clone https://github.com/Wllew4/dj-dog
cd dj-dog
```
2. Build image
```sh
make docker
```
3. Run image
```sh
make
```



1. Copy a valid credentials.json into root folder. You'll need:
	* Discord Token
	* Discord Client ID
	* YouTube API key
1. Deploy (probably do this with tmux :P)
```sh
# Installs additional dependencies and runs compiled js
chmod +x ./deploy.sh
. ./deploy.sh
```