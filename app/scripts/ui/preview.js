"use strict";
angular.module("tiger.ui.preview", []).directive('previewWrap', function () {
    return {
        templateUrl: "views/ui/preview_wrap.html",
        controller: 'previewCtrl',
        link: function (scope, ele, attrs) {
        }
    };
}).controller('previewCtrl', function ($scope, $rootScope, $element, $sce, $uibModal, uiModalService,
                                       apiService, candidateService, commentService, settingService, $templateRequest, $compile, $controller, $timeout, $state) {
    $scope.resouseSrc = '';
    $scope.showType = 'iframe';
    $scope.previewShow = false;

    $rootScope.hidePreview = function () {
        var oldPreviewShow = $scope.previewShow;
        $scope.previewShow = false;
        $scope.resouseSrc = '';
        $scope.showType = 'iframe';
        return oldPreviewShow;
    };

    $rootScope.$on('previewFile', function (event, data) {
        $rootScope.previewFile(data.resourceType, data.resourceId, data.rid);
    });

    var previewTimeoutId;
    $rootScope.previewFile = function (resourceType, resourceId, rid) {
        $scope.previewLoading = true;

        if (resourceType == 'iframe') {
            if (!rid) {
                setResourceSrc($sce.trustAsResourceUrl('/api/file/preview?id=' +
                    resourceId));
            } else {
                setResourceSrc($sce.trustAsResourceUrl('/api/file/preview?id=' +
                    resourceId + '&rid=' + rid));
            }
            $scope.showType = 'iframe';
        } else if (resourceType == 'pdf') {
            setResourceSrc($sce.trustAsResourceUrl(
                '/pdf_viewer/viewer.html?file=/api%2Ffile%2Fdownload%3Fid%3D' +
                resourceId));
            $scope.showType = 'iframe';
        } else if (resourceType == 'image') {
            setResourceSrc('/api/file/download?id=' + resourceId);
            $scope.showType = 'image';
        } else if (resourceType == 'resume' || resourceType == 'resumeComment') {
            $scope.showType = 'resume';

            // 自定义resume数据改变事件, 用于更新视图
            $scope.$on('$resumeInfoChange', function (event, params) {
                if (angular.isDefined(params) && angular.isDefined(params.type) && params.type === 'delete') {
                    $state.reload();
                    $scope.previewShow = false;
                } else {
                    $scope.previewLoading = true;
                    resumePreview(resourceId, rid, $scope.currIndex);
                }
            });
            // 自定义获取resume数据出错事件,
            $scope.$on('$getResumeDataError', function (event, params) {
                // resume被删除
                if (angular.isDefined(params) && angular.isDefined(params.type) && params.type === 'candidate_basic_info') {
                    $scope.previewShow = false;
                }
            });

            $timeout(function () {
                var defautlActive = 0;
                if (resourceType === 'resumeComment') {
                    // resumeComment 表示人才列表页面中的备注预览
                    defautlActive = 3;
                }
                resumePreview(resourceId, rid, defautlActive);
            });
        } else if (resourceType == 'comment') {
            $scope.showType = 'comment';

            initCommentData(resourceId);
            // 自定义comment改变事件
            $scope.$on('$commentInfoChange', function () {
                initCommentData(resourceId);
            });
        } else if (resourceType == 'demo') {
            $scope.showType = 'demo';
            $scope.previewLoading = false;
        }

        var modalZIndex = parseInt(angular.element('body').children('.modal').css('z-index')) || 0;
        $scope.zIndex = modalZIndex ? modalZIndex + 5 : null;
        $scope.previewShow = true;


        $timeout(function () {
            var $preview = $element.find('.preview-wrap');
            // 初始化 jQueryUI 的 sizeable
            $preview.resizable({
                handles: 'all'
            });
            $preview.draggable({
                handle: ".preview-header"
            });
        }, 0);

        clearPreviewTimeout();
        // 鼠标离开preview弹框一段时间后隐藏preview (event delegate required)
        $(document).off('mouseover', 'body').on('mouseover', 'body', function (evt) {
            if (!$scope.previewShow) return;

            if (isMouseOutside(evt)) {
                // 连续多次在preview窗口之外移动鼠标  计时器继续
                if (angular.isUndefined(previewTimeoutId)) {
                    previewTimeoutId = $timeout(function () {
                        $scope.previewShow = false;
                        previewTimeoutId = undefined;
                        $(document).off('mouseover', 'body');
                    }, 1500);
                }
            } else {
                // 在指定计时内再次进入preview弹框时, 重置定时器
                clearPreviewTimeout();
            }
        });
    };

    var setResourceSrc = function (src) {
        $scope.resouseSrc = src;
        $scope.previewLoading = false;
    };

    // 清除预览窗口自动消失定时器
    function clearPreviewTimeout() {
        if (angular.isDefined(previewTimeoutId)) {
            $timeout.cancel(previewTimeoutId);
            previewTimeoutId = undefined;
        }
    }

    /*-------showType为comment逻辑START---------*/

    //初始化备注数据
    function initCommentData(resourceId) {
        setCommentRouteParams(resourceId);
        $controller('commentListCtrl', {$scope: $scope});
        $scope.previewLoading = false;
    }

    //设置备注控制器所需参数
    function setCommentRouteParams(resourceId) {
        $scope.relationId = resourceId.itemId;
        $scope.moduleId = resourceId.moduleId;
    }

    /*-------showType为comment逻辑END---------*/


    /*-------showType为resume逻辑START---------*/

    //设置人才详情页面控制器所需参数
    function setResumeRouteParams(resourceId, rid) {
        $scope.candidateId = resourceId;
        $scope.relationId = $scope.candidateId;
        $scope.moduleId = 4;
        $scope.projectId = rid || 0;
    }

    // 异步获取人才详情页面子视图模板
    function getTemplateAsync(url, controllerName, resourceId, rid) {
        setResumeRouteParams(resourceId, rid);

        $templateRequest(url).then(function (html) {
            var template = angular.element(html);
            $controller(controllerName, {$scope: $scope});
            $('.preview-wrap .content-panel').html($compile(template)($scope));

            $scope.previewLoading = false;
        });
    }

    // 预览逻辑,事件处理
    function resumePreview(resourceId, rid, index) {
        // 记录当前激活的子视图索引
        $scope.currIndex = index;

        // 设置路由参数
        setResumeRouteParams(resourceId, rid);

        // 获取视图模板
        $templateRequest('views/candidate/view_detail.html').then(function (html) {
            var template, $btnGroup, $links, $_blankLinks;
            template = angular.element(html);

            // 点击_blank链接 隐藏preview弹框
            $_blankLinks = template.find('.target_blank');
            $_blankLinks.off('click').on('click', function (evt) {
                $scope.previewShow = false;
            });

            $btnGroup = template.find('.catogary-tab');
            $links = $btnGroup.find('a');
            $links.removeAttr('ui-sref');
            // 通过事件切换子视图
            $links.off('click').on('click', function (e) {
                var self = $(this);
                if (self.hasClass('active')) return;

                $scope.previewLoading = true;

                // 200ms 之内不重复执行
                var debouncedHandler = _.debounce(function () {
                    $scope.currIndex = self.index();

                    $links.removeClass('active');
                    self.addClass('active');

                    var curLink = self.html().trim();
                    if (curLink.indexOf('简历') > -1) {
                        getTemplateAsync('views/candidate/view_main.html', 'candidateViewCtrl', resourceId, rid);
                    } else if (curLink.indexOf('附件') > -1) {
                        getTemplateAsync('views/attachment/attachment_list.html', 'candidateAttachmentCtrl', resourceId, rid);
                    } else if (curLink.indexOf('邮件') > -1) {
                        getTemplateAsync('views/candidate/mail_list.html', 'candidateViewMailCtrl', resourceId, rid);
                    } else if (curLink.indexOf('备注') > -1) {
                        getTemplateAsync('views/comment/list.html', 'commentListCtrl', resourceId, rid);
                    } else if (curLink.indexOf('日志') > -1) {
                        getTemplateAsync('views/candidate/update_logs.html', 'candidateLogCtrl', resourceId, rid);
                    }
                }, 200);
                debouncedHandler();
            });
            // 默认激活第一个视图：基本信息tab
            $links.eq(index).click();

            // 添加主视图
            var $previewHeader = $('.preview-wrap .header-panel');
            $controller('candidateViewCtrl', {$scope: $scope});
            $previewHeader.html($compile(template)($scope));
        })
    }

    /*-------showType为resume逻辑END---------*/

    // 工具函数
    function isMouseOutside(evt) {
        return !isTargetInContainer(evt, '.preview-wrap') && !isTargetInContainer(evt, '.modal') && !isTargetInContainer(evt, '.ui-select-container') && !isTargetInContainer(evt, '.uib-datepicker-popup');
    }

    function isTargetInContainer(evt, selector) {
        return $(evt.target).closest(selector).length;
    }

});
