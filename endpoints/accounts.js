const express = require('express');
const uuid = require('uuid');
const router = express.Router();
const crypto = require("crypto");
const async = require('async');

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

internals.getAccounts = (req, res) => {
    mongodb(collection).find().toArray(function(err, results){
        if (err) {
            res.send(err)
        } else {
            res.send(results);
        }
    });
};

internals.getAccount = (req, res) => {
    mongodb(collection).findOne( { accountId : req.params.accountId }, function(err, results){
        if (err) {
            res.send(err)
        } else {
            res.send(results);
        }
    });
};

internals.login = (req, res) => {
    mongodb(collection).findOne( { email: req.body.email }, function(err, results){
        if (req.body.password === decrypt(results.password)) {
            res.send(results);
        } else {
            res.send("error")
        }
    });
};

internals.signup = (req, res) => {

    async.series({
        searchAccount : callback => {
            mongodb(collection).findOne( { email : req.body.email }, function(err, results){
                if (err) {
                    return callback(err, null);
                } else if (results) {
                    return callback("exist", null);
                } else {
                    return callback(null, null);
                }
            });
        },
        createAccount : callback => {
            req.body.password = encrypt(req.body.password)
            req.body.accountId = uuid.v4().replace(/-/g, '');
            mongodb(collection).insertOne( req.body ).then(function(results) {
                return callback(null, results);
            });
        }
    },
    (err, results) => {
        if (err) {
            res.send(err);
        } else {
            res.send(results.createAccount);
        }
    });
};

internals.deleteAccout = (req, res) => {

    async.series({
        getAccount : callback => {
            mongodb(collection).findOne( { accountId : req.params.accountId }, function(err, results){
                if (err) {
                    return callback(err, null);
                } else if (!results) {
                    return callback("no profile", null);
                } else {
                    if (req.body.email !== results.email) {
                            return callback("error email", null);
                    } else if (req.body.password !== decrypt(results.password)) {
                        return callback("error password", null);
                    } else {
                        return callback(null, results)
                    }
                }
            });
        },
        deleteAccout : callback => {
            mongodb(collection).findOneAndDelete( { accountId : req.params.accountId }, {}, function(err, results){
                if (err) {
                    return callback(err, null);
                } else {
                    return callback(null, results);
                }
            });
        }
    },
    (err, results) => {
        if (err) {
            res.send(err);
        } else {
            res.send("all green")
        }
    });

};

internals.updateAccount = (req, res) => {
    mongodb(collection).findOneAndUpdate( {accountId: req.params.accountId }, req.body, {}, function(err, results){
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

router.put('/:accountId', internals.updateAccount);




module.exports = router;
