var scaleHandler;
var switchVolume;
var olderButton;
var targetA;

chrome.storage.sync.get({
    showSidebar: true
}, function (options) {
    if (options.showSidebar === true) {
        document.body.classList.add('showSidebar');
    }
});

chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName !== 'sync') return;

    if (changes.showSidebar) {
        var value = changes.showSidebar.newValue;

        if (value) {
            document.body.classList.add('showSidebar');
        }
        else {
            document.body.classList.remove('showSidebar');
        }
    }
});

if (/(rouming|maso)Show\.php/.test(location.href)) {
    olderButton = document.querySelector('.roumingButton a[title="Starší obrázek"],.masoButton a[title="Starší obrázek"]');
    targetA = document.querySelector('td[height="600"] a');
    targetA.href = olderButton.href;
    var targetImg = document.querySelector('td[height="600"] a img');
    scaleToScreen(targetA, targetImg);

    var head = document.head;
    var prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = olderButton.href;
    head.appendChild(prefetch);
}

if (/(rouming|maso)GIF\.php/.test(location.href)) {
    olderButton = document.querySelector('.roumingButton a[title="Starší GIF"]');
    targetA = document.querySelector('td.roumingForumMessage[align="center"] a,td.masoForumMessage[align="center"] a');
    targetA.href = olderButton.href;

    var video = document.querySelector("video");
    if (video) {
        var lajk = document.querySelector('.roumingForumTitle a[title="Tento GIF je super!"],.masoForumTitle a[title="Tento GIF je super!"]');
        var panel = lajk.parentElement;

        var setVolumeIcon = function () {
            volume.textContent = video.muted ? "\uD83D\uDD07" : "\uD83D\uDD08";
        };

        switchVolume = function (event) {
            video.muted = !video.muted;
            setVolumeIcon();
            if (event && event.preventDefault) {
                event.preventDefault();
            }
        };

        var volume = document.createElement('a');
        volume.href = "#toggle-volume";
        volume.title = "Zapnout/ztišit zvuk videa";
        volume.classList.add('volume-button');

        volume.addEventListener('click', switchVolume);
        setVolumeIcon();
        panel.insertBefore(volume, lajk);

        chrome.storage.sync.get({
            enableGifSound: false
        }, function (options) {
            if (options.enableGifSound === true) {
                switchVolume();
            }
        });
    }
}

if (/roumingVideo\.php/.test(location.href)) {
    var panels = document.querySelectorAll('.control');
    var target = panels[0];
    var source = panels[1];
    var firstTargetsChild = target.firstElementChild;
    console.log([panels, source, target, firstTargetsChild]);
    for (var i = 0; i < source.childNodes.length; i++) {
        var item = source.childNodes[i];

        if (item.nodeType === Node.ELEMENT_NODE && item.tagName !== 'SPAN') {
            continue;
        }

        var copy = item.cloneNode(true);
        target.insertBefore(copy, firstTargetsChild);
    }
    firstTargetsChild.style.display = 'inline-block';
}

function makePredictableLinks() {
    var links = document.querySelectorAll('.roumingForumMessage a[rel="nofollow"]');
    for (var i = 0; i < links.length; i++) {
        var a = links.item(i);
        if (a.textContent.match(/^odkaz$/)) {
            a.textContent = a.href;
        }
    }
}

makePredictableLinks();

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

    scaleHandler = function (e) {
        toggleScale(img);
        e.preventDefault();
    };
    expandIcon.addEventListener('click', scaleHandler, false);
}

function toggleScale(img) {
    if (img.classList.contains('scaled')) {
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
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyJ') {
        button = document.querySelector(
            '.roumingButton a[title="Starší obrázek"],'
            + '.masoButton a[title="Starší obrázek"],'
            + '.roumingButton a[title="Následující video"],'
            + '.roumingButton a[title="Starší GIF"]');
    }
    else if (event.code === 'ArrowLeft' || event.code === 'KeyK') {
        button = document.querySelector('.roumingButton a[title="Novější obrázek"],'
            + '.masoButton a[title="Novější obrázek"],'
            + '.roumingButton a[title="Předchozí video"],'
            + '.roumingButton a[title="Novější GIF"]');
    }
    else if (event.code === 'KeyL') {
        button = document.querySelector('.roumingButton a[title="Tento obrázek se mi líbí"],'
            + '.masoButton a[title="Tento obrázek se mi líbí"],'
            + '.roumingForumTitle a[title="Tento GIF je super!"],'
            + '.roumingForumTitle a[title="Toto video je super!"],'
            + '.masoForumTitle a[title="Tento GIF je super!"]');
    }
    else if (event.code === 'KeyR') {
        button = document.querySelector('.roumingButton a[title="Zobrazit náhodně jiný obrázek"],'
            + '.masoButton a[title="Zobrazit jiný obrázek"],'
            + '.roumingSubMenu a[href="roumingVideo.php?action=random"],'
            + '.roumingList .mw800 .control a[title="Zobrazit jiný GIF"],'
            + '.masoList a[title="Zobrazit jiný GIF"]');
    }
    else if (event.code === 'KeyP' && scaleHandler) { // P key
        scaleHandler(event);
    }
    else if (event.code === 'KeyM' && switchVolume) { // M key
        switchVolume(event);
    }
    if (button) {
        button.classList.add('activated');
        window.setTimeout(function () {
            button.classList.remove('activated')
        }, 300);
        button.click();
        event.preventDefault();
    }
}

window.addEventListener('keydown', arrowHandler, true);
