angular.module('tiger.api.license', []).service('licenseService', function (apiService) {
    this.updateSerialNumber = function (newSerialNumber) {
        return apiService.post('/api/license/updateSerialNumber', {
            serialNumber: newSerialNumber
        });
    };

    this.getSerialNumber = function () {
        return apiService.get('/api/license/getSerialNumber');
    }
});
