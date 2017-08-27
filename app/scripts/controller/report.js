"use strict";
angular.module('tiger.ctrl.report', ['tiger.api.report']).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('reportProject', {
        url: '/report/project',
        templateUrl: '/views/report/project.html',
        controller: 'reportProjectCtrl',
        data: {
            'title': '项目分析'
        }
    });
}).controller('reportProjectCtrl', function ($scope, $filter, $state, $stateParams, ngToast, reportService) {
    $scope.isLoading = true;

    $scope.reportFilter = {
        dateType: undefined
    };
    $scope.dataList = [];
    $scope.startTime = 0;
    $scope.endTime = 0;
    $scope.refreshTable = false;
    $scope.listKPIKey = "projectReport";

    $scope.dateTypeList = [
        {title: '本周', id: 1, value: 1},
        {title: '本月', id: 2, value: 2},
        {title: '本年', id: 3, value: 3},
        {title: '自定义时间', id: 4, value: 4}
    ];

    var t = new Date();
    t.setHours(0, 0, 0, 0);
    var currentTimestamp = t.getTime() / 1000;

    $scope.customDate = {
        startTime: currentTimestamp - 86400 * 7,
        endTime: currentTimestamp
    };
    $scope.changeConditionWithDefinedTime = function () {
        $scope.startTime = $scope.customDate.startTime;
        $scope.endTime = $scope.customDate.endTime + 86399;

        if (!$scope.startTime || !$scope.endTime) {
            ngToast.warning("请输入自定义时间");
            return;
        }

        if ($scope.startTime > $scope.endTime) {
            ngToast.warning("请定义正确的时间段");
            return;
        }

        $scope.loadData();
    };

    $scope.changeTimeByDateTypeId = function (id) {
        var now = new Date(); //当前日期
        var nowDayOfWeek = now.getDay(); //今天本周的第几天
        var nowDay = now.getDate(); //当前日
        var nowMonth = now.getMonth(); //当前月
        var nowYear = now.getFullYear(); //当前年

        if (id === 1) {
            var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1);
            $scope.startTime = weekStartDate.valueOf() / 1000;
            var weekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek));
            $scope.endTime = weekEndDate.valueOf() / 1000;
            $scope.define = false;

        } else if (id === 2) {
            $scope.startTime = new Date(nowYear, nowMonth, 1).valueOf() / 1000;
            var monthStartDate = new Date(nowYear, nowMonth, 1);
            var monthEndDate = new Date(nowYear, nowMonth + 1, 1);
            var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
            $scope.endTime = new Date(nowYear, nowMonth, days).valueOf() / 1000;
            $scope.define = false;

        } else if (id === 3) {
            $scope.startTime = new Date(nowYear, 0, 1) / 1000;
            $scope.endTime = now.valueOf() / 1000;
            $scope.define = false;

        } else if (id === 4) {
            $scope.define = true;
        }

        if (!$scope.isLoading && !$scope.define) {
            $scope.loadData();
        }
    };

    $scope.$watch('reportFilter.dateType', function (newValue) {
        if (!newValue) {
            return;
        }
        $scope.changeTimeByDateTypeId(newValue.id);
    });

    $scope.fieldList = [
        {
            "name": "name",
            "i18n": {"zh": "用户", "en": "user"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "user"
        },
        {
            "name": "departmentRelationList",
            "i18n": {"zh": "团队", "en": "department"},
            "dataType": "text",
            "canTable": 1,
            "tableDataType": "systemUserDepartment",
            "moduleItem": "user"
        },
        {
            "name": "projectCount",
            "i18n": {"zh": "所有项目", "en": "All Project"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "createProjectCount",
            "i18n": {"zh": "创建项目", "en": "Add Project"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "memberProjectCount",
            "i18n": {"zh": "参与项目", "en": "Member Project"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "joinCount",
            "i18n": {"zh": "加入项目", "en": "Join Project"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "recommendCount",
            "i18n": {"zh": "推荐", "en": "Recommend"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "interviewCount",
            "i18n": {"zh": "面试", "en": "Interview"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "firstInterviewCount",
            "i18n": {"zh": "1面", "en": "First Interview"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "secondInterviewCount",
            "i18n": {"zh": "2面", "en": "second Interview"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "moreInterviewCount",
            "i18n": {"zh": "更多面", "en": "more Interview"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "offerCount",
            "i18n": {"zh": "Offer", "en": "Offer"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "entryCount",
            "i18n": {"zh": "入职", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseCount",
            "i18n": {"zh": "淘汰", "en": "Refuse"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseJoinCount",
            "i18n": {"zh": "加入后淘汰", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseRecommendCount",
            "i18n": {"zh": "推荐后淘汰", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseInterviewCount",
            "i18n": {"zh": "面试后淘汰", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseFirstInterviewCount",
            "i18n": {"zh": "1面后淘汰", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseSecondInterviewCount",
            "i18n": {"zh": "2面后淘汰", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseMoreInterviewCount",
            "i18n": {"zh": "更多面后淘汰", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseOfferCount",
            "i18n": {"zh": "Offer面后淘汰", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        },
        {
            "name": "refuseEntryCount",
            "i18n": {"zh": "入职面后淘汰", "en": "Entry"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": ""
        }
    ];

    $scope.fieldInTable = _.map($scope.fieldList, function (item) {
        return item.moduleItem + '.' + item.name;
    });

    $scope.loadData = function () {
        $scope.isLoading = true;
        $scope.refreshTable = false;
        reportService.getProjectReport($scope.startTime, $scope.endTime).then(function (data) {
            $scope.dataList = data;
        }).then(function () {
            $scope.isLoading = false;
            $scope.refreshTable = true;
        });
    };

    $scope.loadData();
});
