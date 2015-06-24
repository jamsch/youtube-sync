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