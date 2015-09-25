var express = require('express');
var router = express.Router();
module.exports = function(io) {
    var socket_io = require('../sockets/base')(io);

    router.get('/', function (req, res) {
        return res.render('index', {
            title: 'Youtube Sync',
            rooms: socket_io.getPublicRooms()
        });
    });


    router.get('/:id', function (req, res) {
        return res.render('room', {
            title: 'Youtube Sync',
            room: req.params.id
        });
    });

    return router;
};
