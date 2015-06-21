/**
 * Created by James on 11/06/2015.
 */
var Video = require('./video.js');
function playlist() {
    this.videos = [];
    this.size = 100; //maximum of 100 entries in playlist
    this.pos = 0;
    this.locked = false;
    this.seekTime = 0;
    this.timestamp; //time when last seeked
};

playlist.prototype.addVideo = function(videoID) {
    this.videos.push(new Video(videoID));
};

playlist.prototype.removeVideo = function(videoID) {
    var videoIndex = -1;
    for(var i = 0; i < this.videos.length; i++){
        if(this.videos[i].id === videoID){
            videoIndex = i;
            break;
        }
    }
    this.people.remove(videoIndex);
};
playlist.prototype.next = function() {
    delete this.videos.timestamp;
    if (this.videos[this.pos+1] !== undefined) {
        this.pos++;
    } else {
        this.pos = 0;
    }
};
//move
module.exports = playlist;