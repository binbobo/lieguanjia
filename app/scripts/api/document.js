"use strict";
angular.module('tiger.api.document', [
    'tiger.api.base'
]).service('documentService', function (apiService) {

    this.delete = function (ids, feedback) {
        return apiService.post('/api/document/delete', {ids: ids},
            feedback == undefined ? true : feedback);
    };

    this.upload = function (ids, folderId, feedback) {
        var param = {
            ids: ids,
            folderId: folderId
        };
        return apiService.post('/api/document/upload', param, feedback == undefined ? true : feedback);
    };

    this.batchDelete = function (batchParam, feedback) {
        return apiService.post('/api/document/batchDelete', batchParam, feedback == undefined ? true : feedback);
    }
});
