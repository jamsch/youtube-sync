/**
 * Created by James on 11/06/2015.
 */
function video(id) {
    this.url = id.url;
    this.title = id.name;
    this.duration = id.duration;
    this.via = id.username; // Added by username
    this.addedDate = new Date().getTime();
}

module.exports = video;