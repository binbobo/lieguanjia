angular.module('tiger.ctrl.notification', []).config(function ($stateProvider) {
    $stateProvider.state('notification_list', {
        url: '/notification?{type:int}&{read:int}&{start:int}&{end:int}',
        templateUrl: 'views/notification/list.html',
        controller: 'notificationListCtrl',
        data: {
            title: '通知列表'
        }
    });
}).directive('notificationCard', function () {
    return {
        templateUrl: 'views/notification/card.html',
        replace: true,
        scope: {
            notification: '=',
        },
        link: function () {
        },
        controller: function ($scope, notificationService) {
            $scope.readNotification = function () {
                notificationService.read($scope.notification.id);
                $scope.notification.read = 1;
            };
        }
    };
}).directive('notificationContent', function ($rootScope, notificationService) {
    return {
        templateUrl: 'views/notification/content.html',
        scope: {
            notification: '='
        },
        link: function ($scope) {
            $scope.content = $scope.notification.content;
            $scope.contentType = $scope.notification.contentType;
            $scope.linkNewWindow = ($scope.content.linkHref && $scope.content.linkHref.indexOf('://') !== -1);

            $scope.clickNotification = function () {
                if ($rootScope.hideNotificationDropdown) {
                    $rootScope.hideNotificationDropdown();
                }
                if ($scope.$parent.readNotification) {
                    $scope.$parent.readNotification();
                } else {
                    notificationService.read($scope.notification.id);
                    $scope.notification.read = 1;
                }
            };
        }
    }
}).controller('notificationListCtrl', function ($scope, notificationService) {
    $scope.notificationTypeList = [];
    $scope.notificationList = [];

    $scope.condition = {
        selectType: null,
        read: '0'
    };

    $scope.pageState = {
        page: 1,
        listLength: 25,
        totalAvailable: 0
    };

    $scope.read = function (notification) {
        notificationService.read(notification.id).then(function () {
            notification.read = 1;
        });
    };

    $scope.readAll = function () {
        notificationService.readAll().then(function () {
            if ($scope.condition.read == '-1') {
                updateList();
            } else {
                $scope.condition.read = '-1';
            }
        });
    };

    var updateList = function () {
        return notificationService.list({
            offset: ($scope.pageState.page - 1) * $scope.pageState.listLength,
            length: $scope.pageState.listLength,
            type: $scope.condition.selectType,
            read: $scope.condition.read
        }).then(function (data) {
            $scope.notificationList = data.list;
            $scope.pageState.totalAvailable = data.total;
            return data;
        });
    };

    $scope.$watch('pageState.page', function (newValue, oldValue) {
        if (newValue == oldValue) {
            return;
        }
        updateList();
    });

    $scope.$watch('condition', function (newValue, oldValue) {
        if (newValue == oldValue) {
            return;
        }
        updateList();
    }, true);

    notificationService.typeList().then(function (data) {
        $scope.notificationTypeList = data.list;
    });

    updateList().then(function (data) {
        if (data.total == 0) {
            $scope.condition.read = '-1'
        }
    });
});
