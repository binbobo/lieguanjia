angular.module('tiger.ui.attachment_modal', []).controller('attachmentModalController', function ($scope, FileUploader,
    attachmentService, attachmentRid, attachmentType, attachmentList) {

    $scope.attachmentType = attachmentType;
    $scope.attachmentRid = attachmentRid;
    $scope.attachmentList = attachmentList;

    $scope.resumeAttachmentTmp = {};

    $scope.resumeAttachmentType = {
        name: 'subType',
        dataType: 'select',
        listType: 600,
        defaultValue: 134040112,
    };

    $scope.removeAttachment = function (index) {
        $scope.attachmentList.splice(index, 1);
        attachmentService.updateAttachmentList(
            attachmentType, attachmentRid, $scope.attachmentList
        );
    };

    $scope.loadAttachment = true;

    $scope.attachmentUploader = new FileUploader({
        url: '/api/file/upload',
        autoUpload: true,
        formData: [
            {
                type: attachmentType
            }
        ],
        onBeforeUploadItem: function (item) {
            item.formData = [
                {
                    type: attachmentType,
                    // Java特别渣，需要单独传文件名
                    fileName: item.file.name,
                }
            ];
        },
        onErrorItem: function () {
            $scope.loadAttachment = false;
        },
        onCancelItem: function () {
            $scope.loadAttachment = false;
        },
        onSuccessItem: function (item, response, status, headers) {
            var fileData = response.result;

            var fileItem = {
                id: fileData.id,
                fileName: fileData.fileName,
                fileType: fileData.fileType,
                subTypeItem: $scope.resumeAttachmentTmp.subType,
            };

            $scope.attachmentList.push(fileItem);

            attachmentService.updateAttachmentList(
                attachmentType, attachmentRid, $scope.attachmentList
            ).then(function () {
                $scope.loadAttachment = false;
            });
        },
        onProgressItem: function (item, progress) {
            $scope.onResumeUpload = progress;
        },
    });

}).service('attachmentModal', function ($uibModal, attachmentService) {
    this.showAttachmentModal = function (rid, type) {
        return $uibModal.open({
            templateUrl: 'views/attachment/modal/edit.html',
            controller: 'attachmentModalController',
            resolve: {
                attachmentRid: rid,
                attachmentType: type,
                attachmentList: function () {
                    return attachmentService.getAttachmentList(type, rid);
                }
            }
        });
    };
});
