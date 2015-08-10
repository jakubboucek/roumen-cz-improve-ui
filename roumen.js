if(/(rouming|maso)Show\.php/.test(location.href)) {
	var olderButton = document.querySelector('.roumingButton a[title="Starší obrázek"],.masoButton a[title="Starší obrázek"]');
	var targetA = document.querySelector('td[height="600"] a');
	targetA.href = olderButton.href;
	var targetImg = targetA.querySelector('img');
	var wh = document.documentElement.clientHeight;
	targetImg.style.maxHeight = 'calc(100vh - ' + targetImg.offsetTop + 'px)';
}
if(location.href.indexOf('roumingGIF.php') > 1) {
	var olderButton = document.querySelector('.roumingButton a[title="Starší GIF"]');
	var targetA = document.querySelector('td.roumingForumMessage[align="center"] a');
	targetA.href = olderButton.href;
}
