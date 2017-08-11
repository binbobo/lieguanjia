"use strict";
angular.module('tiger.ui.project_modal', []).service('projectResumeModal', function ($uibModal, ngToast, config) {

    this.sendMsgToProjectManager = function () {
    };

    this.sendMsgToResume = function () {
    };

    this.selectProject = function (resumeId, key) {
        return $uibModal.open({
            animation: false,
            templateUrl: 'views/project/modal/select_project.html',
            controller: function ($scope, projectService, $uibModalInstance, ngToast) {
                $scope.itemList = [];
                $scope.projectSelected = null;
                $scope.joinedProjectList = null;
                $scope.resumeId = resumeId;

                projectService.listCanJoinProject(resumeId, key).then(function (data) {
                    $scope.itemList = data;
                });
                if (resumeId) {
                    projectService.listJoinedProjectWithCompany(resumeId).then(function (data) {
                        $scope.joinedProjectList = data;
                    });
                }

                $scope.uiSelectChange = function ($item, $model) {
                    $scope.projectSelected = $item;
                };

                $scope.selectRefresh = function (keyword) {
                    return projectService.listCanJoinProject(resumeId, keyword).then(function (data) {
                        $scope.itemList = data;
                    });
                };

                $scope.ok = function () {
                    if (!$scope.projectSelected) {
                        ngToast.warning('请选择项目');
                        return;
                    }
                    $uibModalInstance.close($scope.projectSelected);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }
        }).result;
    };

    this.interview = function (obj) {
        return $uibModal.open({
            animation: false,
            // keyboard: false,
            backdrop: false,
            templateUrl: 'views/project/modal/interview.html',
            resolve: {
                obj: function () {
                    return obj;
                }
            },
            controller: function ($scope, $uibModalInstance, obj) {
                $scope.obj = {
                    interviewTime: null,
                    remind: {
                        time: 10,
                        type: 0
                    }
                };

                angular.extend($scope.obj, obj);

                if (typeof $scope.obj.remind.type === 'string') {
                    $scope.obj.remind.type = parseInt($scope.obj.remind.type);
                }

                $scope.ok = function (data) {
                    $scope.interviewForm.$setSubmitted();
                    if (!$scope.interviewForm.$valid) {
                        ngToast.warning(config.hint.formError);
                        return;
                    }

                    $uibModalInstance.close(data);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }
        }).result;
    };

    this.offer = function (obj) {
        return $uibModal.open({
            animation: false,
            // keyboard: false,
            backdrop: false,
            templateUrl: 'views/project/modal/offer.html',
            resolve: {
                obj: function () {
                    return obj;
                }
            },
            controller: function ($scope, $uibModalInstance, obj) {

                $scope.obj = {
                    salaryList: [
                        {
                            type: 1,
                            count: 12
                        }
                    ],
                    totalSalary: 0,
                    fee: 0,
                    offerStatus: 0,
                    waitTime: null,
                    planEntryTime: null,
                    signTime: null,
                    rejectTime: null
                };

                angular.extend($scope.obj, obj);

                $scope.salaryTypes = _.map(config.salaryType, function (value, id) {
                    return {
                        id: parseInt(id),
                        label: value
                    }
                });

                $scope.addSalaryItem = function () {
                    $scope.obj.salaryList.push({
                        type: 2,
                        count: 1
                    });
                };

                $scope.delSalaryItem = function (index) {
                    $scope.obj.salaryList.splice(index, 1);
                };

                $scope.ok = function (data) {
                    data = angular.extend({}, data);
                    $uibModalInstance.close(data);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };

                $scope.$watch('obj.salaryList', function (value) {
                    $scope.obj.totalSalary = 0;
                    angular.forEach(value, function (item) {
                        if (!item.count) {
                            item.count = 0;
                        }
                        if (!item.salary) {
                            item.salary = 0;
                        }

                        $scope.obj.totalSalary += item.count * item.salary;
                    });
                }, true);
            }
        }).result;
    };

    this.entry = function (obj, candidateName) {
        return $uibModal.open({
            animation: false,
            // keyboard: false,
            backdrop: false,
            templateUrl: 'views/project/modal/entry.html',
            resolve: {
                obj: function () {
                    return obj;
                }
            },
            controller: function ($scope, $uibModalInstance, obj) {
                $scope.obj = {
                    candidateName: candidateName,
                    entryTime: null,
                    guaranteeEndTime: null,
                    changeProjectStatus: 0
                };

                angular.extend($scope.obj, obj);

                $scope.ok = function (data) {
                    data = angular.extend({}, data);
                    $uibModalInstance.close(data);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }
        }).result;
    };

    this.reject = function (obj) {
        return $uibModal.open({
            animation: false,
            backdrop: false,
            templateUrl: 'views/project/modal/reject.html',
            resolve: {
                obj: function () {
                    return obj;
                }
            },
            controller: function ($scope, $uibModalInstance, obj) {
                $scope.obj = {
                    rejectType: 1,
                    rejectReason: ''
                };

                angular.extend($scope.obj, obj);

                $scope.ok = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }
        }).result;
    };

});
