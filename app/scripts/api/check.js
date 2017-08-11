angular.module('tiger.api.check', ['tiger.api.base']).service('checkService', function (apiService) {

    this.selfCheck = function () {
        return apiService.get('/api/check');
    };
});
