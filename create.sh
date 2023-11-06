host1="eelisr_host1"
host2="eelisr_host2"
host3="eelisr_host3"

ssh_key="./ssh_key"
ssh_pub_key=./hostmachine/ssh_key.pub

docker stop $host1 $host2 $host3
docker rm $host1 $host2 $host3

inspect_container(){
  docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $1
}


if test -f "$ssh_pub_key"; 
  then
    echo "SSH key $ssh_pub_key exists already, skipping."
  else
    ssh-keygen -f ./ssh_key -b 2048 -t rsa -q -N "" 
    mv ./ssh_key.pub ./hostmachine/ssh_key.pub
fi

docker build ./hostmachine -t eelisr_image
docker run -d -P --name $host1 eelisr_image

host1_ip=$(inspect_container $host1)

ssh -i ./ssh_key ansibleuser@$host1_ip

