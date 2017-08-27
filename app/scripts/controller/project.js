"use strict";
angular.module('tiger.ctrl.project', ['tiger.api.project']).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('project_add', {
        url: '/project/add?{companyId:int}&{copyId:int}',
        templateUrl: 'views/project/edit.html',
        controller: 'projectEditCtrl',
        data: {
            title: '新增项目',
            originTitle: '新增项目'
        }
    });

    $stateProvider.state('project_edit', {
        url: '/project/{projectId:int}/edit',
        templateUrl: 'views/project/edit.html',
        controller: 'projectEditCtrl',
        data: {
            title: '编辑项目',
            originTitle: '编辑项目'
        }
    });

    $stateProvider.state('project_view', {
        url: '/project/{projectId:int}',
        templateUrl: 'views/project/view.html',
        controller: 'projectCtrl',
        data: {
            title: '查看项目',
            originTitle: '查看项目'
        }
    });

    $stateProvider.state('project_view.info', {
        url: '/info',
        templateUrl: 'views/project/view_main.html'
        // controller: 'projectViewCtrl',
    });

    $stateProvider.state('project_view.update_logs', {
        url: '/updateLogs',
        templateUrl: 'views/candidate/update_logs.html',
        controller: 'projectLogCtrl'
    });

    $stateProvider.state('project_view.pipeline', {
        url: '/candidate?pipeline',
        templateUrl: 'views/project/pipeline.html',
        controller: 'projectViewPipelineCtrl',
        data: {
            title: '项目人才',
            originTitle: '项目人才'
        }
    });

    $stateProvider.state('project_view.matched_candidate', {
        url: '/matchedCandidate',
        templateUrl: 'views/project/matched_candidate.html',
        controller: 'projectViewMatchedCandidateCtrl'
    });

    $stateProvider.state('project_view.attachment', {
        url: '/attachment',
        templateUrl: 'views/attachment/attachment_list.html'
    });

}).controller('projectEditCtrl', function ($scope, $state, $stateParams, $sce, ngToast, apiService, projectService,
                                           companyService,
                                           uiModalService, attachmentService, config) {

    $scope.project = {};
    $scope.projectModuleType = 21;
    $scope.moduleId = config.moduleMap.project;
    $scope.projectId = $stateParams.projectId;
    $scope.companyId = $stateParams.companyId;
    $scope.copyId = $stateParams.copyId;
    $scope.loadProject = true;
    $scope.memberTypeList = [];
    $scope.memberList = [];
    $scope.memberTypeValue = '';
    $scope.projectMemberData = [];

    $scope.attachmentList = [];
    $scope.attachmentType = config.moduleIdConfig[$scope.moduleId].attachmentType;

    $scope.saveProject = function () {
        $scope.projectBasicInfo.$setSubmitted();
        if (!$scope.projectBasicInfo.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }

        if ($scope.projectMemberData.length === 0) {
            ngToast.warning("请先添加项目成员!");
            return;
        }

        var checkOK = 1;
        angular.forEach($scope.projectMemberData, function (value) {
            if (value === null || !value.member || !value.memberType) {
                checkOK = 0;
            }
        });

        if (checkOK === 0) {
            ngToast.warning("请先添加项目成员!");
            return;
        }

        if ($scope.loadProject) {
            return;
        }

        $scope.loadProject = true;
        projectService.updateProject($scope.project).then(function (data) {
            if ($scope.projectMemberData.length === 0) {
                return;
            }

            $scope.projectId = data;
            return projectService.updateProjectMembers(
                data, $scope.projectMemberData
            );
        }).then(function () {
            return attachmentService.updateAttachmentList(
                $scope.attachmentType, $scope.projectId, $scope.attachmentList);
        }).then(function () {
            $state.go('project_view.matched_candidate', {
                'projectId': $scope.projectId
            });
        }).finally(function () {
            $scope.loadProject = false;
        });
    };


    $scope.backView = function () {
        uiModalService.yesOrNo({
            title: '您确认要取消编辑吗？',
            okBtnText: '确认',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function (data) {
            if ($scope.projectId) {
                $state.go('project_view.info', {
                    'projectId': $scope.projectId
                });
            } else {
                $state.go('project_list');
            }
        });
    };

    $scope.deleteProjectInfo = function () {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function (data) {
            return projectService.deleteProject($scope.projectId);
        }).then(function (data) {
            $state.go('search', {
                moduleId: 2
            });
        });
    };

    $scope.addMemberData = function () {
        $scope.projectMemberData.push({});
    };

    $scope.removeMemberData = function (index) {
        if ($scope.projectMemberData.length > 1) {
            $scope.projectMemberData.splice(index, 1);
        } else {
            $scope.projectMemberData = [{}];
        }
    };

    //init form
    function initForm() {
        apiService.getDataList(401).then(function (data) {
            $scope.memberTypeList = data.list;
        });
        apiService.getDataList(2001).then(function (data) {
            $scope.memberList = data.list;
        });
        apiService.getDataListBySearch(803).then(function (data) {
            $scope.companyList = data.list;
        });
        return apiService.getFieldList($scope.moduleId, $scope.projectModuleType, 'basicInfo').then(function (data) {
            $scope.basicForm = data;
        });
    }

    initForm().then(function () {
        if (!$scope.projectId || $scope.projectId <= 0) {
            $scope.projectMemberData = [{}];
            return {};
        }

        projectService.listProjectMembers($scope.projectId).then(function (data) {
            if (data.length > 0) {
                $scope.projectMemberData = data;
            }
        });

        return projectService.getProject($scope.projectId);
    }).then(function (data) {
        if (data.basicInfo && data.basicInfo.Fproject_name) {
            $state.current.data.title = $state.current.data.originTitle + " - " + data.basicInfo.Fproject_name;
        }
        angular.extend($scope.project, data);

        if ($scope.companyId) {
            companyService.getCompany($scope.companyId).then(function (data) {
                $scope.project.basicInfo.Fcompany_id = {
                    id: data.id,
                    value: data.id,
                    title: data.basicInfo.Fcompany_name
                };
            });
        }

        if ($scope.copyId) {
            projectService.getProject($scope.copyId).then(function (data) {
                angular.extend($scope.project.basicInfo, data.basicInfo);
                return projectService.listProjectMembers($scope.copyId);
            }).then(function (data) {
                $scope.projectMemberData = _.map(data, function (item) {
                    return {
                        member: item.member,
                        memberType: item.memberType
                    }
                });
            })
        }
    }).finally(function () {
        $scope.loadProject = false;
    });

}).controller('projectCtrl', function ($scope, $state, $stateParams, apiService, projectService, attachmentService,
                                       resumeModal) {
    $scope.projectId = $stateParams.projectId;
    if (!$scope.projectId) {
        return;
    }

    $scope.project = {};

    $scope.pipelineCount = {};
    if ($scope.projectId > 0) {
        var searchParam = {"query": {"bool": {"must": [{"term": {"project.id": $scope.projectId}}]}}};
        projectService.getPipelineCount(searchParam).then(function (data) {
            $scope.pipelineCount = data;
        });
    }

    $scope.projectType = 21;
    $scope.projectModuleType = 2;

    $scope.joinResume = function () {
        resumeModal.selectResumeForProject($scope.project).then(function (data) {
            return projectService.batchOperation($scope.projectId, data, 1, null);
        }).then(function () {
            $state.reload();
        });
    };

    $scope.quickEditFunc = function (moduleItemName, fieldItem, itemId, value) {
        projectService.updateField(moduleItemName, fieldItem.name, itemId, value, $scope.projectId);
    };

    projectService.getProject($scope.projectId).then(function (data) {
        $state.current.data.title = $state.current.data.originTitle + " - " + data.basicInfo.Fproject_name;
        $scope.project = data;
    });

    projectService.countMatchedCandidate($scope.projectId).then(function (data) {
        $scope.matchedCandidateCount = data;
    });

    apiService.getFieldList($scope.projectModuleType, $scope.projectType, 'basicInfo').then(function (data) {
        $scope.basicForm = data;
    });

    projectService.listProjectMembers($scope.projectId).then(function (data) {
        $scope.projectMemberData = data;
    });

    attachmentService.getAttachmentListWithSubtype(34, $scope.projectId).then(function (data) {
        $scope.attachmentList = data;
    });

    if ($state.current.name === 'project_view') {
        $state.go('.pipeline');
    }

}).service('pipelineOperationService', function ($state, ngToast, config, uiModalService, projectService,
                                                 projectResumeModal) {
    var self = this;
    this._operation = function (pipelineItem, status, data, extra, operation) {
        if (operation) {
            return projectService.operation(
                pipelineItem.projectId, pipelineItem.resumeId, status, data, extra,
                operation.id
            ).then(function (data) {
                angular.extend(operation, data);
                return data;
            });
        } else {
            return projectService.operation(
                pipelineItem.projectId, pipelineItem.resumeId, status, data, extra
            ).then(function (data) {
                pipelineItem.operationList.unshift(data);
                pipelineItem.lastStatus = data.status;
                return data;
            });
        }
    };

    this.join = function (candidateId) {
        var joinedProjectId = null;
        return projectResumeModal.selectProject(candidateId).then(function (data) {
            joinedProjectId = data.value;
            return projectService.operation(
                data.value, candidateId, 1, null
            );
        }).then(function (data) {
            if ($state.current.name.indexOf('candidate_view') > -1) {
                $state.reload();
            }
            return {
                projectId: joinedProjectId
            }
        })
    };

    this.recommend = function (pipelineItem) {
        return uiModalService.yesOrNo({
            title: '您确认推荐此人才？',
            okBtnText: '推荐'
        }).then(function () {
            self._operation(pipelineItem, config.pipelineStatus.recommend, {}).then(function (data) {
                $state.reload();
            });
        });
    };

    this.remove = function (pipelineItem) {
        return uiModalService.yesOrNo({
            title: '您确认移除此人才?',
            okBtnText: '移除'
        }).then(function () {
            projectService.remove(pipelineItem.projectId, pipelineItem.resumeId).then(function () {
                $state.reload();
            });
        });
    };

    this.interview = function (pipelineItem, operation) {
        return projectResumeModal.interview(operation ? operation.data : null).then(function (data) {
            var count;
            if (data.interviewCount) {
                count = data.interviewCount;
            } else {
                count = 1;
                angular.forEach(pipelineItem.operationList, function (item) {
                    if (item.status.value == config.pipelineStatus.interview) {
                        count++;
                    }
                });
                data.interviewCount = count;
            }
            return self._operation(pipelineItem, config.pipelineStatus.interview,
                data, count, operation).then(function (data) {
                $state.reload();
            });
        });
    };

    this.reject = function (pipelineItem, operation) {
        return projectResumeModal.reject(operation ? operation.data : null).then(function (data) {
            return self._operation(pipelineItem, config.pipelineStatus.reject, data, null,
                operation).then(function (data) {
                $state.reload();
            });
        });
    };

    this.offer = function (pipelineItem, operation) {
        return projectResumeModal.offer(operation ? operation.data : null).then(function (data) {
            return self._operation(
                pipelineItem, config.pipelineStatus.offer, data, data.offerStatus,
                operation).then(function (data) {
                $state.reload();
            });
        });
    };

    this.entry = function (pipelineItem, operation) {
        var operationData;

        //从发票和pipeline入口来的数据结构不一样
        var resumeName = !!pipelineItem.resume.basicInfo ? pipelineItem.resume.basicInfo.Fname : pipelineItem.resume.title;

        return projectResumeModal.entry(operation ? operation.data : null,
            resumeName
        ).then(function (data) {
            operationData = data;
            return self._operation(
                pipelineItem, config.pipelineStatus.entry, data, null, operation);
        }).then(function (data) {
            if (operationData.changeProjectStatus) {
                return projectService.changeProjectStatus(
                    pipelineItem.projectId, config.projectStatus.success);
            } else {
                return data;
            }
        }).then(function (data) {
            $state.reload();
        });
    };
}).controller('projectViewPipelineCtrl', function ($scope, $rootScope, $state, $stateParams, config, apiService,
                                                   uiModalService, projectService, pipelineOperationService, taskOperationService,
                                                   achievementOperationService, mailOperationService) {

    $scope.moduleId = config.moduleMap.project_resume;
    $scope.total = 0;
    $scope.list = [];

    $scope.pageState = {
        page: 1,
        total: 0,
        totalAvailable: 0,
        offset: 0,
        listLength: 25
    };

    $scope.fieldInTable = [
        "resume.basicInfo.Fname",
        "resume.stats.commentCount",
        "resume.stats.attachmentCount",
        "resume.basicInfo.Fsex",
        "resume.basicInfo.Fcity",
        "resume.basicInfo.Fwork_year",
        "resume.basicInfo.Fcurrent_salary",
        "resume.occupationList.Ftitle",
        "resume.occupationList.Fcompany_id",
        "resume.basicInfo.Fphone",
        ".lastStatus",
        ".operation",
        ".time"
    ];

    $scope.operation = {
        pipeline: pipelineOperationService,
        achievement: achievementOperationService,
        mail: mailOperationService,
        comment: {},
        task: taskOperationService
    };

    $scope.quickEditFunc = projectService.updatePipelineField;

    $scope.operation.comment.previewList = function (item) {
        $rootScope.previewFile('comment', {
            itemId: item.resumeId,
            moduleId: 4
        });
    };

    $scope.operation.comment.addComment = function (item) {
        uiModalService.editComment(item.id, config.moduleIdConfig[config.moduleMap.candidate].commentModuleId, 0).then(function () {
            $state.reload();
        });
    };

    $scope.pipelineCurrentStatus = $stateParams.pipeline || 'all';

    $scope.changePipelineCurrentStatus = function (newStatus) {
        $scope.pipelineCurrentStatus = newStatus;
        $scope.updateList();
    };

    apiService.getFieldListForTable(10).then(function (data) {
        $scope.fieldList = data;
    });

    $scope.updateList = function () {
        $scope.loadList = true;
        var condition = [];
        if ($scope.pipelineCurrentStatus != 'all') {
            condition.push({
                term: {
                    'lastStatus.value': config.pipelineStatus[$scope.pipelineCurrentStatus]
                }
            });
        }

        projectService.listProjectCandidate($scope.projectId, {
                bool: {
                    must: condition
                }
            }, {
                updateTime: {
                    order: 'desc'
                }
            }, $scope.pageState.page,
            $scope.pageState.listLength
        ).then(function (data) {
            $scope.pageState.total = data.total;
            $scope.pageState.totalAvailable = data.total;
            $scope.pageState.offset = ($scope.pageState.page - 1) * $scope.pageState.listLength;
            $scope.list = data.list;
            $scope.loadList = false;

            $state.go('.', {
                pipeline: $scope.pipelineCurrentStatus
            }, {
                notify: false,
                location: 'replace'
            });

        });
    };
    $scope.$watch('pageState.page', function (newPage) {
        $scope.pageState.offset = (newPage - 1) * $scope.pageState.listLength;
        $scope.updateList();
    });

    // $scope.$watch('pageState', function () {
    //     console.log('watch pagestate' + $scope.pageState);
    //     $scope.updateList();
    // }, true);
}).controller('projectViewMatchedCandidateCtrl', function ($scope, $state, $rootScope, $stateParams, ngToast,
                                                           config, apiService, uiModalService, projectService,
                                                           pipelineOperationService, achievementOperationService,
                                                           mailOperationService, taskOperationService) {
    $scope.moduleId = config.moduleMap.candidate;
    $scope.total = 0;
    $scope.list = [];

    $scope.pageState = {
        page: 1,
        total: 0,
        totalAvailable: 0,
        offset: 0,
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
        ".operation"];

    $scope.operation = {
        pipeline: pipelineOperationService,
        achievement: achievementOperationService,
        mail: mailOperationService,
        comment: {},
        batch: {},
        task: taskOperationService
    };

    $scope.operation.comment.previewList = function (item) {
        $rootScope.previewFile('comment', {
            itemId: item.id,
            moduleId: 4
        });
    };

    $scope.operation.comment.addComment = function (item) {
        uiModalService.editComment(item.id, config.moduleIdConfig[config.moduleMap.candidate].commentModuleId, 0).then(function () {
            $state.reload();
        });
    };

    $scope.operation.batch.joinProject = function (list) {
        $scope.loadList = true;
        projectService.batchOperation($scope.projectId, list, 1, null).then(function (data) {
            ngToast.success(data.result > 0 ? "操作成功" : "操作失败");
        }).then(function () {
            $state.reload();
        });
    };


    apiService.getFieldListForTable(1).then(function (data) {
        $scope.fieldList = data;
    });

    $scope.updateList = function () {
        $scope.loadList = true;

        projectService.listMatchedCandidate($scope.projectId, $scope.pageState.page,
            $scope.pageState.listLength
        ).then(function (data) {
            $scope.loadList = false;
            if (!data) {
                return;
            }
            $scope.pageState.total = data.total;
            $scope.pageState.totalAvailable = data.total;
            $scope.pageState.offset = ($scope.pageState.page - 1) * $scope.pageState.listLength;
            $scope.list = data.list;
        });
    };
    $scope.$watch('pageState.page', function (newPage) {
        $scope.pageState.offset = (newPage - 1) * $scope.pageState.listLength;
        $scope.updateList();
    });
}).controller('projectOperationCtrl', function ($scope, $state, $uibModal, config, uiModalService, folderModalService,
                                                invoiceModal, ngToast, achievementModal, projectService,
                                                taskOperationService) {

    function editRecReport(item) {
        var cacheItem = angular.extend({}, item);

        $uibModal.open({
            animation: false,
            templateUrl: 'recReportEditModal.html',
            controller: "recReportGenerateCtrl",
            resolve: {
                recReportData: function () {
                    return cacheItem;
                }
            }
        }).result.then(function (data) {
            $.map(data, function (value, key) {
                if (key.charAt(0) == '_') {
                    return;
                }
                item[key] = value;
            });
        }, function () {
        });
    }

    $scope.generateReport = function () {
        editRecReport({})
    };

    $scope.addComment = function (projectId) {
        uiModalService.editComment(projectId, 5, 0, $uibModal).then(function () {
            $state.reload();
        });
    };

    $scope.joinFolder = function (projectId) {
        folderModalService.selectFolder(projectId, false, 2);
    };

    $scope.addInvoice = function (projectId, projectName, resumeId, resumeName) {
        invoiceModal.addInvoice(projectId, projectName, resumeId, resumeName);
    };

    $scope.editInvoice = function (invoiceId) {
        invoiceModal.editInvoice(invoiceId);
    };

    $scope.operationInvoice = function (invoiceId, operationType) {
        invoiceModal.operationInvoice(invoiceId, operationType);
    };

    $scope.openAchievement = function (projectId, resumeId, achievementId) {
        //projectService.listProjectAchievements(projectId, resumeId).then(function (data) {
        //if (data.length == 0) {
        return achievementModal.openAchievement(projectId, resumeId, achievementId);
        //} else {
        //    achievementModal.openAchievementWarn(projectId, resumeId, data);
        //
        //}
        //})
    };

    $scope.addTask = function (project) {
        taskOperationService.addTask(project, config.moduleMap.project);
    };

    $scope.deleteProject = function (projectId) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function (data) {
            return projectService.deleteProject(projectId);
        }).then(function (data) {
            $state.go('search', {
                moduleId: 2
            });
        });
    }
}).controller('achievementEditCtrl', function ($scope, $uibModal, uiModalService, $state, $uibModalInstance, ngToast,
                                               achievementInfo, projectService) {
    //todo 需要加loading. 在人选载入完成之前保存按钮可点击,且会控制台报错(不影响用户使用) 12.23 liudi
    $scope.readOnly = false;
    $scope.revenueAmount = 1;
    if (!achievementInfo.id) {
        $scope.isNew = true;
        projectService.listProjectMemberRevenues(achievementInfo.projectId).then(function (data) {
            $scope.achievement = {
                resumeId: achievementInfo.resumeId,
                projectId: achievementInfo.projectId,
                totalAmount: 0,
                itemList: [{}],
                memberRevenueList: data,
                payNote: ''
            };
        });
    } else {
        $scope.isNew = false;
        $scope.readOnly = !!achievementInfo.readOnly;
        projectService.getAchievementById(achievementInfo.id).then(function (data) {
            $scope.achievement = data;
            //angular.forEach(data.memberRevenueList, function (revenue) {
            //    revenue.revenuePercent = revenue.revenue / $scope.achievement.totalAmount * 100;
            //})
        })
    }

    function parseMoney(fee) {
        var f = parseFloat(fee);
        if (isNaN(f)) {
            return 0;
        }
        f = Math.round(fee * 100) / 100;
        return f;
    }

    $scope.addItem = function () {
        $scope.achievement.itemList.push({})
    };
    $scope.removeItem = function (index) {
        if ($scope.achievement.itemList.length > 1)
            $scope.achievement.itemList.splice(index, 1);
        else
            $scope.achievement.itemList[0] = {};
    };

    $scope.$watch('achievement.itemList', function (value) {
        if (!value) {
            return;
        }
        $scope.achievement.totalAmount = 0;
        angular.forEach(value, function (item) {
            if (!item.fee) {
                return;
            }
            item.fee = parseMoney(item.fee);
            $scope.achievement.totalAmount += item.fee;
        });
    }, true);

    $scope.$watch('achievement.memberRevenueList ', function (value) {
        if (!value) {
            return;
        }
        $scope.revenueAmount = 0;
        var index = 0;
        var length = value.length;
        var percentTotal = 0;
        angular.forEach(value, function (item) {
            index++;
            if (index != length) {
                item.revenue = parseMoney($scope.achievement.totalAmount / 100 * item.revenuePercent);
                $scope.revenueAmount += item.revenue;
                percentTotal += item.revenuePercent;
            } else {
                item.revenuePercent = 100 - percentTotal;
                item.revenue = parseMoney($scope.achievement.totalAmount / 100 * item.revenuePercent);
                $scope.revenueAmount += item.revenue;
            }
        });
    }, true);

    $scope.$watch('achievement.totalAmount ', function (value) {
        if (!value) {
            return;
        }
        $scope.revenueAmount = 0;
        var index = 0;
        var length = $scope.achievement.memberRevenueList.length;
        var percentTotal = 0;
        angular.forEach($scope.achievement.memberRevenueList, function (item) {
            index++;
            if (item.revenuePercent < 0) {
                return;
            }
            if (index != length) {
                item.revenue = parseMoney($scope.achievement.totalAmount / 100 * item.revenuePercent);
                $scope.revenueAmount += item.revenue;
                percentTotal += item.revenuePercent;
            } else {
                item.revenuePercent = 100 - percentTotal;
                item.revenue = $scope.achievement.totalAmount - $scope.revenueAmount;
                $scope.revenueAmount += item.revenue;
            }
        });
    }, true);


    $scope.ok = function () {
        var check = 1;
        if (!$scope.achievement.memberRevenueList || $scope.achievement.memberRevenueList.length <= 0) {
            ngToast.warning("请先添加项目成员");
            check = 0;
        }
        angular.forEach($scope.achievement.itemList, function (item) {
            if (check == 0) {
                return;
            }
            if (item.type == null || isNaN(item.fee)) {
                ngToast.warning("请先填充收费信息");
                check = 0;
                return;
            }
        });
        angular.forEach($scope.achievement.memberRevenueList, function (item) {
            if (check == 0) {
                return;
            }
            if (item.revenuePercent < 0 || item.revenuePercent > 100) {
                ngToast.warning("收费百分比不能大于100或者小于0");
                check = 0;
                return;
            }
        });
        if (check == 0) {
            return;
        }
        projectService.updateAchievement($scope.achievement).then(function (data) {
            if (data > 0) {
                $uibModalInstance.close(true);
            } else {
                // todo ???
                ngToast.warning("FAIL!");
            }
        })
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}).controller('achievementWarnCtrl', function ($scope, $uibModal, uiModalService, $state, $uibModalInstance,
                                               achievementInfo, achievementModal) {

    $scope.achievements = achievementInfo.list;
    $scope.ok = function () {
        $uibModalInstance.dismiss('cancel');
        achievementModal.openAchievement(achievementInfo.projectId, achievementInfo.resumeId, 0);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}).service('achievementOperationService', function (achievementModal, $state) {

    this.addAchievement = function (projectId, resumeId) {
        //projectService.listProjectAchievements(projectId, resumeId).then(function (data) {
        //    if (data.length == 0) {
        achievementModal.openAchievement(projectId, resumeId, 0).then(function () {
            $state.reload();
        });
        //} else {
        //    achievementModal.openAchievementWarn(projectId, resumeId, data);
        //
        //}
        //})
    };

    this.editAchievement = function (achievementId) {
        achievementModal.openAchievement(0, 0, achievementId).then(function () {
            $state.reload();
        });
    };

    this.readAchievement = function (achievementId) {
        achievementModal.openAchievement(0, 0, achievementId, true);
    };
}).controller('projectLogCtrl', function ($scope, projectService) {
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
            newValue: updateItem.newValue,
        };
    };
    projectService.getUpdateLogs($scope.projectId).then(function (data) {
        $scope.updateLogs = data;
    });
});
