"use strict";
angular.module('tiger.api.account', [
    'tiger.api.base',
    'tiger.api.task'
]).service('accountService', function ($rootScope, $state, $timeout, apiService) {
    var accountService = this;
    this.eventHeart = 'heart';

    this.login = function (username, password) {
        return apiService.post('/api/account/login', {
            account: username,
            password: password
        });
    };

    this.adminLogin = function (token) {
        return apiService.post('/api/account/adminLogin', {
            token: token
        });
    };

    this.logout = function () {
        return apiService.get('/api/account/logout');
    };

    this.status = function () {
        return apiService.get('/api/account/heart');
    };

    this.detail = function (accountId) {
        return apiService.get('/api/account/detail', {
            id: accountId
        });
    };

    this.update = function (account, feedback) {
        return apiService.post('/api/account/update', account, feedback === undefined ? true : feedback);
    };

    this.list = function (offset, length, account) {
        return apiService.post('/api/account/list', {
            offset: offset,
            length: length,
            account: account
        });
    };

    this.getOnlineUserList = function (offset, length) {
        return apiService.post('/api/account/onlineUsers', {
            offset: offset,
            length: length
        });
    };

    this.kick = function (uid) {
        return apiService.get('/api/account/kick', {
            uid: uid
        });
    };

    this.getUserSubDepartments = function () {
        return apiService.get('/api/department/subDepartments', {})
    };

    this.changePassword = function (oldPassword, newPassword, feedback) {
        return apiService.post('/api/account/changePassword', {
            oldPassword: oldPassword,
            newPassword: newPassword
        }, feedback == undefined ? true : feedback);
    };

    this.heart = function () {
        return this.status().then(function (data) {
            $rootScope.$emit(accountService.eventHeart, data);
            return data;
        });
    };

    this.invite = function (account, feedback) {
        return apiService.post('/api/account/invite', account, feedback == undefined ? true : feedback);
    };

    this.sendVerifyCode = function (mobile, ticket) {
        return apiService.post('/api/account/sendVerifyCode', {mobile: mobile, ticket: ticket});
    };

    this.acceptInvite = function (inviteMobile, mobile, verifyCode, password) {
        return apiService.post('/api/account/acceptInvite',
            {
                inviteMobile: inviteMobile,
                mobile: mobile,
                verifyCode: verifyCode,
                password: password
            });
    };

    this.getBuyUrl = function () {
        return apiService.get("/api/account/getBuyUrl");
    };

    this.setIsFresh = function (isFresh) {
        return apiService.post('/api/account/setIsFresh', {
            isFresh: isFresh
        });
    };

    this.delete = function (id) {
        return apiService.post('/api/account/delete', {
            id: id
        })
    }
});
