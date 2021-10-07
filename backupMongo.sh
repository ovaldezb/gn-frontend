#!/bin/bash

export TIMESTAMP=$(date +'%Y%m%d%H%M%S')
export BACKUP_LOCATION="/home/backup"
export DATA_BASE="grupo_nordan"
export MONGO_CONTAINER="RTS_CORE_100321"
cd /home/ec2-user/mongoDB/backup
sudo docker exec -t ${MONGO_CONTAINER} mongodump --out ${BACKUP_LOCATION}  --db ${DATA_BASE} --authenticationDatabase "admin" -u "mongo" -p Jafra2018!
sudo docker cp ${MONGO_CONTAINER}:/home/backup/grupo_nordan/ .
tar -czvf ${DATA_BASE}_${TIMESTAMP}.tar ./grupo_nordan
sudo rm -R ./grupo_nordan
