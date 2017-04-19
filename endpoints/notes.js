let express = require('express');
let uuid = require('uuid');
let router = express.Router();

let mongodb = require("../mongo");
let collection = "notes";

/* GET home page. */
router.get('/', function(req, res, next) {
    mongodb(collection).find().toArray(function(err, results){
        res.send(results);
    });
});

router.post('/', function(req, res, next) {
    req.body.noteId = uuid.v4().replace(/-/g, '');
    mongodb(collection).insertOne(req.body).then(function(results) {
        res.send(results);
    });
});

router.get('/:noteId', function(req, res, next) {
    mongodb(collection).findOne( {noteId: req.params.noteId }, function(err, results){
        res.send(results);
    });
});

router.put('/:noteId', function(req, res) {
    mongodb(collection).findOneAndUpdate( {noteId: req.params.noteId }, req.body, {}, function(err, results){
        res.send(results);
    });
});

router.delete('/:noteId', function(req, res) {
    mongodb(collection).findOneAndDelete( {noteId: req.params.noteId }, {}, function(err, results){
        res.send(results);
    });
});

module.exports = router;
