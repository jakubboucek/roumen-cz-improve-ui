var scaleHandler;

var extensionName = 'Rouming.cz improve UI';

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

function makeRealLinks() {
	var us = document.querySelectorAll('.roumingForumMessage u');
	for(var i=0; i < us.length; i++) {
		var u = us.item(i);
		if(u.childNodes.length > 1) {
			console.log('['+extensionName+'] Pseudolink contains more elements, unable to make real link.');
			continue;
		}
		var link = u.textContent;
		if(!link.match(/^\s*https?:\/\//)) {
			console.log('['+extensionName+'] Pseudolink doesn\'t contains URL, unable to make real link.');
			continue;
		}
		var a = document.createElement('a');
		a.href=link;
		a.appendChild(document.createTextNode(link));
		u.parentNode.replaceChild(a, u);
	}
}
makeRealLinks();

function scaleToScreen(parent, img) {
	toggleScale(img);
	parent.classList.add('scaledRouming');

	var floatPanel = document.createElement('div');
	floatPanel.className = 'floatPanel';
	parent.appendChild(floatPanel);

	var expandIcon = document.createElement('img');
	expandIcon.src = chrome.extension.getURL('/expand.svg');
	expandIcon.width = 24;
	expandIcon.title = 'Zobrazit původní velikost obrázku';
	floatPanel.appendChild(expandIcon);

	scaleHandler = function(e){
		toggleScale(img);
		e.preventDefault();
	};
	expandIcon.addEventListener('click', scaleHandler, false);
}

function toggleScale(img) {
	if(img.classList.contains('scaled')) {
		img.className = img.classList.remove('scaled');
		img.style.maxHeight = img.naturalHeight + 'px';
		img.style.maxWidth = img.naturalWidth + 'px';
	}
	else {
		img.classList.add('scaled');
		img.style.maxHeight = 'calc(100vh - ' + img.y + 'px)';
		img.style.maxWidth = 'calc(100vw - ' + img.x + 'px)';
	}
}

function arrowHandler(event) {
	var button;
	if(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
		return;
	}
	if(event.keyCode == 39) { // right arrow key
		button = document.querySelector(
			'.roumingButton a[title="Starší obrázek"],'
			 + '.masoButton a[title="Starší obrázek"],'
			 + '.roumingForumMessage a[title="Následující video"],'
			 + '.roumingButton a[title="Starší GIF"]');
	}
	else if(event.keyCode == 37) { // left arrow key
		button = document.querySelector('.roumingButton a[title="Novější obrázek"],'
			 + '.masoButton a[title="Novější obrázek"],'
			 + '.roumingForumMessage a[title="Předchozí video"],'
			 + '.roumingButton a[title="Novější GIF"]');
	}
	else if(event.keyCode == 76) { // L key
		button = document.querySelector('.roumingButton a[title="Tento obrázek se mi líbí"],'
			 + '.masoButton a[title="Tento obrázek se mi líbí"],'
			 + '.roumingForumTitle a[title="Tento GIF je super!"],'
			 + '.roumingForumTitle a[title="Toto video je super!"],'
			 + '.masoForumTitle a[title="Tento GIF je super!"]');
	}
	else if(event.keyCode == 80 && scaleHandler) { // P key
		scaleHandler(event);
	}
	if(button) {
		button.classList.add('activated');
		window.setTimeout(function(){button.classList.remove('activated')}, 300);
		button.click();
		event.preventDefault();
	}
}

window.addEventListener('keydown', arrowHandler, true);
