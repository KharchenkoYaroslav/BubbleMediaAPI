# docker build -t my-rabbitmq . -f Dockerfile.rabbitmq
# docker run -d --name some-rabbitmq -p 5672:5672 my-rabbitmq

FROM rabbitmq:latest

EXPOSE 5672

CMD ["rabbitmq-server"]
