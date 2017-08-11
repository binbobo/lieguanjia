"use strict";
angular.module('tiger.api.candidate', [
    'tiger.api.base'
]).service('candidateService', function ($q, apiService, uiModalService) {
    this.getCandidate = function (candidateId) {
        return apiService.get('/api/resume/detail', {
            id: candidateId
        });
    };

    this.getBasicCandidate = function (candidateId) {
        return apiService.get('/api/resume/detail/basic', {
            id: candidateId
        });
    };

    this.updateCandidate = function (resume, feedback) {
        return apiService.post('/api/resume/update', resume, feedback == undefined ? true : feedback)
    };

    this.parseCandidate = function (fileId) {
        return apiService.post('/api/resume/parse', {
            id: fileId
        });
    };

    this.checkDuplicate = function (resume) {
        return apiService.post('/api/resume/checkDuplicate', resume);
    };

    this.checkDuplicateAttachment = function (attachmentId, resumeId) {
        return apiService.get('/api/resume/duplicateAttachmentCheck', {
            attachmentId: attachmentId,
            resumeId: resumeId,
        });
    };

    this.listCandidate = function (offset, length) {
        offset = offset || 0;
        length = length || 20;

        return apiService.get('/api/resume/list_tester', {
            offset: offset,
            length: length,
        })
    };


    this.getCandidateFields = function (resumeType) {
        var resumeTypeValue = resumeType ? resumeType.value : 11;
        var result = {};

        return apiService.getFieldList(1, resumeTypeValue, 'basicInfo').then(function (data) {
            result.basicInfo = data;
            return apiService.getFieldList(1, resumeTypeValue, 'educationList');
        }).then(function (data) {
            result.educationList = data;
            return apiService.getFieldList(1, resumeTypeValue, 'occupationList');
        }).then(function (data) {
            result.occupationList = data;
            return apiService.getFieldList(1, resumeTypeValue, 'projectList');
        }).then(function (data) {
            result.projectList = data;

            return result;
        });
    };

    this.getUpdateLogs = function (resumeId) {
        return apiService.getFieldUpdateList(1, resumeId);
    };

    // this.esApi = function (json) {
    //     return apiService.post('/esapi/resume/resume/_search', json);
    // };

    this.updateField = function (item, name, id, value, candidateId) {
        return apiService.post('/api/resume/update/item', {
            moduleItem: item,
            name: name,
            id: id,
            newValue: value,
            indexId: candidateId
        });
    };

    this.deleteCandidate = function (resume, feedback) {
        return apiService.post('/api/resume/delete', resume, feedback == undefined ? true : feedback).then(function (data) {
            if (data == 0) {
                uiModalService.alert('删除失败');
            }
        }, function (data) {
            uiModalService.alert('删除失败');
        });
    };

    this.batchDelete = function (batchParam, feedback) {
        return apiService.post('/api/resume/batchDelete', batchParam, feedback == undefined ? true : feedback);
    };

    this.importBackground = function (template, state, dirPath) {
        var params = {
            template: template,
            state: state,
            dir: dirPath
        };
        return apiService.post('/api/resume/import/background', params);
    };

    this.getImportCount = function (dir) {
        return apiService.get('/api/resume/import/background/resume_count', {dir: dir});
    };

    this.getImportState = function () {
        return apiService.get('/api/resume/import/background/state');
    };

    this.cancelImport = function () {
        return apiService.get('/api/resume/import/cancel');
    };

    this.clearImportState = function () {
        return apiService.get('/api/resume/import/clear');
    };

    this.continueImport = function () {
        return apiService.get('/api/resume/import/continue');
    };

    this.getRecReport = function (templateId, candidateId, projectId) {
        return apiService.getRaw('/api/resume/recReport/generate', {
            templateId: templateId,
            resumeId: candidateId,
            projectId: projectId,
        });
    };

});
