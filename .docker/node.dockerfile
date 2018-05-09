# base node image
FROM node:9-alpine

# install nodemon
RUN npm install -g nodemon

# install typescript
#RUN npm install -g typescript

VOLUME [ "/app" ]

# define working directory
WORKDIR /app

# install node modules
#RUN npm install

# compile typescript
#RUN tsc -p .

# expose port 3000
EXPOSE 3000

# run node sevrer using nodemon
CMD [ "nodemon", "/app/dist/statement/main.js" ]