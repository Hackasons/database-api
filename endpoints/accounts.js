const express = require('express');
const uuid = require('uuid');
const router = express.Router();
const crypto = require("crypto");

const mongodb = require("../mongo");

const collection = "accounts";

const algorithm = 'aes-256-ctr';
const passphrase = "sG4kG9d0nh";

let encrypt = (text) => {
    let cipher = crypto.createCipher(algorithm,passphrase)
    let crypted = cipher.update(text,'utf8','base64')
    crypted += cipher.final('base64');
    return crypted;
}

let decrypt = (text) => {
    let decipher = crypto.createDecipher(algorithm,passphrase)
    let dec = decipher.update(text,'base64','utf8')
    dec += decipher.final('utf8');
    return dec;
}

const internals = {};

internals.getAccounts = (req, res, next) => {
    mongodb(collection).find().toArray(function(err, results){
        if (err) {
            res.send(err)
        } else {
            res.send(results);
        }
    });
};

internals.getAccount = (req, res, next) => {
    mongodb(collection).findOne( { accountId : req.params.accountId }, function(err, results){
        if (err) {
            res.send(err)
        } else {
            res.send(results);
        }
    });
};

internals.login = (req, res, next) => {
    mongodb(collection).findOne( { email: req.body.email }, function(err, results){
        if (req.body.password === decrypt(results.password)) {
            res.send(results);
        } else {
            res.send("error")
        }
    });
};

internals.signup = (req, res, next) => {
    req.body.password = encrypt(req.body.password)
    req.body.accountId = uuid.v4().replace(/-/g, '');
    mongodb(collection).insertOne( req.body ).then(function(results) {
        res.send(results);
    });
};

internals.deleteAccout = (req, res, next) => {
    mongodb(collection).findOneAndDelete( { accountId : req.params.accountId }, {}, function(err, results){
        if (err) {
            res.send(err);
        } else {
            res.send(results);
        }
    });
};

//routings

router.get('/', internals.getAccounts);

router.get('/:accountId', internals.getAccount);

router.post('/login', internals.login);

router.post('/signup', internals.signup);

router.delete('/:accountId', internals.deleteAccout);




module.exports = router;
