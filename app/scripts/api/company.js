/**
 * Created by haozhenghua on 16/4/6.
 */
'use strict';
angular.module('tiger.api.company', ['tiger.api.base']).service('companyService', function (apiService) {
    this.updateCompany = function (company, feedback) {
        return apiService.post('/api/company/update', company, feedback == undefined ? true : feedback);
    };

    this.getCompany = function (companyId) {
        return apiService.get('/api/company/detail', {id: companyId});
    };

    this.getCompanyWithoutPermission = function (companyId) {
        return apiService.get('/api/company/detail/withoutPermission', {id: companyId});
    };

    this.getOnJobAndLeaveJobResumeIds = function (companyId) {
        return apiService.get('/api/company/list/resumeIds', {companyId: companyId});
    };

    this.getUpdateLogs = function (companyId) {
        return apiService.getFieldUpdateList(3, companyId);
    };
    this.deleteCompany = function (companyId, feedback) {
        return apiService.post('/api/company/delete', {id: companyId}, feedback == undefined ? true : feedback);
    };

    this.batchDelete = function (batchParam, feedback) {
        return apiService.post('/api/company/batchDelete', batchParam, feedback == undefined ? true : feedback);
    };

    this.updateField = function (item, name, id, value, companyId) {
        return apiService.post('/api/company/update/item', {
            moduleItem: item,
            name: name,
            id: id,
            newValue: value,
            indexId: companyId
        });
    };
});
