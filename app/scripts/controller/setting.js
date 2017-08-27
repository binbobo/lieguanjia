"use strict";
angular.module('tiger.ctrl.setting', ['ui.tree', 'tiger.api.setting']).config(function ($stateProvider,
                                                                                        $urlRouterProvider) {

    $stateProvider.state('setting', {
        url: '/setting',
        templateUrl: 'views/setting/main.html',
        controller: 'settingMainCtrl',
        data: {
            title: '相关设置'
        }
    });

    $stateProvider.state('setting.tree', {
        url: '/tree/:listType',
        templateUrl: 'views/setting/tree.html',
        controller: 'settingTreeCtrl'
    });

    // $stateProvider.state('setting_form', {
    //     url: '/setting/form',
    //     templateUrl: 'views/setting/form.html',
    //     controller: 'formEditCtrl'
    // });

    $stateProvider.state('setting.form', {
        url: '/form/:moduleId',
        templateUrl: 'views/setting/form_main.html',
        controller: 'settingFormMainCtrl'
    });

    $stateProvider.state('setting.form.edit', {
        url: '/:formName/:type/:fieldGroup',
        templateUrl: 'views/setting/form.html',
        controller: 'formEditCtrl'
    });

    $stateProvider.state('setting.comment', {
        url: '/comment/:moduleId',
        templateUrl: 'views/setting/comment_main.html',
        controller: 'settingCommentMainCtrl'
    });

    // $stateProvider.state('comment.edit', {
    //     url: '/:moduleTitle:time',
    //     templateUrl: 'views/setting/form.html',
    //     controller: 'formEditCtrl'
    // });

    $stateProvider.state('setting.comment.edit', {
        url: '/:moduleTitle/:time',
        templateUrl: 'views/setting/form.html',
        controller: 'formEditCtrl'
    });

    $stateProvider.state('setting.kpi', {
        url: '/kpi',
        templateUrl: 'views/setting/kpi/list.html',
        controller: 'kpiListCtrl',
        data: {
            'title': 'KPI设置',
        }
    });

    $stateProvider.state('setting.kpi_edit', {
        url: '/kpi/{kpiId:int}/edit',
        templateUrl: 'views/setting/kpi/edit.html',
        controller: 'kpiEditCtrl',
        data: {
            'title': '编辑KPI',
            'originTitle': '编辑KPI'
        }
    });
    $stateProvider.state('setting.kpi_add', {
        url: '/kpi/add',
        templateUrl: 'views/setting/kpi/edit.html',
        controller: 'kpiEditCtrl',
        data: {
            'title': '新增KPI',
            'originTitle': '新增KPI'
        }
    });

    $stateProvider.state('setting.generalItem', {
        url: '/generalItem',
        templateUrl: 'views/setting/generalItem/main.html',
        controller: 'settingGeneralItemMainCtrl'
    });

    $stateProvider.state('setting.generalItem.edit', {
        url: '/:moduleId/:listType/:fieldItem',
        templateUrl: 'views/setting/generalItem/edit.html',
        controller: 'generalItemEditCtrl'
    });

    $stateProvider.state('setting.recReport', {
        url: '/recReport',
        templateUrl: 'views/setting/recReport.html',
        controller: 'recReportCtrl',
        data: {
            title: '推荐报告'
        }
    });
}).controller('settingMainCtrl', function ($scope, $state, $stateParams, config) {
    // $scope.chooseSetting = function (type, module) {
    //   $target = '';
    //     $state.go('setting.' + type, {moduleId: module.name})
    // };
    $scope.settingNav = config.settingNav;
    $scope.current = $state.current.name;
    $scope.currentModule = $state.params.moduleId;

}).controller('settingFormMainCtrl', function ($scope, $state, $stateParams, config) {
    $scope.moduleId = $stateParams.moduleId;
    $scope.moduleType = $state.params.type;
    $scope.moduleName = $state.params.formName;
    $scope.fieldGroup = $state.params.fieldGroup;
    var moduleConfig = config.settingNav.form[$scope.moduleId];

    $scope.switchTo = function (name, type, fieldGroup) {
        if (name != null) {
            $scope.moduleName = name;
        }

        if (type != null) {
            $scope.moduleType = type
        }

        if (fieldGroup != null) {
            $scope.fieldGroup = fieldGroup
        }

        if (!$scope.moduleType) {
            // if (moduleConfig.subType.length == 1) {
            $scope.moduleType = moduleConfig.subType[0].name;
            $scope.fieldGroup = moduleConfig.subType[0].fieldGroup;
            // }
        }

        if (!$scope.moduleName || !$scope.moduleType) {
            return;
        }
        $state.go('setting.form.edit', {
            moduleId: $scope.moduleId,
            formName: $scope.moduleName,
            type: $scope.moduleType,
            fieldGroup: $scope.fieldGroup
        });
    };
}).controller('settingTreeCtrl', function ($scope, $stateParams, settingService, apiService, ngToast) {
    $scope.loading = true;
    $scope.treeTypeId = $stateParams.listType;
    $scope.treeData = [];
    $scope.remove = function (scope) {
        scope.remove();
    };

    $scope.toggle = function (scope) {
        scope.toggle();
    };

    $scope.newSubItem = function (scope) {
        var nodeData = scope.$modelValue;
        if (!nodeData.depth) {
            nodeData.depth = 1;
        }
        nodeData.children.push({
            id: 0,
            depth: nodeData.depth + 1,
            i18n: {
                zh: '',
                en: ''
            },
            children: []
        });
    };

    $scope.newItem = function (root) {
        root.splice(0, 0, {
            id: 0,
            depth: 1,
            title: 'new',
            children: []
        });
    };

    $scope.saveList = function () {
        settingService.setDataList($scope.treeTypeId, $scope.treeData).then(function (data) {
        }, function (data) {
            ngToast.warning("保存失败");
        });
    };

    apiService.getDataList($scope.treeTypeId).then(function (data) {
        $scope.treeData = data.list;
        $scope.loading = false;
    });

}).controller('formEditCtrl', function ($scope, $stateParams, $uibModal, config, settingService, uiModalService) {
    // $scope.treeData = angular.extend({}, config.taskForm);
    $scope.loading = true;
    $scope.isCommentForm = $state.current.name == "setting.comment.edit";
    if ($scope.isCommentForm) {
        $scope.loading = false;
        $scope.treeData = $scope.currentFields; //$scope.$parent.fields[$stateParams.moduleTitle];
    }

    $scope.isDisableDisplayNode = function (node) {
        var id = node.id;
        return id == 1  //简历-姓名
            || id == 40 //简历-工作-公司
            || id == 32 //简历-教育-学校
            || id == 51 //简历-项目-名称
            || id == 103//项目-名称
            || id == 113//项目-状态
            || id == 82 //公司-名称
            || id == 255//发票-抬头
            ;
    };

    $scope.addField = function (fieldGroup) {
        $scope.editField(-1, fieldGroup);
    };

    $scope.deleteField = function (index) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function () {
            $scope.treeData.splice(index, 1);
        });
    };

    $scope.editField = function (index, fieldGroup) {
        $uibModal.open({
            animation: false,
            templateUrl: 'views/setting/field_edit_modal.html',
            controller: 'formEditModalCtrl',
            resolve: {
                fieldItem: function () {
                    if (index < 0) {
                        return {
                            fieldGroup: fieldGroup
                        };
                    } else {
                        return $scope.treeData[index];
                    }
                }
            }
        }).result.then(function (data) {
            if (index < 0) {
                if (!$scope.treeData) {
                    $scope.$parent.currentFields = [];
                    $scope.treeData = $scope.$parent.currentFields;
                }
                $scope.treeData.push(data);
            } else {
                angular.extend($scope.treeData[index], data);
            }
        });
    };

    if (!$scope.isCommentForm) {
        settingService.getFieldList($stateParams.moduleId, $stateParams.type, $stateParams.formName).then(
            function (data) {
                $scope.treeData = data.list;
                $scope.loading = false;
            });
    }

    $scope.saveForm = function () {
        if ($scope.loading) {
            return;
        }
        $scope.loading = true;
        settingService.saveFieldList($stateParams.moduleId, $stateParams.type, $stateParams.formName,
            $scope.treeData).then(function (data) {
            return settingService.getFieldList($stateParams.moduleId, $stateParams.type,
                $stateParams.formName);
        }).then(function (data) {
            $scope.treeData = data.list;
            $scope.loading = false;
        });
    };
}).controller('formEditModalCtrl', function ($scope, $uibModalInstance, fieldItem, ngToast) {
    $scope.newField = !fieldItem.dataType;

    $scope.choose = fieldItem.dataType || 'text';
    $scope.fieldItem = angular.extend({
        required: false
    }, fieldItem);

    $scope.dataTypeList = {
        text: {
            name: 'text',
            title: 'Text',
            i18n: {
                zh: '文本'
            }
        },
        textarea: {
            name: 'textarea',
            title: 'multiline text',
            i18n: {
                zh: '多行文本'
            }
        },
        number: {
            name: 'number',
            title: 'Number',
            i18n: {
                zh: '数字'
            }
        },
        email: {
            name: 'email',
            title: 'Email',
            i18n: {
                zh: 'Email'
            }
        },
        checkbox: {
            name: 'checkbox',
            title: 'Checkbox',
            i18n: {
                zh: '选择框'
            }
        },
        radio: {
            name: 'radio',
            title: 'Radio',
            i18n: {
                zh: '单选'
            }
        },
        select: {
            name: 'select',
            title: 'Select',
            i18n: {
                zh: '下拉框（单选）'
            }
        },
        multiselect: {
            name: 'multiselect',
            title: 'Multiselect',
            i18n: {
                zh: '下拉框（多选）'
            }
        }
    };

    $scope.dataTypeHasItemList = ['radio', 'select', 'multiselect',];

    $scope.changeTo = function (item) {
        if ($scope.newField && item.name != $scope.choose) {
            // $scope.fieldItem = {
            //     dataType: item.name
            // };
            $scope.choose = item.name;
            if (item.name == 'radio' || item.name == 'select' || item.name == 'multiselect') {
                $scope.fieldItem.itemList = [{}];
            } else {
                $scope.fieldItem.itemList = null;
            }
        }
    };

    $scope.ok = function () {
        if (!$scope.formFieldEditForm.$valid) {
            $scope.formFieldEditForm.$setSubmitted();
            ngToast.warning('请检查输入项');
            return;
        }

        var fieldItem = angular.extend($scope.fieldItem, {
            dataType: $scope.choose,
            display: 1,
            canTable: 0,
            canSearch: 0
        });

        if ($scope.dataTypeHasItemList.indexOf($scope.choose) > -1) {
            angular.forEach($scope.fieldItem.itemList, function (item) {
                item.title = item.i18n.zh;
            });
        }
        $scope.fieldItem.required = $scope.fieldItem.required ? 1 : 0;
        $uibModalInstance.close($scope.fieldItem);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };
}).controller('settingCommentMainCtrl', function ($scope, $state, $stateParams,
                                                  config, settingService, uiModalService) {

    $scope.moduleList = config.commentModuleList;
    $scope.moduleItems = [];
    $scope.staticModuleItems = [];
    $scope.currentModuleItem = {};
    $scope.currentNumber = 0;
    $scope.currentFields = null;
    $scope.fields = {};

    $scope.moduleId = $stateParams.moduleId;
    $scope.moduleItemId = $stateParams.moduleItemId;

    function getData() {
        settingService.getCommentFieldInfo($scope.moduleId, 1).then(function (data) {
            $scope.moduleItems = data.moduleItems;
            $scope.staticModuleItems = angular.copy($scope.moduleItems);
            $scope.fields = data.fields;
            $scope.currentModuleItem = $scope.moduleItems[$scope.currentNumber];
            $scope.currentFields = $scope.fields[$scope.currentModuleItem.title];

            $state.go('setting.comment.edit', {
                moduleTitle: $scope.currentModuleItem.title,
                time: new Date().getTime(),
                isComment: 1
            });
        });
    }

    function validForm() {
        $scope.moduleItemForm.$setSubmitted();
        if (!$scope.moduleItemForm.$valid) {
            uiModalService.alert("请检查表单");
            return false;
        } else {
            return true;
        }
    }

    $scope.switchTo = function (moduleId, index) {
        if (!moduleId) {
            $scope.currentNumber = index;
            $scope.currentModuleItem = $scope.moduleItems[$scope.currentNumber];
            $scope.currentFields = $scope.fields[$scope.currentModuleItem.title] ? $scope.fields[$scope
                .currentModuleItem.title] : null;
            $state.go('setting.comment.edit', {
                moduleTitle: $scope.currentModuleItem.title,
                isComment: 1
            });
        } else {
            $state.go('setting.comment', {
                moduleId: moduleId
            });
            // $scope.moduleId = moduleId;
            // getData();
        }
    };
    getData();

    $scope.saveCommentFields = function () {
        if (!validForm()) {
            return;
        }

        settingService.saveCommentFieldInfo(
            $scope.moduleId,
            $scope.currentFields,
            $scope.currentModuleItem
        ).then(function () {
            uiModalService.alert("保存成功");
            getData();
        })
    };

    $scope.addModuleItem = function () {
        if (!$scope.moduleItemForm.$valid) {
            uiModalService.alert("请检查表单");
            return;
        }

        $scope.currentNumber = $scope.moduleItems.length;
        $scope.currentModuleItem = {};
        $scope.currentFields = null;
        $state.go('setting.comment.edit', {
            moduleTitle: "new",
            isComment: 1
        });
    };

    $scope.deleteItem = function () {
        if (!$scope.currentModuleItem.id) {
            $scope.switchTo(null, 0);
            return;
        }
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function () {
            return settingService.deleteCommentFieldInfo($scope.currentModuleItem.id);
        }).then(function () {
            $state.reload();
        });
    };
}).controller('kpiListCtrl', function ($scope, $state, ngToast, uiModalService, $stateParams, settingService) {
    settingService.getKPIList().then(function (data) {
        $scope.kpiList = data;
    });

    $scope.deleteKPI = function (id) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function () {
            return settingService.deleteKPI(id);
        }).then(function (data) {
            if (data <= 0) {
                ngToast.warning("删除失败")
            }
            var index = -1;

            $scope.kpiList.some(function (item) {
                index++;
                if (item.id === id) {
                    return;
                }
            });

            if (index >= 0) {
                $scope.kpiList.splice(index, 1);
                ngToast.success("删除成功");
            }
        });
    }

}).controller('kpiEditCtrl', function ($scope, $state, $stateParams, $uibModal, ngToast,
                                       config, uiModalService, settingService) {
    $scope.kpi = {};
    $scope.kpiId = $stateParams.kpiId;

    if ($scope.kpiId > 0) {
        settingService.getKPIDetail($scope.kpiId).then(function (data) {
            $scope.kpi = data;
            $scope.kpi.cycle = {id: data.cycle, value: data.cycle, title: data.cycle == 1 ? "周" : "月"};
            $scope.config = config;
        });
    } else {
        settingService.getKPITemplate().then(function (data) {
            $scope.kpi = data;
            $scope.kpi.cycle = {id: data.cycle, value: data.cycle, title: data.cycle == 1 ? "周" : "月"};
            $scope.config = config;
        });
    }

    $scope.setScore = function (kpiList) {
        $uibModal.open({
            animation: false,
            backdrop: false,
            templateUrl: 'views/setting/kpi/score_modal.html',
            controller: function ($scope, $uibModalInstance, uiModalService) {
                $scope.kpiList = [{}];
                angular.extend($scope.kpiList, kpiList);

                $scope.addItem = function () {
                    $scope.kpiList.push({})
                };
                $scope.removeItem = function (index) {
                    if ($scope.kpiList.length > 1)
                        $scope.kpiList.splice(index, 1);
                    else
                        $scope.kpiList[0] = {};
                };
                $scope.$watch('kpiList', function (value) {
                    for (var i = 0; i < value.length - 1; i++) {
                        value[i + 1].scoreUpper = value[i].scoreLower;
                    }
                }, true);
                $scope.ok = function (kpiList) {
                    var checkOK = true;
                    var rangeCheck = true;
                    angular.forEach(kpiList, function (item) {
                        if (!item.level || !item.level.i18n.zh || item.scoreLower == undefined || item.scoreLower < 0) {
                            checkOK = false;
                        }
                        if (item.scoreUpper != undefined && item.scoreLower > item.scoreUpper) {
                            rangeCheck = false;
                        }
                    });
                    if (!checkOK) {
                        uiModalService.alert("级别(中文)或者分值区间(下限)未填写");
                        return;
                    }
                    if (!rangeCheck) {
                        uiModalService.alert("下限不能大于上限");
                        return;
                    }
                    $uibModalInstance.close(kpiList);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }
        }).result.then(function (data) {
            $scope.kpi.kpiList = data;
        });
    };

    $scope.saveKPI = function () {
        if (!$scope.kpi) {
            return;
        }
        if (!$scope.kpi.cycle) {
            uiModalService.alert("KPI周期未填写");
            return;
        }

        var kpiUpdate = angular.copy($scope.kpi);
        kpiUpdate.cycle = kpiUpdate.cycle.value;

        settingService.updateKPI(kpiUpdate).then(function (data) {
            if (data <= 0) {
                ngToast.warning("保存失败");
                return;
            }
            ngToast.success("保存成功");
            $state.go('setting.kpi', {});
        });
    };
}).controller('settingGeneralItemMainCtrl', function ($scope, $state, ngToast, config) {
    $scope.moduleId = 1;
    $scope.settingNav = config.settingNav;

    $scope.switchTo = function (moduleId, listType, fieldItem) {

        if (moduleId != null) {
            $scope.moduleId = moduleId
        }

        if (listType != null) {
            $scope.listType = listType
        }

        if (fieldItem != null) {
            $scope.fieldItem = fieldItem
        }

        $state.go('setting.generalItem.edit', {
            moduleId: $scope.moduleId,
            listType: $scope.listType,
            fieldItem: $scope.fieldItem
        });
    };

}).controller('generalItemEditCtrl', function ($scope, $state, $stateParams, ngToast, uiModalService, apiService,
                                               settingService) {
    $scope.moduleId = $stateParams.moduleId;
    $scope.listType = $stateParams.listType;
    $scope.fieldItem = $stateParams.fieldItem;
    $scope.treeData = [];
    if ($scope.listType != 0) {
        apiService.getDataList($scope.listType).then(function (data) {
            $scope.treeData = data.list;
            $scope.loading = false;
        });
    }

    if ($scope.fieldItem != 0) {
        apiService.getFieldItemList($scope.fieldItem).then(function (data) {
            $scope.treeData = data.list;
            $scope.loading = false;
        })
    }

    $scope.addItem = function () {
        $scope.treeData.push({
            title: '',
            i18n: {
                zh: '',
                en: ''
            }
        })
    };

    $scope.deleteItem = function (index) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnClass: 'btn btn-danger'
        }).then(function () {
            $scope.treeData.splice(index, 1);
        });
    };

    $scope.saveList = function () {
        settingService.setGeneralItem($scope.listType, $scope.fieldItem, $scope.treeData).then(function (data) {
        }, function (data) {
            ngToast.warning("保存失败");
        });
    };

}).controller('recReportCtrl', function ($scope, FileUploader, ngToast, config, settingService, uiModalService) {
    $scope.fields = angular.copy(config.recReportFields);
    $scope.languageTemplate = {language: {value: 0}};
    $scope.languageShow = {
        0: '中文',
        1: "英文"
    };

    $scope.pageState = {
        page: 1,
        listLength: 10
    };

    $scope.getRecReportList = function () {
        settingService.getRecReportList(
            ($scope.pageState.page - 1) * $scope.pageState.listLength,
            $scope.pageState.listLength
        ).then(function (data) {
            $scope.list = data.list;
            $scope.pageState.total = data.total;
        })
    };

    $scope.$watch('pageState', $scope.getRecReportList, true);

    $scope.uploader = new FileUploader({
        url: '/api/resume/recReport/upload',
        autoUpload: true,
        onBeforeUploadItem: function (item) {
            item.formData = [
                {
                    fileName: item.file.name,
                    language: $scope.languageTemplate.language.value
                }
            ];
        },
        onSuccessItem: function (item, response) {
            item.formData = [
                {
                    tid: response.result.tid,
                    isDuplicate: response.result.isDuplicate,
                    isDoc: response.result.isDoc
                }
            ];
            if (!item.formData[0].isDoc) {
                ngToast.warning("请上传正确格式的模板");
                return;
            }
            if (item.formData[0].isDuplicate) {
                ngToast.warning("您已上传过该模板");
                $scope.getRecReportList();
                return;
            }
            ngToast.success("上传成功");
            $scope.getRecReportList();
        },
        onErrorItem: function (item, response) {
            if (response.code === 2303) {
                uiModalService.alert(response.result.error);
                return;
            }
            if (item.isError) {
                ngToast.warning("上传失败");
            }
        }

    });

    $scope.deleteRecReport = function (tid) {
        uiModalService.yesOrNo({
            title: '是否删除?',
            okBtnClass: 'btn btn-danger'
        }).then(function () {
            settingService.deleteRecReport(tid);
        }).then(function () {
            $scope.getRecReportList();
        });
    }
});
