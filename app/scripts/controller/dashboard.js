"use strict";
angular.module('tiger.ctrl.dashboard', []).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('home', {
        url: '/dashboard',
        templateUrl: 'views/dashboard.html',
        controller: 'dashboardCtrl',
        data: {
            title: '首页'
        }
    });
}).controller('dashboardCtrl', function ($scope, $rootScope, $cookies, $timeout, $uibModal, ngToast, config,
                                         userSessionStorageService, searchService, accountService, presetService,
                                         kpiService, projectService, taskService) {

    // buy module
    $scope.getDeadline = function (expireTime, currentTime) {
        var remainDays = (expireTime - currentTime) / 86400;
        return Math.ceil(remainDays);
    };

    $scope.jumpToBuy = function () {
        $scope.jumping = true;
        accountService.getBuyUrl().then(function (data) {
            location.href = data.url;
        });
    };

    $scope.systemInfo = $rootScope.tigerInfo;

    if ($rootScope.tigerInfo.saas) {
        $scope.deadline = $scope.getDeadline($rootScope.tigerInfo.saas.expireTime, $rootScope.tigerInfo.systemTime);
    }

    // user hello module
    var nowDate = new moment();
    $scope.dateStr = nowDate.format('M月D日') + ' 周' + ['日', '一', '二', '三', '四', '五', '六'][nowDate.days()];
    $scope.timeStr = null;
    switch (nowDate.hour()) {
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 10:
        case 11:
            $scope.timeStr = '早上好';
            break;

        case 12:
        case 13:
        case 14:
        case 15:
        case 16:
        case 17:
        case 18:
        case 19:
            $scope.timeStr = '下午好';
            break;

        case 20:
        case 21:
        case 22:
            $scope.timeStr = '晚上好';
            break;

        case 23:
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
            $scope.timeStr = '夜深了';
    }

    // task module
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    $scope.taskCalOptions = {
        showWeeks: false,
        customClass: function (date) {
            var result = [];

            if (date.mode === 'day') {
                if (date.date - today === 0) {
                    result.push('today');
                }
                result.push('day-' + moment(date.date).format('YYYY-MM-DD'));
            }

            return result;
        }
    };
    $scope.taskDate = today;
    $scope.taskList = [];

    $scope.$watch('taskDate', function (newDate) {
        if (!newDate) {
            return;
        }
        var tmpTaskDate = newDate;
        tmpTaskDate.setHours(0, 0, 0, 0);
        taskService.list(0, 100, tmpTaskDate.getTime() / 1000, tmpTaskDate.getTime() / 1000 + 86400).then(function (list) {
            $scope.taskList = list;
        });
    });

    // realTimeData
    $scope.realTimeData = {};

    $scope.getRealTimeData = function () {
        searchService.listSearchParam(2).then(function (data) {
            angular.forEach(data.primary, function (item) {
                if (item.id !== 10010) {
                    return;
                }
                $scope.realTimeData.processProject = item.count;
            });

            return projectService.getPipelineCount();
        }).then(function (data) {
            angular.extend($scope.realTimeData, data);

            return searchService.listSearchParam(9);
        }).then(function (data) {
            angular.forEach(data.primary, function (item) {
                if (item.id !== 10029) {
                    return;
                }
                $scope.realTimeData.invoiceSent = item.count;
            });
        });
    };

    $scope.getRealTimeData();

    // kpi module
    $scope.kpiData = [];
    kpiService.getCurrentUserCurrentMonthKpi().then(function (data) {
        $scope.kpiData = data;
    });

    // pipeline module
    $scope.sec1List = {
        project_processing: {
            title: '进展中的项目',
            index: 'project',
            query: {
                sort: {
                    updateTime: {
                        order: "desc",
                        ignore_unmapped: true
                    }
                }
            },
            must: [
                {
                    term: {
                        "basicInfo.Fstatus.value": 0
                    }
                }
            ]
        },
        pipeline_interview_1: {
            title: '面试·第1轮',
            index: 'project_resume',
            query: {
                sort: {
                    updateTime: {
                        order: "desc",
                        ignore_unmapped: true
                    }
                }
            },
            must: [
                {
                    term: {
                        "lastStatus.value": config.pipelineStatus.interview
                    }
                },
                {
                    term: {
                        "lastOperation.data.interviewCount": 1
                    }
                }
            ]
        },
        pipeline_interview_2: {
            title: '面试·第2轮',
            index: 'project_resume',
            query: {
                sort: {
                    updateTime: {
                        order: "desc",
                        ignore_unmapped: true
                    }
                }
            },
            must: [
                {
                    term: {
                        "lastStatus.value": config.pipelineStatus.interview
                    }
                },
                {
                    term: {
                        "lastOperation.data.interviewCount": 2
                    }
                }
            ]
        },
        pipeline_interview_more: {
            title: '面试·更多轮',
            index: 'project_resume',
            query: {
                sort: {
                    updateTime: {
                        order: "desc",
                        ignore_unmapped: true
                    }
                }
            },
            must: [
                {
                    term: {
                        "lastStatus.value": config.pipelineStatus.interview
                    }
                },
                {
                    range: {
                        "lastOperation.data.interviewCount": {
                            gt: 2
                        }
                    }
                }
            ]
        },
        pipeline_offer: {
            title: '签订Offer',
            index: 'project_resume',
            must: [
                {
                    term: {
                        "lastStatus.value": config.pipelineStatus.offer
                    }
                }
            ]
        }
    };

    $scope.sec1Choose = '';
    $scope.sec1SearchKeyword = ''; // 准备搜索的词
    $scope.sec1SearchedKeyword = null; // 搜索后的词
    $scope.sec1Loading = false;

    $scope.updateSec1List = function () {
        var item = $scope.sec1List[$scope.sec1Choose];
        var query = item.query || {};

        query.query = query.query || {};
        query.query.bool = query.query.bool || {};
        query.query.bool.must = item.must || [];

        query.size = 5;

        if ($scope.sec1SearchKeyword) {
            query.query.bool.must.push({
                query_string: {
                    query: $scope.sec1SearchKeyword
                }
            });
        }

        $scope.sec1Loading = true;
        searchService.searchWithIndex(item.index, query, "normal").then(function (data) {
            $scope.sec1Data = data;
            $scope.sec1SearchedKeyword = $scope.sec1SearchKeyword;
            $scope.sec1Loading = false;
        }, function () {
            $scope.sec1Loading = false;
        });
    };

    $scope.changeSec1Choose = function (key) {
        $scope.sec1Choose = key;
        $scope.sec1SearchKeyword = null;
        $scope.updateSec1List();
    };

    $scope.searchSec1 = function () {
        $scope.updateSec1List();
    };

    $scope.changeSec1Choose('project_processing');

    $scope.preset = {
        init: function () {
            if ($rootScope.account.id !== 1) {
                return;
            }

            this.isHideHint = userSessionStorageService.get('hide_hint');

            presetService.status().then(function (data) {
                $scope.preset.status = data;
                if ($scope.preset.status === config.presetStatus.presetting) {
                    $scope.preset.getStatusOnTime();
                }
            });
        },
        status: -1,
        isHideHint: false,
        hideHint: function () {
            this.isHideHint = true;
            userSessionStorageService.put('hide_hint', 1);
        },
        addPresetData: function () {
            $uibModal.open({
                animation: false,
                backdrop: 'static',
                windowClass: 'modal-center',
                templateUrl: 'views/guide/step2.html',
                controller: 'userGuideModalCtrl'
            }).result.then(function () {
                $scope.preset.getStatusOnTime();
                ngToast.success('试用数据加载中，预计2分钟内完成');
                return presetService.add();
            }).then(function () {
                $scope.preset.status = config.presetStatus.presetting;
            });
        },
        deletePresetData: function () {
            presetService.delete().then(function () {
                ngToast.success("开始删除，预计10s内完成删除");
                $scope.preset.status = config.presetStatus.deleting;
            });
            $scope.preset.getStatusOnTime();
        },
        getStatusOnTime: function () {
            if ($scope.refreshStatus) {
                return;
            }
            $scope.refreshStatus = setInterval(function () {
                presetService.status().then(function (data) {
                    $scope.preset.status = data;
                    if ($scope.preset.status === config.presetStatus.hasPreset ||
                        $scope.preset.status === config.presetStatus.deleted) {
                        clearInterval($scope.refreshStatus);
                        $scope.updateSec1List();
                    }
                });
            }, 10000);
            $scope.$on("$destroy", function () {
                clearInterval($scope.refreshStatus);
            });
        }
    };
    $scope.preset.init();

});
