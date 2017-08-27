"use strict";
angular.module('tiger.api.base', []).service('apiService', function ($rootScope, $http, $q, $log, $state, ngToast,
                                                                     localize, uiModalService) {
    window.apiService = this;

    this.eventFrontExpired = 'front_expired';

    var handleError = function (err) {
        if (err.data.code === 1011 || err.data.code === 1010) {
            $rootScope.goToLogin();
            throw {
                code: err.data.code,
                error: err.data.result.error
            };
        }

        if (err.data.code === 1100) {
            ngToast.warning("没有注册码");
            $state.go('license_edit');
            throw {
                code: err.data.code,
                error: err.data.result.error
            };
        }

        if (err.data.code === 1101 || err.data.code === 1102 || err.data.code === 1103) {
            $state.go('license_error');
            throw {
                code: err.data.code,
                error: err.data.result.error
            };
        }

        if (err.data.code === 1017) {
            uiModalService.alert({
                okBtnText: '知道了',
                title: err.data.result.error
            });
            throw {
                code: err.data.code,
                error: err.data.result.error
            };
        }

        if (err.status === 400) {
            uiModalService.alert(err.data.result.error);
            throw {
                code: err.data.code,
                error: err.data.result.error
            };
        }

        if (err.status === 403) {
            uiModalService.alert(err.data.result.error);
            throw {
                code: err.data.code,
                error: err.data.result.error
            };
        }

        if (err.status === 404) {
            uiModalService.alert("内容不存在或已删除");
            throw {
                code: err.status
            };
        }

        if (err.status < 500 && err.status !== 403) {
            uiModalService.alert("发生致命错误");
            throw {
                code: err.status
            };
        }

        if (err.data.code < 1000) {
            uiModalService.alert("发生内部错误");
            throw err.data.result;
        }
        throw err.data.result;
    };

    var lastHttpRequestVersion = null;

    this.get = function (url, data) {
        var that = this;
        var reqStartTime = (new Date()).getTime();

        return $http.get(url, {
            params: data
        }).then(function (response) {
            var reqEndTime = (new Date()).getTime();
            if (response.data.code === 200) {
                if (reqEndTime - reqStartTime > 500) {
                    $log.warn(response.data.code + ' Time: ' + (reqEndTime - reqStartTime) +
                        'ms, SLOW. GET ' + url);
                }

                var newRequestVersion = response.headers('t-version');
                if (newRequestVersion) {
                    if (!lastHttpRequestVersion) {
                        lastHttpRequestVersion = newRequestVersion;
                    } else if (lastHttpRequestVersion !== newRequestVersion) {
                        $rootScope.$emit(that.eventFrontExpired, {
                            currentVersion: lastHttpRequestVersion,
                            newVersion: newRequestVersion
                        });
                        lastHttpRequestVersion = newRequestVersion;
                    }
                }
                return response.data.result;
            } else {
                $log.warn(response.data.code + ' Time: ' + (reqEndTime - reqStartTime) + 'ms');
                $log.debug(response.data.message);
                throw {
                    code: response.data.code,
                    message: response.data.message
                };
            }
        }, handleError);
    };

    this.getRaw = function (url, data) {
        return $http.get(url, {
            params: data,
            responseType: "arraybuffer",
        }).then(null, function (err) {
            err.data = JSON.parse(new TextDecoder().decode(err.data));
            return handleError(err);
        });
    };

    this.post = function (url, data, feedback) {
        var reqStartTime = (new Date()).getTime();
        return $http.post(url, data).then(function (response) {
            var reqEndTime = (new Date()).getTime();
            if (response.data.code != 200) {
                throw response;
            }

            if ((response.data.result != undefined && response.data.result != 0 )
                || response.data.result == undefined) {
                if (feedback && localize.getLocalizedString(url, true)) {
                    ngToast.success(localize.getLocalizedString(url, true))
                }
            }

            if (reqEndTime - reqStartTime > 500) {
                $log.warn(response.data.code + ' Time: ' + (reqEndTime - reqStartTime) +
                    'ms, SLOW. POST ' + url);
            }

            return response.data.result;
        }, handleError);
    };

    this.tLog = function (info, type) {
        if ($rootScope.tigerInfo.systemTime === undefined) {
            setTimeout(function () {
                window.apiService.tLog(info, type);
            }, 1500);
            return;
        }

        if (typeof info !== 'object') {
            info = {info: info};
        }

        if (!$rootScope.tigerInfo) {
            return;
        }

        if ($rootScope.account && $rootScope.account.id) {
            info.account = $rootScope.account.id;
        }

        if ($rootScope.tigerInfo.saas) {
            info.saas_id = $rootScope.tigerInfo.saas.saasKey;
        } else {
            info.static_uuid = $rootScope.tigerInfo.static_uuid;
        }

        var url = 'http://t.dev.lieguanjia.com/v1';
        url = url + "?_t=" + new Date().getTime();
        $http.post(url, {
            type: type,
            log: info
        });
    };

    this.basicInfo = function () {
        return this.get('/api/system/info');
    };

    var dataListCache = {};

    this.getDataList = function (type) {
        if (dataListCache[type]) {
            return dataListCache[type];
        }

        dataListCache[type] = this.get('/api/data/list', {
            type: type
        });

        return dataListCache[type];
    };

    this.dataList = this.getDataList;

    this.getDataListBySearch = function (type, search, offset, length, attribute) {
        return this.get('/api/data/list', {
            type: type,
            search: search,
            offset: offset,
            length: length,
            attribute: attribute
        });
    };

    this.updateDataList = function (type, list, feedback) {
        return this.post('/api/data/update', {
            type: type,
            list: list
        }, feedback == undefined ? true : feedback).then(function (data) {
            dataListCache[type] = null;
        });
    };

    var cacheKeyIndex = {};
    var fieldListCache = {};
    this.getFieldList = function (moduleId, moduleType, moduleItem) {
        var key = moduleId + '_' + moduleType + '_' + moduleItem;
        if (fieldListCache[key]) {
            return fieldListCache[key];
        }

        if (!cacheKeyIndex[moduleId]) {
            cacheKeyIndex[moduleId] = [];
        }
        cacheKeyIndex[moduleId].push(key);

        fieldListCache[key] = this.get('/api/field/query', {
            moduleId: moduleId,
            moduleType: moduleType,
            moduleItem: moduleItem
        });
        return fieldListCache[key];
    };

    var fieldListForTableCache = {};
    this.getFieldListForTable = function (moduleId) {
        var key = moduleId;
        if (fieldListForTableCache[key]) {
            return fieldListForTableCache[key];
        }

        fieldListForTableCache[key] = this.get('/api/field/queryForTable', {
            moduleId: moduleId
        });

        return fieldListForTableCache[key];
    };

    this.updateFieldList = function (moduleId, moduleType, moduleItem, list, feedback) {
        return this.post('/api/field/update', {
            moduleId: moduleId,
            moduleType: moduleType,
            moduleItem: moduleItem,
            list: list
        }, feedback == undefined ? true : feedback).then(function (data) {
            fieldListForTableCache[moduleId] = null;
            if (cacheKeyIndex[moduleId]) {
                angular.forEach(cacheKeyIndex[moduleId], function (key) {
                    fieldListCache[key] = null;
                })
            }
            return data;
        });
    };

    this.listIdAboveOrder = function (fieldId, order) {
        return this.get('/api/field/listAboveOrder', {
            fieldId: fieldId,
            order: order
        });

    };

    this.getFieldItemList = function (fieldId) {
        return this.get('/api/field/itemList', {
            fieldId: fieldId
        });
    };
    this.getFieldUpdateList = function (moduleId, primaryId) {
        return this.get('/api/field/updateLogs', {
            moduleId: moduleId,
            primaryId: primaryId

        })
    };

    this.getSelectList = function (typeList) {
        var data = [];
        switch (typeList) {
            case 'taskType':
                data = [
                    {
                        id: 0,
                        title: "默认"
                    }, {
                        id: 1,
                        title: "客户面试"
                    }, {
                        id: 2,
                        title: "入职"
                    }, {
                        id: 3,
                        title: "试用期结束"
                    }, {
                        id: 4,
                        title: "预计到款"
                    },
                ];
                break;
            default:

        }

        return $q(function (resolve, reject) {
            resolve({
                group: {
                    a: {
                        id: 1,
                        title: '人才',
                        i18n: {
                            zh: '人才',
                            en: 'alpha'
                        }
                    },
                    b: {
                        id: 2,
                        title: '项目',
                        i18n: {
                            zh: '项目',
                            en: 'beta'
                        }
                    }
                },
                list: [
                    {
                        id: 1,
                        type: 'a',
                        title: 'a1'
                    }, {
                        id: 2,
                        type: 'a',
                        title: 'a2'
                    }, {
                        id: 3,
                        type: 'a',
                        title: 'a3'
                    }, {
                        id: 1,
                        type: 'b',
                        title: 'b1'
                    }, {
                        id: 2,
                        type: 'b',
                        title: 'b2'
                    }
                ]
            });
        });
    };
});
