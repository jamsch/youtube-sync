/**
 * Created by James on 10/06/2015.
 */
function parseURL(url) {
    var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    if (videoid != null) return videoid[1];
}
$(document).ready(function () {

    socket.on('seek', function (data) {
        if (sync.video.player.getVideoData === undefined) return;
        sync.video.player.seekTo(data.t + 0.5, true);
    });

    //inserts username to message
    $("#users").on("click", "ul li div", function(){
        $("#msg").val($("#msg").val() + " " + $(this).html());
    });

    $("#resync").click(function(){
        socket.emit("resync");
    });

    socket.on("users", function (data) {
        console.log(data);
    });

    socket.on("next", sync.playlist.loadVideo);

    $("form").submit(function (event) {
        event.preventDefault();
    });
    var cmds = {
        "!setname" : setName,
        "!del" : delVideo
    };
    socket.on("updateUsers", sync.users.update);
    // main chat screen
    $("#chatForm").submit(function () {
        var msg = $("#msg").val();
        $("#msg").val("");

        if (msg === "") return;
        var words = msg.split(' ');
        var cmd = words[0];
        if (cmds[cmd]) {
            cmds[cmd](words[1]);
        } else {
            socket.emit("chat", msg);
        }
    });

    //todo:delete functionality
    //todo:resend playlist to users in room
    function delVideo(id) {
        socket.emit("delVideo", id);
    }

    function setName(name)
    {
        if (name === "" || name === undefined || name.length > 20) {
            $("#msgs").append("<li><span style='color:red'>Invalid username</span></li>");
            return;
        }
        console.log("Set name to " + name);
        socket.emit("setName", name);
    }

    $("#next").click(function () {
        //todo:check if owner
        //perhaps give position # for custom next, not just 1
        socket.emit("next");
    });

    $("#addVideo").submit(function () {
        //todo:check if video already exists on client and server
        var videoUrl = $("#videoUrl").val();
        $("#videoUrl").val("");
        var parsed = parseURL(videoUrl);
        if (parsed) {
            socket.emit("addVideo", {url: parsed});
        } else {
            $("#msgs").append("<li><span style='color:red'>Invalid video ID</span></li>");
        }
    });

    socket.on("chat", function (person, msg) {
        $("#msgs").append("<li><div><strong>" + person + "</strong>: " + msg + "</div></li>");
        $('#msgs').scrollTop($('#msgs')[0].scrollHeight);
    });

    socket.on("update", function (msg) {
        $("#msgs").append("<li><div>" + msg + "</div></li>");
    });

    socket.on("userLeft", function (userName) {
        $("#msgs").append("<li><div style='color:red'>" + userName + " has disconnected</div></li>");
    });

    socket.on("userJoined", function (userName) {
        $("#msgs").append("<li><div style='color:green'>" + userName + " has joined</div></li>");
    });

    socket.on("newLeader", function (leaderName) {
        //todo: set leader status on peopleOnline array
        $("#msgs").append("<li><div><a style='color:green'>" + leaderName + " is the new leader of this room</a></div></li>");
    });

    socket.on("videoAdded", sync.playlist.addVideo);
    socket.on("disconnect", function () {
        $("#msgs").append("<li><strong>The server is not available. Please refresh your browser</strong></li>");
        $("#msg").attr("disabled", "disabled");
        $("#addVideoBtn").attr("disabled", "disabled");
    });
});

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        var time = sync.video.player.getCurrentTime();
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