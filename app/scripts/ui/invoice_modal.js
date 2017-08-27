angular.module('tiger.ui.invoice_modal', []).service('invoiceModal', [
    '$uibModal',
    function ($uibModal) {

        this.showInvoice = function (invoiceId) {
            $uibModal.open({
                animation: true,
                templateUrl: 'views/invoice/view.html',
                controller: "invoiceCtrl",
                resolve: {
                    recReportData: function () {
                        return {invoiceId: invoiceId};
                    }
                }
            });
        };

        this.addInvoice = function (projectId, projectName, resumeId, resumeName) {
            $uibModal.open({
                animation: true,
                templateUrl: 'views/invoice/edit.html',
                controller: "invoiceCtrl",
                resolve: {
                    recReportData: function () {
                        return {
                            projectId: projectId,
                            projectName: projectName,
                            resumeId: resumeId,
                            resumeName: resumeName
                        };
                    }
                }
            });
        };

        this.editInvoice = function (invoiceId) {
            $uibModal.open({
                animation: true,
                templateUrl: 'views/invoice/edit.html',
                controller: "invoiceCtrl",
                resolve: {
                    recReportData: function () {
                        return {invoiceId: invoiceId};
                    }
                }
            });
        };

        this.operationInvoice = function (invoiceId, operationType, isShow) {
            $uibModal.open({
                animation: true,
                templateUrl: 'views/invoice/operation.html',
                controller: "invoiceOperationCtrl",
                resolve: {
                    recReportData: function () {
                        return {
                            invoiceId: invoiceId,
                            operationType: operationType,
                            isShow: isShow
                        };
                    }
                }
            });
        };
    }
]);