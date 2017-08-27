/**
 * Created by haozhenghua on 16/11/16.
 */
angular.module('tiger.ctrl.job', ['tiger.api.job'])
    .config([
        '$stateProvider',
        '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider.state('jobList', {
                url: '/job/list',
                templateUrl: '/views/job/view.html',
                controller: 'jobCtrl',
                data: {
                    'title': 'job'
                }
            });
        }
    ]).controller('jobCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$uibModal',
    'ngToast',
    'jobService',
    function ($scope, $state, $stateParams, $uibModal, ngToast, jobService) {
        $scope.jobList = [];
        $scope.offset = 0;
        $scope.length = 30;
        jobService.list($scope.offset, $scope.length).then(function (data) {
            $scope.jobList = data;
        });

        $scope.update = function (jobId, state) {
            return jobService.update(jobId, state).then(function () {
                ngToast.success("成功")
            }).then(function () {
                jobService.list($scope.offset, $scope.length).then(function (data) {
                    $scope.jobList = data;
                });
            })
        };

        var refreshJobList = setInterval(function () {
            jobService.list($scope.offset, $scope.length).then(function (data) {
                $scope.jobList = data;
            });
        }, 30000);

        $scope.$on("$destroy", function () {
            clearInterval(refreshJobList);
        });

        $scope.newJob = function () {
            $uibModal.open({
                animation: false,
                templateUrl: 'views/job/new_job.html',
                controller: "newJobCtrl",
                resolve: {}
            }).result.then(function (data) {

            });
        };

    }
]).controller('newJobCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$uibModalInstance',
    'ngToast',
    'jobService',
    function ($scope, $state, $stateParams, $uibModalInstance, ngToast, jobService) {
        $scope.jobTypes = null;
        $scope.jobSubtypes = null;
        $scope.jobOtherInfos = null;
        $scope.selectedJobType = {};
        $scope.selectedJobSubtype = {};
        $scope.selectedJobOtherInfo = {};
        jobService.listJobTypes().then(function (data) {
            $scope.jobTypes = data;
        });
        $scope.listSubtype = function (id) {
            return jobService.listJobSubtypes(id).then(function (data) {
                $scope.jobSubtypes = data;
            }).then(function () {
                return jobService.listOtherInfo(id).then(function (data) {
                        $scope.jobOtherInfos = data;
                    }
                )
            })
        };

        $scope.isEmpty = function (value) {
            return Object.keys(value).length === 0;
        };
        $scope.$watch('selectedJobType.value', function (value) {
            if (value) {
                $scope.listSubtype(value)
            }
        }, true);
        $scope.ok = function () {
            if ($scope.isEmpty($scope.selectedJobType) || $scope.isEmpty($scope.selectedJobSubtype) || $scope.isEmpty($scope.selectedJobOtherInfo)) {
                ngToast.warning("内容错误，请检查后保存");
                return;
            }
            jobService.newJob($scope.selectedJobType.value,
                $scope.selectedJobSubtype.value,
                $scope.selectedJobOtherInfo.value).then(function () {
                ngToast.success("成功")
            });
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);
