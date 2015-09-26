/**
 * Created by James on 26-Sep-15.
 */
var express = require('express');
var router = express.Router();

module.exports = function(io) {

    var socket_io = require('../sockets/io');
    socket_io.init(io); // Initialize socket.io

    router.get('/:id', function (req, res) {
        return res.render('room', {
            room: req.params.id
        });
    });

    return router;
};

