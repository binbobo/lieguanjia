/**
 * Created by black on 2017/6/26.
 */
"use strict";
angular.module('tiger.api.captcha', [
    'tiger.api.base'
]).service('captchaService', function ($rootScope, $state, $timeout, $q, apiService) {
    var initComplete = false;
    this.initCaptcha = function (data) {
        if (initComplete) {
            return;
        }
        apiService.get("/api/system/captchaJsUrl").then(function (data) {
            return $.getScript(data.result, function () {
                initComplete = true;
            });
        });
    };

    this.verifyCaptcha = function (data) {
        var capOption = {callback: cbfn, showHeader: true, type: 'popup', firstvrytype: 2};
        capDestroy();
        capInit(document.getElementById(data.id), capOption);
        var deferred = $q.defer();

        function cbfn(retJson) {
            if (retJson.ret === 0) {
                // 用户验证成功
                deferred.resolve(retJson.ticket);
            } else {
                capRefresh();

            }
        }

        return deferred.promise;
    }
});
