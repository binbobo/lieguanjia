"use strict";
angular.module('tiger.ui.modal', ['tiger.api.comment', 'tiger.api.folder']).controller('SimpleModalCtrl', function ($scope,
    $uibModalInstance, modalCustom) {
    $scope.custom = {
        title: null,
        content: null,
        okBtnText: '确定',
        okBtnClass: 'btn btn-success',
        cancelBtnText: '取消',
        cancelBtnClass: 'btn btn-default'
    };

    modalCustom && angular.extend($scope.custom, modalCustom);

    $scope.ok = function (data) {
        $uibModalInstance.close(data);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };
}).service('uiModalService', function ($uibModal) {
    this.yesOrNo = function (config) {
        return $uibModal.open({
            animation: false,
            templateUrl: 'views/modal/yes_or_no.html',
            controller: 'SimpleModalCtrl',
            size: 'sm',
            resolve: {
                modalCustom: function () {
                    return config;
                }
            }
        }).result;
    };

    this.alert = function (config, noBackdrop) {
        if (typeof config == 'string') {
            config = {
                title: config
            }
        }

        config = angular.extend({
            okBtnClass: 'btn btn-warning'
        }, config);

        return $uibModal.open({
            animation: false,
            backdrop: !noBackdrop,
            templateUrl: 'views/modal/alert.html',
            controller: 'SimpleModalCtrl',
            size: 'sm',
            resolve: {
                modalCustom: function () {
                    return config;
                }
            }
        }).result;
    };

    this.simpleInput = function (config) {
        if (typeof config == 'string') {
            config = {
                title: config
            }
        }

        return $uibModal.open({
            animation: false,
            templateUrl: 'views/modal/simple_input.html',
            controller: 'SimpleModalCtrl',
            size: 'sm',
            resolve: {
                modalCustom: function () {
                    return config;
                }
            }
        }).result;
    };

    this.editComment = function (relationId, moduleId, commentId) {
        return $uibModal.open({
            animation: true,
            templateUrl: 'views/comment/edit.html',
            controller: "commentEditCtrl",
            resolve: {
                recReportData: function () {
                    return {
                        relationId: relationId,
                        moduleId: moduleId,
                        commentId: commentId
                    };
                }
            }
        }).result;
    };
});
