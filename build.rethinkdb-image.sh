#!/bin/bash
docker build --rm -f .docker/rethinkdb.dockerfile -t rlds-backend-rethinkdb:latest .docker