if(/(rouming|maso)Show\.php/.test(location.href)) {
	var olderButton = document.querySelector('.roumingButton a[title="Starší obrázek"],.masoButton a[title="Starší obrázek"]');
	var targetA = document.querySelector('td[height="600"] a');
	targetA.href = olderButton.href;
	var targetImg = document.querySelector('td[height="600"] a img');
	targetImg.style.maxHeight = 'calc(100vh - ' + targetImg.y + 'px)';
	targetImg.style.maxWidth = 'calc(100vw - ' + targetImg.x + 'px)';

}
if(/(rouming|maso)GIF\.php/.test(location.href)) {
	var olderButton = document.querySelector('.roumingButton a[title="Starší GIF"]');
	var targetA = document.querySelector('td.roumingForumMessage[align="center"] a,td.masoForumMessage[align="center"] a');
	targetA.href = olderButton.href;
}
