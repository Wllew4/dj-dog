# 🐶🎵 dj-dog 3.2
## Notable changes:
1. Major under-the-hood stability improvements
1. Added "empty player" to ViewModel
1. Significant source code restructuring/refactoring

## Known issues:
1. Cannot play livestreams (but it won't crash)

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
