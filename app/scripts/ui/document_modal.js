angular.module('tiger.ui.document_modal', ['tiger.ctrl.document']).service('documentModal', [
    '$uibModal',
    function ($uibModal) {

        this.uploadDocument = function () {
            return $uibModal.open({
                animation: false,
                templateUrl: 'views/document/edit.html',
                controller: "documentEditCtrl",
            }).result;
        };
    }
]);
