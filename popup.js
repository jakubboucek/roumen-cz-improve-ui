/**
 * @var chrome
 * @see https://developer.chrome.com/extensions/api_index
 */

window.addEventListener('load', init);

function init() {
    registerOption('#show-sidebar', 'showSidebar', true);
    registerOption('#skip-disliked', 'skipDisliked', false);
}

function registerOption(checkboxSelector, optionsKey, defaultValue, callback) {
    const check = document.querySelector(checkboxSelector);

    const query = {};
    query[optionsKey] = defaultValue;

    chrome.storage.sync.get(query, function (options) {
        check.checked = options[optionsKey];
    });

    check.addEventListener('click', function () {
        const query = {};
        query[optionsKey] = check.checked;

        chrome.storage.sync.set(query, function () {
            if(callback) {
                callback();
            }
        });
    }, {passive: true});
}

