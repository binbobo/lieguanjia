angular.module('tiger.ctrl.setting.user', []).config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider.state('setting.user', {
        url: '/user',
        templateUrl: 'views/setting/user/list.html',
        controller: 'settingUserListCtrl',
        data: {
            title: '用户列表'
        }
    });

    $stateProvider.state('setting.user_edit', {
        url: '/user/{accountId:int}',
        templateUrl: 'views/setting/user/edit.html',
        controller: 'settingUserEditCtrl',
        data: {
            title: '用户设置'
        }
    });

    $stateProvider.state('setting.user_add', {
        url: '/user/add',
        templateUrl: 'views/setting/user/edit.html',
        controller: 'settingUserEditCtrl',
        data: {
            title: '增加用户'
        }
    });

    $stateProvider.state('setting.user_invite', {
        url: '/user/invite',
        templateUrl: 'views/setting/user/invite.html',
        controller: 'settingUserInviteCtrl',
        data: {
            title: '邀请用户'
        }
    });

    $stateProvider.state('setting.user_invite_result', {
        url: '/user/invite/result',
        templateUrl: 'views/setting/user/invite_result.html',
        controller: 'settingUserInviteResultCtrl',
        data: {
            title: '发送邀请成功'
        }
    });

    $stateProvider.state('setting.role', {
        url: '/role',
        templateUrl: 'views/setting/user/role.html',
        controller: 'settingRoleCtrl',
        data: {
            title: '角色设置'
        }
    });

    $stateProvider.state('setting.role.edit', {
        url: '/{roleId:int}',
        templateUrl: 'views/setting/user/role_edit.html',
        controller: 'settingRoleEditCtrl',
        data: {
            title: '角色设置'
        }
    });

    $stateProvider.state('setting.role.add', {
        url: '/add',
        templateUrl: 'views/setting/user/role_edit.html',
        controller: 'settingRoleEditCtrl',
        data: {
            title: '角色设置'
        }
    });

    $stateProvider.state('setting.permission', {
        url: '/permission',
        templateUrl: 'views/setting/user/permission.html',
        controller: 'settingPermissionCtrl',
        data: {
            title: '权限设置'
        }
    });

    $stateProvider.state('setting.user_report_action', {
        url: '/user/actionReport',
        templateUrl: '/views/setting/user/action_report.html',
        controller: 'actionReportCtrl',
        data: {
            'title': '用户活跃度'
        }
    });

    $stateProvider.state('setting.user_online', {
        url: '/user/online',
        templateUrl: '/views/setting/user/online_user.html',
        controller: 'onlineUserCtrl',
        data: {
            'title': '在线用户列表'
        }
    });

    $stateProvider.state('setting.permission.edit', {
        url: '/:type',
        templateUrl: 'views/setting/user/permission_edit.html',
        controller: 'settingPermissionEditCtrl'
    });

}).controller('settingUserEditCtrl', function ($scope, $state, $stateParams, ngToast, accountService, settingService) {

    $scope.accountId = null;
    if ($stateParams.accountId) {
        $scope.accountId = $stateParams.accountId;
    }

    $scope.userStatus = [
        {
            id: 1,
            value: 1,
            title: '在职'
        },
        {
            id: 2,
            value: 2,
            title: '离职'
        },
        {
            id: 3,
            value: 3,
            title: '冻结'
        }
    ];

    $scope.roleList = [];

    $scope.account = {};
    $scope.oriainAccount = {};

    $scope.addDepartment = function () {
        if (!$scope.account.departmentRelationList) {
            $scope.account.departmentRelationList = [];
        }
        $scope.account.departmentRelationList.push({});
    };

    $scope.deleteDepartment = function (index) {
        $scope.account.departmentRelationList.splice(index, 1);
    };

    var loading = false;
    $scope.updateAccount = function () {
        if (loading) {
            return;
        }

        $scope.editAccountForm.$setSubmitted();
        if (!$scope.editAccountForm.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }

        if (!$scope.account.password && !$scope.accountId) {
            ngToast.warning('请输入密码');
            return;
        }

        if ($scope.account.password != $scope.account.repeat) {
            ngToast.warning('两次密码不一致');
            return;
        }

        loading = true;

        accountService.update($scope.account).then(function (data) {
            loading = false;

            if (!$scope.accountId) {
                $state.go('setting.user_edit', {
                    accountId: data.result
                });
                return;
            }
            return accountService.detail($scope.accountId);
        }, function (err) {
            loading = false;
            throw err;
        }).then(function (data) {
            if (data) {
                $scope.account = data;
            }
        });
    };

    settingService.roleList().then(function (data) {
        $scope.roleList = data.list;
    });

    if ($scope.accountId) {
        accountService.detail($scope.accountId).then(function (data) {
            $scope.account = data;
            $scope.oriainAccount = angular.copy(data);
        });
    } else {
        $scope.account.status = $scope.userStatus[0];
    }

}).controller('settingUserListCtrl', function ($scope, $filter, uiModalService, accountService) {
    $scope.list = [];
    $scope.pageState = {
        page: 1,
        listLength: 15
    };

    $scope.userStatus = 1;
    $scope.search = {account_status: $scope.userStatus};

    $scope.getUserList = function () {
        accountService.list(
            ($scope.pageState.page - 1) * $scope.pageState.listLength,
            $scope.pageState.listLength,
            $scope.search
        ).then(function (data) {
            $scope.dataList = buildDataList(data.list);
            $scope.pageState.total = data.total;
            $scope.pageState.totalAvailable = data.total;
        });
    };

    $scope.operationFunc = {
        deleteAccount: function (id) {
            return uiModalService.yesOrNo({
                title: '您确认取消邀请该用户？'
            }).then(function () {
                accountService.delete(id).then(function () {
                    $scope.getUserList();
                })
            });
        }
    };

    $scope.fieldList = [
        {
            "name": "accountName",
            "i18n": {"zh": "用户名", "en": "accountName"},
            "dataType": "text",
            "canTable": 1
        },
        {
            "name": "name",
            "i18n": {"zh": "姓名", "en": "name"},
            "dataType": "text",
            "canTable": 1
        },
        {
            "name": "departmentStr",
            "i18n": {"zh": "团队", "en": "department"},
            "dataType": "text",
            "canTable": 1
        },
        {
            "name": "role",
            "i18n": {"zh": "角色", "en": "Role"},
            "dataType": "select",
            "canTable": 1
        },
        {
            "name": "employmentTime",
            "i18n": {"zh": "入职日期", "en": "employmentTime"},
            "dataType": "date",
            "canTable": 1
        },
        {
            "name": "operation",
            "i18n": {"zh": "操作", "en": "operation"},
            "tableDataType": "userOperation",
            "canTable": 1
        }
    ];

    var i18nFilter = $filter('i18n');

    function buildDataListItem(item) {
        if (!item.departmentRelationList) {
            return item;
        }

        var tmpArr = [];
        angular.forEach(item.departmentRelationList, function (departmentItem) {
            tmpArr.push(i18nFilter(departmentItem.department));
        });

        item.departmentStr = tmpArr.join(' / ');
        return item;
    }

    function buildDataList(list) {
        return _.map(list, function (item) {
            return buildDataListItem(item);
        });
    }

    $scope.fieldInTable = _.map($scope.fieldList, function (item) {
        return '.' + item.name;
    });

    $scope.getUserList();

    $scope.changeUserStatus = function (status) {
        $scope.userStatus = status;
        $scope.search = {account_status: status};
        $scope.getUserList();
    };

    $scope.$watch('pageState', function (newValue, oldValue) {
        if (newValue.page === oldValue.page
            && newValue.listLength === oldValue.listLength) {
            return;
        }

        if (newValue.listLength !== oldValue.listLength) {
            $scope.pageState.page = 1;
        }

        $scope.pageState.offset = (newValue.page - 1) * $scope.pageState.listLength;
        $scope.getUserList();
    }, true);

}).controller('settingRoleCtrl', function ($scope, settingService) {
    $scope.roleList = [];
    $scope.updateList = function () {
        return settingService.roleList().then(function (data) {
            $scope.roleList = data.list;
        });
    };
    $scope.updateList();

}).controller('settingRoleEditCtrl', function ($scope, $state, $stateParams, $uibModal, ngToast, settingService) {
    $scope.roleId = $stateParams.roleId;

    $scope.role = {};
    $scope.roleList = [];
    $scope.shiftData = {
        originRoleId: $scope.roleId
    };

    $scope.permissionList = [];
    $scope.myPermissionList = {};
    $scope.permissionListTmp = {};

    $scope.getPermissionList = function () {
        var result = [];
        angular.forEach($scope.permissionList, function (item) {
            if ($scope.myPermissionList[item.id]) {
                result.push(item.id);
                return;
            }

            angular.forEach(item.children, function (item) {
                if ($scope.myPermissionList[item.id]) {
                    result.push(item.id);
                }
            });
        });

        return result;
    };

    $scope.getRoleDetail = function () {
        return settingService.roleDetail($scope.roleId).then(function (data) {
            $scope.role = data;
            $scope.shiftData.originRoleTitle = data.title;
            var tmp = {};

            angular.forEach(data.permissionIds, function (id) {
                tmp[id] = true;
            });

            $scope.myPermissionList = tmp;
        });
    };

    $scope.updateRole = function () {
        //todo 增加统一的form验证!
        $scope.editRoleForm.$setSubmitted();
        if (!$scope.editRoleForm.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }

        $scope.role.permissionIds = $scope.getPermissionList();
        settingService.saveRole($scope.role).then(function (data) {
            $scope.updateList();

            if (!$scope.roleId) {
                throw data;
            }
            return $scope.getRoleDetail();
        }).then(null, function (data) {
            $state.go("setting.role.edit", {
                roleId: data.result
            });
            return null;
        });
    };

    $scope.openShift = function (shiftData) {
        return $uibModal.open({
            animation: true,
            backdrop: 'static',
            windowClass: 'modal-center',
            templateUrl: 'views/setting/user/role_shift.html',
            controller: "shiftRoleCtrl",
            resolve: {
                roleShiftModalData: function () {
                    return shiftData;
                }
            }
        }).result;
    };

    $scope.shiftRole = function () {
        var obj;
        $scope.openShift($scope.shiftData).then(function (data) {
            obj = data;
            return settingService.deleteRole(data.originRoleId);
        }).then(function () {
            return settingService.shiftRole(obj.originRoleId, obj.targetRole.id);
        }).then(function () {
            $state.go('setting.role', {}, {reload: true});
        });
    };

    settingService.permissionList().then(function (data) {
        $scope.permissionList = data.list;
    });

    if ($scope.roleId) {
        $scope.getRoleDetail();
    }
}).controller('shiftRoleCtrl', function ($scope, $state, $uibModalInstance, settingService, roleShiftModalData,
                                         ngToast) {
    $scope.shiftData = roleShiftModalData;

    $scope.roleList = [];

    settingService.roleList().then(function (data) {
        angular.forEach(data.list, function (item) {
            if (item.id === $scope.shiftData.originRoleId) {
                return;
            }
            $scope.roleList.push(item);
        });
    });

    $scope.ok = function () {
        if (!$scope.shiftData.targetRole) {
            ngToast.warning("请选择转移角色");
            return;
        }
        $uibModalInstance.close($scope.shiftData);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}).controller('settingPermissionCtrl', function ($scope, $state, config, settingService) {
    $scope.loading = true;
    $scope.type = $state.params.type;
    $scope.data = [];
    $scope.permissionConfig = config.permissionSettingConfig;

    settingService.settingList().then(function (data) {
        $scope.data = data;
        $scope.loading = false;
    });

    $scope.switchTo = function (type) {
        if (type != null) {
            $scope.type = type
        }

        if (!$scope.type) {
            return;
        }

        $state.go('setting.permission.edit', {
            type: $scope.type
        });
    };

    if ($state.$current.name == 'setting.permission') {
        $scope.switchTo('resume');
    }

}).controller('settingPermissionEditCtrl', function ($scope, $state, settingService) {
    $scope.type = $state.params.type;

    $scope.save = function (param, value) {
        $scope.$parent.loading = true;
        settingService.saveSetting(param, value).then(function () {
            //todo loading
            return settingService.settingList();
        }).then(function (data) {
            $scope.$parent.data = data;
            $scope.$parent.loading = false;
        });
    }
}).controller('actionReportCtrl', function ($scope, $filter, $state, ngToast, settingService) {

    $scope.startTime = 0;
    $scope.endTime = 0;
    $scope.define = false;
    $scope.dateType = 1;
    $scope.isLoading = false;
    $scope.pageState = {
        page: 1,
        listLength: 15
    };
    $scope.fieldList = [
        {
            "name": "name",
            "i18n": {"zh": "用户", "en": "user"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "user"
        },
        {
            "name": "departmentStr",
            "i18n": {"zh": "团队", "en": "department"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "user"
        },
        {
            "name": "role",
            "i18n": {"zh": "角色", "en": "Role"},
            "dataType": "select",
            "canTable": 1,
            "moduleItem": "user"
        },
        {
            "name": "seeCandidateDetail",
            "i18n": {"zh": "查看候选人详情", "en": "seeCandidateDetail"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "countMap"
        },
        {
            "name": "previewCandidateAttachment",
            "i18n": {"zh": "预览候选人附件", "en": "previewCandidateAttachment"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "countMap"
        },
        {
            "name": "downloadCandidateAttachment",
            "i18n": {"zh": "下载候选人附件", "en": "downloadCandidateAttachment"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "countMap"
        },
        {
            "name": "downloadDocumentAttachment",
            "i18n": {"zh": "下载文档附件", "en": "downloadDocumentAttachment"},
            "dataType": "text",
            "canTable": 1,
            "moduleItem": "countMap"
        }
    ];

    $scope.changeCondition = function () {
        $scope.isLoading = true;
        settingService.getActionReport(
            ($scope.pageState.page - 1) * $scope.pageState.listLength,
            $scope.pageState.listLength,
            $scope.startTime,
            $scope.endTime
        ).then(function (data) {
            $scope.dataList = buildDataList(data.list);
            $scope.isLoading = false;
        }, function () {
            $scope.isLoading = false;
            $scope.pageState.totalAvailable = data.total;
            $scope.pageState.offset = 10;
        })
    };

    $scope.changeConditionWithDefinedTime = function (customStartTime, customEndTime) {
        $scope.startTime = customStartTime;
        $scope.endTime = customEndTime + 86399;
        if (!$scope.startTime || !$scope.endTime) {
            ngToast.warning("请输入自定义时间");
            return;
        }
        if ($scope.startTime > $scope.endTime) {
            ngToast.warning("自定义的结束时间需要大于开始时间");
            return;
        }
        $scope.changeCondition();
    };

    $scope.changeDateType = function (dateType) {
        $scope.dateType = dateType;
        var now = new Date();
        var nowDayOfWeek = now.getDay();
        var nowDay = now.getDate();
        var nowMonth = now.getMonth();
        var nowYear = now.getFullYear();

        if (dateType === 1) {
            var todayStart = new Date(nowYear, nowMonth, nowDay);
            $scope.startTime = todayStart.valueOf() / 1000;
            $scope.endTime = Date.parse(now) / 1000;
            $scope.define = false;
        } else if (dateType === 2) {
            var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1);
            $scope.startTime = weekStartDate.valueOf() / 1000;
            $scope.endTime = Date.parse(now) / 1000;
            $scope.define = false;

        } else if (dateType === 3) {
            $scope.startTime = new Date(nowYear, nowMonth, 1).valueOf() / 1000;
            $scope.endTime = Date.parse(now) / 1000;
            $scope.define = false;

        } else if (dateType === 4) {
            $scope.startTime = new Date(nowYear, 0, 1) / 1000;
            $scope.endTime = Date.parse(now) / 1000;
            $scope.define = false;

        } else if (dateType === 5) {
            $scope.define = true;
        }

        if (!$scope.isLoading && !$scope.define) {
            $scope.changeCondition();
        }
    };


    var i18nFilter = $filter('i18n');

    function buildDataListItem(item) {
        if (!item.user) {
            return item;
        }
        if (!item.user.departmentRelationList) {
            item.user.departmentStr = null;
            return item;
        }

        var tmpArr = [];
        angular.forEach(item.user.departmentRelationList, function (departmentItem) {
            tmpArr.push(i18nFilter(departmentItem.department));
        });

        item.user.departmentStr = tmpArr.join(' / ');
        return item;
    }

    function buildDataList(list) {
        var result = [];
        angular.forEach(list, function (item) {
            result.push(buildDataListItem(item));
        });

        return result;
    }

    function buildFieldInTable(fieldList) {
        var fieldInTableTmp = [];
        angular.forEach(fieldList, function (item) {
            fieldInTableTmp.push(item.moduleItem + '.' + item.name);
        });
        return fieldInTableTmp;
    }

    $scope.fieldInTable = buildFieldInTable($scope.fieldList);

    $scope.changeDateType(1);

    settingService.getActionReport(
        ($scope.pageState.page - 1) * $scope.pageState.listLength,
        $scope.pageState.listLength,
        $scope.startTime,
        $scope.endTime
    ).then(function (data) {
        $scope.datalist = data.list;
        $scope.pageState.total = data.total;
        $scope.pageState.totalAvailable = data.total;
    });

    $scope.$watch('pageState', function (newValue, oldValue) {
        if (newValue.page === oldValue.page
            && newValue.listLength === oldValue.listLength) {
            return;
        }

        if (newValue.listLength !== oldValue.listLength) {
            $scope.pageState.page = 1;
        }

        $scope.pageState.offset = (newValue.page - 1) * $scope.pageState.listLength;
        $scope.changeCondition();
    }, true);

}).controller('onlineUserCtrl', function ($scope, $state, accountService, uiModalService) {
    $scope.list = [];
    $scope.pageState = {
        page: 1,
        listLength: 15
    };

    $scope.getOnlineUserList = function () {
        accountService.getOnlineUserList(
            ($scope.pageState.page - 1) * $scope.pageState.listLength,
            $scope.pageState.listLength
        ).then(function (data) {
            $scope.list = data.list;
            $scope.pageState.total = data.total;
        });
    };

    $scope.$watch('pageState.page', function () {
        $scope.getOnlineUserList();
    }, true);

    $scope.kick = function (uid) {
        uiModalService.yesOrNo({
            title: '是否踢出该用户?',
            okBtnClass: 'btn btn-danger'
        }).then(function () {
            return accountService.kick(uid);
        }).then(function () {
            $scope.getOnlineUserList();
        });
    }
}).controller('settingUserInviteCtrl', function ($scope, $state, ngToast, accountService, settingService) {
    $scope.roleList = [];

    $scope.account = {};

    settingService.roleList().then(function (data) {
        $scope.roleList = data.list;
    });

    var loading = false;
    var phoneRegexPattens = /^1\d{10}$/;
    $scope.invite = function () {

        if (loading) {
            return;
        }

        $scope.inviteAccountForm.$setSubmitted();
        if (!phoneRegexPattens.test($scope.account.accountName)) {
            ngToast.warning("请输入正确的手机号");
            return;
        }
        if (!$scope.inviteAccountForm.$valid) {
            ngToast.warning("内容错误，请检查后保存");
            return;
        }

        loading = true;

        accountService.invite($scope.account).then(function (data) {
            loading = false;
            $state.go("setting.user_invite_result");
        }, function (err) {
            loading = false;
            throw err;
        });
    };
}).controller('settingUserInviteResultCtrl', function ($scope, $state) {

    $scope.continueInvite = function () {
        $state.go('setting.user_invite')
    }

});
