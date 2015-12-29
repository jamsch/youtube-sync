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
}

playlist.prototype.addVideo = function(videoID) {
    this.videos.push(new Video(videoID));
};

playlist.prototype.removeVideo = function(videoID) {
    var videoIndex = -1;
    for (var i = 0; i < this.videos.length; i++) {
        if(this.videos[i].url === videoID){
            delete this.videos[i];
            videoIndex = i;
            break;
        }
    }
   return videoIndex;
};

playlist.prototype.next = function() {
    if (this.videos[this.pos+1] !== undefined) {
        this.pos++;
    } else {
        this.pos = 0;
    }
    // Reset timestamp and seek time
    this.timestamp = new Date().getTime();
    this.seekTime = 0;
};

playlist.prototype.exists = function(videoID) {
    for (var i = 0; i < this.videos.length; i++) {
        if (this.videos[i].url == videoID) return true;
    }
    return false;
}

//todo move video function
module.exports = playlist;