if(/(rouming|maso)Show\.php/.test(location.href)) {
	var targetImg = document.querySelector('td[height="600"] a img');
	targetImg.style.maxHeight = 'calc(100vh - ' + targetImg.y + 'px)';
	targetImg.style.maxWidth = 'calc(100vw - ' + targetImg.x + 'px)';
}
if(location.href.indexOf('roumingGIF.php') > 1) {
}
