/**
 * @var chrome
 * @see https://developer.chrome.com/extensions/api_index
 */
/** @var chrome.storage.onChanged */
/** @var chrome.storage.onChanged.addListener */
/** @var chrome.extension */
/** @var chrome.extension.getUrl */

let scaleHandler;
let saveHandler;
let switchVolume;
let olderButton;
let targetA;

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
        const value = changes.showSidebar.newValue;

        if (value) {
            document.body.classList.add('showSidebar');
        } else {
            document.body.classList.remove('showSidebar');
        }
    }
});

if (/(rouming|maso)Show\.php/.test(location.href)) {
    olderButton = document.querySelector('.roumingButton a[title="Starší obrázek"],.masoButton a[title="Starší obrázek"]');
    targetA = document.querySelector('td[height="600"] a');
    targetA.href = olderButton.href;

    const targetImg = document.querySelector('td[height="600"] a img');
    scaleToScreen(targetA, targetImg);
    setSaveHandler(targetImg);

    const head = document.head;
    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = olderButton.href;
    head.appendChild(prefetch);
}

if (/(rouming|maso)GIF\.php/.test(location.href)) {
    olderButton = document.querySelector('.roumingButton a[title="Starší GIF"]');
    targetA = document.querySelector('td.roumingForumMessage[align="center"] a,td.masoForumMessage[align="center"] a');
    targetA.href = olderButton.href;

    const video = targetA.querySelector("video");
    if (video) {
        if (video.src !== "") {
            setSaveHandler(video);
        } else {
            const source = video.querySelector("source");
            if (source) {
                setSaveHandler(source);
            }
        }
    } else {
        const gif = targetA.querySelector('img[border="0"]');
        setSaveHandler(gif);
    }
}

if (/roumingVideo\.php/.test(location.href)) {
    const panels = document.querySelectorAll('.control');
    const target = panels[0];
    const source = panels[1];
    const firstTargetsChild = target.firstElementChild;
    console.log([panels, source, target, firstTargetsChild]);
    for (let i = 0; i < source.childNodes.length; i++) {
        const item = source.childNodes[i];

        if (item.nodeType === Node.ELEMENT_NODE && item.tagName !== 'SPAN') {
            continue;
        }

        const copy = item.cloneNode(true);
        target.insertBefore(copy, firstTargetsChild);
    }
    firstTargetsChild.style.display = 'inline-block';
}

function makePredictableLinks() {
    const links = document.querySelectorAll('.roumingForumMessage a[rel="nofollow"]');
    for (let i = 0; i < links.length; i++) {
        const a = links.item(i);
        if (a.textContent.match(/^odkaz$/)) {
            a.textContent = a.href;
        }
    }
}

makePredictableLinks();

function scaleToScreen(parent, img) {
    toggleScale(img);
    parent.classList.add('scaledRouming');

    const floatPanel = document.createElement('div');
    floatPanel.className = 'floatPanel';
    parent.appendChild(floatPanel);

    const expandIcon = document.createElement('img');
    expandIcon.src = chrome.extension.getURL('/expand.svg');
    expandIcon.width = 24;
    expandIcon.title = 'Zobrazit původní velikost obrázku';
    floatPanel.appendChild(expandIcon);

    scaleHandler = function (e) {
        toggleScale(img);
        e.preventDefault();
    };
    expandIcon.addEventListener('click', scaleHandler, {capture: false, passive: false});
}

function toggleScale(img) {
    if (img.classList.contains('scaled')) {
        img.className = img.classList.remove('scaled');
        img.style.maxHeight = img.naturalHeight + 'px';
        img.style.maxWidth = img.naturalWidth + 'px';
    } else {
        img.classList.add('scaled');
        img.style.maxHeight = 'calc(100vh - ' + img.y + 'px)';
        img.style.maxWidth = 'calc(100vw - ' + img.x + 'px)';
    }
}

function setSaveHandler(img) {
    saveHandler = function () {
        const link = document.createElement('a');
        link.setAttribute("href", img.src);
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

function arrowHandler(event) {
    let button;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyJ') {
        button = document.querySelector(
            '.roumingButton a[title="Starší obrázek"],'
            + '.masoButton a[title="Starší obrázek"],'
            + '.roumingButton a[title="Následující video"],'
            + '.roumingButton a[title="Starší GIF"]');
    } else if (event.code === 'ArrowLeft' || event.code === 'KeyK') {
        button = document.querySelector('.roumingButton a[title="Novější obrázek"],'
            + '.masoButton a[title="Novější obrázek"],'
            + '.roumingButton a[title="Předchozí video"],'
            + '.roumingButton a[title="Novější GIF"]');
    } else if (event.code === 'KeyL') {
        button = document.querySelector('.roumingButton a[title="Tento obrázek se mi líbí"],'
            + '.masoButton a[title="Tento obrázek se mi líbí"],'
            + '.roumingForumTitle a[title="Tento GIF je super!"],'
            + '.roumingForumTitle a[title="Toto video je super!"],'
            + '.masoForumTitle a[title="Tento GIF je super!"]');
    } else if (event.code === 'KeyR') {
        button = document.querySelector('.roumingButton a[title="Zobrazit náhodně jiný obrázek"],'
            + '.masoButton a[title="Zobrazit jiný obrázek"],'
            + '.roumingSubMenu a[href="roumingVideo.php?action=random"],'
            + '.roumingList .mw800 .control a[title="Zobrazit jiný GIF"],'
            + '.masoList a[title="Zobrazit jiný GIF"]');
    } else if (event.code === 'KeyP' && scaleHandler) {
        scaleHandler(event);
    } else if (event.code === 'KeyM') {
        button = document.querySelector(
            '.roumingButton a[name="audioSwitch"],'
            + '.masoButton a[name="audioSwitch"]');
    } else if (event.code === 'KeyS' && saveHandler) {
        saveHandler(event);
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

window.addEventListener('keydown', arrowHandler, {capture: true, passive: false});
