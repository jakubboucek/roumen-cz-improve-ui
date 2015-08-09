chrome.webRequest.onBeforeRequest.addListener(
	function(info) {
		console.log(info.url);
		return {cancel: false};
	},
	{
		urls: ["<all_urls>"]
	},
	["blocking"]
);