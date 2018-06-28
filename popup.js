window.addEventListener('load', init);

function init() {
    registerOption('#show-sidebar', 'showSidebar', true);
    registerOption('#default-gif-sound', 'enableGifSound', false);
}

function registerOption(checkboxSelector, optionsKey, defaultValue, callback) {
    var check = document.querySelector(checkboxSelector);

    var query = {};
    query[optionsKey] = defaultValue;

    chrome.storage.sync.get(query, function (options) {
        check.checked = options[optionsKey];
    });

    check.addEventListener('click', function () {
        var query = {};
        query[optionsKey] = check.checked;

        chrome.storage.sync.set(query, function () {
            if(callback) {
                callback();
            }
        });
    });
}

