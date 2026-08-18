(Invoke-RestMethod "https://checkip.amazonaws.com").Trim()

Add 2222 port on ec2

| Step | Purpose                      | Command                                                                   |
| ---- | ---------------------------- | ------------------------------------------------------------------------- |
| 1    | SSH config edit              | `sudo nano /etc/ssh/sshd_config`                                          |
| 2    | Add SSH ports                | `Port 22`<br>`Port 2222`                                                  |
| 3    | Validate SSH config          | `sudo sshd -t`                                                            |
| 4    | Check effective SSH ports    | `sudo sshd -T \| grep '^port'`                                            |
| 5    | Check SSH service            | `sudo systemctl status ssh`                                               |
| 6    | Check socket activation      | `sudo systemctl status ssh.socket`                                        |
| 7    | Check actual listening ports | `sudo ss -lntp \| grep -E ':22\|:2222'`                                   |
| 8    | Edit `ssh.socket` override   | `sudo systemctl edit ssh.socket`                                          |
| 9    | Add socket configuration     | `[Socket]`<br>`ListenStream=`<br>`ListenStream=22`<br>`ListenStream=2222` |
| 10   | Reload systemd               | `sudo systemctl daemon-reload`                                            |
| 11   | Restart SSH socket           | `sudo systemctl restart ssh.socket`                                       |
| 12   | Verify ports                 | `sudo ss -lntp \| grep -E ':22\|:2222'`                                   |
| 13   | Test from your PC            | `Test-NetConnection <EC2-IP> -Port 2222`                                  |
| 14   | SSH using new port           | `ssh -p 2222 ubuntu@<EC2-IP>`                                             |

| Type       |   Port | Source        |
| ---------- | -----: | ------------- |
| SSH        |   `22` | Your IP `/32` |
| Custom TCP | `2222` | Your IP `/32` |

# generate self signed certificate:

<code> openssl req -x509 -new -key private.key -out certificate.crt -days 365</code>

# Generate a private RSA key:

<code>openssl genpkey -algorithm RSA -out private.key -pkeyopt rsa_keygen_bits:2048</code>

(Invoke-RestMethod "https://api4.ipify.org").Trim()

# AWS commands

docker start []
docker compose down && docker compose build --no-cache && docker compose up

aws ecr get-login-password --region ca-central-1 | docker login --username AWS --password-stdin 381492111089.dkr.ecr.ca-central-1.amazonaws.com

aws ecr describe-images \
 --repository-name [ecrname] \
 --region ca-central-1 \
 --query 'sort_by(imageDetails,& imagePushedAt)[*].[imageTags[0],imageDigest,imagePushedAt]' \
 --output table

docker ps

docker network create my-network

docker run -d --name redis --network my-network redis:7-alpine

docker exec redis redis-cli ping

docker network inspect my-network

docker run -d \
 --name worker \
 --network my-network \
 -v /home/ubuntu/certs:/app/certs:ro \
 --env-file .env.docker \
 -v uploads:/app/uploads/compressed \
 381492111089.dkr.ecr.ca-central-1.amazonaws.com/[ecrname]:[image] \
 npm run worker

docker run -d \
--name compressimage \
--network my-network \
-p [port]:[port] \
--env-file .env.docker \
-v /home/ubuntu/certs:/app/certs:ro \
-v uploads:/app/uploads/compressed \
381492111089.dkr.ecr.ca-central-1.amazonaws.com/[ecrname]:[image]

docker exec -it bnkbackendexpress sh

docker logs bnkbackendexpress

docker stop bnkbackendexpress && docker rm bnkbackendexpress

docker run --rm 381492111089.dkr.ecr.ca-central-1.amazonaws.com/bnkbackendexpress:8440990caa1b0c63393dd35cdb70331f2d8b754a npm run

I created dockerFile, compose.yml, env.docker, docker compose up, then created build, login to ecr, push image task in github/deploy.yml, created secrets on github and used in deploly yml,
implemented GitHub → ECR → EC2 flow, on aws created container registery, created IAM user with AmazonEC2ContainerRegistryPowerUser permission, created role with AmazonEC2ContainerRegistryReadOnly,
created ECR repo, added IAM role for instance, installed docker on ec2, looged in for ECR from EC2, pulled docker image and running container

docker compose config - .:/app - /app/node_modules
command: npm run dev

| Step | Purpose                | Command                                   |
| ---- | ---------------------- | ----------------------------------------- | ------------------ | ---- | --------- |
| 1    | બધા containers stop    | `docker stop $(docker ps -aq)`            |
| 2    | બધા containers remove  | `docker rm -f $(docker ps -aq)`           |
| 3    | બધા images remove      | `docker rmi -f $(docker images -aq)`      |
| 4    | બધા volumes remove ⚠️  | `docker volume rm $(docker volume ls -q)` |
| 5    | Custom networks remove | `docker network rm $(docker network ls -q | grep -vE '^(bridge | host | none)$')` |
| 6    | Final cleanup          | `docker system prune -a --volumes -f`     |
| 7    | Verify containers      | `docker ps -a`                            |
| 8    | Verify images          | `docker images`                           |
| 9    | Verify volumes         | `docker volume ls`                        |
| 10   | Verify networks        | `docker network ls`                       |

docker stop $(docker ps -aq) && docker rm -f $(docker ps -aq) && docker rmi -f $(docker images -aq) && docker volume rm $(docker volume ls -q) && docker network rm $(docker network ls -q | grep -vE '^(bridge | host | none)$') && docker system prune -a --volumes -f

docker ps -a && docker images && docker volume ls && docker network ls

entry-level or manager or senior entry-level or manager or senior javascript full-time posted in the past 24 hours Amazon or BMO or CGI or CIBC or CNN or Capgemini or Cognizant or Google or Hiive or IBM or Intact or Manulife or Mastercard or Microsoft or OpenText or PayPal or RBC or Scotiabank or TD or Tata Consultancy Services or Warner Bros. Discovery posted in the past 24 hours
