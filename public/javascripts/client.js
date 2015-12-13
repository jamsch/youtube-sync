/**
 * Created by James on 10/06/2015.
 */

$(document).ready(function () {

    socket.on('seek', function (data) {
        if (!sync.youtube.loaded) return;
        if (sync.youtube.player.getVideoData === undefined) return;
        sync.youtube.player.seekTo(data.t + 0.5, true);
    });

    $("#resync").click(function () {
        socket.emit("resync");   // todo timed interval resync
    });

    $("#shuffle").click(function () {
        socket.emit("shuffle");
    });

    socket.on("users", function (data) {
        console.log(data);
    });

    socket.on("next", sync.playlist.loadVideo);

    $("form").submit(function (event) {
        event.preventDefault();
    });

    var cmds = {
        "/setname": function (name) {
            if (name === "" || name === undefined || name.length > 20) {
                sync.chat.append("Invalid username", "color:red");
                return;
            }
            socket.emit("setName", name);
        },
        "/del": function (pos) {
            socket.emit("deleteVideo", pos)
        }
    };

    socket.on("deleteVideo", sync.playlist.deleteVideo);
    socket.on("nameChanged", sync.users.setName);
    socket.on("updateUsers", sync.users.update);

    // Insert username from user list to message
    $("#users").on("click", "ul li div", function () {
        $("#msg").val($("#msg").val() + " " + $(this).html() + " ");
        $("#msg").focus();
    });

    // main chat screen
    $("#chatForm").submit(function () {
        var msg = $("#msg").val();
        $("#msg").val("");
        if (msg === "") return;
        var words = msg.split(' ');
        var cmd = words[0];
        if (cmds[cmd]) // if the first word is a valid command
            cmds[cmd](words[1]);
        else
            socket.emit("chat", msg);
    });

    //todo:delete functionality
    //todo:resend playlist to users in room
    function delVideo(id) {
        console.log("deleting video " + id);
        socket.emit("delVideo", id);
    }

    $("#next").click(function () {
        //todo:check if owner
        //perhaps give position # for custom next, not just 1
        if (sync.users.owner == sync.users.uid)
            socket.emit("next");
        else
            sync.chat.append("Error: You are not a mod", "color:red");
    });

    $("#addVideoBtn").click(function () {
        //todo:check if video already exists on client and server
        var videoUrl = $("#videoUrl").val();
        $("#videoUrl").val("");
        var parsed = sync.util.parseURL(videoUrl);
        if (parsed) {
            socket.emit("addVideo", {url: parsed});
        } else {
            sync.chat.append("Invalid video ID", "color:red");
        }
    });
    $("#clearPlayed").click(function() {
        socket.emit("clearPlayed");
       // delVideo(sync.playlist.videos[sync.playlist.pos].url);
    });

    socket.on("err", function(msg) {
        sync.chat.append(msg, "color:red");
    });

    socket.on("chat", function (person, msg) {
        sync.chat.append("<div><strong>" + person + "</strong>: " + msg + "</div>");
        $('#chatbox').scrollTop($('#chatbox')[0].scrollHeight);
    });

    socket.on("update", function (msg) {
        sync.chat.append(msg);
    });

    socket.on("userLeft", function (userName) {
        sync.chat.append(userName + " has disconnected", "color:red")
    });

    socket.on("userJoined", function (userName) {
        sync.chat.append(userName + " has joined", "color:green");
    });

    socket.on("newLeader", function (leaderName) {
        //todo: set leader status on peopleOnline array
        sync.chat.append(leaderName + " is the new leader of this room", "color:green");
    });

    socket.on("videoAdded", sync.playlist.addVideo);

    socket.on("disconnect", function () {
        sync.chat.append("<strong>The server is not available. Please refresh your browser</strong>");
        $("#msg").attr("disabled", "disabled");
        $("#addVideoBtn").attr("disabled", "disabled");
    });

});

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        var time = sync.youtube.player.getCurrentTime();
        if (time !== 0) {
            socket.emit("seek", time);
        }
    }
    if (event.data == YT.PlayerState.PAUSED) {
        console.log("paused");
    }
    if (event.data == YT.PlayerState.ENDED) {
        socket.emit("next"); //todo: check if user is owner
    }
}