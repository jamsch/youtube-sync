var express = require('express');
var router = express.Router();


router.get('/:id', function(req, res) {
    return res.render('index', {
      title: 'Youtube Sync',
      room: req.params.id
    });
});

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
      title: 'Youtube Sync',
      room: "lobby"
    });
});

module.exports = router;
