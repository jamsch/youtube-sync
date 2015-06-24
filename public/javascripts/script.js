/**
 * Created by James on 16/06/2015.
 */

var sync = sync || {};

sync.playlist = (function () {
    var self = {};
    self.videos = [];
    self.pos;
    self.totalDuration = 0;
    self.createPlaylist = function () {
        $('#playlist').empty();
        console.log(self.videos);
        $.each(self.videos, function (k) {
            self.append(self.videos[k]);
            self.totalDuration += self.videos[k].duration;
        });
        $("#playlist li:eq(" + self.pos + ")").addClass('active');
        sync.util.updatePlaylistInfo();
    };
    self.loadVideo = function(pos) {
        $('.active').removeClass('active');
        $("#playlist li:eq(" + pos + ")").addClass('active');
        sync.video.loadVideoById(self.videos[pos].url, 0);
    };
    self.addVideo = function(data) {
        if (sync.video.player === undefined) sync.video.load(data.url, 0);
        self.videos.push({
            "url": data.url,
            "title": data.title,
            "duration": data.duration,
            "via": data.via
        });
        self.totalDuration += data.duration;
        self.append(self.videos[self.videos.length-1]);
        $("#msgs").append("<li><div style='color:green'><strong>" + data.via + "</strong> added: <em>" + data.title + "</em></div></li>");
        sync.util.updatePlaylistInfo();
    };
    self.append = function(video) {
        $('#playlist').append(
            "<li>" +
            "<div>" +
                video.title + "<span style='float:right'><a href='https://www.youtube.com/watch?v=" + video.url + "'>(link)</a></span>" +
            "</div>" +
            "<div>" +
            "via " + video.via + "<span style='float:right'><a>" + sync.util.parseSeconds(video.duration) + "</a></span>" +
            "</div>" +
            "</li>");
    };
    return self;
}());

sync.util = {
    updatePlaylistInfo: function() {
        $(".duration").html(this.parseSeconds(sync.playlist.totalDuration));
        $(".numVideos").html(sync.playlist.videos.length + " Video(s)");
    },
    parseSeconds: function(seconds) {
        var hours = parseInt(seconds / 3600) % 24 || 0;
        var minutes = parseInt(seconds / 60) % 60 || 0;
        var seconds = seconds % 60 || 0;
        if (seconds < 10) seconds = "0"+seconds;
        if (minutes < 10) minutes = "0"+minutes;
        var result = minutes + ":" + seconds;
        if (hours != 0) result = hours + ":" + result;
        return result;
    }
};


sync.video = (function() {
    var self = {};
    self.player;
    self.load = function(videoId) {
        self.player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: videoId,
            events: {
                'onReady': function (event) {
                    event.target.playVideo();
                    socket.emit("resync");
                },
                'onStateChange': onPlayerStateChange
            }
        });
    };
    self.loadVideoById = function (id, seconds) {
        self.player.loadVideoById(id, seconds);
        self.player.seekTo(seconds);
    };
    return self;
}());

sync.users = (function () {
    var self = {};
    self.users = [];
    var name;
    self.update = function(data) {
        $('#users>ul').empty(); //empty user list;
        if (data.users !== undefined) {
            self.users = data.users;
            $.each(self.users, function (k, v) {
                appendUser(v, data.owner === k || self.users[k].mod);
            });
        }
    };
    var appendUser = function(user,isModOrOwner) {
        if (isModOrOwner) {
            $('#users>ul').append("<li><div style='color:#00B7FF'>" + user.name + "</div></li>");
        } else {
            $('#users>ul').append("<li><div>" + user.name + "</div></li>");
        }
    };
    self.getName = function() {
        return name;
    };
    self.setName = function(value) {
        name = value;
    };
    return self;
}());

var playerReady = false;
function onYouTubeIframeAPIReady() {
    if (sync.playlist.videos[sync.playlist.pos] !== undefined) {
        sync.video.load(sync.playlist.videos[sync.playlist.pos].url);
    }
    playerReady = true;
}

(function () {
    var randomNameArr = ['ka', 'tu', 'mi', 'te', 'ku', 'lu', 'ji', 'ri',
        'ki', 'zu', 'me', 'ta', 'rin', 'to', 'mo', 'no', 'ke', 'shi',
        'ari', 'chi', 'do', 'ru', 'mei', 'na', 'fu', 'zi'];
    var name = "";
    for (var i = 0; i < Math.random() * 8; i++) {
        name += randomNameArr[Math.ceil(Math.random() * randomNameArr.length) - 1];
    }
    socket.emit("join", name, roomName);
    socket.on("ackJoin", function (data) {
        $("#msgs").append("<li><div><strong>Joined room " + roomName + ".</strong><br>Your name is '" + data.username + "'. <br>Type !setname to set your username.</div></li>");
        if (data.playlist !== undefined) {
            sync.playlist.videos = data.playlist;
            sync.playlist.pos = data.pos;
            if (sync.playlist.videos[sync.playlist.pos] !== undefined) { //in case a person joins a room with no videos
                sync.playlist.createPlaylist();
                //if YT hasn't loaded when it was ready, and there's a video
                if (playerReady && sync.video.player === undefined) {
                    sync.video.load(sync.playlist.videos[sync.playlist.pos].url);
                }
            }
        }
    });
})();