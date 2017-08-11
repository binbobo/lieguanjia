"use strict";
angular.module('tiger.ctrl.comment', ['ngTable', 'tiger.api.comment']).config(function ($stateProvider) {
    //4
    $stateProvider.state('candidate_view.commentList', {
        url: '/commentList',
        templateUrl: 'views/comment/list.html',
        controller: 'commentListCtrl',
        data: {
            key: 'candidateId',
            moduleId: 4
        }
    });

    //6
    $stateProvider.state('company_view.commentList', {
        url: '/commentList',
        templateUrl: 'views/comment/list.html',
        controller: 'commentListCtrl',
        data: {
            key: 'companyId',
            moduleId: 6
        }
    });

    //5
    $stateProvider.state('project_view.commentList', {
        url: '/commentList',
        templateUrl: 'views/comment/list.html',
        controller: 'commentListCtrl',
        data: {
            key: 'projectId',
            moduleId: 5
        }
    });
}).controller('commentEditCtrl', function ($scope, $uibModalInstance, ngToast,
                                           apiService, commentService, settingService, recReportData, uiModalService) {

    $scope.relationId = recReportData.relationId;
    $scope.moduleId = recReportData.moduleId;
    $scope.commentId = recReportData.commentId;

    $scope.commentData = {
        relationId: $scope.relationId,
        moduleId: $scope.moduleId
    };
    $scope.commentCustomData = {};

    $scope.config.commentFields.typeFieldInfo.itemList = null;
    $scope.config.commentFields.subtypeFieldInfo.itemList = null;

    $scope.customForm = {};

    if (!$scope.relationId || !$scope.moduleId) {
        uiModalService.alert("参数错误");
        return;
    }

    function initCommentData() {
        if ($scope.commentId < 1) {
            initFieldInfo();
            return;
        }
        commentService.get($scope.commentId).then(function (data) {
            $scope.commentData = data;
            $scope.commentCustomData = angular.fromJson(data.data);
            initFieldInfo();
        });
    }

    function initFieldInfo() {
        settingService.getCommentFieldInfo($scope.moduleId, 0).then(function (data) {
            $scope.config.commentFields.typeFieldInfo.itemList = data.moduleItems;
            $scope.customForm = data.fields;
            if (!$scope.commentData.typeItem) {
                $scope.commentData.typeItem = data.moduleItems[0];
            }
            if ($scope.moduleId == 4) {
                apiService.getDataList(301).then(function (data) {
                    $scope.config.commentFields.subtypeFieldInfo.itemList = data.list;
                });
            }
        });
    }

    $scope.ok = function () {
        if (!$scope.commentData.typeItem) {
            ngToast.warning("请选择备注类型");
            return;
        }
        $scope.commentInfo.$setSubmitted();
        if (!$scope.commentInfo.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }
        $scope.commentData.data = angular.toJson($scope.commentCustomData);
        commentService.update($scope.commentData).then(function () {
            $uibModalInstance.close();
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    initCommentData();
}).controller('commentListCtrl', function ($rootScope, $scope, $state, $stateParams, uiModalService, $uibModal, commentService,
                                           settingService) {

    $scope.list = [];
    $scope.allListMap = {
        0: []
    };

    // $scope.relationId = $stateParams.relationId;
    // $scope.moduleId = $stateParams.moduleId;
    $scope.relationId = $stateParams[$state.current.data.key] || $scope.relationId; // 取路由参数或者通过preview传递过来的参数
    $scope.moduleId = $state.current.data.moduleId || $scope.moduleId;

    $scope.customForm = {};
    $scope.commentCustomData = {};

    $scope.typeItemList = null;

    $scope.selectType = 0;

    $scope.changeType = function (newType) {
        $scope.selectType = newType;
    };

    if ($scope.relationId < 1 || $scope.moduleId < 1) {
        uiModalService.alert("初始化异常");
        return;
    }

    $scope.allListMap = {
        0: []
    };

    function initCommentData() {
        settingService.getCommentFieldInfo($scope.moduleId, 0).then(function (data) {
            $scope.typeItemList = data.moduleItems;
            $scope.customForm = data.fields;
            angular.forEach($scope.customForm, function (field) {
                angular.forEach(field, function (item) {
                    item.hideNode = 1;
                });
            });

            return commentService.list($scope.relationId, $scope.moduleId);
        }).then(function (data) {
            $scope.allListMap = {
                0: []
            };

            angular.forEach(data, function (item) {
                item.commentCustomData = angular.fromJson(item.data);
                if (!$scope.allListMap[item.type])
                    $scope.allListMap[item.type] = [];
                $scope.allListMap[item.type].push(item);
                $scope.allListMap[0].push(item);
            });
        });
    }

    $scope.delete = function (id) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function () {
            return commentService.delete(id);
        }).then(commentChangeSuccess);
    };

    $scope.edit = function (id) {
        uiModalService.editComment(
            $scope.relationId, $scope.moduleId, id, $uibModal
        ).then(commentChangeSuccess);
    };

    function commentChangeSuccess() {
        if ($state.current.name === 'candidate_view.commentList') {
            $state.reload();
        } else if ($scope.showType === 'resume') {
            // resume
            $rootScope.$broadcast('$resumeInfoChange');
        } else if ($scope.showType === 'comment') {
            $rootScope.$broadcast('$commentInfoChange');
        }
    }

    initCommentData();
});
