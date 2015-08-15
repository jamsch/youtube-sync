var https = require("https");

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.getJSON = function (options, callback) {
    var req = https.request(options, function (res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            callback(res.statusCode, JSON.parse(output));
        });
    });
    req.end();
};

/**
 * getPlaylistVideos: returns an array of playlist videos, by video ID
 * @param options: http options object
 * @param playlist: youtube playlist url
 * @param videos: array of video IDs
 * @param callback: callback function with argument of 'videos' - a video array
 */
exports.getPlaylistVideos = function(options, playlist, videos, callback) {
    exports.getJSON(options, function (statusCode, arr) {
        if (statusCode == 200) {
            // Get all video IDs from current results and add to videos array
            for (var i = 0; i < arr.items.length; i++) {
                videos.push(arr.items[i].contentDetails.videoId);
            }
            // If there is >50 videos, another JSON call will have to be made
            if (arr.hasOwnProperty('nextPageToken')) {
                options.path = '/youtube/v3/playlistItems?&key=' + api + '&part=contentDetails,snippet' + '&playlistId=' + playlist + '&maxResults=50&pageToken=' + arr.nextPageToken;
                exports.getPlaylistVideos(options, playlist, obj);
            } else {
                callback(videos);
            }
        } else {
            console.log("Error with getting json data from YT API - " + statusCode);
        }
    });
};

/**
 * Parses ISO 8601 string to seconds
 * @param duration: ISO 8601 string
 * @returns total number of seconds
 */
exports.parseDuration = function (duration) {
    var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    var hours = (parseInt(match[1]) || 0);
    var minutes = (parseInt(match[2]) || 0);
    var seconds = (parseInt(match[3]) || 0);
    return hours * 3600 + minutes * 60 + seconds;
};