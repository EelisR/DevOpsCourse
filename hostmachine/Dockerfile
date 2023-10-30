FROM debian
USER root

COPY . /home
WORKDIR /home

RUN apt-get update

RUN apt-get install -y openssh-server python3 sudo net-tools

ENTRYPOINT service ssh start && python3 -m http.server
