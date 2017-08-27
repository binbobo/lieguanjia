"use strict";
angular.module('tiger.api.task', ['tiger.api.base']).service('taskService', function (apiService) {
    this.list = function (offset, length, start_time, end_time) {
        var that = this;

        var param = {
            offset: offset,
            length: length
        };
        if (start_time) {
            param.startTime = start_time;
        }
        if (end_time) {
            param.endTime = end_time;
        }

        return apiService.get('/api/task/list', param).then(function (res) {
            if (!res.list) {
                return;
            }

            return that.processList(res.list);
        });
    };

    this.processList = function (list) {
        return angular.forEach(list, this.processTaskFromRaw);
    };

    this.processTaskFromRaw = function (item) {
        item.datetimeRange = {
            Fstart_time: item.Fstart_time,
            Fend_time: item.Fend_time,
            wholeDay: item.wholeDay
        };
        if (item.advanceTimeType === 0) {
            item.advanceTimeType = 1;
        }
        item.advanceTimeType = {
            value: item.advanceTimeType
        };
        return item;
    };

    this.updateOptionTime = function (taskId, startTime, endTime) {
        var param = {
            taskId: taskId,
            startTime: startTime,
            endTime: endTime
        };

        return apiService.post('/api/task/update/options', param);
    };

    this.updateTaskComplete = function (taskId, completed) {
        return apiService.post('/api/task/update/options', {
            taskId: taskId,
            isCompleted: completed
        });
    };

    this.updateTaskReminded = function (taskIdList) {
        if (taskIdList.length === 0) {
            return;
        }
        return apiService.post('/api/task/reminded', {
            list: taskIdList
        });
    };

    this.delete = function (taskId) {
        return apiService.post('/api/task/delete', {
            taskId: taskId
        });
    };

    this.updateTask = function (taskObj) {
        var params = {
            taskId: taskObj.id,
            title: taskObj.title,
            taskType: taskObj.taskType ? taskObj.taskType.id : null,
            startTime: taskObj.datetimeRange.Fstart_time,
            endTime: taskObj.datetimeRange.Fend_time,
            wholeDay: taskObj.datetimeRange.wholeDay,
            advanceTime: taskObj.advanceTime,
            advanceTimeType: taskObj.advanceTimeType.value,
            needEmail: taskObj.needEmail,
            participantId: taskObj.participants ? $.map(taskObj.participants, function (item) {
                return item.id;
            }) : [],
            remark: taskObj.remark,
            relatedId: taskObj.relatedId,
            relatedType: taskObj.relatedType
        };

        return apiService.post('/api/task/update', params);
    };

    this.generateIcsFile = function (summary, startTime, endTime, content) {
        var params = {
            summary:summary,
            startTime: startTime,
            endTime : endTime,
            content: content
        };
        return apiService.post('/api/task/generateIcsFile', params);
    }
});
