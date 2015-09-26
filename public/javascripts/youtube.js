/**
 * Created by James on 26-Sep-15.
 */
// Load YT script
(function () {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}());

function onYouTubeIframeAPIReady() {
    // Load YT element only if there's a video
    if (sync.playlist.videos.length > 0) {
        sync.youtube.load(sync.playlist.videos[sync.playlist.pos].url);
    }
}