"use strict";
angular.module('tiger.api.setting', [
    'tiger.api.base'
]).service('settingService', function (apiService) {
    this.getFieldList = function (moduleId, moduleType, moduleItem) {
        return apiService.get('/api/field/list', {
            moduleId: moduleId,
            moduleType: moduleType,
            moduleItem: moduleItem,
        });
    };

    this.saveFieldList = function (moduleId, moduleType, moduleItem, list, feedback) {
        // return apiService.post('/api/field/update', {
        //     moduleId: moduleId,
        //     moduleType: moduleType,
        //     moduleItem: moduleItem,
        //     list: list
        // }, feedback == undefined ? true : feedback);
        return apiService.updateFieldList(moduleId, moduleType, moduleItem, list, feedback == undefined ? true : feedback);
    };

    this.getCommentFieldInfo = function (moduleId, all) {
        return apiService.get("api/field/queryForComment", {
            moduleId: moduleId,
            all: all
        });
    };

    this.saveCommentFieldInfo = function (moduleId, fields, moduleItem) {
        var param = {
            moduleId: moduleId,
            fields: fields,
            moduleItem: moduleItem
        };
        return apiService.post("api/field/updateSingleForComment", param);
    };

    this.deleteCommentFieldInfo = function (itemId) {
        return apiService.post("api/field/deleteForComment", {
            id: itemId
        });
    };

    this.setDataList = function (type, list) {
        // return apiService.post('/api/data/update', {
        //     type: type,
        //     list: list
        // });
        return apiService.updateDataList(type, list);
    };

    this.setGeneralItem = function (listType, fieldItem, list, feedback) {
        if (listType != 0) {
            return apiService.post('/api/data/update', {
                type: listType,
                list: list
            }, feedback == undefined ? true : feedback);
        }
        if (fieldItem != 0) {
            return apiService.post('/api/field/itemList/update', {
                fieldId: fieldItem,
                list: list
            }, feedback == undefined ? true : feedback);
        }
    };

    this.roleDetail = function (roleId) {
        return apiService.get('/api/role/detail', {
            id: roleId
        });
    };

    this.saveRole = function (role, feedback) {
        return apiService.post('/api/role/update', role, feedback == undefined ? true : feedback);
    };

    this.deleteRole = function (roleId) {
        return apiService.post('/api/role/delete', {id: roleId});
    };

    this.shiftRole = function (originRoleId, targetRoleId) {
        return apiService.post('/api/role/shift', {
            originRoleId: originRoleId,
            targetRoleId: targetRoleId
        })
    };

    this.roleList = function () {
        return apiService.get('/api/role/list');
    };

    this.permissionList = function () {
        return apiService.get('/api/permission/list');
    };

    this.getKPIList = function () {
        return apiService.get('/api/statistic/kpi/brief/list')
    };
    this.getKPIDetail = function (kpiId) {
        return apiService.get('/api/statistic/kpi/detail', {id: kpiId})
    };
    this.getKPITemplate = function () {
        return apiService.get('/api/statistic/kpi/template')
    };
    this.updateKPI = function (kpi) {
        return apiService.post('/api/statistic/kpi/update', kpi)
    };
    this.deleteKPI = function (id) {
        return apiService.post('/api/statistic/kpi/delete', {id: id})
    };
    this.getRecReportList = function (offset, length) {
        return apiService.get('/api/resume/recReport/list', {
            offset: offset,
            length: length
        })
    };
    this.deleteRecReport = function (tid) {
        return apiService.post('/api/resume/recReport/delete', {tid: tid})
    };

    this.settingList = function () {
        return apiService.get('/api/setting/data');
    };

    this.saveSetting = function (param, value) {
        return apiService.post('/api/setting/update', {param: param, value: value}, true);
    };

    this.getActionReport = function (offset, length, startTime, endTime) {
        return apiService.get('/api/statistic/report/action', {
            offset: offset,
            length: length,
            startTime: startTime,
            endTime: endTime
        });
    };
});
