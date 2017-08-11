"use strict";
angular.module('tiger.ctrl.mail', ['ngTable', 'ui.router', 'tiger.api.mail', 'tiger.api.file']).config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when("/email", "/email/inbox/1");

        $stateProvider.state('mail', {
            url: '/email',
            templateUrl: 'views/mail/main.html',
            controller: 'mailCtrl',
            data: {
                title: '邮件'
            }
        }).state('mail.inbox', {
            url: '/inbox/{type:int}',
            templateUrl: 'views/mail/list.html',
            controller: 'mailListCtrl',
            data: {
                title: '邮件'
            }
        }).state('mail.detail', {
            url: '/detail/{emailId:int}',
            templateUrl: 'views/mail/detail.html',
            controller: 'mailDetailCtrl',
            data: {
                title: '邮件'
            }
        }).state('mail.compose', {
            url: '/compose/{emailId:int}:{sendType:int}',
            templateUrl: 'views/mail/compose.html',
            controller: 'mailCompostCtrl',
            data: {
                title: '写邮件'
            }
        }).state('candidate_view.mailList', {
            url: '/mailList',
            templateUrl: 'views/candidate/mail_list.html',
            controller: 'candidateViewMailCtrl',
            data: {
                key: 'candidateId',
                moduleId: 4
            }
        }).state('setting.mail_template', {
            url: '/mailTemplate/list',
            templateUrl: 'views/mail/template_list.html',
            controller: 'mailTemplateListCtrl',
            data: {
                title: '邮件模板',
                general: 1
            }
        });
    }
]).controller('mailCtrl', [
    '$scope',
    '$rootScope',
    '$interval',
    '$filter',
    '$state',
    'ngTableParams',
    'mailService',
    'uiModalService',
    function ($scope, $rootScope, $interval, $filter, $state, ngTableParams, mailService, uiModalService) {

        $scope.groupCount = [];
        $scope.refreshing = false;
        $scope.lossMailConfig = false;

        $scope.type = 1;
        mailService.getConfig().then(function (data) {
            if (!data.result) {
                $scope.lossMailConfig = true;
            } else {
                $scope.lossMailConfig = false;
                return mailService.groupCount();
            }
        }).then(function (response) {
            $scope.groupCount = response;
        });

        $scope.refresh = function () {
            if ($scope.refreshing)
                return;
            $scope.refreshing = true;
            mailService.receive().then(function () {
                startTimer();
            });
        };

        function startTimer() {
            if (!$scope.timer) {
                $scope.timer = $interval(function () {
                    isReceiving();
                }, 1000);
            }
        }

        function isReceiving(ignoreRefresh) {
            mailService.isReceiving().then(function (data) {
                $scope.refreshing = data;
                if (!$scope.refreshing) {
                    $interval.cancel($scope.timer);
                    $scope.timer = null;
                    if (!ignoreRefresh) {
                        $state.reload();
                    }
                } else if (!$scope.timer) {
                    startTimer();
                }
            });
        }

        isReceiving(true);

        $rootScope.$on('$stateChangeStart',
            function () {
                $interval.cancel($scope.timer);
                $scope.timer = null;
            }
        );


    }
]).controller('mailListCtrl',
    function ($scope, $filter, $state, $stateParams, ngTableParams, mailService, fileService, uiModalService) {

        $scope.type = $stateParams.type;
        if (!$scope.type)
            $scope.type = 1;

        $scope.page_size = 10;

        $scope.now_offset = 0;

        $scope.list_mails = function (type) {
            if ($scope.type = type) {
                $scope.now_offset = 0;
                $scope.type = type;
            }
            mailService.list(type, 0, $scope.page_size).then(function (response) {
                $scope.mails = response;
            });
        };

        $scope.page_mails = function (page_type) {
            if (page_type == -1 && $scope.now_offset == 0 || page_type == 1 && $scope.now_offset >= $scope.mails.total - $scope.page_size) {
                return;
            }
            $scope.now_offset = $scope.now_offset + (page_type == 1 ? $scope.page_size : -$scope.page_size);
            mailService.list($scope.type, $scope.now_offset, $scope.page_size).then(function (response) {
                $scope.mails = response;
                $scope.fitMailListAttCount($scope.mails.list);
            });
        };
        //
        // $scope.refresh = function () {
        //     if ($scope.refreshing)
        //         return;
        //     $scope.refreshing = true;
        //     mailService.receive().then(function (response) {
        //         $scope.refreshing = false;
        //         $state.reload();
        //     });
        // };

        $scope.fitMailListAttCount = function (mails) {
            var mail_ids = [];
            angular.forEach(mails, function (mail, index, array) {
                mail_ids[index] = mail.id;
            });
            fileService.att_count(mail_ids, 32).then(function (response) {
                angular.forEach(mails, function (mail, index, array) {
                    mail.attCount = response[mail.id] ? response[mail.id] : 0;
                });
            });
        };

        $scope.toDetail = function (id, type) {
            if (type == 3)
                $state.go('mail.compose', {emailId: id, sendType: 0});
            else
                $state.go('mail.detail', {emailId: id});
        };

        $scope.starred = function (item) {
            if (!item) return;
            mailService.starred(item.id, item.starred == 0 ? 1 : 0)
                .then(function (response) {
                    if (response > 0) {
                        item.starred = item.starred == 0 ? 1 : 0;
                        $scope.refreshList();
                    } else {
                        uiModalService.alert("设置星标失败");
                    }
                });
        };

        $scope.trash = function (id) {
            if (!id)
                return;
            mailService.trash(id, 1).then(function (response) {
                if (response) {
                    $scope.refreshList();
                } else {
                    uiModalService.alert("失败");
                }
            });
        };

        $scope.reTrash = function (id) {
            if (!id)
                return;
            mailService.trash(id, 0).then(function (response) {
                if (response) {
                    $scope.refreshList();
                    uiModalService.alert("成功");
                } else {
                    uiModalService.alert("失败");
                }
            });
        };

        $scope.refreshList = function () {
            //if ($scope.type == 99 || $scope.type == 4) {
            mailService.list($scope.type, $scope.now_offset, $scope.page_size).then(function (response) {
                $scope.mails = response;
                $scope.fitMailListAttCount($scope.mails.list);
            });
            //}
            mailService.groupCount().then(function (response) {
                $scope.$parent.groupCount = response;
            })
        };

        $scope.refreshList();
    }
).controller('mailDetailCtrl', [
    '$scope',
    '$sce',
    '$state',
    '$stateParams',
    '$window',
    'mailService',
    'attachmentService',
    'config',
    function ($scope, $sce, $state, $stateParams, $window, mailService, attachmentService, config) {
        $scope.config = config;
        $scope.emailId = $stateParams.emailId;
        if (!$scope.emailId) return;
        mailService.detail($scope.emailId).then(function (response) {
            $scope.detail = response;
            $scope.content_html = $sce.trustAsHtml($scope.detail.data)
        });

        attachmentService.getAttachmentList(32, $scope.emailId).then(function (data) {
            $scope.attachmentList = data;
        });

        $scope.reply = function () {
            $state.go('mail.compose', {emailId: $scope.emailId, sendType: 2});
        };
        $scope.forward = function () {
            $state.go('mail.compose', {emailId: $scope.emailId, sendType: 1});
        };
        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.contentUrl = $sce.trustAsResourceUrl('/api/email/detail/content?id=' + $scope.emailId)
    }
]).controller('mailCompostModalCtrl', [
    '$scope',
    '$rootScope',
    'recReportData',
    '$uibModalInstance',
    'uiModalService',
    'mailService',
    'projectService',
    function ($scope, $rootScope, recReportData, $uibModalInstance, uiModalService, mailService, projectService) {
        $scope.isModal = recReportData.isModal;
        $scope.mail = {};
        $scope.mail.receiver = angular.copy(recReportData.receiver);
        $scope.projectId = recReportData.projectId;
        $scope.templateData = recReportData.templateData;
        $scope.templateId = recReportData.templateId;
        $scope.type = recReportData.type;
        $scope.sendOk = false;

        mailService.getConfig().then(function (data) {
            if (!data.result) {
                uiModalService.alert("请先配置邮箱", true).then(function () {
                    $uibModalInstance.close();
                });
            }
        });
        if (!!$scope.projectId && $scope.projectId > 0) {
            projectService.getCustomerInfo($scope.projectId).then(function (data) {
                //发送给客户联系人时
                if ($scope.type == 3) {
                    $scope.mail.receiver = !data.Femail ? [] : data.Femail;
                    $scope.templateData.recipient = data.Fname;
                }

                $scope.templateData.phone = !data.Fphone ? "" : data.Fphone[0];

            });
        }

        $scope.$watch('sendOk', function () {
            if ($scope.sendOk) {
                $uibModalInstance.close(true);
            }
        }, true);

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]).controller('mailCompostCtrl', [
    '$scope',
    '$rootScope',
    '$sce',
    '$filter',
    '$state',
    '$stateParams',
    '$interpolate',
    'ngTableParams',
    'mailService',
    'fileService',
    'taskService',
    'uiModalService',
    'mailModal',
    'ngToast',
    function ($scope, $rootScope, $sce, $filter, $state, $stateParams, $interpolate, ngTableParams, mailService, fileService, taskService, uiModalService, mailModal, ngToast) {
        if (!$scope.mail) {
            $scope.mail = {};
        }
        if (!$scope.mail.receiver) {
            $scope.mail.receiver = [];
        }
        $scope.mail.cc = [];
        $scope.mail.bcc = [];
        $scope.attachmentList = [];
        $scope.available = [];
        $scope.templateList = [];
        $scope.emailReg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        $scope.mailSign = "";

        var signSeparator = "<br/><p>------------------------</p>";


        mailService.listTemplate().then(function (data) {
            $scope.templateList = data.list;
            angular.forEach($scope.templateList, function (templateItem) {
                if (templateItem.id == $scope.templateId) {
                    $scope.choseTemplate = templateItem;
                    $scope.changeTemplate(templateItem);
                }
            });
        });

        $scope.emailId = $stateParams.emailId;
        var sendType = $stateParams.sendType;
        if ($scope.emailId) {
            mailService.detail($scope.emailId).then(function (response) {
                if (!response)
                    return;

                fileService.list($scope.emailId, 32).then(function (list) {
                    $scope.attachmentList = list;

                });
                //0:普通发送  1:转发  2:回复
                switch (sendType) {
                    case 0:
                        $scope.mail = response;
                        break;
                    case 1:
                        $scope.addDataPrefix(response);
                        $scope.mail.subject = "转发：" + response.subject;
                        $scope.mail.data = response.data;
                        break;
                    case 2:
                        $scope.addDataPrefix(response);
                        $scope.mail.receiver = [response.sender];
                        $scope.mail.cc = response.cc ? [response.cc] : [];
                        $scope.mail.subject = "回复：" + response.subject;
                        $scope.mail.data = response.data;
                        break;
                }
            });
        } else {
            mailService.getSign().then(function (data) {
                $scope.mailSign = data.sign;
                if (!!$scope.mailSign) {
                    $scope.mail.data = signSeparator + $scope.mailSign;
                }
            });
        }

        $scope.send = function () {
            if (!$scope.mail.receiver || $scope.mail.receiver.length < 1) {
                uiModalService.alert("收件人不能为空");
                return;
            }
            if (!$scope.mail.subject || $scope.mail.subject.length < 1) {
                uiModalService.alert("主题不能为空");
                return;
            }
            if (!$scope.mail.data || $scope.mail.data.length < 1) {
                uiModalService.alert("正文不能为空");
                return;
            }

            $scope.loading = true;
            mailService.send($scope.mail, $scope.attachmentList, $scope.relationId, $scope.moduleId).then(function (response) {
                if (response > 0) {
                    $scope.loading = false;
                    if (!$scope.isModal) {
                        $state.go('mail.inbox', {type: 2});
                    } else {
                        $scope.$parent.sendOk = true;
                    }
                    ngToast.success("发送成功");
                } else {
                    $scope.loading = false;
                    // $scope.draft();
                    ngToast.warning("发送失败");
                }
            });
        };

        $scope.draft = function () {
            $scope.loading = true;
            mailService.draft($scope.mail, $scope.attachmentList).then(function (response) {
                if (response > 0) {
                    $state.go('mail.inbox', {type: 3});
                } else {
                    ngToast.warning("保存草稿失败");
                }
                $scope.loading = false;
            })
        };

        $scope.addAttachment = function () {
            mailModal.chooseAttachment().then(function (mailModal) {
                angular.forEach(mailModal, function (item) {
                    $scope.attachmentList.push(item);
                });
            });
        };

        $scope.removeAttachment = function ($index) {
            $scope.attachmentList.splice($index, 1);
        };

        $scope.addDataPrefix = function (mail) {
            var prefix = "<br/><br/><div style=\" font: 12px/1.5 'Lucida Grande';padding:2px 0 2px 0;\"><span style=\"color:#333;text-decoration:line-through;white-space:pre-wrap;\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;原始邮件&nbsp;<span style=\"color:#333;text-decoration:line-through;white-space:pre-wrap;\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></div>"
            prefix += "<div style=\"font: 12px/1.5 'Lucida Grande';background-color:#efefef;color:#666666;padding:8px;\">";
            if (mail.sender)
                prefix += "<div><b style=\"color:#999;\">发件人:</b>" + mail.sender + "</div>";
            if (mail.receiver && mail.receiver.length > 0)
                prefix += "<div><b style=\"color:#999;\">收件人:</b>" + $filter("arrayToStr")(mail.receiver) + "</div>";
            if (mail.cc && mail.cc.length > 0)
                prefix += "<div><b style=\"color:#999;\">抄送:</b>" + mail.cc + "</div>";
            if (mail.receiveTime)
                prefix += "<div><b style=\"color:#999;\">发送时间:</b>" + $filter("date")(mail.receiveTime * 1000, "yyyy年M月d日 HH:mm") + "</div>";
            if (mail.subject)
                prefix += "<div><b style=\"color:#999;\">主题:</b>" + mail.subject + "</div>";
            prefix += "</div><br/>";
            mail.data = prefix + mail.data;
        };

        $scope.$watch('templateData.recipient', function () {
            $scope.changeTemplate($scope.choseTemplate);
        }, true);

        $scope.changeTemplate = function (mailTemplate) {
            if (!mailTemplate) {
                return;
            }
            $scope.templateId = mailTemplate.id;
            var originalTemplateData = angular.copy($scope.templateData);
            handleTemplateNullFieldData();

            $scope.mail.subject = $interpolate(mailTemplate.subject)($scope.templateData);
            $scope.mail.data = $interpolate(mailTemplate.template)($scope.templateData);

            handleReminderFile(originalTemplateData);
            if (!!$scope.mailSign) {
                $scope.mail.data += signSeparator + $scope.mailSign;
            }
        };

        function handleReminderFile(originalTemplateData) {
            for (var i = 0; i < $scope.attachmentList.length; i++) {
                if (!!$scope.attachmentList[i].current_ics) {
                    $scope.attachmentList.splice(i, 1);
                }
            }

            if ($scope.templateId != 10006 && $scope.templateId != 10007) {
                return;
            }
            if (!originalTemplateData.interview.timestamp) {
                return;
            }
            var content = "";
            if ($scope.templateId == 10006) {
                if (!!originalTemplateData.interview.company) {
                    content += "面试公司:" + originalTemplateData.interview.company + "\n";
                }
                if (!!originalTemplateData.interview.time) {
                    content += "面试时间:" + originalTemplateData.interview.time + "\n";
                    $scope.mail.subject += "-" + $filter("tigerDate")(originalTemplateData.interview.timestamp);
                }
                if (!!originalTemplateData.interview.address) {
                    content += "面试地点:" + originalTemplateData.interview.address + "\n";
                }
                if (!!originalTemplateData.interview.interviewer) {
                    content += "面试官:" + originalTemplateData.interview.interviewer + "\n";
                }
                if (!!originalTemplateData.phone) {
                    content += "联系电话:" + originalTemplateData.phone + "\n";
                }
            } else if ($scope.templateId == 10007) {
                if (!!originalTemplateData.interview.time) {
                    content += "面试时间:" + originalTemplateData.interview.time + "\n";
                }
                if (!!originalTemplateData.candidate) {
                    content += "候选人:" + originalTemplateData.candidate + "\n";
                    $scope.mail.subject += "-" + originalTemplateData.candidate;
                }
                if (!!originalTemplateData.interview.address) {
                    content += "面试地点:" + originalTemplateData.interview.address + "\n";
                }
            }
            taskService.generateIcsFile($scope.mail.subject, originalTemplateData.interview.timestamp, originalTemplateData.interview.timestamp + 60 * 60, content).then(function (data) {
                data.current_ics = true;
                var contains = false;
                for (var i = 0; i < $scope.attachmentList.length; i++) {
                    if ($scope.attachmentList[i].fileName == data.fileName) {
                        $scope.attachmentList[i] = data;
                        contains = true;
                    }
                }
                if (contains) {
                    return;
                }
                $scope.attachmentList.push(data);
                $scope.mail.data += '<p style="font-size: 14px;text-align: left;">&nbsp;&nbsp; &nbsp; &nbsp; =======================================</p>'
                $scope.mail.data += '<p style="font-size: 14px;text-align: left;">&nbsp;&nbsp; &nbsp; &nbsp; 双击附件可以将本面试安排添加到您的日历中&nbsp; ^_^</p>'
                $scope.mail.data += '<p style="font-size: 14px;text-align: left;">&nbsp;&nbsp; &nbsp; &nbsp; =======================================</p>'

            });
        }

        function handleTemplateNullFieldData() {
            $scope.templateData = !$scope.templateData ? {} : $scope.templateData;
            $scope.templateData.interview = !$scope.templateData.interview ? {} : $scope.templateData.interview;

            $scope.templateData.username = $rootScope.account.name;
            $scope.templateData.recipient = !$scope.templateData.recipient ? "〈收件人〉" : $scope.templateData.recipient;
            $scope.templateData.candidate = !$scope.templateData.candidate ? "〈候选人〉" : $scope.templateData.candidate;
            $scope.templateData.project = !$scope.templateData.project ? "〈项目〉" : $scope.templateData.project;
            $scope.templateData.position = !$scope.templateData.position ? "〈职位〉" : $scope.templateData.position;
            $scope.templateData.phone = !$scope.templateData.phone ? "〈联系电话〉" : $scope.templateData.phone;
            $scope.templateData.interview.company = !$scope.templateData.interview.company ? "〈公司〉" : $scope.templateData.interview.company;
            $scope.templateData.interview.time = !$scope.templateData.interview.time ? "〈面试时间〉" : $scope.templateData.interview.time;
            $scope.templateData.interview.address = !$scope.templateData.interview.address ? "〈面试地点〉" : $scope.templateData.interview.address;
            $scope.templateData.interview.interviewer = !$scope.templateData.interview.interviewer ? "〈面试官〉" : $scope.templateData.interview.interviewer;
        }
    }
]).controller('candidateViewMailCtrl', [
    '$scope',
    '$stateParams',
    'mailService',
    'config',
    function ($scope, $stateParams, mailService, config) {

        $scope.moduleId = config.moduleMap.email;
        $scope.candidateId = $stateParams.candidateId;
        $scope.fieldList = config.candidateEmailTableFields;
        $scope.list = [];

        $scope.pageState = {
            page: 1,
            total: 0,
            listLength: 25
        };

        $scope.fieldInTable = [
            ".sender",
            ".receiver",
            ".subject",
            ".receive_time"
        ];

        $scope.updateList = function () {

            var from = ($scope.pageState.page - 1) * $scope.pageState.listLength;
            var size = $scope.pageState.listLength;
            mailService.relationList($scope.candidateId, 1, from, size).then(function (data) {
                $scope.pageState.total = data.total;
                $scope.pageState.totalAvailable = data.total;
                $scope.list = data.list;
            });
        };

        $scope.$watch('pageState', function () {
            $scope.updateList();
        }, true);
    }
]).controller('mailSettingCtrl', [
        '$scope',
        '$state',
        function ($scope, $state) {

            $scope.currentModule = $state.current.name;

            $scope.switchTo = function (type) {
                $scope.currentModule = type;
                $state.go($scope.currentModule);
            }
        }

    ]
).controller('mailSignCtrl', [
        '$scope',
        '$state',
        'mailService',
        'ngToast',
        function ($scope, $state, mailService, ngToast) {
            $scope.sign = "";
            mailService.getSign().then(function (data) {
                $scope.sign = data.sign;
            });

            $scope.updateSign = function () {
                mailService.updateSign($scope.sign).then(function () {
                    ngToast.success("保存成功");
                });
            }
        }

    ]
).controller('mailAccountCtrl', [
        '$scope',
        '$filter',
        '$stateParams',
        'mailService',
        'config',
        'ngToast',
        function ($scope, $filter, $stateParams, mailService, config, ngToast) {
            $scope.loading = true;

            $scope.emailTypeList = ["163", "126", "sina", "sohu", "qq", "其它"];

            mailService.getConfig().then(function (data) {
                if (data.result) {
                    $scope.emailConfig = data.result;
                    $scope.emailType = data.result.emailType;
                    $scope.emailConfig.hint = config.emailConfig[$scope.emailType].hint;
                }
                $scope.loading = false;
            });

            $scope.uiSelectChange = function ($item, $model) {
                $scope.emailConfig = angular.copy(config.emailConfig[$item]);
                $scope.emailConfig.emailType = $item;
            };

            $scope.saveEmailConfig = function () {
                $scope.mailConfigForm.$setSubmitted();
                if (!$scope.mailConfigForm.$valid) {
                    ngToast.warning("内容错误，请检查后保存");
                    return;
                }
                $scope.loading = true;
                $scope.emailConfig.protrol = $filter("i18n")($scope.emailConfig.protrol);
                mailService.saveConfig($scope.emailConfig).then(function (data) {
                    if (data.code == 200) {
                        ngToast.success(data.message);
                    } else {
                        ngToast.danger(data.message);
                    }
                    $scope.loading = false;
                });
            };
        }

    ]
).controller('mailTemplateListCtrl', [
        '$scope',
        '$state',
        'mailService',
        'ngToast',
        'mailModal',
        'uiModalService',
        function ($scope, $state, mailService, ngToast, mailModal, uiModalService) {
            $scope.loading = true;
            var isGeneralList = $state.current.data.general;

            $scope.pageState = {
                page: 1,
                listLength: 10
            };

            $scope.getList = function () {
                $scope.loading = true;
                var listFunc = isGeneralList > 0 ? mailService.listGeneralTemplate : mailService.listSelfTemplate;
                listFunc(($scope.pageState.page - 1) * $scope.pageState.listLength, $scope.pageState.listLength).then(function (data) {
                    $scope.list = data.list;
                    $scope.pageState.total = data.total;
                    $scope.loading = false;
                });
            };
            $scope.$watch('pageState', $scope.getList, true);

            $scope.getList();

            $scope.updateTemplate = function (mailTemplate) {
                mailModal.updateMailTemplate(mailTemplate, isGeneralList).then(function () {
                    $state.reload();
                });
            };

            $scope.deleteTemplate = function (id) {
                uiModalService.yesOrNo({
                    title: '是否删除？',
                    okBtnClass: 'btn btn-danger'
                }).then(function () {
                    mailService.deleteTemplate(id);
                }).then(function () {
                    $state.reload();
                });
            };

        }
    ]
).controller('mailTemplateUpdateModalCtrl', [
    '$scope',
    'recReportData',
    '$uibModalInstance',
    'uiModalService',
    'mailService',
    function ($scope, recReportData, $uibModalInstance, uiModalService, mailService) {

        $scope.isModal = true;
        $scope.isGeneral = recReportData.isGeneral;
        $scope.template = !!recReportData.mailTemplate ? recReportData.mailTemplate : {};
        $scope.title = !!$scope.template && !!$scope.template.id > 0 ? "编辑邮件模板" : "新增邮件模板";

        $scope.saveTemplate = function () {

            if (!$scope.template.title || $scope.template.title.length < 1) {
                uiModalService.alert("模板名称不可为空");
                return;
            }
            if (!$scope.template.subject || $scope.template.subject.length < 1) {
                uiModalService.alert("主题不能为空");
                return;
            }
            var updateFunc = !!$scope.template && $scope.template.id > 0 ? mailService.updateTemplate : $scope.isGeneral ? mailService.saveGeneralTemplate : mailService.saveSelfTemplate;
            updateFunc($scope.template).then(function () {
                $uibModalInstance.close();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]).service('mailOperationService', [
    '$state', 'mailModal', 'uiModalService', 'mailService',
    function ($state, mailModal, uiModalService, mailService) {

        this.chooseAttachment = function () {
            mailModal.chooseAttachment();
        };

        this.composeMail = function (candidateItem, moduleId) {
            mailService.getConfig().then(function (data) {
                if (!data.result) {
                    uiModalService.yesOrNo({
                        title: '您还未配置邮箱，请先配置后使用。',
                        okBtnClass: 'btn btn-primary',
                        okBtnText: '去配置'
                    }).then(function () {
                        var configUrl = $state.href('profile.mail.account');
                        window.open(configUrl, '_blank');
                    });
                } else {
                    return mailModal.composeMail(candidateItem, moduleId);
                }
            });
        };
    }
]).service('mailTemplateService', [
    '$state', 'mailModal',
    function ($state, mailModal) {
        this.updateTemplate = function (mailTemplate) {
            mailModal.updateMailTemplate(mailTemplate);
        };
    }
]).config(["$provide", function ($provide) {
    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) {
        // // $delegate is the taOptions we are decorating
        // // register the tool with textAngular
        // taRegisterTool('image', {
        //     iconclass: "fa fa-picture-o",
        //     action: function () {
        //         this.$editor().wrapSelection("insertImage", "http://b.hiphotos.baidu.com/image/h%3D200/sign=8c8dc382d239b60052ce08b7d9513526/b58f8c5494eef01fa36ad8a4e7fe9925bc317d51.jpg", !0);
        //     }
        // });
        // taRegisterTool('file', {
        //     iconclass: "fa fa-link",
        //     action: function () {
        //         var editor = this.$editor();
        //         mailModal.chooseAttachment().then(function (a) {
        //             // editor.wrapSelection('createLink', "http://", true);
        //         });
        //     }
        // });
        // add the button to the default toolbar definition
        // taOptions.toolbar[3][1] = ('image');
        // taOptions.toolbar[3][2] = ('file');

        taOptions.toolbar[3].splice(1, 3);
        taOptions.toolbar[1].splice(8, 1);
        return taOptions;
    }]);
}]);

