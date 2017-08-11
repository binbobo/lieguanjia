'use strict';

angular.module('TigerApp', [
    'ngCookies',
    'ui.router',
    'ngAnimate',
    'ngSanitize',
    'ui.bootstrap',
    // 'easypiechart',
    'textAngular',
    'ui.tree',
    // 'ngMap',
    'ngTagsInput',
    // 'slick',
    'ui.select',
    'app.localization',
    'app.ui.ctrls',
    'app.ui.directives',
    'app.directives',
    'treeControl',
    'ngDragDrop',
    'ngToast',
    'angular-loading-bar',
    'ui.sortable',
    'angulartics',
    'angulartics.tiger',

    'app.nav',
    'tiger.config',
    'tiger.filter',
    'tiger.api.account',
    'tiger.api.attachment',
    'tiger.api.notification',
    'tiger.api.guide',
    'tiger.api.captcha',

    'tiger.ctrl.dashboard',
    'tiger.ctrl.profile',
    'tiger.ctrl.task',
    'tiger.ctrl.mail',
    // 'tiger.ctrl.login',
    'tiger.ctrl.demo',
    'tiger.ctrl.setting',
    'tiger.ctrl.setting.user',
    'tiger.ctrl.candidate',
    'tiger.ctrl.company',
    'tiger.ctrl.project',
    'tiger.ctrl.folder',
    'tiger.ctrl.comment',
    'tiger.ctrl.search',
    'tiger.ctrl.invoice',
    'tiger.ctrl.contract',
    'tiger.ctrl.check',
    'tiger.ctrl.channel',
    'tiger.ctrl.kpi',
    'tiger.ctrl.report',
    'tiger.ctrl.job',
    'tiger.ctrl.license',
    'tiger.ctrl.about',
    'tiger.ctrl.document',
    'tiger.ctrl.notification',

    'tiger.ui.custom_form',
    'tiger.ui.preview',
    'tiger.ui.modal',
    'tiger.ui.custom_table',

    'tiger.ui.task_modal',
    'tiger.ui.resume_modal',
    'tiger.ui.project_modal',
    'tiger.ui.invoice_modal',
    'tiger.ui.achievement_modal',
    'tiger.ui.mail_modal',
    'tiger.ui.document_modal',
    'tiger.ui.attachment_upload',
    'tiger.ui.common',
    'tiger.ui.t',
    'tiger.ui.quick_search',

    'tiger.widget.guide',

    // 'selectApp',
    // 'ui.calendar',
    // 'tablesorting',
    // 'inlineedittable',
    // 'TodoApp',
    'xeditable',
    'FullscreenApp',
    'angularFileUpload',
    // 'galleryApp',
    // 'datatables',
    'LocalStorageModule',
]).config(function ($qProvider, $locationProvider, $stateProvider, $urlRouterProvider, localStorageServiceProvider,
                    $localeProvider, ngToastProvider, config) {
    $locationProvider.hashPrefix('');
    $urlRouterProvider.otherwise("/dashboard");
    localStorageServiceProvider.setPrefix(config.localStoragePrefix);

    $stateProvider.state('error_404', {
        url: '/error/404',
        templateUrl: 'views/pages/404.html'
    }).state('loading', {
        url: '/loading?token',
        templateUrl: 'views/pages/loading.html',
        controller: 'loadingCtrl',
    });

    ngToastProvider.configure({
        verticalPosition: 'top',
        horizontalPosition: 'center',
        maxNumber: 10
    });

    $localeProvider.$get().DATETIME_FORMATS.SHORTDAY = ['日', '一', '二', '三', '四', '五', '六'];

}).controller('AppCtrl', function ($location, $scope, $rootScope, $window, $document, $timeout, $state, $cookies,
                                   $analytics, localStorageService, config, apiService, accountService, taskService,
                                   uiModalService) {
    window.$state = $rootScope.$state = $state;
    window.localStorageService = localStorageService;

    $scope.main = {
        brand: "AdminPro",
        name: "P Square Design"
    };
    $scope.admin = {
        layout: false,
        menu: false,
        fixedHeader: true,
        fixedSidebar: true,
        themeID: "11",
        navbarHeaderColor: 'bg-primary',
        logo: 'bg-primary',
        asideColor: 'bg-dark'
    };
    $scope.color = {
        primary: "#248AAF",
        success: "#3CBC8D",
        info: "#29B7D3",
        purple: "#7266ba",
        warning: "#FAC552",
        danger: "#E9422E"
    };
    $rootScope.initWaves = function () {
        Waves.init();
    };

    $rootScope.notification = {};
    $rootScope.notificationDropdown = {isOpen: false};
    $rootScope.hideNotificationDropdown = function () {
        $rootScope.notificationDropdown.isOpen = false;
        // $state.go('notification_list');
    };

    $rootScope.task = {
        total: 0,
        list: [],
        showList: [],
        showListMap: {},
        canPush: Push.Permission.has(),
        canRequirePush: Push.Permission.get() !== Push.Permission.DENIED
    };
    $rootScope.taskDropdown = {isOpen: false};
    $rootScope.hideTaskDropdown = function () {
        $rootScope.taskDropdown.isOpen = false;
    };
    $rootScope.toCalendar = function ($event) {
        if (angular.element($event.target).closest('a').length) {
            return;
        }
        $state.go('task_calendar');
        $rootScope.hideTaskDropdown();
    };

    $rootScope.requestPushPermission = function () {
        Push.Permission.request(function () {
            $rootScope.task.canPush = true;
            $rootScope.$apply();
        }, function () {
            $rootScope.task.canRequirePush = false;
            $rootScope.$apply();
        });
    };

    var heartTimeout;

    $rootScope.handleHeart = function (data, fromApi) {
        // console.log(new Date());
        // console.log(fromApi ? 'api' : 'other');
        if (fromApi) {
            localStorageService.set('heart', data);
            localStorageService.set('heart_time', new Date().getTime());
        }

        $rootScope.account = data.account;

        $rootScope.notification = $rootScope.notification || {};
        $rootScope.notification.list = data.notification;
        $rootScope.notification.total = data.notificationTotal;
        $rootScope.task.list = taskService.processList(data.task);
        $rootScope.task.total = data.unCompleteTaskCount;

        if ($rootScope.task.list && $rootScope.task.list.length > 0) {

            if (!$rootScope.taskDropdown.isOpen) {
                $rootScope.task.showList = [];
                $rootScope.task.showListMap = {};
                $rootScope.taskDropdown.isOpen = true;
            }

            var needReminder = [];
            _.forEachRight($rootScope.task.list, function (item) {
                if ($rootScope.task.showListMap[item.id]) {
                    return null;
                }

                $rootScope.task.showListMap[item.id] = 1;

                $rootScope.task.showList.unshift(item);

                if (fromApi && $rootScope.task.canPush) {
                    Push.create(item.title, {
                        body: item.remark,
                        icon: '/favicon.ico',
                        timeout: 120000,
                        onClick: function () {
                            window.focus();
                            this.close();

                            $state.go('task_calendar');
                            $rootScope.hideTaskDropdown();
                        }
                    });
                }

                needReminder.push(item.id);
            });

            if (fromApi) {
                taskService.updateTaskReminded(needReminder);
            }
        }

        if (heartTimeout) {
            $timeout.cancel(heartTimeout);
        }

        var timeoutMs = 32768;
        if (!fromApi) {
            timeoutMs += 5000 + Math.round(Math.random() * 3000);
        }
        // console.log(timeoutMs);
        heartTimeout = $timeout(function () {
            accountService.heart();
        }, timeoutMs);
    };

    $rootScope.$on(accountService.eventHeart, function (event, data) {
        $rootScope.handleHeart(data, true);
    });

    $($window).on('storage', function (event) {
        switch (event.key) {
            case config.localStoragePrefix + '.heart_time':
                if (!localStorageService.get('heart')) {
                    break;
                }
                $rootScope.handleHeart(localStorageService.get('heart'), false);
                break;

            default:
        }
    });

    var reloadRequestOpened = false;

    $rootScope.showReloadRequestModel = function () {
        if (reloadRequestOpened) {
            return;
        }
        reloadRequestOpened = true;
        uiModalService.yesOrNo({
            title: '系统已经更新',
            content: '请刷新页面以重新载入',
            okBtnText: '刷新',
            cancelBtnText: '以后'
        }).then(function () {
            location.reload();
        }).finally(function () {
            reloadRequestOpened = false;
        });
    };
    $rootScope.$on(apiService.eventFrontExpired, function (event, data) {
        $rootScope.showReloadRequestModel();
    });

    var taskDropdownFirstOpen = true;
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        if (toState.name === 'login' || toState.name === 'loading' || toState.name === 'error_404' || toState.name === 'ui') {
            return;
        }

        if (toState.name === 'profile.accept_invite') {
            return;
        }

        if (toState.name === 'license_edit' || toState.name === 'license_error') {
            return;
        }

        if ($rootScope.account && $rootScope.account.id) {
            if ($rootScope.account.isFresh > 0) {
                if (toState.name === 'home') {
                    $rootScope.startUserGuide();
                }
            }

            if ($rootScope.taskDropdown.isOpen) {
                if (!taskDropdownFirstOpen) {
                    $rootScope.hideTaskDropdown();
                } else {
                    taskDropdownFirstOpen = false;
                }
            }
            return;
        }

        event.preventDefault();
        var currentHref = location.hash;
        $state.go('loading');

        accountService.heart().then(function (data) {
            $state.go(toState, toParams, {
                location: 'replace'
            });
        }, function (err) {
            if (err.code === 1010 || err.code === 1011) {
                $rootScope.loginBefore = currentHref;
                return;
            }
            if (err.code >= 1100 && err.code < 1200) {
                return;
            }

            if (err.code === 2203) {
                var currentHost = location.hostname;
                if (/^www/.test(currentHost)) {
                    location.href = location.href.replace(/\/\/www\./, '//');
                    return;
                }
                location.href = "https://www.lieguanjia.com";
                return;
            }

            $state.go('error_404');
        });
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        Waves.init();

        var $liList;
        $liList = $('#nav').find('li');

        if (toState.name !== "loading") {
            $timeout(function () {
                $liList.removeClass('active');
                $liList.has('a.active').addClass('active');
            }, 50);
        }
    });

    $scope.selectYears = [2013, 2014, 2015];

    $rootScope.goToLogin = function (backUrl) {
        if ($rootScope.account.id) {
            $analytics.eventTrack('kick out', {
                category: 'system'
            });
        }
        if (!backUrl) {
            if (location.hash != '#/profile/login') {
                $rootScope.loginBefore = location.hash;
            }
        } else {
            $rootScope.loginBefore = backUrl;
        }
        $rootScope.account = {};
        $state.go('login');
        // $state.go('demo.ui');
    };

    $rootScope.back = function () {
        history.back();
    };

    $rootScope.notice = {};
    $rootScope.hasNotice = function () {
        var flag = false;
        angular.forEach($rootScope.notice, function (item) {
            if (item) {
                flag = true;
            }
        });
        return flag;
    };

    $rootScope.tigerInfo = {};

    $rootScope.updateViewVersion = function () {
        var cookieDate = new Date();
        cookieDate.setFullYear(cookieDate.getFullYear() + 1);
        $cookies.put("last_view_version", $rootScope.tigerInfo.version, {
            expires: cookieDate
        });
        $rootScope.notice.updatedVersion = false;
    };

    $rootScope.updateBasicInfo = function () {
        return apiService.basicInfo().then(function (data) {
            $rootScope.tigerInfo = data;
            $rootScope.currentYear = new Date(data.systemTime * 1000).getFullYear();

            var watermark = [null];
            if (data.dev) {
                watermark.push(data.version + ' DEV');

                if (data.saas) {
                    watermark.push('SaaS Ver.');
                }
            }

            // if (data.sn_hash) {
            //     watermark.push(data.sn_hash);
            // }

            $('.watermark').text((new Array(2000)).join(watermark.join('             ')));

            var lastViewVersion = $cookies.get("last_view_version");
            if (!lastViewVersion || lastViewVersion != data.version) {
                $rootScope.notice.updatedVersion = true;
            }
        });
    };

    $rootScope.updateBasicInfo();

    $rootScope.isHighlightInCustomTable =
        localStorageService.get('isHighlightInCustomTable') !== null ? localStorageService.get('isHighlightInCustomTable') : true;
    $rootScope.$watch('isHighlightInCustomTable', function () {
        localStorageService.set('isHighlightInCustomTable', $rootScope.isHighlightInCustomTable);
    });

    $window.tiger.updateBasicInfo = $rootScope.updateBasicInfo;
    $window.tiger.getBasicInfo = function () {
        return $rootScope.tigerInfo;
    };
    $window.tiger.getAccountInfo = function () {
        return $rootScope.account;
    };
    $window.tiger.openTaskList = function () {
        $rootScope.taskDropdown.isOpen = true;
        $rootScope.$apply();
    };
    $window.tiger.showReloadRequestModel = $rootScope.showReloadRequestModel;

}).controller('HeaderCtrl', function ($scope, $rootScope, $state, accountService) {
    $rootScope.account = {};

    $scope.logout = function () {
        accountService.logout().then(function (data) {
            $rootScope.account = {};
            $rootScope.goToLogin();
        });
    };
}).controller('NavCtrl', function () {
}).controller('loadingCtrl', function ($state, $stateParams, userSessionStorageService, accountService) {
    if ($stateParams.token) {
        accountService.adminLogin($stateParams.token).then(function () {
            return accountService.heart();
        }).then(function () {
            userSessionStorageService.clear();

            $state.go('home', null, {
                location: 'replace'
            });
        }, function () {
            $state.go('login', null, {
                location: 'replace'
            });
        });
    }
}).service('userSessionStorageService', function ($cookies) {
    var mainKey = 'user_session';

    var rawData = $cookies.getObject(mainKey) || {};

    this.saveToCookie = function () {
        $cookies.putObject(mainKey, rawData);
    };

    this.put = function (key, value) {
        rawData[key] = value;
        this.saveToCookie();
    };

    this.get = function (key) {
        return rawData[key];
    };

    this.has = function (key) {
        return key in rawData;
    };

    this.clear = function () {
        rawData = {};
        this.saveToCookie();
    };

}).service('userLocalStorageService', function (localStorageService) {
    /**
     * 用户设置模块，存储在localStorage 中
     */

    var mainKey = 'user_config';

    var defaultData = {
        openLinkInNewWindow: 0
    };

    var rawData = angular.extend(defaultData, localStorageService.get(mainKey));

    this.saveToLocalStorage = function () {
        localStorageService.set(mainKey, rawData);
    };

    this.put = function (key, value) {
        rawData[key] = value;
        this.saveToLocalStorage();
    };

    this.get = function (key) {
        return rawData[key];
    };

    this.has = function (key) {
        return key in rawData;
    };

    this.getAll = function () {
        return angular.copy(rawData);
    };

    this.putAll = function (config) {
        angular.extend(rawData, config);
        this.saveToLocalStorage();
    };

    this.clear = function () {
        rawData = {};
        this.saveToLocalStorage();
    };
}).run(function ($rootScope, $window, config) {
    $rootScope.config = config;
    $window.tiger = {};

    var browsers = {
        windows: /Windows NT/i,
        mac_os: /Mac OS/i,
        chrome: /chrome/i,
        firefox: /firefox/i,
        ie: /internet explorer/i
    };
    $rootScope.flagClasses = [];

    angular.forEach(browsers, function (regex, uaFlag) {
        if (regex.test($window.navigator.userAgent)) {
            $rootScope.flagClasses.push('ua-' + uaFlag);
        }
    });

}).constant('treeConfig', {
    treeClass: 'angular-ui-tree',
    emptyTreeClass: 'angular-ui-tree-empty',
    hiddenClass: 'angular-ui-tree-hidden',
    nodesClass: 'angular-ui-tree-nodes',
    nodeClass: 'angular-ui-tree-node',
    handleClass: 'angular-ui-tree-handle',
    placeholderClass: 'angular-ui-tree-placeholder',
    dragClass: 'angular-ui-tree-drag',
    dragThreshold: 3,
    levelThreshold: 30,
    defaultCollapsed: false
}).constant('treecontrollConfig', {
    templateUrl: 'treeControlTemplate.html',
    injectClasses: {
        liSelected: "active"
    }
}).factory('$exceptionHandler', function ($log) {
    return function (exception, cause) {
        $log.error(exception, cause);
        try {
            // window.apiService.tLog(exception, 'frontend_error');
        } catch (e) {
        }
    };
}).directive('tigerInclude', function () {
    return {
        restrict: 'AE',
        templateUrl: function (ele, attr) {
            return attr.templatePath;
        }
    }
}).directive('convertToNumber', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function (val) {
                return parseInt(val, 10);
            });
            ngModel.$formatters.push(function (val) {
                return '' + val;
            });
        }
    };
}).directive('focusThis', function ($timeout) {
    return function ($scope, $element, $attrs) {
        $timeout(function () {
            $element.focus();
        }, 100);
    }
}).directive('tigerHover', function () {
    return {
        link: function ($scope, $element, $attrs) {
            var $tigerHoverShow = $element.find('[tiger-hover-show]').appendTo($('body'));

            var showFunc = function () {
                $tigerHoverShow.css('top', $element.offset().top + $element.height());
                $tigerHoverShow.css('left', $element.offset().left - $tigerHoverShow.width() / 2);
                $tigerHoverShow.show();
            };

            var hideFunc = function () {
                $tigerHoverShow.hide();
            };

            $element.on('mouseenter', showFunc);
            $element.on('mouseleave', hideFunc);
            $tigerHoverShow.on('mouseenter', showFunc);
            $tigerHoverShow.on('mouseleave', hideFunc);

            $element.on('$destroy', function () {
                $tigerHoverShow.remove();
            });
        }
    }
}).directive('tigerTimeoutHover', function ($timeout) {
    return {
        link: function ($scope, $element, $attrs) {
            var isTimeout = false;
            var hoverDelay = parseInt($attrs.tigerTimeoutHoverDelay) || 1000;
            var timeoutId;
            $element.off('mouseenter.tigerHover').on('mouseenter.tigerHover', function () {
                if (timeoutId) {
                    return;
                }
                timeoutId = $timeout(function () {
                    if (!isTimeout) {
                        $scope.$eval($attrs.tigerTimeoutHover);
                        isTimeout = true;
                    }
                }, hoverDelay);
            });

            $element.on('mouseleave.tigerHover click.tigerHover', function () {
                isTimeout = true;
                if (timeoutId) {
                    $timeout.cancel(timeoutId);
                }
                timeoutId = null;
                isTimeout = false;
                $scope.$apply(function () {
                    $scope.$eval($attrs.tigerTimeoutHoverEnd);
                });
            });
        }
    }
}).directive('ngKeyEsc', function () {
    return {
        link: function ($scope, $element, $attrs) {
            $element.off("keydown.tiger keypress.tiger").on("keydown.tiger keypress.tiger", function (event) {
                if (event.which === 27) {
                    $scope.$apply(function () {
                        if ($scope.$eval($attrs.ngKeyEsc)) {
                            event.preventDefault();
                        }
                    });
                }
            });
        }
    }
}).directive('formErrorHint', function () {
    return {
        template: '<span ng-if="tigerForm.$invalid" class="form-error-hint text-danger" ng-click="toError()">当前表单有 {{tigerForm | countFormError}} 项错误</span>',
        scope: {
            tigerForm: '='
        },
        controller: function ($scope) {
            $scope.toError = function () {
                $scope.tigerForm.$error[Object.keys($scope.tigerForm.$error)[0]][0].$$element.focus();
            };
        }
    };
}).directive('aLinkTarget', function (userLocalStorageService) {
    return {
        restrict: 'A',
        compile: function ($element) {
            if (userLocalStorageService.get('openLinkInNewWindow')) {
                $element.attr('target', '_blank');
            }
        }
    };
});
// .controller('NavCtrl',  [
//   "$scope", "taskStorage", "filterFilter", function($scope, taskStorage, filterFilter) {
//     var tasks;
//     tasks = $scope.tasks = taskStorage.get();
//     $scope.taskRemainingCount = filterFilter(tasks, {
//       completed: false
//     }).length;
//     return $scope.$on("taskRemaining:changed", function(event, count) {
//       return $scope.taskRemainingCount = count;
//     });
//   }
// ]);;
