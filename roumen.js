if(/(rouming|maso)Show\.php/.test(location.href)) {
	var olderButton = document.querySelector('.roumingButton a[title="Starší obrázek"],.masoButton a[title="Starší obrázek"]');
	var targetA = document.querySelector('td[height="600"] a');
	targetA.href = olderButton.href;
	var targetImg = document.querySelector('td[height="600"] a img');
	scaleToScreen(targetA, targetImg);

	var head = document.head;
	var prefetch = document.createElement('link');
	prefetch.rel = 'prefetch';
	prefetch.href = olderButton.href;
	head.appendChild(prefetch);
}

if(/(rouming|maso)GIF\.php/.test(location.href)) {
	var olderButton = document.querySelector('.roumingButton a[title="Starší GIF"]');
	var targetA = document.querySelector('td.roumingForumMessage[align="center"] a,td.masoForumMessage[align="center"] a');
	targetA.href = olderButton.href;
}

function scaleToScreen(parent, img) {
	toggleScale(img);
	parent.className+=' scaledRouming';

	var floatPanel = document.createElement('div');
	floatPanel.className = 'floatPanel';
	parent.appendChild(floatPanel);

	var expandIcon = document.createElement('img');
	expandIcon.src = chrome.extension.getURL('/expand.svg');
	expandIcon.width = 24;
	expandIcon.title = 'Zobrazit původní velikost obrázku';
	floatPanel.appendChild(expandIcon);

	expandIcon.addEventListener('click', function(e){toggleScale(img);e.preventDefault();}, false);
}

function toggleScale(img) {
	if(img.className.match(/(\s|^)scaled(\s|$)/)) {
		img.className = img.className.replace(/(\s|^)scaled(\s|$)/, ' ');
		img.style.maxHeight = img.naturalHeight + 'px';
		img.style.maxWidth = img.naturalWidth + 'px';
	}
	else {
		img.className += ' scaled';
		img.style.maxHeight = 'calc(100vh - ' + img.y + 'px)';
		img.style.maxWidth = 'calc(100vw - ' + img.x + 'px)';
	}
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
		button.className += ' activated';
		window.setTimeout(function(){button.className=button.className.replace(/(\s|^)activated(\s|$)/,' ')}, 300);
		button.click();
	}
}

window.addEventListener('keydown', arrowHandler, true);
