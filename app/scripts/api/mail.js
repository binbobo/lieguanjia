"use strict";
angular.module('tiger.api.mail', ['tiger.api.base']).service('mailService', function (apiService) {
    this.list = function (type, offset, length) {
        var param = {
            type: type,
            offset: offset,
            length: length
        };
        return apiService.get('/api/email/query', param);
    };

    this.receive = function () {
        return apiService.get('/api/email/receive');
    };

    this.detail = function (id) {
        var param = {
            id: id
        };
        return apiService.get('/api/email/detail', param);
    };

    this.groupCount = function () {
        return apiService.get('/api/email/groupCount');
    };

    this.send = function (mail, attIds, relationId, relationModuleId, feedback) {
        var param = {
            email: {
                id: mail.id,
                receiver: mail.receiver,
                cc: mail.cc,
                bcc: mail.bcc,
                subject: mail.subject,
                data: mail.data
            },
            attIds: attIds
        };
        if (!!relationId && !!relationModuleId) {
            param.relation = {relationId: relationId, moduleId: relationModuleId};
        }
        return apiService.post('/api/email/send', param, feedback == undefined ? true : feedback);
    };

    this.draft = function (mail, attIds, feedback) {
        var param = {
            email: {
                id: mail.id,
                receiver: mail.receiver,
                cc: mail.cc,
                bcc: mail.bcc,
                subject: mail.subject,
                data: mail.data
            },
            attIds: attIds
        };
        return apiService.post('/api/email/draft', param, feedback == undefined ? true : feedback);
    };

    this.starred = function (id, starred) {
        var param = {
            id: id,
            starred: starred
        };
        return apiService.get('/api/email/starred', param);
    };

    this.trash = function (id, trash, feedback) {
        var param = {
            id: id,
            trash: trash
        };
        return apiService.post('/api/email/trash', param, feedback == undefined ? true : feedback);
    };

    this.relationList = function (relationId, moduleId, offset, length) {
        var param = {
            relationId: relationId,
            moduleId: moduleId,
            offset: offset,
            length: length
        };
        return apiService.get('/api/email/relationList', param);
    };

    this.saveConfig = function (configParams, feedback) {
        return apiService.post('/api/email/config', configParams, feedback == undefined ? true : feedback);
    };

    this.getConfig = function () {
        return apiService.get('/api/email/config/detail');
    };

    this.isReceiving = function () {
        return apiService.get('/api/email/isReceiving');
    };

    this.listTemplate = function () {
        return apiService.get('/api/email/template/list');
    };

    this.listSelfTemplate = function (offset, length) {
        return apiService.get('/api/email/template/list/self', {offset: offset, length: length});
    };

    this.listGeneralTemplate = function (offset, length) {
        return apiService.get('/api/email/template/list/general', {offset: offset, length: length});
    };

    this.updateTemplate = function (template) {
        return apiService.post("/api/email/template/update", template);
    };

    this.saveSelfTemplate = function (template) {
        return apiService.post("/api/email/template/self/insert", template);
    };

    this.saveGeneralTemplate = function (template) {
        return apiService.post("/api/email/template/general/insert", template);
    };

    this.deleteTemplate = function (id) {
        return apiService.post("/api/email/template/delete", {id: id});
    };

    this.getSign = function () {
        return apiService.get("/api/email/sign/get");
    };

    this.updateSign = function (sign) {
        return apiService.post("/api/email/sign/update", {sign: sign})
    }


});
