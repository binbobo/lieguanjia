"use strict";

angular.module('tiger.ctrl.candidate', ['tiger.api.candidate']).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('candidate_add', {
        url: '/candidate/add?{resumeType:int}&{companyId:int}',
        templateUrl: 'views/candidate/edit.html',
        controller: 'candidateEditCtrl',
        data: {
            title: '新增人才'
        }
    });

    // 路由视图, 批量查看和单个查看共享
    var views = {
        'candidates': {
            url: '/candidates',
            templateUrl: 'views/candidate/batch_view.html',
            controller: 'candidatesViewCtrl',
            data: {
                title: '查看人才',
                originTitle: '查看人才'
            }
        },
        'candidateView': {
            url: '/candidate/{candidateId:int}?{project_id:int}',
            templateUrl: 'views/candidate/view.html',
            controller: 'candidateViewCtrl',
            data: {
                title: '查看人才',
                originTitle: '查看人才'
            },
            abstract: true
        },

        'candidateViewDefault': {
            url: '',
            templateUrl: 'views/candidate/view_main.html',

        },

        'candidateViewAttachment': {
            url: '/attachment',
            templateUrl: 'views/attachment/attachment_list.html',
            controller: 'candidateAttachmentCtrl'
        },

        'candidateViewUpdateLogs': {
            url: '/updateLogs',
            templateUrl: 'views/candidate/update_logs.html',
            controller: 'candidateLogCtrl'
        }
    };

    // 批量查看路由
    $stateProvider.state('candidates', views.candidates);
    $stateProvider.state('candidates.candidate_view', views.candidateView);
    $stateProvider.state('candidates.candidate_view.default', views.candidateViewDefault);
    $stateProvider.state('candidates.candidate_view.attachment', views.candidateViewAttachment);
    $stateProvider.state('candidates.candidate_view.update_logs', views.candidateViewUpdateLogs);

    // 单个查看路由
    $stateProvider.state('candidate_view', angular.copy(views.candidateView));
    $stateProvider.state('candidate_view.default', angular.copy(views.candidateViewDefault));
    $stateProvider.state('candidate_view.attachment', angular.copy(views.candidateViewAttachment));
    $stateProvider.state('candidate_view.update_logs', angular.copy(views.candidateViewUpdateLogs));

    $stateProvider.state('candidate_edit', {
        url: '/candidate/{candidateId:int}/edit?{attachmentId:int}',
        templateUrl: 'views/candidate/edit.html',
        controller: 'candidateEditCtrl',
        data: {
            title: '编辑人才',
            originTitle: '编辑人才'
        }
    });

    $stateProvider.state('candidate_import', {
        url: '/candidate/import?projectId',
        templateUrl: 'views/candidate/import.html',
        controller: 'candidateImportCtrl',
        data: {
            title: '批量导入'
        },
        resolve: {
            projectItem: function ($stateParams, $filter, projectService) {
                if (!$stateParams.projectId) {
                    return null;
                }

                return projectService.getProject($stateParams.projectId).then(function (item) {
                    return {
                        id: item.id,
                        value: item.id,
                        title: item.basicInfo.Fproject_name + ' - ' + (item.basicInfo.Fcompany_id ? $filter('i18n')(item.basicInfo.Fcompany_id) : "")
                    };
                });
            }
        }
    });

    $stateProvider.state('candidate_import_bg', {
        url: '/candidate/import_background',
        templateUrl: 'views/candidate/import_background.html',
        controller: 'candidateImportBackgroundCtrl',
        data: {
            title: '后台批量导入'
        }
    });

    $stateProvider.state('candidate_excel_import', {
        url: '/candidate/excelImport',
        templateUrl: 'views/candidate/excel_import.html',
        controller: 'excelImportCtrl',
        data: {
            title: 'Excel导入'
        }
    });
}).controller('candidateEditCtrl', function ($scope, $timeout, $sce, $state, $stateParams, ngToast, FileUploader,
                                             apiService, candidateService, fileService, attachmentService,
                                             companyService, resumeModal, uiModalService) {
    $scope.resume = null;
    $scope.moduleId = 1;

    $scope.resumeTypeList = [
        {
            id: 11,
            value: 11,
            type: 303,
            title: '候选人',
            i18n: {
                zh: "候选人",
                en: "Candidate"
            },
            color: "#00FF00",
            time: 0,
            children: null
        },
        {
            id: 12,
            value: 12,
            type: 303,
            title: '客户联系人',
            i18n: {
                zh: "客户联系人",
                en: "Contact Person"
            },
            color: "#00FF00",
            time: 0,
            children: null
        },
        {
            id: 13,
            value: 13,
            type: 303,
            title: 'Cold Call',
            color: "#00FF00",
            time: 0,
            children: null
        }
    ];

    $scope.candidateId = $stateParams.candidateId;
    $scope.companyId = $stateParams.companyId;
    $scope.resumeType = $stateParams.resumeType;
    $scope.loadResume = false;

    $scope.imageUploader = new FileUploader({
        url: '/api/file/upload',
        autoUpload: true,
        formData: [
            {
                type: 37
            }
        ],
        filters: [
            {
                name: 'img',
                fn: function (item) {
                    if (item.type === 'image/jpeg') {
                        return true;
                    }

                    if (item.type === 'image/png') {
                        return true;
                    }

                    uiModalService.alert('请选择正确的图片');
                    console.error(item);
                    return false;
                }
            }
        ],
        onBeforeUploadItem: function (item) {
            item.formData = [
                {
                    type: 37,
                    // Java特别渣，需要单独传文件名
                    fileName: item.file.name
                }
            ];
        },
        onSuccessItem: function (item, response, status, headers) {
            if (response.result.id) {
                $scope.resume.basicInfo.Favatar = response.result.id;
            }
        }
    });

    $scope.attachmentList = [];

    $scope.resumeAttachmentType = {
        name: 'subType',
        dataType: 'select',
        listType: 600,
        defaultValue: 134040112
    };

    $scope.resumeAttachmentTmp = {
        fileType: null
    };


    $scope.onResumeUpload = -1;
    $scope.onFileUploadSuccess = function (data) {
        var fileItem = data;
        candidateService.checkDuplicateAttachment(
            data.id, $scope.candidateId
        ).then(function (data) {
            var needParse = isEmptyResume() &&
                fileItem.subTypeItem.value === 134040112;
            if (needParse) {
                $scope.parseResume(fileItem.id);
            }
            fileItem.duplicateResumeId = data.result;

            if (!$scope.candidateId && !needParse) {
                $scope.loadResume = false;
            }
        });
    };

    $scope.duplicateList = [];

    var duplicateTimeout;
    $scope.checkDuplicate = function (isAsync) {
        if (isAsync) {
            clearTimeout(duplicateTimeout);
            duplicateTimeout = setTimeout($scope.checkDuplicate, 1000);
            return;
        }

        return candidateService.checkDuplicate($scope.generateResumeSummaryItem()).then(function (data) {
            $scope.duplicateList = data.list;
        });
    };

    $scope.generateResumeSummaryItem = function () {
        var result = {};
        if (!$scope.resume) {
            return {};
        }

        result.id = $scope.resume.id;
        if ($scope.resume.basicInfo) {
            result.basicInfo = {};

            result.basicInfo.Fname = $scope.resume.basicInfo.Fname;
            result.basicInfo.Fqq = $scope.resume.basicInfo.Fqq;
            result.basicInfo.Fbirthday = $scope.resume.basicInfo.Fbirthday;
            result.basicInfo.Fskills = $scope.resume.basicInfo.Fskills;

            result.basicInfo.Fphone = $scope.resume.basicInfo.Fphone;
            result.basicInfo.Femail = $scope.resume.basicInfo.Femail;
        }

        if ($scope.resume.occupationList) {
            result.occupationList = _.map($scope.resume.occupationList, function (item) {
                return {
                    Fstart_time: item.Fstart_time,
                    Fend_time: item.Fend_time,
                    Ftitle: item.Ftitle
                };
            });
        }

        if ($scope.resume.projectList) {
            result.projectList = _.map($scope.resume.projectList, function (item) {
                return {
                    Fstart_time: item.Fstart_time,
                    Fend_time: item.Fend_time,
                    Ftitle: item.Ftitle
                };
            });
        }

        if ($scope.resume.educationList) {
            result.educationList = _.map($scope.resume.educationList, function (item) {
                return {
                    Fstart_time: item.Fstart_time,
                    Fend_time: item.Fend_time,
                    Fmajor: item.Fmajor,
                    Funiversity: item.Funiversity,
                    Fcollecage: item.Fcollecage
                };
            });
        }

        return result;
    };

    $scope.$watch('generateResumeSummaryItem()', function (newValue, oldValue) {
        if (newValue === null) {
            return;
        }
        $scope.checkDuplicate(true);
    }, true);

    $scope.saveResume = function () {
        $scope.resumeBasicInfo.$setSubmitted();

        var subItemReady = true;
        angular.forEach($scope.subItem.infoList, function (item) {
            if ($scope.subItem.editing[item.name] >= 0) {
                if (!$scope.validateSubItem(item.name)) {
                    subItemReady = false;
                }
            }
        });

        if (!subItemReady) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        } else if (!$scope.resumeBasicInfo.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }

        angular.forEach($scope.subItem.infoList, function (item) {
            if ($scope.subItem.editing[item.name] >= 0) {
                $scope.saveSubItem(item.name);
            }
        });

        $scope.loadResume = true;

        candidateService.updateCandidate($scope.resume).then(function (data) {
            if (!$scope.candidateId) {
                $scope.candidateId = data;
            }

            return attachmentService.updateAttachmentList(31, $scope.candidateId, $scope.attachmentList);
        }).then(function () {
            $scope.loadResume = false;

            $state.go('candidate_view.default', {
                candidateId: $scope.candidateId
            });
        }, function () {
            $scope.loadResume = false;
        });
    };

    $scope.parseAttachmentId = null;
    $scope.parseResume = function (attachmentId) {
        $scope.loadResume = true;
        var parseData;
        candidateService.parseCandidate(attachmentId).then(function (data) {
            $scope.parseAttachmentId = attachmentId;
            parseData = data;

            return candidateService.checkDuplicate(data);
        }).then(function (duplicateData) {
            $scope.duplicateList = duplicateData.list;
            angular.forEach(parseData, function (item, index) {
                if (item !== null) {
                    $scope.resume[index] = item;
                }
            });
            parseData
            $scope.loadResume = false;
        }, function (data) {
            $scope.loadResume = false;
        });
    };

    $scope.backView = function () {
        uiModalService.yesOrNo({
            title: '您确认要取消编辑吗？',
            okBtnText: '确认',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function (data) {
            if ($scope.candidateId) {
                $state.go('candidate_view.default', {
                    candidateId: $scope.candidateId
                });
            } else {
                $state.go('candidate_list');
            }
        });
    };

    $scope.deleteResume = function () {
        uiModalService.yesOrNo({
            title: '您确认要删除吗？',
            okBtnClass: 'btn btn-danger',
            okBtnText: '删除',
            cancelBtnText: '取消'
        }).then(function () {
            return candidateService.deleteCandidate($scope.resume);
        }).then(function () {
            $state.go('search', {
                moduleId: 1
            });
        });
    };

    $scope.basicForm = [];
    $scope.subItem = {
        infoList: {},
        formList: {},
        editing: {},
        tmpData: {}
    };

    function initForm() {
        $scope.subItem.infoList = {
            occupationList: null,
            educationList: null,
            projectList: null
        };

        if (!$scope.resume) {
            return;
        }

        apiService.getFieldList(1, $scope.resume.moduleType.value, 'basicInfo').then(function (data) {
            $scope.basicForm = data;

            return apiService.getFieldList(1, $scope.resume.moduleType.value, 'educationList');
        }).then(function (data) {
            $scope.subItem.infoList.educationList = {
                name: 'educationList',
                form: data,
                title: '教育经历',
                i18n: {
                    zh: '教育经历',
                    en: 'Education'
                }
            };
            $scope.subItem.editing.educationList = -1;
            $scope.eduForm = data;

            return apiService.getFieldList(1, $scope.resume.moduleType.value, 'projectList');
        }).then(function (data) {
            $scope.subItem.infoList.projectList = {
                name: 'projectList',
                form: data,
                title: '项目经历',
                i18n: {
                    zh: '项目经历',
                    en: 'Project'
                }
            };
            $scope.subItem.editing.projectList = -1;
            $scope.projectForm = data;

            return apiService.getFieldList(1, $scope.resume.moduleType.value, 'occupationList');
        }).then(function (data) {
            $scope.subItem.infoList.occupationList = {
                name: 'occupationList',
                form: data,
                title: '工作经历',
                i18n: {
                    zh: '工作经历',
                    en: 'Occupation'
                }
            };
            $scope.subItem.editing.occupationList = -1;
            $scope.workForm = data;
            if (!$scope.initialResumeBasicInfo) {
                $scope.initialResumeBasicInfo = JSON.stringify($scope.resume.basicInfo);
            }
        });
    }

    $scope.$watch('resume.moduleType', function () {
        initForm();
    });

    $scope.validateSubItem = function (itemName) {
        var subItemForm = $scope.subItem.formList[itemName];
        subItemForm.$setSubmitted();
        return subItemForm.$valid;
    };

    $scope.saveSubItem = function (itemName) {
        if (!$scope.validateSubItem(itemName)) {
            ngToast.warning("内容错误，请检查后保存");
            return false;
        }

        if (!$scope.resume[itemName]) {
            $scope.resume[itemName] = [];
        }

        if ($scope.subItem.editing[itemName] >= $scope.resume[itemName].length) {
            $scope.resume[itemName].push($scope.subItem.tmpData[itemName]);
        } else {
            $scope.resume[itemName][$scope.subItem.editing[itemName]] = $scope.subItem.tmpData[itemName];
        }

        $scope.subItem.editing[itemName] = -1;
        return true;
    };

    $scope.addSubItem = function (itemName) {
        $scope.cancelSubItem(itemName, true).then(function () {
            if (!$scope.resume[itemName]) {
                $scope.resume[itemName] = [];
            }

            $scope.subItem.editing[itemName] = $scope.resume[itemName].length;
            $scope.subItem.tmpData[itemName] = {};
        });
    };

    $scope.editSubItem = function (itemName, index) {
        $scope.cancelSubItem(itemName, true).then(function () {
            $scope.subItem.editing[itemName] = index;
            $scope.subItem.tmpData[itemName] = angular.extend({}, $scope.resume[itemName][index]);
        });
    };

    $scope.cancelSubItem = function (itemName, needCheck) {
        var touched = false;
        if (needCheck && $scope.subItem.editing[itemName] >= 0) {
            angular.forEach($scope.subItem.formList[itemName], function (item, key) {
                if (key.charAt(0) === '$') {
                    return;
                }
                if (item.$touched) {
                    touched = true;
                }
            });
        }

        if (!touched) {
            $scope.subItem.editing[itemName] = -1;
            return $timeout(0);
        } else {
            return uiModalService.yesOrNo({
                title: '您是否要放弃当前编辑内容？',
                okBtnText: '放弃',
                okBtnClass: 'btn btn-danger',
                cancelBtnText: '继续编辑'
            }).then(function () {
                $scope.subItem.editing[itemName] = -1;
                return $timeout(0);
            });
        }
    };

    $scope.delSubItem = function (itemName, index) {
        if ($scope.subItem.editing[itemName] === index) {
            $scope.subItem.editing[itemName] = -1;
        } else if ($scope.subItem.editing[itemName] > index) {
            $scope.subItem.editing[itemName] -= 1;
        }

        $scope.resume[itemName].splice(index, 1);
    };

    if ($scope.candidateId > 0) {
        candidateService.getCandidate($scope.candidateId).then(function (data) {
            $state.current.data.title = $state.current.data.originTitle + " - " + data.basicInfo.Fname;
            $scope.resume = data;

            if (!$scope.resume.moduleType) {
                $scope.resume.moduleType = $scope.resumeTypeList[0];
            } else {
                angular.forEach($scope.resumeTypeList, function (item) {
                    if (item.value === $scope.resume.moduleType.value) {
                        $scope.resume.moduleType = item;
                    }
                });
            }
            //todo  附件列表无需再取
            return attachmentService.getAttachmentList(31, $scope.candidateId);
        }).then(function (data) {
            $scope.attachmentList = data;

            if (!$stateParams.attachmentId) {
                return null;
            }
            var flag = true;
            angular.forEach($scope.attachmentList, function (item) {
                if (item.id === $stateParams.attachmentId) {
                    flag = false;
                    item.exist = true;
                }
            });

            if (!flag) {
                return null;
            }

            return fileService.detail($stateParams.attachmentId);
        }).then(function (fileData) {
            if (!fileData) {
                return;
            }

            apiService.dataList(600).then(function (data) {
                var fileItem = {
                    id: fileData.id,
                    fileName: fileData.fileName,
                    fileType: fileData.fileType,
                    subTypeItem: data.list[0],
                    autoAdd: true,
                };
                $scope.attachmentList.push(fileItem);

                return attachmentService.updateAttachmentList(31, $scope.candidateId,
                    $scope.attachmentList);
            });
        });
    } else {
        $scope.resume = {
            moduleType: $scope.resumeTypeList[0]
        };

        if ($scope.resumeType === 11) {
            $scope.resume.moduleType = $scope.resumeTypeList[0];
        } else if ($scope.resumeType === 12) {
            $scope.resume.moduleType = $scope.resumeTypeList[1];
        }
    }

    if ($scope.companyId) {
        companyService.getCompany($scope.companyId).then(function (data) {
            angular.extend($scope.resume.basicInfo, {
                Findustry: data.basicInfo.Findustry_ids
            });

            if (!$scope.resume.occupationList) {
                $scope.resume.occupationList = [];
            }

            $scope.resume.occupationList.unshift({
                Findustry_id: data.basicInfo.Findustry_ids,
                Fcompany_id: {
                    id: data.id,
                    value: data.id,
                    title: data.basicInfo.Fcompany_name
                }
            });
        });

    }

    function isEmptyResume() {
        return !$scope.candidateId &&
            (!$scope.resume.occupationList || $scope.resume.occupationList.length < 1) &&
            (!$scope.resume.projectList || $scope.resume.projectList.length < 1) &&
            (!$scope.resume.educationList || $scope.resume.educationList.length < 1) &&
            ($scope.initialResumeBasicInfo === "{}" || $scope.initialResumeBasicInfo === JSON.stringify($scope.resume.basicInfo));
    }

}).controller('candidateViewCtrl', function ($rootScope, $scope, $state, $stateParams,
                                             apiService, candidateService, candidateCommonService) {

    $scope.candidateId = $stateParams.candidateId || $scope.candidateId;// 取路由参数或者通过preview传递过来的参数

    $scope.resume = {};

    if (!$scope.candidateId) {
        return;
    }

    if (candidateCommonService.isBatchViewing()) {
        // 通知批量查看视图更新当前激活id
        $rootScope.$broadcast('candidates.candidate.stateParamsUpdated', {candidateId: $scope.candidateId});
    }

    candidateService.getCandidate($scope.candidateId).then(function (data) {
        if (angular.isDefined($state.current.data.originTitle)) {
            $state.current.data.title = $state.current.data.originTitle + " - " + data.basicInfo.Fname;
        }
        angular.merge($scope.resume, data);

        if (!data.moduleType) {
            data.moduleType = {
                value: 11
            };
        }

        return candidateService.getCandidateFields(data.moduleType);
    }, function () {
        if (!candidateCommonService.isCandidateViewing()) {
            $rootScope.$broadcast('$getResumeDataError', {
                type: 'candidate_basic_info'
            });
        }
    }).then(function (data) {
        $scope.fieldList = data;
    });

    $scope.quickEditFunc = function (moduleItemName, fieldItem, itemId, value) {
        return candidateService.updateField(moduleItemName, fieldItem.name, itemId, value, $scope.candidateId).then(function () {
            // 修改姓名的时候， 更新批量查看页面当前激活项名称
            if (fieldItem.name == 'Fname') {
                if (candidateCommonService.isBatchViewing()) {
                    $rootScope.$broadcast('candidates.candidate.nameUpdated', {newName: value});
                }
            }
            // $state.reload();  //修改基础信息后刷新页面
        });
    };
}).controller('candidatesViewCtrl', function ($scope, localStorageService) {

    // 获取当前查看的简历列表
    $scope.resumes = JSON.parse(localStorageService.get('batchViewing.resumeList'));
    if (!$scope.resumes || !$scope.resumes.length) {
        return;
    }

    // 切换导航菜单
    $scope.switchResume = function (resume) {
        _.debounce(function () {
            if (resume.id != $scope.activeResumeId) {
                goBatchView(resume);
            }
        }, 300)();
    }

    // 路由到批量查看视图
    function goBatchView(resume) {
        if (!resume) return;

        $scope.activeResumeId = resume.id;
        $state.go('candidates.candidate_view.default', {
            candidateId: resume.id,
            project_id: resume.projectId
        });
    }

    // 更新localStorage
    function updateStorageResumes() {
        localStorageService.set('batchViewing.resumeList', JSON.stringify($scope.resumes));
    }

    // 移除导航栏中的项
    $scope.removeResume = function (resume) {
        var index = findResumeById(resume.id);
        if (index === -1) return;

        $scope.resumes.splice(index, 1);
        updateStorageResumes();

        if ($scope.resumes.length) {
            // 如果当前关闭的为激活项，激活相邻项目
            if (resume.id == $scope.activeResumeId) {
                var nextActiveResume;

                if (index > 0) {
                    nextActiveResume = $scope.resumes[index - 1];// pre
                } else {
                    nextActiveResume = $scope.resumes[index];// next
                }
                goBatchView(nextActiveResume);
            }
        } else {
            $state.go('search', {
                moduleId: 1
            });
        }
    }

    // 根据简历id获取索引
    function findResumeById(id) {
        if (!$scope.resumes) {
            return -1;
        }
        for (var i = 0, len = $scope.resumes.length; i < len; i++) {
            if ($scope.resumes[i].id == id) {
                return i;
            }
        }
        return -1;
    }

    // 自定义更新参数事件
    $scope.$on('candidates.candidate.joinNewProject', updateResumeProjectId);
    $scope.$on('candidates.candidate.stateParamsUpdated', updateActiveResumeId);
    $scope.$on('candidates.candidate.nameUpdated', updateResumeName);


    // 页面加载时, 记录当前激活的简历id
    function updateActiveResumeId(event, params) {
        $scope.activeResumeId = params.candidateId;
    }

    // 加入新项目时, 更新projectId
    function updateResumeProjectId(event, params) {
        var index = findResumeById($scope.activeResumeId);
        if (index !== -1 && $scope.resumes[index].projectId != params.projectId) {
            $scope.resumes[index].projectId = params.projectId;
            updateStorageResumes();
        }
    }

    // 姓名修改时, 更新导航栏显示名称
    function updateResumeName(event, params) {
        var index = findResumeById($scope.activeResumeId);
        if (index !== -1 && $scope.resumes[index].name != params.newName) {
            $scope.resumes[index].name = params.newName;
            updateStorageResumes();
        }
    }

}).controller('candidateAttachmentCtrl', function ($scope, $stateParams, attachmentService) {
    $scope.candidateId = $stateParams.candidateId || $scope.candidateId;// 取路由参数或者通过preview传递过来的参数
    if (!$scope.candidateId) {
        return;
    }

    $scope.attachmentList = [];
    attachmentService.getAttachmentListWithSubtype(31, $scope.candidateId).then(function (data) {
        $scope.attachmentList = data;
    })
}).controller('candidateLogCtrl', function ($scope, candidateService) {
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
    candidateService.getUpdateLogs($scope.candidateId).then(function (data) {
        $scope.updateLogs = data;
    });
}).controller('candidateProjectCtrl', function ($rootScope, $scope, $state, $stateParams, projectService, uiModalService,
                                                pipelineOperationService, candidateCommonService) {
    $scope.uiModalService = uiModalService;
    $scope.operationFunc = {
        pipeline: pipelineOperationService,
        project: {
            joinProject: function () {
                pipelineOperationService.join(
                    $scope.candidateId
                ).then(function (data) {
                    $scope.projectId = data.projectId;
                    if (candidateCommonService.isBatchViewing()) {
                        $rootScope.$broadcast('candidates.candidate.joinNewProject', {projectId: data.projectId});
                    }
                    updateProjectList();
                });
            },
            remove: function (pipelineItem) {
                uiModalService.yesOrNo({
                    title: '您确认移除此人才?',
                    okBtnText: '移除'
                }).then(function () {
                    return projectService.remove(pipelineItem.projectId, pipelineItem.resumeId);
                }).then(function () {
                    if (candidateCommonService.isBatchViewing()) {
                        $rootScope.$broadcast('candidates.candidate.joinNewProject', {projectId: 0});
                        $state.go('candidates.candidate_view.default', {
                            candidateId: $scope.candidateId,
                            project_id: 0
                        }, {reload: true});
                    } else {
                        $state.go('candidate_view.default', {
                            candidateId: $scope.candidateId,
                            project_id: 0
                        }, {reload: true});
                    }
                })
            }
        }
    };
    $scope.projectId = $stateParams.project_id;
    $scope.candidateId = $stateParams.candidateId;

    $scope.joinedProjectList = [];
    $scope.selectedProject = null;

    function updateProjectList() {
        projectService.listJoinedProject($scope.candidateId).then(function (data) {
            $scope.joinedProjectList = data || [];

            if (!$scope.projectId) {
                if ($scope.joinedProjectList.length > 0) {
                    $scope.projectId = $scope.joinedProjectList[0].value;
                }
            }

            if (!$scope.projectId) {
                return;
            }

            angular.forEach($scope.joinedProjectList, function (item) {
                if (item.value === $scope.projectId) {
                    $scope.selectedProject = item;
                }
            });
        });
    }

    updateProjectList();

    $scope.uiSelectChange = function ($item, $model) {
        $scope.selectedProject = $item;
    };

    $scope.$watch('selectedProject', function (item) {
        if (!item) {
            return;
        }

        $scope.projectId = item.value;
        $stateParams.project_id = item.value;

        $stateParams.candidates = $scope.resumes;

        $state.go($state.current.name, $stateParams, {
            notify: false,
            location: 'replace'
        });

        projectService.getProjectCandidateDetail(
            $scope.projectId, $scope.candidateId
        ).then(function (data) {
            $scope.projectCandidateDetail = data;
            $scope.rowItem = $scope.projectCandidateDetail;
        });
    });

    $scope.rowItem = null;
    $scope.projectCandidateDetail = {};

}).controller('candidateImportCtrl', function ($scope, $stateParams, FileUploader, ngToast, projectItem, config) {

    var tmpFields = angular.copy(config.batchImportCandidateFields);
    tmpFields.duplicateOperation.itemList.splice(1, 1);
    $scope.fields = tmpFields;
    $scope.importTemplate = {
        type: {value: 11},
        project: projectItem
    };

    $scope.state = {
        finish: 0,
        error: 0,
        duplicate: 0
    };

    $scope.clearQueue = function () {
        $scope.state.finish = 0;
        $scope.state.error = 0;
        $scope.state.duplicate = 0;
        $scope.uploader.clearQueue();
    };


    $scope.uploadAll = function () {
        $scope.importForm.$setSubmitted();
        if (!$scope.importForm.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }
        $scope.uploader.uploadAll();
    };


    $scope.uploader = new FileUploader({
        url: '/api/resume/upload',
        onBeforeUploadItem: function (item) {
            item.formData = [
                {
                    // Java特别渣，需要单独传文件名
                    fileName: item.file.name,
                    importTemplate: angular.toJson($scope.importTemplate)
                }
            ];
        },
        onSuccessItem: function (item, response, status, headers) {
            if (!response.result.resumeId) {
                item.formData = [
                    {
                        state: response.result.state,
                        fileName: item.file.name,
                        error: 1,
                        info: response.result.state === 2 || response.result.state === 3 ? response.result.info : ""
                    }
                ];
                if (response.result.state === 2) {
                    item.formData[0].duplicateList = response.result.duplicateList.slice(0, 5);
                    item.formData[0].error = 1;
                    $scope.state.error++;
                } else if (response.result.state === 3) {
                    item.formData[0].duplicateList = response.result.duplicateList.slice(0, 5);
                    item.formData[0].error = 0;
                    $scope.state.duplicate++;
                } else {
                    $scope.state.error++;
                }
                return;
            }
            $scope.state.finish++;
            item.formData = [
                {
                    fileName: item.file.name,
                    candidate_id: response.result.resumeId
                }
            ];
        }
    });
}).controller('candidateImportBackgroundCtrl', function ($scope, $rootScope, $interval, ngToast, uiModalService,
                                                         candidateService, config) {
    var tmpFields = angular.copy(config.batchImportCandidateFields);
    tmpFields.duplicateOperation.itemList.splice(1, 1);
    $scope.fields = tmpFields;

    $scope.importTemplate = {type: {value: 11}};
    $scope.state = {};
    $scope.dir = "";

    $scope.uploading = false;
    $scope.loading = false;
    $scope.canneling = false;

    $scope.getResumeCount = function () {
        $scope.loading = true;
        candidateService.getImportCount($scope.dir).then(function (data) {
            $scope.resumeCount = data.result;
            $scope.loading = false;
        });
    };

    $scope.continue = function () {
        candidateService.continueImport().then(function () {
            startTimer();
        });
    };

    $scope.upload = function () {
        $scope.importForm.$setSubmitted();
        $scope.dirForm.$setSubmitted();
        if (!$scope.dirForm.$valid || !$scope.importForm.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }
        $scope.uploading = true;
        candidateService.importBackground(angular.toJson($scope.importTemplate), 1, $scope.dir).then(function () {
            startTimer();
        });
    };

    $scope.cancel = function () {
        $scope.canneling = true;
        candidateService.cancelImport().then(function () {
            startTimer();
        });
    };

    $scope.clear = function () {
        uiModalService.yesOrNo({
            title: '是否清空列表？',
            okBtnText: '确定',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function () {
            $scope.loading = true;
            candidateService.clearImportState().then(function () {
                $scope.state = {};
                $scope.loading = false;
                getState();
            });
        });
    };


    $rootScope.$on('$stateChangeStart',
        function () {
            $interval.cancel($scope.timer);
            $scope.timer = null;
        }
    );

    function getState() {
        candidateService.getImportState().then(function (data) {
            $scope.state = data;
            $scope.state.failed = $scope.state.failed + $scope.state.duplicate;
            $scope.uploading = data.working;
            if (!$scope.uploading) {
                $interval.cancel($scope.timer);
                $scope.timer = null;
                $scope.canneling = false;
            } else if (!$scope.timer) {
                startTimer();
            }
        });
    }

    function startTimer() {
        if (!$scope.timer) {
            $scope.timer = $interval(function () {
                getState();
            }, 2000);
        }
    }

    getState();
}).service('candidateCommonService', function ($state) {
    // 是否为批量查看
    this.isBatchViewing = function () {
        return $state.current.name.indexOf('candidates.candidate_view') > -1;
    }
    // 是否为人才查看 包括批量查看和单个查看
    this.isCandidateViewing = function () {
        return $state.current.name.indexOf('candidate_view') > -1;
    }

}).service('candidateOperationService', function ($uibModal) {
    this.editRecReport = function (item, resumeItem) {
        var cacheItem = angular.extend({}, item);

        $uibModal.open({
            animation: false,
            templateUrl: 'views/candidate/modal/rec_report_edit.html',
            controller: "recReportGenerateCtrl",
            resolve: {
                recReportData: function () {
                    return cacheItem;
                },
                resumeData: function () {
                    return resumeItem;
                }
            }
        }).result.then(function (data) {
            $.map(data, function (value, key) {
                if (key.charAt(0) === '_') {
                    return;
                }
                item[key] = value;
            });
        }, null);
    };

}).controller('candidateOperationCtrl', function ($rootScope, $scope, $uibModal, $state, config, uiModalService, folderModalService,
                                                  candidateService, mailOperationService, candidateOperationService,
                                                  pipelineOperationService, taskOperationService, candidateCommonService) {

    $scope.generateReport = function (resumeItem) {
        candidateOperationService.editRecReport({}, resumeItem);
    };

    $scope.joinFolder = function (resumeId) {
        folderModalService.selectFolder(resumeId, false, 1);
    };

    $scope.addComment = function (resumeId) {
        uiModalService.editComment(resumeId, 4, 0, $uibModal).then(resumeInfoChangeSuccess);
    };

    function resumeInfoChangeSuccess() {
        if (candidateCommonService.isCandidateViewing()) {
            $state.reload();
        } else {
            // for preview
            $rootScope.$broadcast('$resumeInfoChange');
        }
    }

    // 操作下拉菜单出现的时候， 设置父面板overflow:visible
    $scope.toggleDropdown = function (status) {
        if (status.isopen) {
            $('.resume-header').css('overflow', 'visible');
        } else {
            $('.resume-header').css('overflow', 'hidden');
        }
    }

    $scope.composeMail = function (resume) {
        mailOperationService.composeMail(resume, 1).then(resumeInfoChangeSuccess);
    };

    $scope.deleteResume = function (resumeId) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function () {
            return candidateService.deleteCandidate({id: resumeId});
        }).then(function (data) {
            if (candidateCommonService.isCandidateViewing()) {
                $state.go('search', {
                    moduleId: 1
                });
            } else {
                $rootScope.$broadcast('$resumeInfoChange', {
                    type: 'delete'
                });
            }
        });
    };

    $scope.joinProject = function (resumeId) {
        pipelineOperationService.join(
            resumeId
        ).then(function (data) {
            if (candidateCommonService.isCandidateViewing()) {
                if (candidateCommonService.isBatchViewing()) {
                    $rootScope.$broadcast('candidates.candidate.joinNewProject', {projectId: data.projectId});
                    $state.go('candidates.candidate_view.default', {
                        candidateId: $scope.candidateId,
                        project_id: data.projectId
                    });
                } else {
                    $state.go('candidate_view.default', {
                        candidateId: $scope.candidateId,
                        project_id: data.projectId
                    });
                }
            }
        });
    };

    $scope.addTask = function (resumeItem) {
        taskOperationService.addTask(resumeItem, config.moduleMap.candidate);
    }
}).controller('excelImportCtrl', function ($scope, FileUploader, candidateService, config, ngToast) {
    var tmpFields = angular.copy(config.batchImportCandidateFields);
    tmpFields.duplicateOperation.itemList.splice(2, 1);
    $scope.fields = tmpFields;
    $scope.importTemplate = {type: {value: 11}};

    $scope.state = {
        finish: 0,
        error: 0
    };
    $scope.checkRequired = function () {
        $scope.importForm.$setSubmitted();
        if (!$scope.importForm.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }
        $scope.uploader.uploadAll();
    };

    $scope.clearQueue = function () {
        $scope.state.finish = 0;
        $scope.state.error = 0;
        $scope.uploader.clearQueue();
    };

    $scope.uploader = new FileUploader({
        url: '/api/resume/excel/upload',
        onBeforeUploadItem: function (item) {
            item.formData = [
                {
                    // Java特别渣，需要单独传文件名
                    fileName: item.file.name,
                    importTemplate: angular.toJson($scope.importTemplate)
                }
            ];
        },

        onSuccessItem: function (item, response, status, headers) {
            if (!!response.result.state) {
                $scope.state.error++;
                item.formData = [
                    {
                        error: 1,
                        info: response.result.info
                    }
                ];
                return;
            }
            $scope.state.finish++;
            item.formData = [
                {
                    importNum: response.result.importNum,
                    duplicateNum: response.result.duplicateNum,
                    duplicateResumeList: response.result.duplicateResumeList,
                    success: 1
                }
            ];
        }
    });
}).controller('recReportGenerateCtrl', function ($scope, $uibModalInstance, $stateParams, FileUploader,
                                                 recReportData, resumeData, candidateService, uiModalService) {

    $scope.oldData = angular.extend({}, recReportData);
    $scope.recReportData = recReportData;
    $scope.downloadUrl = '';
    $scope.resumeId = resumeData.id;

    $scope.debugReport = 0;
    $scope.openReportDebug = function () {
        $scope.debugReport = 1;
    };

    $scope.ok = function () {
        if (!$scope.recReportData.template ||
            !$scope.recReportData.template.id ||
            !resumeData.id) {
            uiModalService.alert("内容错误，请检查后保存");
            return;
        }

        var projectId = 0;
        if ($scope.recReportData.project) {
            projectId = $scope.recReportData.project.id;
        }

        candidateService.getRecReport($scope.recReportData.template.id, resumeData.id, projectId).then(function (data) {
            var fileName = "推荐报告.docx";

            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(data.headers('content-disposition'));
            if (matches !== null && matches[1]) {
                fileName = matches[1].replace(/['"]/g, '');
                fileName = decodeURIComponent(fileName);
            }

            var outputFile = new Blob([data.data], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
            saveAs(outputFile, fileName);

            $uibModalInstance.close($scope.recReportData);
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
});
