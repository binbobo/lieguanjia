"use strict";
angular.module('tiger.api.folder', ['tiger.api.base']).service('folderService', function (apiService) {

    this.treeFull = function (moduleId) {
        moduleId = parseInt(moduleId);
        return apiService.get('/api/folder/treeFull', {
            type: 900 + moduleId
        });
    };

    this.tree = function (type) {
        return apiService.get('/api/folder/tree', {type: type});
    };

    this.updateDetail = function (folder) {
        if (folder.shareInfoList) {
            angular.forEach(folder.shareInfoList, function (item, index) {
                if (item.shareType == 3 && item.colleagueItem != null) {
                    folder.shareInfoList[index].shareTargetId = item.colleagueItem.id;
                } else if (item.shareType == 2 && item.teamItems != null) {
                    folder.shareInfoList[index].shareTargetId = item.teamItems[0].id;
                }
            });
        }
        return apiService.post('/api/folder/updateDetail', folder);
    };

    this.saveTree = function (type, list) {
        var param = {
            type: type,
            data: list
        };
        return apiService.post('/api/folder/treeUpdate', param);
    };

    this.joinFolder = function (type, folderIds, relationId, feedback) {
        var param = {
            type: type,
            folderIds: folderIds,
            relationId: relationId
        };
        return apiService.post('/api/folder/joinFolder', param, feedback == undefined ? true : feedback);
    };

    this.getRelationIds = function (relationId, type) {
        var param = {
            type: type,
            relationId: relationId
        };
        return apiService.get('/api/folder/getRelationIds', param);
    };

    this.getJoinedFolderByList = function (list, moduleId) {
        var param = angular.extend(list, {
            moduleId: moduleId
        });
        return apiService.post('/api/folder/getJoinedFolder', param);
    };

    this.batchJoinFolder = function (moduleId, selectFolderData, batchParam, feedback) {
        var param = {
            moduleId: moduleId,
            selectFolderData: selectFolderData
        };
        if (batchParam.ids) {
            param.ids = batchParam.ids;
        } else {
            param.searchParam = batchParam.searchParam;
        }
        return apiService.post('/api/folder/batchJoinFolder', param, feedback == undefined ? true : feedback);
    };
});
