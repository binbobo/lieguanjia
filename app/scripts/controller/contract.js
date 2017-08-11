angular.module('tiger.ctrl.contract', ['tiger.api.contract']).config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('company_view.contract', {
            url: '/contract',
            templateUrl: 'views/company/contract.html',
            controller: 'companyViewContractCtrl'
        })
    }
]).controller('contractCtrl',
    function ($scope, $uibModal, uiModalService, $state, recReportData, $uibModalInstance,
              apiService, contractService, attachmentService, config) {

        $scope.loading = true;
        $scope.isNew = !recReportData.contractId;
        $scope.contractId = recReportData.contractId;
        $scope.moduleId = config.moduleMap.contract;
        $scope.contract = {};

        $scope.basicForm = [];

        $scope.attachmentType = 36;
        $scope.attachmentRelationId = $scope.contractId;
        $scope.attachmentList = [];

        $scope.creator = null;

        function initData() {
            apiService.getFieldList(8, 80, 'contract').then(function (data) {
                $scope.basicForm = data;

                if (!$scope.isNew) {
                    return contractService.getContract($scope.contractId);
                } else {
                    $scope.contract.Fcompany_id = {
                        id: recReportData.companyId,
                        value: recReportData.companyId,
                        title: recReportData.companyName
                    };
                    $scope.loading = false;
                }
            }).then(function (data) {
                if (data) {
                    $scope.contract = data.contract;
                    $scope.creator = data.creator;
                }
                attachmentService.getAttachmentList($scope.attachmentType, $scope.contractId).then(function (data) {
                    $scope.attachmentList = data;
                    $scope.loading = false;
                });
            })
        }

        $scope.ok = function () {
            $scope.contractInfo.$setSubmitted();
            if (!$scope.contractInfo.$valid) {
                uiModalService.alert("内容错误，请检查后保存");
                return;
            }
            contractService.updateContract($scope.contract, $scope.contractId).then(function (data) {
                $scope.contractId = data;
                return attachmentService.updateAttachmentList($scope.attachmentType, $scope.contractId, $scope.attachmentList);
            }).then(function () {
                $state.reload();
                $uibModalInstance.close();
            })
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        initData();
    }
).controller('companyViewContractCtrl',
    function ($scope, $stateParams, config, apiService, searchService, contractOperationService) {

        $scope.moduleId = config.moduleMap.contract;
        $scope.companyId = $stateParams.companyId;
        $scope.total = 0;
        $scope.list = [];

        $scope.operationFunc = {
            contract: contractOperationService
        };

        $scope.pageState = {
            page: 1,
            total: 0,
            listLength: 25
        };

        $scope.fieldInTable = [
            "contract.Fcontract_name",
            "stats.attachmentCount",
            "contract.Finvoice_title",
            "contract.Ffee_scale",
            "contract.Fstart_time",
            "contract.Fend_time",
            ".creator",
            ".operation"
        ];

        apiService.getFieldListForTable(8).then(function (data) {
            $scope.fieldList = data;
        });

        $scope.updateList = function () {
            var query = {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    'contract.Fcompany_id.id': $scope.companyId
                                }
                            }
                        ]
                    }
                },
                from: ($scope.pageState.page - 1) * $scope.pageState.listLength,
                size: $scope.pageState.listLength,
                sort: {
                    "time": {
                        order: 'desc'
                    }
                }
            };
            searchService.search("contract", query, "normal").then(function (data) {
                $scope.pageState.total = data.total;
                $scope.pageState.totalAvailable = data.total;
                $scope.list = data.list;
            });
        };

        $scope.$watch('pageState', function () {
            $scope.updateList();
        }, true);
    }
).service('contractModal', [
    '$uibModal',
    function ($uibModal) {
        this.editContract = function (contractId, companyId, companyName) {
            $uibModal.open({
                animation: true,
                templateUrl: 'views/contract/edit.html',
                controller: "contractCtrl",
                resolve: {
                    recReportData: function () {
                        return {
                            contractId: contractId,
                            companyId: companyId,
                            companyName: companyName
                        };
                    }
                }
            });
        };
    }
]).service('contractOperationService',
    function (contractModal, contractService, uiModalService, $state) {

        this.editContract = function (item) {
            contractModal.editContract(item.id);
        };

        this.addContract = function (item) {
            contractModal.editContract(null, item.id, item.basicInfo.Fcompany_name);
        };

        this.deleteContract = function (item) {
            uiModalService.yesOrNo({title: '是否删除？', okBtnClass: 'btn btn-danger'}).then(function () {
                return contractService.deleteContract(item.id);
            }).then(function () {
                $state.reload();
            });
        };
    }
);
