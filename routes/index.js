var express = require('express');
var router = express.Router();


router.get('/:id', function(req, res) {
  // Then you can use the value of the id with req.params.id
  // So you use it to get the data from your database:
//  var db = req.db;
//  var collection = db.get('usercollection');
//  return collection.findOne({ id: req.params.id }, function (err) {
 //   if (err) { throw(err); }
    return res.render('index', {
      title: 'Youtube Sync',
      room: req.params.id
    });
//  });
});

/* GET home page. */
router.get('/', function(req, res) {
 // var db = req.db;
//  var collection = db.get('usercollection');
 // collection.find({},{},function(e,docs){
    res.render('index', {
      title: 'Youtube Sync',
      room: "lobby"
    });
   // console.log(req.socket.address());
 // });
});

module.exports = router;
