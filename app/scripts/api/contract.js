'use strict';
angular.module('tiger.api.contract', ['tiger.api.base']).service('contractService', function (apiService) {
    this.updateContract = function (contract, contractId, feedback) {
        return apiService.post('/api/companyContract/update', {contract: contract, id: contractId},
            feedback == undefined ? true : feedback)
    };

    this.getContract = function (contractId) {
        return apiService.get('/api/companyContract/detail', {id: contractId})
    };

    this.deleteContract = function (contractId, feedback) {
        return apiService.post('/api/companyContract/delete', {id: contractId},
            feedback == undefined ? true : feedback)
    };
});
