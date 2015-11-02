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

function arrowHandler(event) {
	var button;
	if(event.keyCode == 39) {
		button = document.querySelector('.roumingButton a[title="Starší obrázek"],.masoButton a[title="Starší obrázek"],.roumingButton a[title="Starší GIF"]');
	}
	else if(event.keyCode == 37) {
		button = document.querySelector('.roumingButton a[title="Novější obrázek"],.masoButton a[title="Novější obrázek"],.roumingButton a[title="Novější GIF"]');
	}
	else if(event.keyCode == 76) {
		button = document.querySelector('.roumingButton a[title="Tento obrázek se mi líbí"],.masoButton a[title="Tento obrázek se mi líbí"],.roumingForumTitle a[title="Tento GIF je super!"],.masoForumTitle a[title="Tento GIF je super!"]');
	}
	if(button) {
		button.className += " activated";
		window.setTimeout(function(){button.className=button.className.replace(/(\s|^)activated(\s|$)/,' ')}, 300);
		button.click();
	}
}

window.addEventListener('keydown', arrowHandler, true);