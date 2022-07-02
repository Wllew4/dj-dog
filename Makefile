# registry interaction
pull:
	docker pull ghcr.io/wllew4/djdog
publish:
	docker build -t ghcr.io/wllew4/djdog:$V .
	docker tag ghcr.io/wllew4/djdog:$V ghcr.io/wllew4/djdog:latest
	docker push -a ghcr.io/wllew4/djdog
# container interaction
start:
	docker run -d --name dj-dog --env-file=env ghcr.io/wllew4/djdog
up:
	docker start dj-dog
stop:
	docker stop dj-dog
logs:
	docker logs --follow dj-dog
#debug
clean:
	rm -rf build
	rm -rf node_modules
	docker system prune -f
dev:
	docker run --rm -ti --name dj-dev \
		--env-file=env \
		-v $(pwd):/dj-dev \
		-w /dj-dev \
		--entrypoint /bin/bash \
		ghcr.io/wllew4/djdog
