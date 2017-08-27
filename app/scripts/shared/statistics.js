angular.module('angulartics.tiger', ['angulartics']).config(function ($analyticsProvider) {

    // both tiger and cnzz

    window._czc = window._czc || [];
    _czc.push(['_setAutoPageview', false]);


    var lastPath = null;
    $analyticsProvider.registerPageTrack(function (path, urlObj) {
        if (/^\/loading/g.test(path)) {
            return;
        }

        // console.log('from: ' + lastPath + ', to: ' + path);
        _czc.push(['_trackPageview', path]);
        apiService.tLog({to: path, from: lastPath});

        lastPath = path;
    });

    $analyticsProvider.registerEventTrack(function (action, prop) {
        _czc.push([
            '_trackEvent',
            prop.category,
            action,
            prop.label,
            prop.value,
            prop.nodeid
        ]);
    });

    nb.startTimeIt(5, 15, function (param) {
        apiService.tLog({time: param}, 'use_time');
    }, function () {
        return lastPath;
    })
});
