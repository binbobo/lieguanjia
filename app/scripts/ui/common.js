"use strict";
angular.module('tiger.ui.common', []).directive('tigerLoading', function () {
    var loadingType = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4, 4, 4, 4][Math.floor(Math.random() * 20)];

    return {
        scope: {
            loading: '='
        },
        templateUrl: 'views/ui/loading.html',
        replace: true,
        controller: function ($scope, $element, $timeout, $attrs) {
            $scope.parent = $attrs.parent;
            var $parent;
            if ($scope.parent) {
                $parent = $element.closest($scope.parent);
            }

            if ($attrs.loadingType) {
                $scope.type = $attrs.loadingType;
            } else {
                $scope.type = loadingType;
            }

            $scope.$watch('loading', function (newValue, oldValue) {
                if (newValue) {
                    if ($parent) {
                        $parent.addClass('loading');
                    }
                    $element.show();
                } else {
                    $timeout(function () {
                        if ($parent) {
                            $parent.removeClass('loading');
                        }
                        $element.hide();
                    }, 0);
                }
            });
        }
    };
}).directive('helpHint', function () {
    return {
        templateUrl: 'views/ui/help_hint/main.html',
        replace: true,
        link: function ($scope, $element, $attrs) {
            $scope.helpType = 1;
            /**
             * 1 = simple
             * 2 = has more
             * 3 = with pic
             */

            $scope.hint = {};
            $scope.hint.message = $attrs.message;
            $scope.hint.link = $attrs.link;
            $scope.hint.download = $attrs.download;
            $scope.hint.picture = $attrs.picture;
            $scope.hint.appendToBody = $attrs.appendToBody || true; //default true

            $scope.placement = 'right';

            if ($scope.hint.download) {
                $scope.helpType = 4;
            } else if ($scope.hint.picture) {
                $scope.helpType = 3;
                $scope.placement = 'bottom';
            } else if ($scope.hint.link) {
                $scope.helpType = 2;
            } else {
                $scope.helpType = 1;
            }

            if ($scope.placement === 'right') {
                if ($(window).width() - $element.offset().left < 300) {
                    $scope.placement = 'left';
                }
            }
        }
    };
}).directive("uiFileUpload", function () {
    return {
        restrict: "A",
        link: function (scope, ele) {
            return ele.bootstrapFileInput();
        }
    };
});
