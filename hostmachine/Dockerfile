FROM debian
USER root

RUN apt-get update
RUN apt-get install -y openssh-server python3 sudo net-tools
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN useradd -m -d /home/ansibleuser -s /bin/bash ansibleuser

COPY ./host.pub /home/ansibleuser/.ssh/authorized_keys

RUN chown -R ansibleuser:ansibleuser /home/ansibleuser/.ssh
RUN chmod 700 /home/ansibleuser/.ssh
RUN chmod 600 /home/ansibleuser/.ssh/authorized_keys

ENV PORT=8894
EXPOSE 22 $PORT

ENTRYPOINT service ssh start && python3 -m http.server $PORT 

