/**
 * Created by James on 26-Sep-15.
 */

var express = require('express');
var router = express.Router();

var socket_io = require('../sockets/io');

//todo ajax queries

router.get('/userinfo', function (req, res) {
    return res.render('ajax', {
       // reply: socket_io.getUserInfo()
    });
});


router.get('/roominfo', function (req, res) {
    return res.render('ajax', {
        // reply: socket_io.getRoomInfo()
    });
});

module.exports = router;