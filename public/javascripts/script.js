/**
 * Created by James on 16/06/2015.
 */

(function() {
    //lol
    var randomNameArr = ['ka', 'tu', 'mi', 'te', 'ku', 'lu', 'ji', 'ri',
        'ki', 'zu', 'me', 'ta', 'rin', 'to', 'mo', 'no', 'ke', 'shi',
        'ari', 'chi', 'do', 'ru', 'mei', 'na', 'fu', 'zi'];
    var name = "";
    for (var i = 0; i < Math.random() * 8; i++) {
        name += randomNameArr[Math.ceil(Math.random() * randomNameArr.length) - 1];
    }
    socket.emit("join", name, roomName);
    socket.on("ackJoin", ackJoin);
})();


var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var playlist = [];
var users = [];
var player;
var pos;
var playerReady = false;

function onYouTubeIframeAPIReady() {
    if (playlist[pos] !== undefined) {
        loadYTElement(playlist[pos].url);
    }
    playerReady = true;
}

function ackJoin(data) {
    $("#msgs").append("<li><div><strong>Joined room " + roomName + ".</strong><br>Your name is '" + data.username + "'. <br>Type !setname to set your username.</div></li>");
    if (data.playlist !== undefined) {
        playlist = data.playlist;
        pos = data.pos;
        if (playlist[pos] !== undefined) { //in case a person joins a room with no videos
            createPlaylist();
            //if YT hasn't loaded when it was ready, and there's a video
            if (playerReady && player === undefined) {
                loadYTElement(playlist[pos].url);
            }
        }
    }
}

function createPlaylist() {
    $('#playlist').empty();
    $.each(playlist, function (k, v) {
        appendPlaylistItem(k);
    });
    $("#playlist li:eq(" + pos + ")").addClass('active');

}

function appendPlaylistItem(pos) {
    $('#playlist').append(
        "<li>" +
            "<div>" +
                    playlist[pos].title + "<span style='float:right'><a href='https://www.youtube.com/watch?v=" + playlist[pos].url + "'>(link)</a></span>" +
            "</div>" +
            "<div>" +
                "via " + playlist[pos].via +
            "</div>" +
        "</li>");
}

function updateUsers(data) {
    $('#users>ul').empty(); //empty user list;
    console.log(data);
    if (data !== undefined) {
        users = data.users;
        $.each(users, function (k, v) {
            console.log(k);
            if (data.owner === k || users[k].mod) { //
                $('#users>ul').append("<li><div style='color:#00B7FF'>" + v.name + "</div></li>");
            } else
                $('#users>ul').append("<li><div>" + v.name + "</div></li>");
        });
    }
}

function loadYTElement(videoId) {
    player = new YT.Player('player', {
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
}

function loadVideoById(id, seconds) {
    player.loadVideoById(id, seconds);
    player.seekTo(seconds);
}

function getPlayerTime() {
    return player.getCurrentTime();
}

function getVideoUrl() {
    return player.getVideoUrl();
}

function stopVideo() {
    player.stopVideo();
}