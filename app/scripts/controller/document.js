angular.module('tiger.ctrl.document', ['tiger.api.document']).config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        // $stateProvider.state('document', {
        //     templateUrl: 'views/document/edit.html',
        //     controller: 'documentEditCtrl',
        //     data: {
        //         title: '渠道职位'
        //     }
        // });
    }
]).controller('documentEditCtrl', [
    '$scope',
    'config',
    'documentService',
    '$uibModalInstance',
    'FileUploader',
    '$state',
    'uiModalService',
    function ($scope, config, documentService, $uibModalInstance, FileUploader, $state, uiModalService) {

        $scope.documentList = [];
        $scope.documentIdList = [];
        $scope.folderInfo = {};

        $scope.fields = config.documentFields;

        $scope.documentListValid = true;
        $scope.uploadError = null;

        $scope.loading = false;

        $scope.ok = function () {
            $scope.documentInfo.$setSubmitted();
            if ($scope.documentIdList.length < 1) {
                $scope.documentListValid = false;
                return;
            }
            if (!$scope.documentInfo.$valid || $scope.documentIdList.length < 1) {
                return;
            }
            $scope.loading = true;
            documentService.upload($scope.documentIdList, $scope.folderInfo.folder ? $scope.folderInfo.folder[0].id : 0).then(function () {
                $scope.loading = false;
                $state.reload();
                $uibModalInstance.close();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

        $scope.removeAttachment = function ($index) {
            $scope.documentList.splice($index, 1);
            $scope.documentIdList.splice($index, 1);
            if ($scope.documentIdList.length < 1) {
                $scope.documentListValid = false;
            }
        };

        $scope.onFileUpload = -1;
        $scope.fileUploading = false;
        $scope.fileUploader = new FileUploader({
            url: '/api/file/upload',
            autoUpload: true,
            formData: [
                {
                    type: 41
                }
            ],
            onBeforeUploadItem: function (item) {
                $scope.uploadError = null;
                $scope.fileUploading = true;
                $scope.onFileUpload = 0;
                item.formData = [
                    {
                        type: 41,
                        fileName: item.file.name,
                    }
                ];
            },
            onErrorItem: function (data, response) {
                if (response.result) {
                    $scope.uploadError = response.result.error;
                } else if (response && response.indexOf("request entity too large")) {
                    $scope.uploadError = "上传失败,文件过大";
                } else {
                    $scope.uploadError = "上传失败";
                }
                $scope.fileUploading = false;
            },
            onCancelItem: function () {
                $scope.fileUploading = false;
            },
            onSuccessItem: function (item, response, status, headers) {

                var fileItem = {
                    id: response.result.id,
                    fileName: response.result.fileName,
                    fileType: response.result.fileType,
                };

                $scope.documentList.push(fileItem);
                $scope.documentIdList.push(fileItem.id);

                $scope.fileUploading = false;
                $scope.documentListValid = true;
            },
            onProgressItem: function (item, progress) {
                $scope.onFileUpload = progress;
            }
        });
    }
]).service('documentOperationService', [
    'documentModal',
    'uiModalService',
    'documentService',
    '$state',
    function (documentModal, uiModalService, documentService, $state) {

        this.uploadDocument = function () {
            documentModal.uploadDocument();
        };

        this.deleteDocument = function (documentId) {
            uiModalService.yesOrNo(
                {
                    title: '您确认要删除？',
                    okBtnClass: 'btn btn-danger',
                    okBtnText: '删除'
                }
            ).then(function () {
                return documentService.delete([documentId]);
            }).then(function () {
                $state.reload();
            });
        }
    }
]);
;
