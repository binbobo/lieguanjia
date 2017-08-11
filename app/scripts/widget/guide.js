angular.module('tiger.widget.guide', []).directive('userGuide', function () {
    return {
        templateUrl: 'views/guide/wrap.html',
        replace: true,
        controller: 'userGuideCtrl'
    };
}).controller('userGuideModalCtrl', function ($scope, $uibModalInstance) {
    $scope.ok = function (data) {
        $uibModalInstance.close(data);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };
}).controller('userGuideCtrl', function ($scope, $rootScope, $window, $q, $uibModal, accountService) {
    $scope.stepNo = -1;

    $scope.resolve = null;
    $scope.reject = null;

    $scope.closeGuide = function () {
        $rootScope.account.isFresh = 0;
        return accountService.setIsFresh(0);
    };

    $scope.step1 = function () {
        return $uibModal.open({
            animation: false,
            backdrop: 'static',
            templateUrl: 'views/guide/step1.html',
            windowClass: 'modal-center',
            controller: 'userGuideModalCtrl'
        }).result;
    };

    $scope.step2 = function () {
        return $uibModal.open({
            animation: false,
            backdrop: 'static',
            templateUrl: 'views/guide/step2.html',
            controller: 'userGuideModalCtrl'
        }).result;
    };

    $scope.step3 = function () {
        return $q(function (resolve, reject) {
            $scope.stepNo = 3;
            $scope.resolve = resolve;
            $scope.reject = reject;
        });
    };

    $scope.step4 = function () {
        return $q(function (resolve, reject) {
            $scope.stepNo = 4;
            $scope.resolve = resolve;
            $scope.reject = reject;
        });
    };

    $scope.step5 = function () {
        return $q(function (resolve, reject) {
            $scope.stepNo = 5;
            $scope.resolve = resolve;
            $scope.reject = reject;
        });
    };

    $rootScope.startUserGuide = function () {
        $scope.step1().then(function () {
            // if ($rootScope.tigerInfo.saas && $rootScope.tigerInfo.saas.isTrial) {
            //     return $scope.step2();
            // } else {
            //     return null;
            // }
        }).then(function (data) {
            // if (data === true) {
            //     // 导入数据
            // }
            return $scope.step3();
        }).then(function () {
            return $scope.step4();
        }).then(function () {
            if ($rootScope.tigerInfo.saas) {
                // 判断邀请权限
                return $scope.step5();
            }
        }).then(function () {
            $scope.stepNo = -1;

            $scope.closeGuide();
        }, function () {
            $scope.stepNo = -1;

            $scope.closeGuide();
        });
    };

    $window.tiger.startUserGuide = $rootScope.startUserGuide;
});
