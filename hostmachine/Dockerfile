FROM ubuntu 
USER root

RUN apt-get update
RUN apt-get install -y openssh-server python3 python3-apt sudo net-tools

RUN useradd -m -d /home/ansibleuser ansibleuser && echo "ansibleuser:ansibleuser" | chpasswd && adduser ansibleuser sudo


COPY ./server.py /home/ansibleuser/server/server.py
COPY ./ssh_key.pub /home/ansibleuser/.ssh/authorized_keys

WORKDIR /home/ansibleuser/


RUN chown -R ansibleuser:ansibleuser .ssh
RUN chmod 700 .ssh
RUN chmod 600 .ssh/authorized_keys

ENV PORT=8894

EXPOSE $PORT 22

ENTRYPOINT service ssh start && python3 server/server.py

