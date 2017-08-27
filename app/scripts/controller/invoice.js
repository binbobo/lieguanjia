angular.module('tiger.ctrl.invoice', ['tiger.api.invoice']).config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('project_view.invoice', {
            url: '/invoice',
            templateUrl: 'views/project/invoice.html',
            controller: 'projectViewInvoiceCtrl'
        })
    }
]).controller('invoiceCtrl', [
    '$scope',
    '$uibModal',
    'uiModalService',
    '$state',
    'recReportData',
    '$uibModalInstance',
    'apiService',
    'invoiceService',
    function ($scope, $uibModal, uiModalService, $state, recReportData, $uibModalInstance, apiService, invoiceService) {

        $scope.isNew = !recReportData.invoiceId;
        $scope.loading = true;

        $scope.projectId = recReportData.projectId;
        $scope.projectName = recReportData.projectName;
        $scope.resumeId = recReportData.resumeId;
        $scope.resumeName = recReportData.resumeName;

        $scope.invoiceData = {invoice: {}};

        $scope.clientInfoForm = [];
        $scope.internalForm = [];

        function initData() {
            apiService.getFieldList(9, 90, 'invoice').then(function (data) {
                angular.forEach(data, function (item) {
                    if (item.fieldGroup == 'customerInfo') {
                        $scope.clientInfoForm.push(item);
                    } else if (item.fieldGroup == 'internalInfo') {
                        $scope.internalForm.push(item);
                    }
                });
                if (!$scope.isNew) {
                    return invoiceService.getInvoice(recReportData.invoiceId);
                } else {
                    $scope.loading = false;
                }
            }).then(function (data) {
                if (data) {
                    $scope.invoiceData = data;
                    if (data.invoice.Ftelephone && data.invoice.Ftelephone.length < 1) {
                        $scope.invoiceData.invoice.Ftelephone = null;
                    }
                }
                $scope.loading = false;
            })
        }

        $scope.ok = function () {
            $scope.invoiceInfo.$setSubmitted();
            if (!$scope.invoiceInfo.$valid) {
                uiModalService.alert("内容错误，请检查后保存");
                return;
            }
            if ($scope.isNew) {
                $scope.invoiceData.invoice.Fresume_id = {value: recReportData.resumeId};
                $scope.invoiceData.invoice.Fproject_id = {value: recReportData.projectId};
            }
            $scope.invoiceData.invoice.Fstatus = {value: 1};
            invoiceService.updateInvoice($scope.invoiceData.invoice, $scope.isNew ? 0 : recReportData.invoiceId).then(function () {
                $state.reload();
                $uibModalInstance.close();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        initData();
    }
]).controller('invoiceOperationCtrl', [
    '$scope',
    '$uibModal',
    'uiModalService',
    '$state',
    'recReportData',
    '$uibModalInstance',
    'apiService',
    'invoiceService',
    'config',
    function ($scope, $uibModal, uiModalService, $state, recReportData, $uibModalInstance, apiService, invoiceService, config) {

        $scope.invoiceId = recReportData.invoiceId;
        $scope.isShow = recReportData.isShow;

        $scope.basicForm = [];
        $scope.invoice = null;

        $scope.operationType = recReportData.operationType;
        $scope.title = config.invoiceOperationInfos[recReportData.operationType].title;
        $scope.fieldGroup = config.invoiceOperationInfos[recReportData.operationType].group;

        function initData() {
            apiService.getFieldList(9, 90, 'invoice').then(function (data) {
                angular.forEach(data, function (item) {
                    if (item.fieldGroup == $scope.fieldGroup) {
                        $scope.basicForm.push(item);
                    }
                });
                return invoiceService.getInvoice($scope.invoiceId);
            }).then(function (data) {
                if (data) {
                    $scope.invoice = data.invoice;
                }
            })
        }

        $scope.ok = function () {
            $scope.invoiceInfo.$setSubmitted();
            if (!$scope.invoiceInfo.$valid) {
                uiModalService.alert("内容错误，请检查后保存");
                return;
            }
            $scope.invoice.Fstatus = {value: $scope.operationType};
            invoiceService.updateInvoice($scope.invoice, $scope.invoiceId).then(function () {
                $state.reload();
                $uibModalInstance.close();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        initData();
    }
]).controller('projectViewInvoiceCtrl', function ($scope, $stateParams, config, apiService, searchService, invoiceOperationService, achievementOperationService) {

        $scope.moduleId = config.moduleMap.invoice;
        $scope.projectId = $stateParams.projectId;
        $scope.total = 0;
        $scope.list = [];

        $scope.operationFunc = {
            invoice: invoiceOperationService,
            achievement: achievementOperationService
        };

        $scope.pageState = {
            page: 1,
            total: 0,
            listLength: 25
        };

        $scope.fieldInTable = [
            "invoice.Fresume_id",
            "invoice.Finvoice_amount",
            "invoice.Fpayment_time",
            "invoice.Fpayment_amount",
            "invoice.Fstatus",
            ".status",
            ".operation"
        ];

        apiService.getFieldListForTable(9).then(function (data) {
            $scope.fieldList = data;
        });

        $scope.updateList = function () {
            var query = {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    'invoice.Fproject_id.id': $scope.projectId
                                }
                            }
                        ]
                    }
                },
                from: ($scope.pageState.page - 1) * $scope.pageState.listLength,
                size: $scope.pageState.listLength,
                sort: {
                    id: {
                        order: 'desc'
                    }
                }
            };
            searchService.search("invoice", query, "normal").then(function (data) {
                $scope.pageState.total = data.total;
                $scope.pageState.totalAvailable = data.total;
                $scope.list = data.list;
            });
        };

        $scope.$watch('pageState', function () {
            $scope.updateList();
        }, true);
    }
).service('invoiceOperationService', [
    'invoiceModal',
    function (invoiceModal) {

        this.showInvoice = function (invoiceId) {
            invoiceModal.showInvoice(invoiceId);
        };

        this.showOperation = function (invoiceId, status) {
            invoiceModal.operationInvoice(invoiceId, status, true);
        };

        this.editInvoice = function (invoiceId) {
            invoiceModal.editInvoice(invoiceId);
        };

        this.sendInvoice = function (invoiceId) {
            invoiceModal.operationInvoice(invoiceId, 2);
        };

        this.paymentInvoice = function (invoiceId) {
            invoiceModal.operationInvoice(invoiceId, 3);
        };

        this.cancelInvoice = function (invoiceId) {
            invoiceModal.operationInvoice(invoiceId, 4);
        };
    }
]);
