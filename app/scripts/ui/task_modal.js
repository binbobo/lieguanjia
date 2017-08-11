"use strict";
angular.module('tiger.ui.task_modal', [
    'tiger.api.task'
]).controller('taskEditCtrl', function ($scope, $uibModalInstance, ngToast, config, calendarData, uiModalService,
                                        taskService) {
    $scope.oldData = angular.copy(calendarData);
    $scope.calendarData = calendarData;

    $scope.ok = function () {
        $scope.taskForm.$setSubmitted();
        if (!$scope.taskForm.$valid) {
            ngToast.warning(config.hint.formError);
            return;
        }

        taskService.updateTask($scope.calendarData).then(function () {
            $uibModalInstance.close($scope.calendarData);
        });
    };

    $scope.delete = function () {
        uiModalService.yesOrNo({
            title: '您确认要删除吗？',
            okBtnText: '确认',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function () {
            return taskService.delete($scope.calendarData.id).then(function () {
                $uibModalInstance.close();
            });
        });
    };

    $scope.cancel = function () {
        $scope.calendarData = $scope.oldData;
        $uibModalInstance.dismiss('cancel');
    };
}).service('taskModal', function ($uibModal, $rootScope, taskService) {

    this.edit = function (item) {
        var cacheItem = angular.copy(item);

        if (!cacheItem.id) {
            if (!cacheItem.participants || cacheItem.participants.length === 0) {
                cacheItem.participants = [{
                    id: $rootScope.account.id,
                    value: $rootScope.account.id,
                    title: $rootScope.account.name,
                    type: 800,
                    i18n: null,
                    color: null,
                    order: null,
                    time: 0,
                    children: null
                }];
            }

            if (!cacheItem.datetimeRange) {
                var tmpDate = new Date();
                tmpDate.setSeconds(0, 0);
                cacheItem.datetimeRange = {
                    Fstart_time: tmpDate.getTime() / 1000 + 600,
                    Fend_time: tmpDate.getTime() / 1000 + 4200
                };
            }
        }

        return $uibModal.open({
            animation: false,
            backdrop: false,
            templateUrl: 'views/task/modal/edit.html',
            controller: "taskEditCtrl",
            resolve: {
                calendarData: function () {
                    return cacheItem;
                }
            }
        }).result;
    };

});
