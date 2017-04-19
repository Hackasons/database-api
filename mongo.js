"use strict";

let db;
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');

let url = 'mongodb://localhost:27017/express';

MongoClient.connect(url, function(err,mongodb) {
  assert.equal(null,err);
  console.log("Connected correctly to server");
  db = mongodb;
});

let mongodb = function(name) {
  return db.collection(name);
};

module.exports = mongodb;
