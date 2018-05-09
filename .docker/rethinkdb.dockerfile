
# ubuntu bionic image
FROM ubuntu:bionic

# install wget
RUN \
  apt update && \
  apt install -y wget gnupg
  

# install rethinkdb
RUN \
  echo "deb http://download.rethinkdb.com/apt zesty main" > /etc/apt/sources.list.d/rethinkdb.list && \
  wget -qO- http://download.rethinkdb.com/apt/pubkey.gpg | apt-key add - && \
  apt update && \
  apt install -y rethinkdb

# clear apt lists
RUN rm -rf /var/lib/apt/lists/*

# create volume for data
VOLUME [ "/data" ]

# set working directory
WORKDIR /data

# start rethinkdb
CMD ["rethinkdb", "--bind", "all", "-d", "/data"]

# expose necessary ports
EXPOSE 8080 28015 29015
