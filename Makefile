run:
	docker run --rm -d --name dj-dog -v $(shell pwd):/dj --env-file=env djdog:3

stop:
	docker stop dj-dog

docker:
	docker build -t djdog:3 .

clean:
	rm -rf build
	rm -rf node_modules
	docker system prune -f
