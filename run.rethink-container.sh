#!/bin/bash
docker run -m 1G --rm -d -p 28015:28015 -p 29015:29015 -p 8080:8080 --mount type=bind,source="$(pwd)"/rethinkdb-data,target=/data rlds-backend-rethinkdb:latest