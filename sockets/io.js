/**
 * Created by James on 24-Aug-15.
 */
var Room = require('../room');
var util = require('./util');
var rooms = []; // Array of Room objects

    var socketio = socketio || {};

    socketio.init = (function (io) {

        //Finds
        setInterval(function(){
            for (var room in rooms) {
                if (typeof io.sockets.connected[rooms[room].owner] == 'undefined') {
                    var socketid = io.findNewOwner(rooms[room].owner,room);
                    if (typeof socketid != 'undefined') {
                        rooms[room].removePerson(rooms[room].owner);
                        rooms[room].owner = socketid;
                        io.sockets.in(room).emit("updateUsers", {
                            users: rooms[room].people,
                            owner: rooms[room].owner
                        });
                    }
                }
                if (typeof rooms[room] == 'undefined') {
                    io.sockets.in(room).disconnect();
                    continue;
                }
                if (rooms[room].size <= 0) {
                    io.sockets.in(room).disconnect();
                    delete rooms[room];
                    continue;
                }
                for (var person in rooms[room].people) {
                    if (typeof io.sockets.connected[person] == 'undefined') {
                        console.log("Removing: " + rooms[room].people[person].name);
                        rooms[room].removePerson(person);
                        var socketid = io.findNewOwner(person,room);
                        if (typeof socketid != 'undefined') {
                            rooms[room].removePerson(rooms[room].owner);
                            rooms[room].owner = socketid;
                            io.sockets.in(room).emit("updateUsers", {
                                users: rooms[room].people,
                                owner: rooms[room].owner
                            });
                        }
                        io.sockets.in(room).emit("updateUsers", {
                            users: rooms[room].people,
                            owner: rooms[room].owner
                        });
                    }
                }
            }
        }, 10000);

        io.findNewOwner = function(socket_id,room_name) {
            for (var id in rooms[room_name].people) {
                if (socket_id !== id) {
                    if (typeof io.sockets.connected[id] != 'undefined') {
                        if (io.sockets.connected[id].connected) {
                            socketid = id;
                            break;
                        }
                    }
                }
            }
        };

        io.on("connection", function (socket) {
            socket.on("join", function(username, room_name) {

                if (!validateUser(username,room_name)) {
                    socket.disconnect();
                    return;
                }

                // Set some socket properties the desired username

                socket.username = username; //Todo: Check if valid username
                socket.room = room_name; //Todo check if valid room name

                // if Room is new/empty
                if (rooms[room_name] === undefined) {
                    rooms[room_name] = new Room(socket.id);
                    console.log("Created a new room: " + room_name);
                }

                socket.join(room_name);

                rooms[room_name].addPerson(socket.id, username);

                // Send playlist, and other info. Doesn't matter if the playlist is empty or not.
                io.sockets.connected[socket.id].emit("ackJoin", {
                    username: username, //todo: avoid sending username
                    uid: socket.id,
                    pos: rooms[room_name].playlist.pos,
                    playlist: rooms[room_name].playlist.videos
                });

                // Send username to the room to show who joined
                socket.broadcast.to(socket.room).emit("userJoined", socket.username);

                io.sockets.in(socket.room).emit("updateUsers", {
                    users: rooms[socket.room].people,
                    owner: rooms[socket.room].owner
                });
                console.log(socket.username + " joined " + socket.room + ". Socket ID: " + socket.id);
            });

            socket.on("next", function () {
                if (rooms[socket.room] !== undefined) { //Only owner can go next (For now)
                    if (rooms[socket.room].owner === socket.id) {
                        rooms[socket.room].playlist.next();
                        io.sockets.in(socket.room).emit("next", rooms[socket.room].playlist.pos);
                    }
                }
            });

            socket.on("clearPlayed", function () {
                if (rooms[socket.room] === undefined) {
                    socket.disconnect(); // In case someone emits a seek without joining a room
                    return;
                }
                if (rooms[socket.room].owner === socket.id) {
                    rooms[socket.room].playlist.clearPlayed();
                }
            });

            socket.on("setName", function (name) {
                if (name === undefined || name == "" || name.length > 20) { // in case client side javascript was tampered
                    io.sockets.connected[socket.id].emit("update", "Invalid name");
                } else {
                    io.sockets.in(socket.room).emit("update", "<em>" + socket.username + " set name to " + name + "</em>");
                    socket.username = name;
                    rooms[socket.room].people[socket.id].name = name;
                    //todo:change user list client side
                    // For now, broadcast to all
                    io.sockets.in(socket.room).emit("updateUsers", {  //  socket.broadcast.to
                        users: rooms[socket.room].people,
                        owner: rooms[socket.room].owner
                    });
                }
            });
            socket.on("addVideo", function (data) {
                //todo: check if video already exists in playlist
                //todo: check if user can add videos to this room
                //todo: check if user has reached personal video limit in room

                if (rooms[socket.room].playlist.locked) {
                    io.sockets.connected[socket.id].emit("error", "Playlist is locked");
                    return;
                }

                var api = "AIzaSyBacpszKfy_j9IqiAvhhqtkhvQDTdVTx48"; // todo: put this somewhere else

                if (data.url.indexOf('playlist?list=') != -1) {
                    //todo check if user is owner/mod
                    var playlist = data.url.replace('playlist?list=', '');
                    var options = {
                        host: 'www.googleapis.com',
                        path: '/youtube/v3/playlistItems?key=' + api + '&part=contentDetails,snippet&playlistId=' + playlist + '&maxResults=50',
                        method: 'GET',
                        port: 443
                    };
                    util.getPlaylistVideos(options, playlist, [], function (videos) {
                        console.log(videos); //todo: do something with playlist videos
                    });
                    return;
                }

                var options = {
                    host: 'www.googleapis.com',
                    path: '/youtube/v3/videos?id=' + data.url + '&key=' + api + '&part=snippet,contentDetails',
                    method: 'GET',
                    port: 443
                };

                util.getJSON(options, function (statusCode, arr) {
                    if (arr.items.length < 1) {
                        io.sockets.connected[socket.id].emit("error", "Invalid video ID");
                        return;
                    }
                    if (statusCode == 200) {
                        data.name = arr.items[0].snippet.title;
                        data.duration = util.parseDuration(arr.items[0].contentDetails.duration);
                        data.username = socket.username;
                        rooms[socket.room].addVideo(data);
                        var videos = rooms[socket.room].playlist.videos;
                        io.sockets.in(socket.room).emit("videoAdded", videos[videos.length - 1]);
                    } else {
                        console.log("Error with getting json data from YT API - " + statusCode);
                    }
                });

            });

            socket.on("chat", function (msg) {
                if (typeof msg != 'string') {
                    socket.disconnect();
                    return;
                }
                if (msg.length > 200) {
                    io.sockets.connected[socket.id].emit("err", "Message too long");
                    return;
                }
                console.log(socket.username + " from " + socket.room + " sent " + msg);
                io.sockets.in(socket.room).emit("chat", socket.username, msg);
            });

            socket.on("disconnect", function () {
                if (rooms[socket.room] === undefined) return; //in case the user is no longer in a room
                //delete room if last person leaves
                if (rooms[socket.room].size === 1) {
                    deleteRoom(socket.room);
                } else {
                    rooms[socket.room].size--;
                    // If the owner leaves
                    if (rooms[socket.room].owner === socket.id) {
                        try {
                            // Assign someone else the leader
                            var socketid = io.findNewOwner(socket.id,socket.room);
                            if (typeof socketid != 'undefined') {
                                socket.broadcast.to(socket.room).emit("newLeader", io.sockets.connected[id].username);
                                rooms[socket.room].owner = id;
                            } else {
                                deleteRoom(socket.room);
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    // If the person that's disconnecting exists in this room
                    if (rooms[socket.room].removePerson(socket.id)) {
                        console.log("Removed person from " + socket.room + " - " + socket.username);
                        // Broadcast to the room that the person disconnected
                        socket.broadcast.to(socket.room).emit("userLeft", socket.username);
                    }
                }

                var roomName = socket.room;
                socket.leave(socket.room);
                if (rooms[roomName] !== undefined) {
                    io.sockets.in(socket.room).emit("updateUsers", {
                        users: rooms[roomName].people,
                        owner: rooms[roomName].owner
                    });
                }
            });

            socket.on("seek", function (time) {
                if (rooms[socket.room] === undefined) {
                    socket.disconnect(); // In case someone emits a seek without joining a room
                    return;
                }
                // only allow owner to seek, todo allow mods to seek
                if (rooms[socket.room].owner === socket.id) {
                    // todo: verify time and url
                    // Check if owner hasn't already 'seeked' a second ago
                    if (((new Date().getTime() - rooms[socket.room].playlist.timestamp) / 1000) < 1) return;
                    console.log("Owner [" + socket.room + "] seeked to [" + time + "]");
                    if (rooms[socket.room].playlist.videos[rooms[socket.room].playlist.pos] !== undefined) {
                        rooms[socket.room].playlist.seekTime = time;
                        rooms[socket.room].playlist.timestamp = new Date().getTime();
                        socket.broadcast.to(socket.room).emit("seek", {
                            t: time,
                            url: rooms[socket.room].playlist.videos[rooms[socket.room].playlist.pos].url
                        });
                    }
                }
            });

            socket.on("resync", function () {
                try {
                    io.sockets.connected[socket.id].emit("seek", {
                        t: ((new Date().getTime() - rooms[socket.room].playlist.timestamp) / 1000) + rooms[socket.room].playlist.seekTime,
                        url: rooms[socket.room].playlist.videos[rooms[socket.room].playlist.pos].url
                    })
                } catch (err) {
                    console.log(err);
                }
            });

            socket.on("shuffle", function () {
                //todo owner shuffle video array
            });
        });
    });

    //Private functions

    var validateUser = (function(username,room_name) {
        // Prevent XSS/undefined check
        if (typeof username != 'string' || typeof room_name != 'string') {
            return false;
        }
        if (username.length > 12 || room_name.length > 24) {
            return false;
        }
        return true;
    });

    var deleteRoom = (function(room_name) {
        delete rooms[room_name];
        console.log("Room " + room_name + " deleted");
    });

    //Public functions

    socketio.getRoom = (function(room_name) {
        if (rooms[room_name] === undefined) return;
        return {
            users: rooms[room_name].people,
            videos: rooms[room_name].playlist.videos,
            pos: rooms[room_name].playlist.pos,
            owner: rooms[room_name].owner
        }
    });

    socketio.getUsers = (function(room_name) {
        if (rooms[room_name] === undefined) return;
        return rooms[room_name].people;
    });

    //todo:get current video playing in array
    //todo:get number of users in room
    socketio.getPublicRooms = (function() {
        var publicRooms = [];
        for (var key in rooms) {
            if (!rooms[key].private) // Get only public rooms
                if (typeof rooms[key].playlist.videos[rooms[key].playlist.pos] !== 'undefined') { // Only get rooms with videos playing
                    publicRooms.push({
                        name: key,
                        size: rooms[key].size,
                        playing: rooms[key].playlist.videos[rooms[key].playlist.pos]
                    });
                }
        }
        return publicRooms;
    });

    socketio.getAllRoomNames = (function() {
        var allRooms = [];
        for (var key in rooms) {
            allRooms.push(key);
        }
        return allRooms;
    });

    module.exports = socketio;