"use strict";
angular.module('tiger.api.channel', [
    'tiger.api.base'
]).service('channelService', function (apiService) {

    this.detail = function (id) {
        return apiService.get('/api/channel/account', {id: id});
    };

    this.list = function () {
        return apiService.get('/api/channel/account/list');
    };

    this.update = function (account, feedback) {
        var params = {
            type: account.type.title,
            account: account.account,
            password: account.password
        };
        return apiService.post('/api/channel/account/bind', params, feedback == undefined ? true : feedback);
    };

    this.unBind = function (id, feedback) {
        return apiService.post('/api/channel/account/unBind', {id: id}, feedback == undefined ? true : feedback);
    };

    this.import = function (id, feedback) {
        return apiService.post('/api/channel/job/import', {id: id}, feedback == undefined ? true : feedback);
    };

    this.importState = function () {
        return apiService.get('api/channel/job/state');
    };

    this.getJob = function (id) {
        return apiService.get('/api/channel/job/detail', {id: id});
    };

    this.getJobTypeCounts = function () {
        return apiService.get('/api/channel/job/count');
    }

});
