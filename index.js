const express = require("express");
const request = require("superagent");

const port = process.env.PORT || 3000;

const redis = require("redis");
const redisPort = process.env.REDIS_PORT || 6379;

const app = express();
const redisClient = redis.createClient(redisPort);

redisClient.flushall();

function respond(org, repoCount) {
    return `Organization '${org}' has ${repoCount} public repos`;
}

function getRepoCount(req, res, next) {
    const org = req.query.org;

    request.get(`https://api.github.com/orgs/${org}/repos`, (err, response) => {
        if (err) {
            throw err;
        }

        let repoCount = response.body.length;

        redisClient.set(org, repoCount);

        console.log("getting from interwebs");
        res.send(respond(org, repoCount));
    });
}

function getRepoCache(req, res, next) {
    const org = req.query.org;
    redisClient.get(org, (err, data) => {
        if (err) {
            throw err;
        }

        if (data != null) {
            console.log("getting from cache");
            res.send(respond(org, data));
        } else {
            next();
        }
    });
}

app.get("/repos", getRepoCache, getRepoCount);

app.listen(port, () => {
    console.log("Server listening on port ", port);
});