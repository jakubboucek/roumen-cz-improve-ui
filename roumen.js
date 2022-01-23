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
let olderButton;
let targetA;

const getOption = (() => {
    // Async Preload all options
    const optionsPromise = new Promise((resolve) => {
        const options = {
            showSidebar: true,
            videoVolume: null,
            skipDisliked: false
        };
        chrome.storage.sync.get(options, function (options) {
            resolve(options);
        });
    });

    // provide async getter for option
    return async (key) => {
        const options = await optionsPromise;
        if (options.hasOwnProperty(key) === false)
            throw new Error(`Option '${key}' doesn't exists.`);

        return options[key];
    }
})();

const setOption = (key, value) => {
    chrome.storage.sync.set({[key]: value});
};

getOption('showSidebar').then((showSidebar) => {
    if (showSidebar) {
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
    const olderButtons = document.querySelectorAll('.roumingButton a[title="Starší obrázek"],.masoButton a[title="Starší obrázek"]');
    olderButton = olderButtons[0];
    targetA = document.querySelector('td[height="600"] a');
    targetA.href = olderButton.href;

    const links = Array.from(olderButtons);
    links.push(targetA);

    getOption('skipDisliked').then((skipDisliked) => {
        if (!skipDisliked) return;

        const url = new URL(location.href);
        // RUIA = Rouming Ui Improve Action
        const isAutoNext = url.searchParams.get('_ruia') === 'next';

        if (isAutoNext) {
            // Remove appended parameter
            url.searchParams.delete('_ruia');
            history.replaceState(null, document.title, url);
        }

        const nextUrl = new URL(olderButton.href);
        nextUrl.searchParams.set('_ruia', 'next');
        links.forEach((link) => link.href = nextUrl.toString());

        // Skip disliked images is allowed only when is triggered by olderButton (and similar)
        if (!isAutoNext) return;

        const likeBtn = document.querySelector('.roumingButton a[title="Tento obrázek se mi líbí"]');
        const dislikeBtn = document.querySelector('.roumingButton a[title="Tento obrázek se mi nelíbí"]');
        if (!likeBtn || !dislikeBtn) return;

        const rating = [parseInt(likeBtn.textContent), parseInt(dislikeBtn.textContent)]
            .map((val) => Number.isNaN(val) ? 0 : val)
            .reduce((cur, prev) => cur + prev, 0);

        if (rating < 0) {
            location.assign(nextUrl);
        }
    });

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
    targetA = document.querySelector('td.roumingForumMessage[align="center"],td.masoForumMessage[align="center"]');

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

        let volume = null;
        getOption('videoVolume').then((videoVolume) => {
            if (videoVolume !== null) {
                video.volume = volume = videoVolume;
            }
        });
        const volumeHandler = (event) => {
            const videoVolume = event.target.volume;
            // Prevent event infinite loop
            if (volume === videoVolume) {
                return;
            }
            setOption('videoVolume', videoVolume);
        };
        video.addEventListener('volumechange', volumeHandler, {capture: false, passive: true});

    } else {
        const gif = targetA.querySelector('img[border="0"]');
        setSaveHandler(gif);
    }
}

if (/roumingLinks\.php/.test(location.href)) {
    const a = document.querySelectorAll('.roumingList table td a[target="odkaznik"]');

    a.forEach((a) => {
        a.setAttribute('target', '_blank');
        // Security shield, @see: https://developers.google.com/web/tools/lighthouse/audits/noopener
        a.relList.add('noopener');
    });
}

if (/roumingVideo\.php/.test(location.href)) {
    const panels = document.querySelectorAll('.control');
    const target = panels[0];
    const source = panels[1];
    const firstTargetsChild = target.firstElementChild;

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

function deobfuscateLinks() {
    document.querySelectorAll('.roumingForumMessage a[rel~="nofollow"]').forEach((a) => {
        if (a.textContent.match(/^odkaz$/)) {
            a.textContent = a.href;
        }
    });

    document.querySelectorAll('.roumingForumMessage u').forEach((u) => {
        const parent = u.parentNode;
        const url = u.textContent;
        const a = document.createElement('a');
        a.textContent = url;
        a.setAttribute('href', url);
        a.setAttribute('target', '_blank');
        // Security shield, @see: https://developers.google.com/web/tools/lighthouse/audits/noopener
        a.relList.add('noopener');
        parent.replaceChild(a, u);
    });
}

deobfuscateLinks();

function scaleToScreen(parent, img) {
    toggleScale(img);
    parent.classList.add('scaledRouming');

    const floatPanel = document.createElement('div');
    floatPanel.className = 'floatPanel';
    parent.appendChild(floatPanel);

    const expandIcon = document.createElement('img');
    expandIcon.src = chrome.runtime.getURL('/expand.svg');
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
        img.classList.remove('scaled');
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
        link.setAttribute('href', img.src);
        link.setAttribute('download', '');
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
    const tagName = event.target && event.target.nodeName && event.target.nodeName.toLowerCase();
    if (['button', 'datalist', 'input', 'meter', 'output', 'select', 'textarea'].includes(tagName)) {
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
            + '.roumingButton a[title="Vypnout audio"],'
            + '.roumingButton a[title="Zapnout audio"]');
    } else if (event.code === 'KeyS' && saveHandler) {
        saveHandler(event);
    }

    if (!button) return;

    button.classList.add('activated');
    window.setTimeout(function () {
        button.classList.remove('activated')
    }, 300);

    button.click();

    event.preventDefault();
}

window.addEventListener('keydown', arrowHandler, {capture: true, passive: false});

// Remove conflicting arrow handler by Roumen
const script = document.createElement('script');
script.innerHTML = 'window.arrowHandler = ()=>{};';
document.head.appendChild(script);
