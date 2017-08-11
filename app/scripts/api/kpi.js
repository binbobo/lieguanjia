/**
 * Created by haozhenghua on 16/4/6.
 */
'use strict';
angular.module('tiger.api.kpi', ['tiger.api.base']).service('kpiService', function (apiService, settingService) {
    this.getKPIResult = function (id, listType, startTime, endTime, departmentId, withScore) {
        return apiService.get('/api/statistic/', {
            id: id,
            listType: listType,
            startTime: parseInt(startTime),
            endTime: parseInt(endTime),
            departmentId: departmentId,
            withScore: withScore
        })
    };

    this.individual = function (startTime, endTime) {
        return apiService.get('/api/statistic/individual', {
            startTime: startTime,
            endTime: endTime
        });
    };

    this.getCurrentUserCurrentMonthKpi = function () {
        var tmpDate = new Date();
        var nowTime = Math.round(tmpDate.getTime() / 1000);
        tmpDate.setDate(1);
        tmpDate.setHours(0, 0, 0, 0);
        var monthStart = Math.round(tmpDate.getTime() / 1000);


        return this.individual(monthStart, nowTime).then(function (data) {
            if (!data.length) {
                return null;
            }
            return data[0].statisticMap;
        });
    };
});
