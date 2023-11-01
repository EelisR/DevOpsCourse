docker kill eelisr_host 
docker rm eelisr_host 

docker build ./hostmachine -t eelisr_image

docker run -d --name eelisr_host eelisr_image
