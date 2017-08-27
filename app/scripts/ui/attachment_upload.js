"use strict";
angular.module("tiger.ui.attachment_upload", []).directive('attachmentUpload', function ($rootElement, $timeout) {
    function containsFiles(event) {
        if (event.dataTransfer.types) {
            for (var i = 0; i < event.dataTransfer.types.length; i++) {
                if (event.dataTransfer.types[i] === "Files") {
                    return true;
                }
            }
        }
        return false;
    }

    function removeClassWhenMouseover() {
        $rootElement.off('mouseover.tigerUpload').on('mouseover.tigerUpload', function (event) {
            $rootElement.removeClass('dragging-file').off('mouseover.tigerUpload');
        });
    }

    var coldDown = null;
    var lastIn = null;

    $rootElement.on('dragover.tigerUpload', function (event) {
        if (containsFiles(event.originalEvent)) {
            lastIn = $(event.target).attr('class');

            $rootElement.addClass('dragging-file');
            removeClassWhenMouseover();
            $timeout.cancel(coldDown);
        }
    }).on('dragleave.tigerUpload', function (event) {
        $timeout.cancel(coldDown);
        coldDown = $timeout(function () {
            if (lastIn !== 'attachment-drag-zone-wrap') {
                $rootElement.removeClass('dragging-file');
            }
        }, 500);
    });

    return {
        templateUrl: "views/attachment/attachment_upload.html",
        link: function ($scope, ele, attrs) {
        },
        scope: {
            moduleId: '@',
            title: '@',
            onSuccess: '=',
            onError: '='
        },
        controller: function ($rootScope, $scope, FileUploader, ngToast, config) {
            $scope.subTypeEntity = {};
            $scope.subTypeFieldInfo = config.moduleIdConfig[$scope.moduleId].attachmentSubType;
            $scope.attachmentType = config.moduleIdConfig[$scope.moduleId].attachmentType;
            $scope.attachmentUploader = new FileUploader({
                url: '/api/file/upload',
                autoUpload: true,
                removeAfterUpload: true,
                formData: [
                    {
                        type: $scope.attachmentType
                    }
                ],
                onAfterAddingFile: function () {
                    // $rootElement.removeClass('dragging-file');
                },
                onBeforeUploadItem: function (item) {
                    item.formData = [
                        {
                            type: $scope.attachmentType,
                            // Java特别渣，需要单独传文件名
                            fileName: item.file.name,
                        }
                    ];
                    $scope.onUpload = 0;
                },
                onErrorItem: function (item, response, status, headers) {
                    if (response.result) {
                        ngToast.warning(response.result.error);
                    } else if (response && response.indexOf("request entity too large")) {
                        ngToast.warning('上传失败,文件过大');
                    } else {
                        ngToast.warning("上传失败");
                    }
                    $scope.loadAttachment = false;
                    $scope.$eval($scope.onError);
                },
                onCancelItem: function () {
                    $scope.loadAttachment = false;
                },
                onSuccessItem: function (item, response, status, headers) {
                    var fileData = response.result;
                    var account = $rootScope.account;
                    var user = {
                        title: account.name
                    };
                    var fileItem = {
                        id: fileData.id,
                        fileName: fileData.fileName,
                        fileType: fileData.fileType,
                        subTypeItem: $scope.subTypeEntity.subType,
                        fileSize: fileData.fileSize,
                        time: Math.round(new Date().getTime() / 1000),
                        user: user
                    };

                    if ($scope.onSuccess) {
                        $scope.onSuccess(fileItem);
                    }
                },
                onProgressItem: function (item, progress) {
                    $scope.onUpload = progress;
                }
            });
        }

    };
}).directive('attachmentList', function () {
    return {
        templateUrl: "views/attachment/attachment_list_edit.html",
        link: function ($scope, ele, attrs) {
        },
        transclude: true,
        scope: {
            list: '=',
            relationId: '=',
            parseResume: '=',
            moduleId: '@',
            title: '@',
            onSuccess: '=',
            onError: '=',
        },
        controller: function ($rootScope, $scope, config, uiModalService, attachmentService) {
            $scope.config = config;
            $scope.attachmentType = config.moduleIdConfig[$scope.moduleId].attachmentType;
            // if (!$scope.list) {
            //     $scope.list = [];
            // }
            if ($scope.relationId) {
                attachmentService.getAttachmentList($scope.attachmentType, $scope.relationId).then(function (data) {
                    $scope.list = data;
                });
            }
            $scope.addAttachment = function (fileItem) {
                $scope.list.push(fileItem);
                if ($scope.relationId) {
                    attachmentService.updateAttachmentList($scope.attachmentType, $scope.relationId, $scope.list);
                }
            };

            $scope.removeAttachment = function ($index) {
                uiModalService.yesOrNo({
                    title: '您确认要删除吗？',
                    okBtnClass: 'btn btn-danger',
                    okBtnText: '删除',
                    cancelBtnText: '取消'
                }).then(function () {
                    $scope.list.splice($index, 1);
                    if ($scope.relationId > 0) {
                        attachmentService.updateAttachmentList($scope.attachmentType, $scope.relationId, $scope.list);
                    }
                })
            };

            $scope.onUploadSuccess = function (fileItem) {
                $scope.addAttachment(fileItem);
                if ($scope.onSuccess) {
                    $scope.onSuccess(fileItem);
                }
            };

            $scope.previewFile = function (type, id, rid) {
                $rootScope.$emit('previewFile', {resourceType: type, resourceId: id, rid: rid});
            };
        }
    };
});
