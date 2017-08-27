angular.module('tiger.ctrl.about', []).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('release_note', {
        url: '/releaseNote',
        templateUrl: 'views/about/release_note.html',
        data: {
            title: '版本说明'
        },
        controller: function ($rootScope, $element) {
            $rootScope.updateViewVersion();

            $element.find('.release-body').each(function (index) {
                if (index < 3) {
                    return;
                }
                $(this).addClass('collapsed');
            });

            $element.on('click', '.release-body h3', function () {
                // $(this).closest('.release-body').toggleClass('collapsed');
                $(this).closest('.release-body').removeClass('collapsed');
            });
        }
    });

    // $stateProvider.state('release_note_dev', {
    //     url: '/releaseNoteDev',
    //     templateUrl: 'views/about/release_note_dev.html',
    //     data: {
    //         title: '版本说明(DEV)'
    //     }
    // });
}).directive('dev', function () {
    return {
        template: '<div class="dev" title="dev note" ng-transclude></div>',
        replace: true,
        transclude: true
    };
}).directive('releaseNote', function () {
    return {
        template: '<div class="panel-body release-body">' +
        '<h3 ng-if="::versionMain">{{::versionMain}} <small>({{::versionSub}})</small></h3>' +
        '<div ng-transclude></div><i class="fa fa-cloud-upload background-icon"></i></div>',
        replace: true,
        transclude: true,
        scope: {
            'versionMain': '@',
            'versionSub': '@'
        }
    }
}).directive('releasePart', function () {
    return {
        template: '<h4 ng-bind="partName"></h4><ol ng-transclude></ol>',
        transclude: true,
        scope: {
            'partName': '@'
        }
    };
});
