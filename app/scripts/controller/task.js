"use strict";
angular.module('tiger.ctrl.task', [
    'ngTable', 'ui.calendar', 'ui.bootstrap', 'tiger.api.task'
]).config(function ($stateProvider) {
    // $stateProvider.state('task', {
    //     url: '/task',
    //     templateUrl: 'views/task/main.html'
    // });
    // $stateProvider.state('task.list', {
    //     url: '/list',
    //     templateUrl: 'views/task/list.html'
    // });

    $stateProvider.state('task_calendar', {
        url: '/task/calendar',
        templateUrl: 'views/task/calendar.html',
        controller: 'calendarCtrl',
        data: {
            title: '提醒'
        }
    });
}).controller('taskCtrl', function ($scope, $filter, ngTableParams, taskService) {
    /**
     * @deprecated
     */

    $scope.fields = ['id', 'remark', 'reminderType', 'advanceTime'];
    var data;
    taskService.list(0, 10).then(function (response) {
        data = response.list;

        $scope.tableParams = new ngTableParams({
            page: 1,
            count: 10
        }, {
            getData: function ($defer, params) {
                var orderedData;
                orderedData = (params.sorting() ? $filter("orderBy")(data, params.orderBy()) : data);
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
    });

}).controller('calendarCtrl', function ($scope, $rootScope, $templateCache, $compile, $interpolate, $filter, $state,
                                        $uibModal, taskModal, taskService) {

    $scope.events = [];

    $scope.eventSources = [];

    $scope.eventTemplate = $templateCache.get('eventItem.html');

    $scope.filterCompleted = {
        value: -1,
        title: '全部状态'
    };
    $scope.itemList = [
        {
            value: -1,
            title: '全部状态'
        },
        {
            value: 0,
            title: '未完成'
        },
        {
            value: 1,
            title: '已完成'
        }
    ];
    $scope.filterCompleted = $scope.itemList[0];
    $scope.uiSelectChange = function (item) {
        $scope.filterCompleted = item;
    };

    $scope.renderEvent = function ($element, event) {
        var $content = $element.find('.fc-content');

        if ($content.scope()) {
            $content.scope().event = event;
            return;
        }

        var eventScope = $scope.$new();
        var eventElement = $content.html($scope.eventTemplate);

        eventScope.event = event;
        $compile(eventElement)(eventScope);

        eventElement.on('remove', function () {
            eventScope.$destroy();
        });

        eventScope.$watch('event.complete', function (newValue, oldValue) {
            if (typeof newValue === 'undefined') {
                return;
            }
            if (newValue !== oldValue) {
                taskService.updateTaskComplete(event.id, event.complete);
            }

            if (event.complete) {
                $element.removeClass('event-uncompleted').addClass('event-completed');
            } else {
                $element.removeClass('event-completed').addClass('event-uncompleted');
            }
        });

        // $content.html($interpolate($scope.eventTemplate)({event: event}));
        // if (event.complete) {
        //     $content.find('input[type=checkbox]').prop('checked', true);
        // }
    };

    $scope.uiConfig = {
        calendar: {
            height: 'auto',
            editable: true,
            timeFormat: 'H(:mm)',
            displayEventTime: false,
            timezone: 'local',
            lang: 'zh-cn',
            header: {
                left: "today prev,next title",
                center: "",
                right: "month,agendaWeek,agendaDay"
            },
            nextDayThreshold: '00:00:00',
            slotLabelFormat: 'HH:mm',
            events: function (start, end, timezone, callback) {
                taskService.list(0, 50, start.unix(), end.unix()).then(function (data) {
                    var e = $.map(data, function (item) {
                        item.start = moment(item.datetimeRange.Fstart_time * 1000);
                        item.end = moment(item.datetimeRange.Fend_time * 1000);
                        item.allDay = item.datetimeRange.wholeDay;

                        return item;
                    });
                    callback(e);
                });
            },
            eventRender: function (event, element) {
                $scope.renderEvent(element, event);
            },
            dayClick: function (date, jsEvent, view) {
                var startTime = date.toDate();
                if (view.name === 'month') {
                    startTime.setHours(9, 0, 0, 0);
                }

                editCalendar({
                    datetimeRange: {
                        Fstart_time: Math.round(startTime.getTime() / 1000),
                        Fend_time: Math.round(startTime.getTime() / 1000) + 3600,
                        wholeDay: 0
                    }
                });
            },
            eventClick: function (event, jsEvent, view) {
                var $target = $(jsEvent.target);
                if ($target.is('a,input') || $target.closest('.ui-checkbox').length) {
                    return;
                }
                editCalendar(event);
            },
            eventDrop: function (event, delta, revertFunc) {
                taskService.updateOptionTime(event.id, event.datetimeRange.Fstart_time + delta.asSeconds(), event.datetimeRange.Fend_time + delta.asSeconds()).then(function () {
                    event.datetimeRange.Fstart_time += delta.asSeconds();
                    event.datetimeRange.Fend_time += delta.asSeconds();
                });
            },
            eventResize: function (event, delta) {
                taskService.updateOptionTime(event.id, event.datetimeRange.Fstart_time, event.datetimeRange.Fend_time + delta.asSeconds()).then(function () {
                    event.datetimeRange.Fend_time += delta.asSeconds();
                });
            }
            // eventResize: $scope.alertOnResize

        }
    };

    function editCalendar(item) {
        taskModal.edit(item).then(function (data) {
            $state.reload();
        });
    }

    $scope.addCalendar = function () {
        editCalendar({});
    };

}).controller('CalendarEditCtrl', function ($scope, $uibModalInstance, calendarData, uiModalService, taskService) {
    /**
     * @deprecated
     */
    $scope.oldData = angular.extend({}, calendarData);
    $scope.calendarData = calendarData;

    $scope.ok = function () {
        $scope.taskForm.$setSubmitted();
        if (!$scope.taskForm.$valid) {
            //ngToast.warning("内容错误，请检查后保存");
            return;
        }
        taskService.updateTask($scope.calendarData).then(function () {
            $uibModalInstance.close($scope.calendarData);
        });
    };

    $scope.delete = function () {
        uiModalService.yesOrNo({
            title: '您确认要删除吗？',
            okBtnText: '确认',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function () {
            return taskService.delete($scope.calendarData.id).then(function () {
                $uibModalInstance.close();
            });
        });
    };

    $scope.cancel = function () {
        $scope.calendarData = $scope.oldData;
        $uibModalInstance.dismiss('cancel');
    };
}).directive('taskItem', function ($templateCache, taskService) {
    return {
        template: $templateCache.get('eventItem.html'),
        scope: {
            event: '='
        },
        link: function ($scope, $element, $attr) {
            $scope.noCheckbox = $attr.noCheckbox || false;
            $scope.onlyStartTime = $attr.onlyStartTime || false;

            $scope.$watch('event.complete', function (newValue, oldValue) {
                if (typeof newValue === 'undefined') {
                    return;
                } else if (newValue === oldValue) {
                    return;
                } else if ($scope.noCheckbox) {
                    return;
                }
                taskService.updateTaskComplete($scope.event.id, newValue);
            });
        }
    };
}).service('taskOperationService', function (taskModal, config) {
    this.addTask = function (row, moduleId) {
        var taskItem = {};
        switch (moduleId) {
            case config.moduleMap.candidate:
                taskItem.title = row.basicInfo.Fname;
                taskItem.remark = '/#/candidate/' + row.id;
                break;

            case config.moduleMap.project:
                taskItem.title = row.basicInfo.Fproject_name;
                taskItem.remark = '/#/project/' + row.id;
                break;

            case config.moduleMap.company:
                taskItem.title = row.basicInfo.Fcompany_name_short;
                taskItem.remark = '/#/company/' + row.id;
                break;

            case config.moduleMap.pipeline:
                taskItem.title = row.resume.basicInfo.Fname;
                taskItem.remark = '/#/candidate/' + row.resume.id + '?project_id=' + row.project.id;

                switch (row.lastStatus.value) {
                    case config.pipelineStatus.interview:
                        taskItem.title += ' - 面试';
                        if (row.lastOperation.data) {
                            taskItem.datetimeRange = {
                                Fstart_time: row.lastOperation.data.interviewTime,
                                Fend_time: row.lastOperation.data.interviewTime + 3600
                            };
                        }
                        break;
                }
                break;

        }
        taskModal.edit(taskItem);
    };
});
