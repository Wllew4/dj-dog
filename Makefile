run:
	docker run --rm -ti -v $(shell pwd):/dj djdog:3

docker:
	docker build -t djdog:3 .

clean:
	sudo rm -rf build
	sudo rm -rf node_modules
