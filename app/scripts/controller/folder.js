"use strict";
angular.module('tiger.ctrl.folder', ['ngTable', 'ui.router', 'tiger.api.folder']).config(function ($stateProvider,
                                                                                                   $urlRouterProvider) {
    $stateProvider
        .state('folder', {
            url: '/folder/tree',
            templateUrl: 'views/folder/tree.html',
            controller: 'folderEditCtrl'
        })
}).service('folderModalService', function ($uibModal, folderService) {
    this.selectFolder = function (relationId, isEdit, moduleId) {

        return this.selectFolderBySelectData(
            folderService.getRelationIds(relationId, moduleId + 900).then(function (data) {
                var result = {};
                angular.forEach(data, function (item) {
                    result[item] = 1;
                });
                return result;
            }), isEdit, moduleId
        ).then(function (selected) {
            if (!angular.isObject(selected)) {
                return;
            }
            var tmp = [];
            angular.forEach(selected, function (item, key) {
                if (item == 1) {
                    tmp.push(key);
                }
            });
            folderService.joinFolder(moduleId + 900, tmp, relationId);
        });
    };

    this.selectFolderBySelectData = function (selectedData, isEdit, moduleId) {
        return $uibModal.open({
            animation: true,
            templateUrl: 'views/folder/tree.html',
            controller: "folderEditCtrl",
            resolve: {
                folderInfo: function () {
                    return {
                        isEdit: isEdit,
                        moduleId: moduleId
                    }
                },
                selectedData: selectedData
            }
        }).result;
    }
}).controller('folderEditCtrl', function ($scope, $rootScope, $uibModal, $stateParams, folderService, folderModalService, $uibModalInstance,
                                          folderInfo, selectedData) {
    $scope.forEdit = folderInfo.isEdit;
    $scope.moduleId = folderInfo.moduleId;
    $scope.folderType = $scope.moduleId + 900;

    $scope.isEdit = folderInfo.isEdit;
    $scope.fromModal = false;

    if (!$scope.isEdit) {
        // $scope.relationId = recReportData.relationId;
    }

    $scope.loading = true;

    $scope.treeData = [];
    $scope.oldTreeData = [];
    $scope.selected = {};//非编辑状态下选择的itemId
    $scope.selected = selectedData;

    $scope.getFullTree = function () {
        folderService.treeFull($scope.moduleId).then(function (data) {
            $scope.treeData = data;
            $scope.oldTreeData = angular.copy(data);

            $scope.loading = false;
            // if ($scope.relationId) {
            //     return folderService.getRelationIds($scope.relationId, $scope.folderType);
            // }
        });
    };

    $scope.toggle = function (scope) {
        scope.toggle();
    };

    $scope.newItem = function (root) {
        var item = {id: 0, title: '', permissionType: 1, type: $scope.folderType, children: []};
        $scope.editFolder(item, root);
    };

    $scope.saveList = function () {
        folderService.saveTree($scope.folderType, $scope.treeData).then(function () {
            $scope.getFullTree();
        });
    };

    $scope.checkPermission = function (item) {
        if ($rootScope.account.id == 1) {
            return true;
        }
        if (item.creatorId == $rootScope.account.id) {
            return true;
        }
        return false;
    };

    $scope.getFullTree();

    $scope.editFolder = function (item, parentScope) {
        if (!item) {
            item = {
                id: 0,
                title: '',
                permissionType: 1,
                fatherId: parentScope.$modelValue.id,
                type: $scope.folderType,
                children: []
            };
        }

        $uibModal.open({
            animation: false,
            templateUrl: 'folderDetailEditModal.html',
            controller: "folderDetailEditCtrl",
            resolve: {
                folderData: function () {
                    return item;
                }
            }
        }).result.then(function () {
            $scope.getFullTree();
        });
    };

    $scope.updateSelection = function (id) {
        if ($scope.selected[id] != 1) {
            $scope.selected[id] = 1;
        } else {
            $scope.selected[id] = 0;
        }
    };

    $scope.ok = function () {
        $uibModalInstance.close($scope.selected);
    };

    $scope.confirm = function () {
        if ($scope.fromModal) {
            $scope.back();
        } else {
            folderService.saveTree($scope.folderType, $scope.treeData).then(function () {
                $uibModalInstance.close();
            });
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.back = function () {
        $scope.isEdit = false;
        $scope.fromModal = false;
        folderService.saveTree($scope.folderType, $scope.treeData);
    };

    $scope.edit = function () {
        $scope.isEdit = true;
        $scope.fromModal = true;
    }

}).controller('folderDetailEditCtrl', function ($scope, $uibModalInstance, folderData, config, folderService,
                                                apiService, uiModalService) {

    $scope.fieldsInfo = config.folderFields;

    //copy
    $scope.folderData = angular.fromJson(angular.toJson(folderData));
    if (!$scope.folderData.shareInfoList) {
        $scope.folderData.shareInfoList = [];
    }
    $scope.teamList = [];
    $scope.userList = [];

    $scope.permissionTypeList = [1, 2];
    $scope.permissionTypeMap = {1: "查看", 2: "编辑"};
    $scope.shareTypeList = [1, 2, 3];
    $scope.shareTypeMap = {1: "所有人", 2: "团队", 3: "同事"};

    //项目中文件夹不可分享
    $scope.canShare = $scope.folderData.type != 902;

    $scope.ok = function () {
        if (!$scope.verify()) {
            return;
        }
        folderService.updateDetail($scope.folderData).then(function (folderId) {
            if ($scope.folderData.id) {
                $scope.folderData.id = folderId;
            }
            $uibModalInstance.close();
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.removeItem = function (index) {
        $scope.folderData.shareInfoList.splice(index, 1);
    };

    $scope.addItem = function () {
        $scope.folderData.shareInfoList.push({});
    };

    $scope.verify = function () {
        var verifyOk = true;
        if ($scope.folderData.title.length < 1) {
            verifyOk = false;
            $scope.folderData.invalid = true;
        }
        if ($scope.canShare && $scope.folderData.shareInfoList && $scope.folderData.shareInfoList.length > 0) {
            for (var i = 0; i < $scope.folderData.shareInfoList.length; i++) {
                var item = $scope.folderData.shareInfoList[i];
                if (!item.shareType || (item.shareType == 2 && !item.teamItems) || (item.shareType == 3 && !item.colleagueItem)) {
                    verifyOk = false;
                    item.invalid = true;
                }
            }
        }
        return verifyOk;
    };

    $scope.changeShareType = function (item) {
        item.shareTargetId = 0;
        item.display = null;
    };
});
