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
	setLoadedAttib = setInterval(function() {
		if (typeof sync != "undefined") {
			sync.youtube.loaded = true;
			clearInterval(setLoadedAttib);
		}
	}, 500);
}