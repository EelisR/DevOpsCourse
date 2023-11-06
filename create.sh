playbook="playbook.yaml"
# Variables for the docker container names
image_name="eelisr_image"
host1="eelisr_host1"
host2="eelisr_host2"


# Ansible configuration
ansible_user="ansibleuser"
ansible_hosts="./ansiblehosts"

echo "[ansiblehosts]" > $ansible_hosts
 
# Some password to the ssh user on the container,
# really not the right way
sudo_password="sudo_password"
echo "ansibleuser" > $sudo_password

# Create ssh keys in working directory and move the 
# public one into the image file
ssh_key="./ssh_key"
ssh_pub_key=./hostmachine/ssh_key.pub

if test -f $ssh_pub_key; 
  then
    echo "SSH key $ssh_pub_key exists already, skipping."
  else
    ssh-keygen -f ./ssh_key -b 2048 -t rsa -q -N "" 
    mv ./ssh_key.pub ./hostmachine/ssh_key.pub
fi

# Test automation
# docker stop $host1 $host2 
# docker rm $host1 $host2 

# Gets the IP of the spesified docker container
get_ip(){
  docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $1
}

docker build ./hostmachine -t $image_name

docker run -d -P --name $host1 $image_name 
echo $(get_ip $host1) >> $ansible_hosts

# Run the playbook 
echo "O1" >> README.rd
ansible-playbook -v --become-password-file=sudo_password -i $ansible_hosts -u $ansible_user --key-file $ssh_key $playbook | tee -a README.rd

# Run it again
echo "O2" >> README.rd
ansible-playbook -v --become-password-file=sudo_password -i $ansible_hosts -u $ansible_user --key-file $ssh_key $playbook | tee -a README.rd

# Create new container
docker run -d -P --name $host2 $image_name 
echo $(get_ip $host2) >> $ansible_hosts

# Run playbook
echo "O3" >> README.rd
ansible-playbook -v --become-password-file=sudo_password -i $ansible_hosts -u $ansible_user --key-file $ssh_key $playbook| tee -a README.rd

# Run again
echo "O4" >> README.rd
ansible-playbook -v --become-password-file=sudo_password -i $ansible_hosts -u $ansible_user --key-file $ssh_key $playbook | tee -a README.rd

# Cleanup
docker stop $host1 $host2
docker rm $host1 $host2
docker image rm $image_name 
rm $ansible_hosts $ssh_pub_key $ssh_key $sudo_password
