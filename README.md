# dj-dog relaunch
## Notable changes:
1. Now running on Linode/Ubuntu
1. Google cloud stuff removed
1. Removed extra entries from credentials.json
1. Linter removed + indentation changed to 4-wide tabs (sorry)

## Get it running:
1. Clone (you'll need credentials)
```sh
git clone https://github.com/Wllew4/dj-dog
cd dj-dog
```
2. Copy a valid credentials.json into root folder. You'll need:
	* Discord Token
	* Discord Client ID
	* YouTube API key
3. Deploy (probably do this with tmux :P)
```sh
# Installs additional dependencies and runs compiled js
chmod +x ./deploy.sh
./deploy.sh
```