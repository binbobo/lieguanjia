angular.module('tiger.api.guide', [
    'tiger.api.base'
]).service('guideService', function (apiService) {

}).service('presetService', function (apiService) {
    this.status = function () {
        return apiService.get('/api/guide/preset/status');
    };

    this.add = function () {
        return apiService.post('/api/guide/preset/add');
    };

    this.delete = function () {
        return apiService.post('/api/guide/preset/delete');
    };
});
