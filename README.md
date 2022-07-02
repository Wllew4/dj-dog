# dj-dog 3.1 🐋
## Notable changes:
1. youtube-dl -> yt-dlp
	* No longer crashes on age restricted videos
	* No longer crashes on shorts
	* Begins playback faster
1. Container hosts entire app, no need to clone any code
1. Updated Makefile with additional dev tools

## Get it running:
1. Create `env` file with credentials. Don't use quotation marks.
```sh
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
YT_API_KEY=...
```
2. Pull image
```sh
docker pull ghcr.io/wllew4/djdog
```
3. Run container
```sh
docker run -d --name dj-dog --env-file=env ghcr.io/wllew4/djdog
```
4. Check logs
```sh
docker logs --follow dj-dog
```
5. Stop and remove container
```sh
docker stop dj-dog
docker rm dj-dog
```
