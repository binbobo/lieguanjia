"use strict";
angular.module('tiger.ctrl.check', ['ngTable', 'tiger.api.check']).config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('self_check', {
            url: '/self_check',
            templateUrl: 'views/check/self_check.html',
            controller: 'selfCheckCtrl'
        })
    }
]).controller('selfCheckCtrl', [
    '$scope',
    'checkService',
    function ($scope, checkService) {

        $scope.loading = true;

        $scope.checkResult = {};
        
        $scope.showMap = {
            "platformServer": "平台",
            "parserServer": "简历解析",
            "dbServer": "数据库",
            "hardware": "系统信息",
            "network": "网络信息",
            "systemParams": "系统参数"
        };

        checkService.selfCheck().then(function (response) {
            $scope.checkResult = response;
            $scope.checkResultKeys = Object.keys(response);
            $scope.loading = false;
        });
    }
])