/**
 * Created by haozhenghua on 16/4/6.
 */
"use strict";
angular.module('tiger.ctrl.company', ['tiger.api.company']).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('company_add', {
        url: '/company/add',
        templateUrl: 'views/company/edit.html',
        controller: 'companyEditCtrl',
        data: {
            'title': '新增公司'
        }
    });

    $stateProvider.state('company_view', {
        url: '/company/{companyId:int}',
        templateUrl: 'views/company/view.html',
        controller: 'companyViewCtrl',
        data: {
            'title': '查看公司',
            'originTitle': '查看公司'
        }
    });

    $stateProvider.state('company_view.update_logs', {
        url: '/updateLogs',
        templateUrl: 'views/candidate/update_logs.html',
        controller: 'companyLogCtrl'
    });

    $stateProvider.state('company_view.project', {
        url: '/project',
        templateUrl: 'views/company/project_list.html',
        controller: 'companyViewProjectCtrl',
        data: {
            'title': '公司项目',
            'originTitle': '公司项目'
        }
    });

    $stateProvider.state('company_view.contacts', {
        url: '/candidate',
        templateUrl: 'views/company/contacts.html',
        controller: 'companyViewContactCtrl'
    });

    $stateProvider.state('company_view.attachment', {
        url: '/attachment',
        templateUrl: 'views/attachment/attachment_list.html'
    });

    $stateProvider.state('company_edit', {
        url: '/company/{companyId:int}/edit',
        templateUrl: 'views/company/edit.html',
        controller: 'companyEditCtrl',
        data: {
            'title': '编辑公司',
            'originTitle': '编辑公司'
        }
    });
}).controller('companyEditCtrl', function ($scope, $state, $stateParams, $sce, ngToast,
                                           apiService, companyService, uiModalService, attachmentService, config) {

    $scope.company = {};
    $scope.moduleId = config.moduleMap.company;
    $scope.companyModuleType = 31;
    $scope.companyId = $stateParams.companyId;
    $scope.loadCompany = false;

    $scope.attachmentType = config.moduleIdConfig[$scope.moduleId].attachmentType;
    $scope.attachmentRelationId = $scope.companyId;
    $scope.attachmentList = [];

    $scope.saveCompany = function () {
        $scope.companyBasicInfo.$setSubmitted();
        if (!$scope.companyBasicInfo.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }
        $scope.loadCompany = true;
        companyService.updateCompany($scope.company).then(function (data) {
            $scope.companyId = data;
            return attachmentService.updateAttachmentList(
                $scope.attachmentType, $scope.companyId, $scope.attachmentList);
        }).then(function () {
            $state.go('company_view', {
                'companyId': $scope.companyId
            });
        });
    };

    $scope.backView = function () {
        uiModalService.yesOrNo({
            title: '您确认要取消编辑吗？',
            okBtnText: '确认',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function (data) {
            if ($scope.companyId) {
                $state.go('company_view', {
                    'companyId': $scope.companyId
                });
            } else {
                $state.go('company_list');
            }
        });
    };

    $scope.deleteCompany = function () {
        uiModalService.yesOrNo({
            title: '您确认要删除？',
            okBtnClass: 'btn btn-danger',
            okBtnText: '删除'
        }).then(function (data) {
            return companyService.deleteCompany($scope.companyId);
        }).then(function (data) {
            $state.go('search', {
                moduleId: $scope.moduleId
            });
        });
    };

    apiService.getFieldList($scope.moduleId, $scope.companyModuleType, 'basicInfo').then(function (data) {
        $scope.basicForm = data;
        if ($scope.companyId > 0) {
            companyService.getCompany($scope.companyId).then(function (data) {
                $state.current.data.title =
                    $state.current.data.originTitle + " - " + data.basicInfo.Fcompany_name;
                $scope.company = data;
            });
            attachmentService.getAttachmentList(
                $scope.attachmentType, $scope.companyId
            ).then(function (data) {
                $scope.attachmentList = data;
                $scope.loadAttachment = true;
            });
        } else {
            $scope.company = {
                basicInfo: {
                    Ftype: {
                        value: 1
                    }
                }
            };
            $scope.loadAttachment = true;
        }
    });

}).controller('companyLogCtrl', function ($scope, companyService) {
    $scope.updateLogs = [];
    $scope.fixData = function (updateItem) {
        updateItem.fieldInfo.dataType = updateItem.fieldDataType.name;
        updateItem.fieldInfoOld = angular.extend({
            name: 'oldValue'
        }, updateItem.fieldInfo);
        updateItem.fieldInfoNew = angular.extend({
            name: 'newValue'
        }, updateItem.fieldInfo);
        updateItem.values = {
            oldValue: updateItem.oldValue,
            newValue: updateItem.newValue
        };
    };

    companyService.getUpdateLogs($scope.companyId).then(function (data) {
        $scope.updateLogs = data;
    });

}).controller('companyViewCtrl', function ($scope, $stateParams, $state,
                                           apiService, companyService, projectService, attachmentService) {

    $scope.companyId = $stateParams.companyId;
    if (!$scope.companyId) {
        return;
    }
    $scope.company = {};

    $scope.companyType = 31;
    $scope.companyModuleType = 3;

    $scope.quickEditFunc = function (moduleItemName, fieldItem, itemId, value) {
        companyService.updateField(moduleItemName, fieldItem.name, itemId, value, $scope.companyId);
    };

    apiService.getFieldList($scope.companyModuleType, $scope.companyType, 'basicInfo').then(function (data) {
        $scope.basicForm = data;

    });

    companyService.getCompany($scope.companyId).then(function (data) {
        $state.current.data.title = $state.current.data.originTitle + " - " + data.basicInfo.Fcompany_name;
        $scope.company = data;
    }).then(function (data) {
        return attachmentService.getAttachmentListWithSubtype(35, $scope.companyId);
    }).then(function (data) {
        $scope.attachmentList = data;
    });

}).controller('companyOperationCtrl', function ($scope, $state, $uibModal, ngToast, config, uiModalService,
                                                folderModalService, contractModal, companyService,
                                                taskOperationService) {

    $scope.addComment = function (companyId) {
        uiModalService.editComment(companyId, 6, 0, $uibModal).then(function () {
            $state.reload();
        });
    };

    $scope.joinFolder = function (companyId) {
        folderModalService.selectFolder(companyId, false, 3);
    };

    $scope.editContract = function (contractId, companyId, companyName) {
        contractModal.editContract(contractId, companyId, companyName);
    };

    $scope.addTask = function (company) {
        taskOperationService.addTask(company, config.moduleMap.company);
    };

    $scope.deleteCompany = function (companyId) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function (data) {
            return companyService.deleteCompany(companyId);
        }).then(function (data) {
            $state.go('search', {
                moduleId: 3
            });
        });
    };

}).controller('companyViewContactCtrl', function ($scope, $rootScope, $stateParams, config, apiService, uiModalService,
                                                  folderModalService, searchService, companyService,
                                                  taskOperationService, pipelineOperationService,
                                                  candidateOperationService, mailOperationService,
                                                  achievementOperationService) {

    $scope.moduleId = config.moduleMap.candidate;
    $scope.companyId = $stateParams.companyId;
    $scope.selectType = 1;
    $scope.total = 0;
    $scope.list = [];
    $scope.loading = true;

    $scope.allOnJobReusmeId = [];
    $scope.allLeaveJobReusmeId = [];

    $scope.groupTotal = {
        contacts: 0,
        onJob: 0,
        leave: 0
    };

    $scope.pageState = {
        page: 1,
        total: 0,
        listLength: 25
    };

    $scope.fieldInTable = [
        "basicInfo.Fname",
        "stats.commentCount",
        "stats.attachmentCount",
        "basicInfo.Fwork_year",
        "basicInfo.Fcity",
        "basicInfo.Fphone",
        "occupationList.Ftitle",
        "occupationList.Fcompany_id",
        ".operation"
    ];

    $scope.operation = {
        comment: {},
        pipeline: pipelineOperationService,
        folder: {},
        mail: mailOperationService,
        achievement: achievementOperationService,
        candidate: candidateOperationService,
        task: taskOperationService
    };

    $scope.operation.folder.addFolder = function (item) {
        return folderModalService.selectFolder(item.id, false, 1);
    };

    $scope.operation.comment.addComment = function (item) {
        var commentModuleId = 4;
        if (!commentModuleId) {
            return;
        }
        uiModalService.editComment(item.id, commentModuleId, 0);
    };

    $scope.operation.comment.previewList = function (item) {
        var itemId = item.id;
        var moduleId = 4;

        $rootScope.previewFile('comment', {
            itemId: itemId,
            moduleId: moduleId
        });
    };

    apiService.getFieldListForTable(1).then(function (data) {
        $scope.fieldList = data;
    });

    $scope.isSelectType = function (type) {
        return $scope.selectType == type
    };

    function initCondition() {
        $scope.onJobCondition = {
            must: [
                {
                    terms: {
                        'basicInfo.Fid': $scope.allOnJobReusmeId
                    }
                }
            ]
        };
        $scope.leaveJonCondition = {
            must: [
                {
                    terms: {
                        'basicInfo.Fid': $scope.allLeaveJobReusmeId
                    }
                }
            ]
        };
        $scope.contactsCondition = {
            must: [
                {
                    term: {
                        'occupationList.Fcompany_id.id': $scope.companyId
                    }
                },
                {
                    term: {
                        'moduleType.id': '12'
                    }
                }
            ]
        };

    }

    $scope.updateList = function (type) {
        $scope.selectType = type ? type : 1;
        var condition = [];
        switch (type) {
            case 2: //在职
                condition = $scope.onJobCondition;
                break;
            case 3: //离职
                condition = $scope.leaveJonCondition;
                break;
            case 1: //客户联系人
                condition = $scope.contactsCondition;
                break;

            default:
                condition = $scope.contactsCondition;
                break;
        }
        var query = {
            query: {
                bool: condition
            },
            from: ($scope.pageState.page - 1) * $scope.pageState.listLength,
            size: $scope.pageState.listLength,
            sort: {
                "time": {
                    order: 'desc'
                }
            }
        };
        searchService.search("resume", query, "company").then(function (data) {
            $scope.pageState.total = data.total;
            $scope.pageState.totalAvailable = data.total;
            $scope.list = data.list;
        });
    };

    function getGroupTotal() {
        var query = {
            query: {
                bool: $scope.contactsCondition
            }
        };
        searchService.count("resume", query, "company").then(function (total) {
            $scope.groupTotal.contacts = total;

            query.query.bool = $scope.onJobCondition;
            return searchService.count("resume", query, "company");
        }).then(function (total) {
            $scope.groupTotal.onJob = total;

            query.query.bool = $scope.leaveJonCondition;
            return searchService.count("resume", query, "company");
        }).then(function (total) {
            $scope.groupTotal.leave = total;
            $scope.loading = false;
        });
    }

    initCondition();
    companyService.getOnJobAndLeaveJobResumeIds($scope.companyId).then(function (data) {
        $scope.allOnJobReusmeId = data.onJob;
        $scope.allLeaveJobReusmeId = data.leaveJob;
        initCondition();
        getGroupTotal();
    });


    $scope.$watch('pageState', function () {
        $scope.updateList($scope.selectType);
    }, true);
}).controller('companyViewProjectCtrl', function ($rootScope, $scope, $stateParams, config, apiService, uiModalService,
                                                  folderModalService, searchService, pipelineOperationService,
                                                  mailOperationService, achievementOperationService,
                                                  taskOperationService) {

    $scope.moduleId = config.moduleMap.project;
    $scope.companyId = $stateParams.companyId;
    $scope.total = 0;
    $scope.list = [];
    $scope.groupTotal = {
        contacts: 0,
        onJob: 0,
        leave: 0
    };

    $scope.pageState = {
        page: 1,
        total: 0,
        listLength: 25
    };

    $scope.fieldInTable = [
        "basicInfo.Fproject_name",
        "basicInfo.Fcustomer_id",
        "basicInfo.Fannual_salary",
        "basicInfo.Ffunction",
        "basicInfo.Fstart_time",
        "basicInfo.Fend_time",
        "stats.allResumeCount",
        ".operation",
        ".time"
    ];

    $scope.operation = {
        comment: {},
        pipeline: pipelineOperationService,
        folder: {},
        mail: mailOperationService,
        achievement: achievementOperationService,
        task: taskOperationService
    };

    $scope.operation.folder.addFolder = function (item) {
        return folderModalService.selectFolder(item.id, false, 2);
    };

    $scope.operation.comment.addComment = function (item) {
        var commentModuleId = 5;
        if (!commentModuleId) {
            return;
        }
        uiModalService.editComment(item.id, commentModuleId, 0);
    };

    $scope.operation.comment.previewList = function (item) {
        var itemId = item.id;
        var moduleId = 5;

        $rootScope.previewFile('comment', {
            itemId: itemId,
            moduleId: moduleId
        });
    };


    apiService.getFieldListForTable(2).then(function (data) {
        $scope.fieldList = data;
    });
    $scope.updateList = function () {
        var query = {
            query: {
                bool: {
                    must: [
                        {
                            term: {
                                'basicInfo.Fcompany_id.id': $scope.companyId
                            }
                        }
                    ]
                }
            },
            from: ($scope.pageState.page - 1) * $scope.pageState.listLength,
            size: $scope.pageState.listLength,
            sort: {
                "updateTime": {
                    order: 'desc'
                }
            }
        };
        searchService.search("project", query, "company").then(function (data) {
            $scope.pageState.total = data.total;
            $scope.pageState.totalAvailable = data.total;
            $scope.list = data.list;
        });
    };

    $scope.$watch('pageState', function () {
        $scope.updateList();
    }, true);
});
