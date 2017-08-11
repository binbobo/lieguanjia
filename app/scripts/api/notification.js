angular.module('tiger.api.notification', ['tiger.api.base']).service('notificationService', function (apiService,
    accountService) {

    this.list = function (param) {
        param = angular.extend({
            type: null,
            read: null,
            startTime: null,
            endTime: null,
            offset: null,
            length: null
        }, param);
        return apiService.get('/api/notification', param);
    };

    this.typeList = function () {
        return apiService.get('/api/notification/typeList');
    };

    this.read = function (list) {
        if (typeof list == 'number' || typeof list == 'string') {
            list = [list];
        }
        return apiService.post('/api/notification/read', {
            list: list
        }).then(function (data) {
            accountService.heart();
            return data;
        });
    };

    this.readAll = function () {
        return apiService.post('/api/notification/readAll').then(function (data) {
            accountService.heart();
            return data;
        });
    };
});
