run:
	docker run --rm -ti -v $(shell pwd):/dj djdog:3

docker:
	docker build -t djdog:3 .

clean:
	rm -rf build
	rm -rf node_modules
	docker system prune -f
