angular.module('tiger.ctrl.channel', ['tiger.api.channel']).config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('profile.channel', {
            url: '/channel',
            templateUrl: 'views/profile/channel.html',
            controller: 'channelAccountListCtrl',
            data: {
                title: '绑定渠道'
            }
        });

        $stateProvider.state('channel', {
            url: '/channel/job',
            templateUrl: 'views/channel/list.html',
            controller: 'channelJobListCtrl',
            data: {
                title: '渠道职位'
            }
        });

        $stateProvider.state('channel_view', {
            url: '/channel/{jobId:int}',
            templateUrl: 'views/channel/view.html',
            controller: 'channelJobViewCtrl',
            data: {
                title: '查看职位'
            }
        });
    }
]).controller('channelAccountListCtrl', [
    '$scope',
    'channelService',
    '$uibModal',
    'uiModalService',
    function ($scope, channelService, $uibModal, uiModalService) {


        $scope.loading = true;
        $scope.list = [];
        $scope.listJobState = {};

        $scope.newAccount = function () {
            return $uibModal.open({
                animation: true,
                templateUrl: 'views/profile/channel_edit.html',
                controller: "channelAccountEditCtrl"
            });
        };

        $scope.unBind = function (id) {
            uiModalService.yesOrNo({
                title: '解绑后，将不再同步此账号的职位，已同步的职位也将陆续从渠道职位中删除，您确定要解绑吗？',
                okBtnClass: 'btn btn-danger'
            }).then(function () {
                $scope.loading = true;
                return channelService.unBind(id);
            }).then(function () {
                $scope.loading = false;
                $state.reload();
            });
        };

        $scope.import = function (account) {
            account.importing = 1;
            channelService.import(account.id);
        };

        function initList() {
            channelService.list().then(function (data) {
                $scope.list = data;
                return channelService.importState();
            }).then(function (data) {
                angular.forEach($scope.list, function (account) {
                    if (data[account.id]) {
                        account.importing = data[account.id].processing;
                    }
                });
                $scope.loading = false;
            });
        }

        initList();
    }
]).controller('channelAccountEditCtrl', [
    '$scope',
    '$state',
    'config',
    'channelService',
    'uiModalService',
    '$uibModalInstance',
    'ngToast',
    function ($scope, $state, config, channelService, uiModalService, $uibModalInstance, ngToast) {

        $scope.account = {};
        $scope.customForm = config.channelFields;
        $scope.loading = false;

        $scope.ok = function () {
            $scope.channelForm.$setSubmitted();
            if (!$scope.channelForm.$valid) {
                uiModalService.alert("内容错误，请检查后保存");
                return;
            }
            $scope.loading = true;
            channelService.update($scope.account).then(function (data) {
                $scope.loading = false;
                return ngToast.success(data.success > 0 ? "操作成功" : data.message);
            }).then(function () {
                $state.reload();
                $uibModalInstance.close();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }
]).controller('channelJobListCtrl', [
    '$scope',
    '$state',
    'config',
    'searchService',
    'channelService',
    function ($scope, $state, config, searchService, channelService) {

        $scope.list = [];
        $scope.loadList = false;

        $scope.channelType = 0;
        $scope.jobCounts = {};
        $scope.channelTypes = ["好猎友", "猎上网", "猎小二", "猎必得"];

        $scope.getESJson = function () {
            var boolConditionList = {
                must: []
            };

            if ($scope.keyword) {
                boolConditionList.must.push({
                    match_phrase: {
                        jobName: $scope.keyword
                    }
                });
            }

            if ($scope.channelType > 0) {
                boolConditionList.must.push({
                    term: {
                        type: $scope.channelType
                    }
                });
            }

            var result = {
                query: {
                    bool: boolConditionList
                },
                from: $scope.pageState.offset,
                size: $scope.pageState.listLength,
                sort: []
            };

            result.sort.push({
                refreshTime: {
                    order: "desc"
                }
            });

            return result;
        };

        $scope.updateList = function (reset) {
            $scope.loadList = true;

            if (reset) {
                $scope.pageState.page = 1;
            }

            var stateParams = {
                moduleId: $scope.moduleId,
                q: JSON.stringify($scope.conditionList),
                page: $scope.pageState.page,
            };

            if ($scope.selectedSearchParam) {
                stateParams.quick = $scope.selectedSearchParam.id
            } else {
                stateParams.quick = null;
            }

            searchService.search("channel_job", $scope.getESJson(), "normal").then(function (data) {
                $scope.loadList = false;
                $scope.list = data.list;

                $scope.pageState.total = data.total;
                $scope.pageState.totalAvailable = data.total;
                if (data.total > config.search.maxLength) {
                    $scope.pageState.totalAvailable =
                        config.search.maxLength - $scope.pageState.listLength + 1;
                }
            }, function (err) {
                $scope.loadList = false;
            });

        };


        $scope.pageState = {
            listLength: 10,
            offset: 0,
            page: 1,
        };

        // if ($stateParams.page) {
        //     $scope.pageState.page = $stateParams.page;
        //     $scope.pageState.total = $stateParams.page * $scope.pageState.listLength;
        //     $scope.pageState.totalAvailable = $scope.pageState.total;
        // }

        channelService.getJobTypeCounts().then(function (data) {
            $scope.jobCounts = data;
        });

        $scope.$watch('pageState.page', function (newPage) {
            $scope.pageState.offset = (newPage - 1) * $scope.pageState.listLength;
            $scope.updateList();
        });

        $scope.changeChannel = function (channelType) {
            $scope.channelType = channelType;
            $scope.keyword = null;
            $scope.updateList(true);
        }


    }
]).controller('channelJobViewCtrl', [
    '$scope',
    '$state',
    '$filter',
    'config',
    '$stateParams',
    'channelService',
    function ($scope, $state, $filter, config, $stateParams, channelService) {
        $scope.channelTypes = ["好猎友", "猎上网", "猎小二", "猎必得"];
        $scope.jobId = $stateParams.jobId;
        $scope.job = {};
        $scope.fieldList = config.channelJobFields;

        $scope.loading = true;

        channelService.getJob($scope.jobId).then(function (data) {
            $scope.job = data;
            if (!!data.tags && data.tags.length > 1) {
                $scope.job.tags = data.tags.split(',');
            } else {
                $scope.job.tags = null;
            }
            $scope.job.predictSalary = $filter("tigerMoney")($scope.job.predictMinSalary) + '-' + $filter("tigerMoney")($scope.job.predictMaxSalary);
            $scope.loading = false;
        });
    }
]);
