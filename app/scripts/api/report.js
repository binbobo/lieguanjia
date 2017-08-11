/**
 * Created by haozhenghua on 16/4/6.
 */
'use strict';
angular.module('tiger.api.report', ['tiger.api.base']).service('reportService', function (apiService) {

    this.getProjectReport = function (startTime, endTime) {
        return apiService.get('/api/statistic/report/project', {
            startTime: parseInt(startTime),
            endTime: parseInt(endTime),
        })
    };
});
