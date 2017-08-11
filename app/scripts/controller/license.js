angular.module('tiger.ctrl.license', [
    'tiger.api.license'
]).config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('license_edit', {
            url: '/license/edit',
            templateUrl: 'views/license/edit.html',
            controller: 'LicenseEditCtrl'
        });

        $stateProvider.state('license_error', {
            url: '/license/error',
            templateUrl: 'views/license/error.html',
        });
    }
]).controller('LicenseEditCtrl', [
    '$scope',
    '$state',
    'ngToast',
    'licenseService',
    function ($scope, $state, ngToast, licenseService) {
        $scope.newSerialNumber = null;
        $scope.loading = false;
        $scope.errorMsg = null;

        licenseService.getSerialNumber().then(function (data) {
            $scope.newSerialNumber = data.result;
        });

        $scope.updateSerialNumber = function () {
            if ($scope.loading) {
                return;
            }

            $scope.errorMsg = null;
            
            $scope.loading = true;
            licenseService.updateSerialNumber($scope.newSerialNumber).then(function (data) {
                $scope.loading = false;
                ngToast.warning("注册码验证成功");
                $state.go('login');
            }, function (err) {
                $scope.loading = false;
                $scope.errorMsg = err.error;
            });
        };
    }
]);
