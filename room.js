/**
 * Created by James on 10/06/2015.
 */
var Playlist = require('./playlist.js');

function Room(owner) {
    this.owner = owner;
    this.mods = {};
    this.people = {};
    this.status = "available";
    this.size = 0;
    this.private = false;
    this.playlist = new Playlist();
    this.skips = [];
    this.skipRatio = 1;
}

Room.prototype.addPerson = function(id,name) {
    this.people[id] = {
            name: name
        };
    this.size++;
};

//todo mod user
Room.prototype.modUser = function(id) {
    if (this.people[id] !== undefined) {
        this.mods[id] = true;
        return true;
    }
    return false;
};

Room.prototype.isMod = function(id) {
    return this.mods[id];
};

//todo demod user
Room.prototype.demodUser = function(id) {
    if (this.mods[id] !== undefined) {
        delete this.mods[id];
        return true;
    }
    return false;
};

//todo hide from public user list (when implemented)
Room.prototype.isPrivate = function() {
    return this.private;
};


Room.prototype.addVideo = function(video) {
   this.playlist.addVideo(video);
};

module.exports = Room;