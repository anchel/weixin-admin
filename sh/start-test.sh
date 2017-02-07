#!/usr/bin/env bash

if [ $# -lt 2 ]
then
    echo " "
    echo "Usage: "
    echo "       start.sh [env] [port]"
    echo " "
    echo " env : development test production"
    echo " port: 9304"
    echo " "
    exit 0
fi

CUR_PWD=$(pwd)
SH_PWD=$(cd "$(dirname "$0")"; pwd)

run_env=""
run_port=""

if [ $# -gt 0 ]
then
    run_env=$1
fi

if [ $# -gt 1 ]
then
    run_port=$2
fi

if [ -z $run_env ]
then
    run_env="development"
fi

if [ -z $run_port ]
then
    run_port="9304"
fi

echo "env  : $run_env "
echo "port : $run_port"

cd ${SH_PWD}/..
NODE_ENV=${run_env} PORT=${run_port} pm2 start app.js -i 1 --name weixin-admin-test
pm2 save
cd ${CUR_PWD}