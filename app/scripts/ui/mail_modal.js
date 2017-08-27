angular.module('tiger.ui.mail_modal', []).service('mailModal', [
    '$uibModal',
    '$rootScope',
    '$filter',
    function ($uibModal, $rootScope, $filter) {
        this.chooseAttachment = function () {
            return $uibModal.open({
                animation: false,
                templateUrl: 'views/mail/modal/attachment.html',
                controller: [
                    '$scope',
                    'config',
                    'attachmentService',
                    '$uibModalInstance',
                    'FileUploader',
                    function ($scope, config, attachmentService, $uibModalInstance, FileUploader) {


                        $scope.selectType = 31;
                        $scope.relationItem = {};
                        $scope.attachmentList = [];
                        $scope.selected = [];

                        $scope.changeType = function (type) {
                            $scope.selectType = type;
                            $scope.attachmentList = [];
                            $scope.relationItem = {};
                            $scope.selected = [];
                        };

                        $scope.ok = function () {
                            $uibModalInstance.close($scope.selected);
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };


                        $scope.$watch('relationItem', function () {
                            if (!!$scope.relationItem.info) {
                                attachmentService.getAttachmentList($scope.selectType, $scope.relationItem.info.id).then(function (data) {
                                    $scope.attachmentList = data;
                                });
                            }
                        }, true);


                        $scope.updateSelection = function ($event, id) {
                            var checkbox = $event.target;
                            if (checkbox.checked && $scope.selected.indexOf(id) == -1) {
                                $scope.selected.push(id);
                            }
                            if (!checkbox.checked && $scope.selected.indexOf(id) != -1) {
                                var idx = $scope.selected.indexOf(id);
                                $scope.selected.splice(idx, 1);
                            }
                        };

                        $scope.isSelected = function (id) {
                            return $scope.selected.indexOf(id) >= 0;
                        };

                        $scope.removeAttachment = function ($index) {
                            $scope.attachmentList.splice($index, 1);
                        };

                        $scope.onFileUpload = -1;
                        $scope.fileUploader = new FileUploader({
                            url: '/api/file/upload',
                            autoUpload: true,
                            formData: [
                                {
                                    type: 32
                                }
                            ],
                            onBeforeUploadItem: function (item) {
                                $scope.onFileUpload = 0;
                                item.formData = [
                                    {
                                        type: 32,
                                        fileName: item.file.name,
                                    }
                                ];
                            },
                            onErrorItem: function () {
                            },
                            onCancelItem: function () {
                            },
                            onSuccessItem: function (item, response, status, headers) {

                                var fileItem = {
                                    id: response.result.id,
                                    fileName: response.result.fileName,
                                    fileType: response.result.fileType,
                                };

                                $scope.attachmentList.push(fileItem);
                                $scope.selected.push(fileItem);
                            },
                            onProgressItem: function (item, progress) {
                                $scope.onFileUpload = progress;
                            }
                        });
                    }
                ]
            }).result;
        };
        this.composeMail = function (data, type) {

            var templateId = 0;
            var template = {};

            var receiver = "";
            var projectId = 0;
            var relationId = 0;
            switch (type) {
                //简历列表/详情页发送
                case 1:
                    receiver = !data.basicInfo.Femail ? [] : data.basicInfo.Femail;
                    template.recipient = data.basicInfo.Fname;
                    relationId = data.id;
                    break;
                //pipeline列表,向简历发送
                case 2:
                //pipeline列表,向客户联系人发送
                case 3:
                    template.recipient = type == 2 ? data.resume.basicInfo.Fname : "";
                    template.candidate = data.resume.basicInfo.Fname;
                    template.project = data.project.basicInfo.Fproject_name;
                    template.position = data.project.basicInfo.Fproject_name;
                    template.interview = {};
                    var lastOperation = data.lastOperation;
                    var operationStatus = !!lastOperation.status ? lastOperation.status.value : 0;
                    //流转状态->面试
                    if (operationStatus == 3) {
                        var interviewData = data.lastOperation.data;
                        var projectData = data.project.basicInfo;
                        if (!!interviewData) {
                            template.interview.time = $filter("tigerDatetime")(interviewData.interviewTime);
                            template.interview.timestamp = interviewData.interviewTime;
                            template.interview.interviewer = interviewData.interviewer;
                            template.interview.address = interviewData.place;
                            template.interview.company = !projectData.Fcompany_id ? "" : projectData.Fcompany_id.title;
                        }
                    }

                    templateId = type == 2 && operationStatus == 1 ? 10001
                        : type == 2 && operationStatus == 3 ? 10006
                        : type == 3 && operationStatus == 3 ? 10007
                        : type == 2 && operationStatus == 4 ? 10008
                        : type == 3 && operationStatus == 2 ? 10005 : 0;
                    receiver = type == 2 && !!data.resume.basicInfo.Femail ? data.resume.basicInfo.Femail : [];
                    projectId = !data.project.basicInfo ? 0 : data.project.basicInfo.Fid;
                    debugger
                    relationId = data.resume.id;
                    break;
            }

            return $uibModal.open({
                animation: false,
                templateUrl: 'views/mail/modal/compose.html',
                backdrop: false,
                controller: 'mailCompostModalCtrl',
                size: "lg",
                resolve: {
                    recReportData: function () {
                        return {
                            isModal: true,
                            receiver: receiver,
                            projectId: projectId,
                            templateData: template,
                            templateId: templateId,
                            moduleId: 1,
                            relationId: relationId,
                            type: type
                        };
                    }
                }
            }).result;
        };
        this.updateMailTemplate = function (mailTemplate, isGeneral) {
            return $uibModal.open({
                animation: true,
                templateUrl: 'views/mail/modal/template_update.html',
                backdrop: false,
                controller: 'mailTemplateUpdateModalCtrl',
                size: "lg",
                resolve: {
                    recReportData: function () {
                        return {
                            mailTemplate: mailTemplate,
                            isGeneral: isGeneral
                        };
                    }
                }
            }).result;
        };
    }
]);