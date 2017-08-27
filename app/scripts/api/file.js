"use strict";
angular.module('tiger.api.file', ['tiger.api.base']).service('fileService', function (apiService) {

    this.detail = function (id) {
        return apiService.get('/api/file/detail', {
            id: id
        });
    };

    this.list = function (rid, type) {
        var param = {
            rid: rid,
            type: type
        };
        return apiService.get('/api/attachment/list', param);
    };

    this.att_count = function (ridList, type) {
        var param = {
            ridList: ridList,
            type: type
        };
        return apiService.post('/api/attachment/attCount', param);
    };

    this.listIds = function (rid, type) {
        var param = {
            rid: rid,
            type: type
        };
        return apiService.get('/api/attachment/list_ids', param);
    };
});
