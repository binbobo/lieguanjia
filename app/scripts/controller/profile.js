"use strict";

angular.module('tiger.ctrl.profile', []).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('login', {
        url: '/profile/login?token',
        templateUrl: 'views/pages/login.html',
        data: {
            title: '登录'
        }
    });

    $stateProvider.state('profile', {
        url: '/profile',
        templateUrl: 'views/profile/main.html',
        controller: 'profileViewCtrl',
        data: {
            title: '个人设置'
        }
    });

    $stateProvider.state('profile.password', {
        url: '/password',
        templateUrl: 'views/profile/password.html',
        controller: 'profileChangePasswordCtrl',
        data: {
            title: '修改密码'
        }
    });

    $stateProvider.state('profile.mail', {
        url: '/mail',
        templateUrl: 'views/profile/mail_main.html',
        controller: 'mailSettingCtrl',
        data: {
            title: '邮件设置'
        }
    });

    $stateProvider.state('profile.mail.account', {
        url: '/account',
        templateUrl: 'views/profile/mail.html',
        controller: 'mailAccountCtrl',
        data: {
            title: '邮件设置'
        }
    });

    $stateProvider.state('profile.mail.sign', {
        url: '/sign',
        templateUrl: 'views/profile/mail_sign.html',
        controller: 'mailSignCtrl',
        data: {
            title: '邮件设置'
        }
    });

    $stateProvider.state('profile.mail.template', {
        url: '/template',
        templateUrl: 'views/mail/template_list.html',
        controller: 'mailTemplateListCtrl',
        data: {
            title: '邮件模板',
            general: 0
        }
    });

    $stateProvider.state('profile.accept_invite', {
        url: '/accept_invite/{mobile:string}',
        templateUrl: 'views/pages/login.html',
        data: {
            title: '接受邀请'
        }
    });

}).controller('loginCtrl', function ($scope, $rootScope, $element, $state, $stateParams, $cookies, $timeout,
                                     ngToast, userSessionStorageService, uiModalService, accountService,
                                     captchaService) {
    if ($rootScope.account && $rootScope.account.id) {
        $state.go('home');
    }

    $scope.logining = false;

    $scope.username = $cookies.get('last_login');
    captchaService.initCaptcha();
    if ($stateParams.mobile) {
        $scope.mobile = $stateParams.mobile;
        $scope.inviteMobile = $stateParams.mobile;
        $scope.isInvite = true;
    }

    if (typeof $cookies.get('remember') === 'undefined') {
        $scope.remember = 1;
    } else {
        $scope.remember = parseInt($cookies.get('remember'));
    }

    if ($stateParams.mobile) {
        $element.find('[name=verifyCode]').focus();
    } else if ($scope.username) {
        $element.find('[name=password]').focus();
    } else {
        $element.find('[name=username]').focus();
    }

    $scope.login = function () {
        if (!$scope.loginForm.$valid) {
            uiModalService.alert('请输入用户名密码');
            return;
        }

        $scope.logining = true;

        accountService.login($scope.username, $scope.password).then(function (data) {
            $scope.logining = false;
            $rootScope.account = data;

            var cookieDate = new Date();
            cookieDate.setFullYear(cookieDate.getFullYear() + 1);

            $cookies.put('remember', $scope.remember, {
                expires: cookieDate
            });

            if ($scope.remember) {
                $cookies.put('last_login', $scope.username, {
                    expires: cookieDate
                });
            } else {
                $cookies.remove('last_login');
            }

            accountService.heart();

            userSessionStorageService.clear();

            if ($rootScope.loginBefore) {
                location.hash = $rootScope.loginBefore;
                $rootScope.loginBefore = null;
            } else {
                $state.go('home');
            }

        }, function (err) {
            $scope.logining = false;
            return null;
        });
    };

    $scope.acceptInvite = function () {
        if (!$scope.inviteForm.$valid) {
            ngToast.danger("请输入完整的信息");
            return;
        }
        accountService.acceptInvite($scope.inviteMobile, $scope.mobile, $scope.verifyCode, $scope.newPassword).then(function (data) {
            accountService.heart();
            $state.go('home');
        }, function (err) {
            $scope.logining = false;
            return null;
        });
    };

    var phoneRegexPattens = /^1\d{10}$/;
    $scope.sendVerifyColdDownCount = 0;
    $scope.sendVerifyCode = function () {

        if ($scope.sendVerifyColdDownCount > 0) {
            return;
        }
        if (!phoneRegexPattens.test($scope.mobile)) {
            ngToast.warning("请输入正确的手机号");
            return;
        }
        captchaService.verifyCaptcha({id: 't-captcha'}).then(function (data) {
            accountService.sendVerifyCode($scope.mobile, data).then(function (data) {
                ngToast.info("验证码发送成功");
            });
            $scope.sendVerifyColdDownCount = 60;
            sendVerifyColdDown();
        }, function (data) {
            console.log('error')
        });
    };

    var sendVerifyColdDown = function () {
        if ($scope.sendVerifyColdDownCount <= 0) {
            return;
        }

        $scope.sendVerifyColdDownCount = $scope.sendVerifyColdDownCount - 1;
        $timeout(sendVerifyColdDown, 1000);
    };
    var lastBg;
    var changeBgTimeout;
    var changeBg = function () {
        var ran = Math.floor(Math.random() * 5);
        if (!lastBg || ran >= lastBg) {
            ran++;
        }
        lastBg = ran;

        var t = Math.round(new Date().getTime() / 1000);
        if (ran == 0) {
            $element.css('background-image', 'url("images/photos/login_bg/hidden.jpg")')
        } else {
            $element.css('background-image', 'url("images/photos/login_bg/' + ran + '.jpg")')
        }
        changeBgTimeout = $timeout(changeBg, 15000)
    };
    changeBg();

}).controller('profileViewCtrl', function ($scope, ngToast, userLocalStorageService) {
    $scope.userConfig = userLocalStorageService.getAll();

    $scope.saveConfig = function () {
        userLocalStorageService.putAll($scope.userConfig);
        ngToast.success('保存成功');
    };

}).controller('profileChangePasswordCtrl', function ($scope, $rootScope, ngToast, uiModalService, accountService) {
    $scope.oldPassword = null;
    $scope.newPassword = null;
    $scope.repeat = null;

    $scope.changePassword = function () {
        if (!$scope.oldPassword || !$scope.newPassword) {
            uiModalService.alert('请输入密码');
            return;
        }

        if ($scope.repeat != $scope.newPassword) {
            uiModalService.alert('两次密码不一致');
            return;
        }

        accountService.changePassword(
            $scope.oldPassword,
            $scope.newPassword
        ).then(function (data) {
            $rootScope.goToLogin('/');
        });
    };
});
