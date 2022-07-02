run:
	docker run -d --name dj-dog --env-file=env ghcr.io/wllew4/djdog:3.1

build:
	docker build -t ghcr.io/wllew4/djdog:3.1 .

stop:
	docker stop dj-dog

docker:
	docker build -t djdog:3 .

clean:
	rm -rf build
	rm -rf node_modules
	docker system prune -f
