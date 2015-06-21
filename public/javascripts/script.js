/**
 * Created by James on 16/06/2015.
 */

var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var playlist = [];
var users = [];
var player;

function onYouTubeIframeAPIReady() {
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
}

function ackJoin(data) {
    $("#msgs").append("<li><div><strong>Joined room " + roomName + ".</strong><br>Your name is '" + data.username + "'. <br>Type !setname to set your username.</div></li>");
    if (data.playlist !== undefined) {
        if (data.playlist[data.pos] !== undefined) { //in case a person joins a room with no videos
            createPlaylist(data);
        }
    }
}

function createPlaylist(data) {
    playlist = data.playlist;
    $('#playlist').empty();
    $.each(playlist, function (k, v) {
        appendPlaylistItem(k);
    });
    $("#playlist li:eq(" + data.pos + ")").addClass('active');
    var videoURL = playlist[data.pos] !== undefined ? playlist[data.pos].url : "";
    var videoTime = data.secondsIn;
    loadYTElement(videoURL, videoTime);
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
            if (data.owner === k || data.mods[k]) { //
                $('#users>ul').append("<li><div style='color:#00B7FF'>" + v.name + "</div></li>");
            } else
                $('#users>ul').append("<li><div>" + v.name + "</div></li>");
        });
    }
}

function playerUndefined() {
    return (player === undefined);
}

function loadYTElement(videoId, startSeconds) {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: videoId,
        events: {
            'onReady': function (event) {
                event.target.playVideo();
                event.target.seekTo(startSeconds);
                socket.emit("videoStarted"); //todo:check if owner
            }
            ,
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