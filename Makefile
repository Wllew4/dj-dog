run:
	docker run -d --name dj-dog --env-file=env djdog:3.1

stop:
	docker stop dj-dog

docker:
	docker build -t djdog:3 .

clean:
	rm -rf build
	rm -rf node_modules
	docker system prune -f
