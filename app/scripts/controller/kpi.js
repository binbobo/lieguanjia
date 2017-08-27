"use strict";
angular.module('tiger.ctrl.kpi', ['tiger.api.kpi']).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('kpiInfo', {
        url: '/kpi?{dateType: int}',
        templateUrl: '/views/kpi/kpi.html',
        controller: 'kpiCtrl',
        data: {
            'title': 'KPI'
        }
    });
    $stateProvider.state('kpiWeekInfo', {
        url: '/kpi/week',
        templateUrl: '/views/kpi/kpi_week.html',
        controller: 'kpiWeekCtrl',
        data: {
            'title': 'KPI周报'
        }
    });
}).controller('kpiCtrl', function ($scope, $filter, $state, $stateParams, ngToast, uiModalService,
                                   settingService, kpiService, accountService) {
    $scope.isLoading = true;

    $scope.kpiFilter = {
        dateType: undefined,
        department: undefined
    };
    $scope.kpiList = [];
    $scope.kpiResult = [];
    $scope.kpiDetail = {};
    $scope.fieldList = [];
    $scope.dataList = [];
    $scope.userSubDepartments = [];
    $scope.currentKpiId = 0;
    $scope.currentKpi = {};
    $scope.currentListType = 0;
    $scope.currentDateType = null;
    $scope.startTime = 0;
    $scope.departmentId = 0;
    $scope.endTime = 0;
    $scope.refreshTable = false;
    $scope.listKPIKey = "kpi";
    $scope.withScore = true;
    $scope.dateType = [
        {title: '本周', id: 1, value: 1},
        {title: '本月', id: 2, value: 2},
        {title: '本年', id: 3, value: 3},
        {title: '自定义时间', id: 4, value: 4}
    ];
    // $scope.sec1Loading = false;
    $scope.define = false;

    var t = new Date();
    t.setHours(0, 0, 0, 0);
    var currentTimestamp = t.getTime() / 1000;

    $scope.customDate = {
        startTime: currentTimestamp - 86400 * 7,
        endTime: currentTimestamp
    };

    $scope.changeListType = function (listType) {
        $scope.listType = listType;
        $scope.updateKpiList();
    };

    $scope.changeDepartment = function (departmentItem) {
        $scope.departmentId = departmentItem.id;
        $scope.updateKpiList();
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

        $scope.updateKpiList();
    };

    $scope.countTimeByDateTypeId = function (id) {
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
    };

    $scope.changeTimeByDateTypeId = function (id) {
        $scope.countTimeByDateTypeId(id);
        if (!$scope.isLoading && !$scope.define) {
            $scope.updateKpiList()
        }
    };

    $scope.updateKpiList = function () {
        if (!$scope.currentKpiId) {
            return;
        }

        if (!$scope.kpiFilter.dateType) {
            return;
        }
        $scope.countTimeByDateTypeId($scope.kpiFilter.dateType.id);

        // $scope.withScore = $scope.currentKpi.cycle === $scope.kpiFilter.dateType.id;

        $scope.isLoading = true;
        kpiService.getKPIResult(
            $scope.currentKpiId, $scope.listType, $scope.startTime, $scope.endTime, $scope.departmentId, $scope.withScore
        ).then(function (data) {
            $scope.kpiResult = data;
            // $scope.dataList = buildDataList(data);
            $scope.dataList = buildDataList(data);
        }).finally(function () {
            $scope.isLoading = false;
        });
    };

    accountService.getUserSubDepartments().then(function (data) {
        data.unshift({title: "所有", id: 0});
        $scope.userSubDepartments = data;
        $scope.kpiFilter.department = $scope.userSubDepartments[0];
    });

    if ($stateParams.dateType) {
        _.map($scope.dateType, function (item) {
            if (item.id === $stateParams.dateType) {
                $scope.kpiFilter.dateType = item;
            }
        });
    }

    $scope.$watch('kpiFilter.dateType', function (newValue, oldValue) {
        if (!newValue) {
            return;
        }
        $scope.changeTimeByDateTypeId(newValue.id);
    });

    $scope.$watch('kpiFilter.department', function (newValue) {
        if (!newValue) {
            return;
        }
        $scope.changeDepartment(newValue);
    });

    var fieldListPart = [
        {
            "name": "name",
            "i18n": {"zh": "用户", "en": "user"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "user"
        },
        {
            "name": "departmentStr",
            "i18n": {"zh": "团队", "en": "department"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "user"
        },
        {
            "name": "role",
            "i18n": {"zh": "角色", "en": "Role"},
            "dataType": "select",
            "canTable": 1,
            "moduleItem": "user"
        }
    ];

    var fieldListPartForDepartment = [
        {
            "name": "name",
            "i18n": {"zh": "团队", "en": "user"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "user"
        }
    ];


    // $scope.fieldInTableTmp = [
    //     "user.name",
    //     "user.departmentStr",
    //     "user.role",
    //     "kpi.score"
    // ];
    $scope.fieldInTable = [];

    settingService.getKPIList().then(function (data) {
        $scope.kpiList = data;
        if ($scope.kpiList.length > 0) {
            $scope.getKpiResult($scope.kpiList[0].id, 1, $scope.startTime, $scope.endTime, $scope.departmentId);
            $scope.currentKpiId = $scope.kpiList[0].id;
            $scope.currentKpi = $scope.kpiList[0];
        }
    }).then(function () {
        //$scope.changeTimeByDateTypeId(1);
    });

    function buildFieldList(kpiFieldList, forDepartment) {
        var fieldListTemp = [];
        var fieldInTableTmp = [];

        if (forDepartment) {
            fieldListTemp = angular.copy(fieldListPartForDepartment);
        } else {
            fieldListTemp = angular.copy(fieldListPart);
        }

        fieldListTemp.push({
            "name": "score",
            "i18n": {"zh": "KPI总分", "en": "KPI Score"},
            "dataType": "number",
            "canTable": 1,
            "moduleItem": "kpi"
        });

        angular.forEach(kpiFieldList, function (item) {
            if (!item.use) {
                return;
            }

            var fieldItem = {
                "name": item.basicItem.countName,
                "i18n": {"zh": item.displayName, "en": item.displayName},
                "dataType": "text",
                "canTable": 1,
                "moduleItem": "statisticMap"
            };

            fieldListTemp.push(fieldItem);
            // if (item.display) {
            //     fieldInTableTmp.push('statisticMap.' + item.basicItem.countName);
            // }
        });
        // $scope.fieldInTable = fieldInTableTmp;

        angular.forEach(fieldListTemp, function (item) {
            fieldInTableTmp.push(item.moduleItem + '.' + item.name);
        });

        $scope.fieldInTable = fieldInTableTmp;

        return fieldListTemp;
    }

    var i18nFilter = $filter('i18n');

    function buildDataListItem(item) {
        // todo 这部分逻辑应该放到 custom form list 中
        // User Department
        if (!item.user) {
            return item;
        }
        if (!item.user.departmentRelationList) {
            item.user.departmentStr = null;
            return item;
        }

        var tmpArr = [];
        angular.forEach(item.user.departmentRelationList, function (departmentItem) {
            tmpArr.push(i18nFilter(departmentItem.department));
        });

        item.user.departmentStr = tmpArr.join(' / ');
        return item;
    }

    function buildDataList(list) {
        var result = [];
        angular.forEach(list, function (item) {
            result.push(buildDataListItem(item));
        });

        return result;
    }

    $scope.getKpiResult = function (id, listType, startTime, endTime) {
        $scope.currentKpiId = id;
        $scope.refreshTable = false;
        $scope.listType = listType;
        settingService.getKPIDetail($scope.currentKpiId).then(function (data) {
            $scope.kpiDetail = data;
            $scope.currentKpi = data;

            if (!data.itemList) {
                return;
            }

            $scope.fieldList = [];
            $scope.fieldList = buildFieldList(data.itemList);
            $scope.listKPIKey = "listKey" + $scope.currentKpiId;
        }).then(function () {
            // $scope.item = $scope.dateType[$scope.kpiDetail.cycle - 1];
            $scope.isLoading = false;
            $scope.refreshTable = true;
            // $scope.withScore = $scope.currentKpi.cycle === $scope.kpiFilter.dateType.id;
            // $scope.changeTimeByDateTypeId($scope.item.id);

            // $scope.updateKpiList();
        });
        // kpiService.getKPIResult($scope.currentKpiId, listType, startTime, endTime, $scope.departmentId, $scope.withScore).then(function (data) {
        //     $scope.kpiResult = data;
        //     // $scope.dataList = buildDataList(data);
        //     $scope.dataList = data;
        // });
    };

});
