window.addEventListener('load', init);

function init() {
    var check = document.querySelector('#show-sidebar');

    chrome.storage.sync.get({
        showSidebar: true
    }, function (options) {
        check.checked = options.showSidebar;
    });

    check.addEventListener('click', updateCheck);
}

function updateCheck(event, event2) {
    var check = document.querySelector('#show-sidebar');

    chrome.storage.sync.set({
        showSidebar: check.checked
    }, function () {
        //
    });
}