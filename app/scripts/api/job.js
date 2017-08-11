'use strict';
angular.module('tiger.api.job', ['tiger.api.base']).service('jobService', function (apiService) {

    this.newJob = function (jobType, jobSubtype, otherInfo) {
        return apiService.post("/api/job/new",
            {
                jobType: jobType,
                jobSubtype: jobSubtype,
                otherInfo: otherInfo
            })
    };
    this.list = function (offset, length) {
        return apiService.get("/api/job/list",
            {
                offset: offset,
                length: length
            })
    };
    this.listJobTypes = function () {
        return apiService.get("/api/job/jobType")
    };
    this.listJobSubtypes = function (id) {
        return apiService.get("/api/job/jobSubtype", {id: id})
    };
    this.listOtherInfo = function (id) {
        return apiService.get("/api/job/otherInfo", {id: id})
    };

    this.update = function (jobId, state) {
        return apiService.post("/api/job/update",
            {
                jobId: jobId,
                state: state
            }
        )
    }
});
