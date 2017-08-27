// app.localization
// ====================================================================
// This file should included in your project.
//
// - Squaredesigns.net -

"use strict";
angular.module("app.localization", [])

    /***********************************
     :: localize
     ***********************************/

    .factory("localize", [
        "$http", "$rootScope", "$window",
        function ($http, $rootScope, $window) {
            var localize;
            localize = {
                language: "zh",
                resourceFileLoaded: false,
                successCallback: function (data) {
                    localize.dictionary = data;
                    localize.resourceFileLoaded = true;
                    return $rootScope.$broadcast("localizeResourcesUpdated");
                },
                setLanguage: function (value) {
                    localize.language = value.toLowerCase().split("-")[0];
                    return localize.initLocalizedResources();
                },
                setUrl: function (value) {
                    localize.url = value;
                    return localize.initLocalizedResources();
                },
                buildUrl: function () {
                    if (!localize.language) {
                        localize.language = ($window.navigator.userLanguage || $window.navigator.language).toLowerCase();
                        localize.language = localize.language.split("-")[0];
                    }
                    return "i18n/resources-locale_" + localize.language + ".json?_v=1";
                },
                initLocalizedResources: function () {
                    var url;
                    url = localize.url || localize.buildUrl();
                    // return $http({
                    //     method: "GET",
                    //     url: url,
                    //     cache: false
                    // }).success(localize.successCallback).error(function () {
                    //     return $rootScope.$broadcast("localizeResourcesUpdated");
                    // });
                    return $http({
                        method: "GET",
                        url: url,
                        cache: false
                    }).then(function(data){
                        localize.successCallback(data.data);
                    }, function(){
                        return $rootScope.$broadcast("localizeResourcesUpdated");
                    });
                },
                getLocalizedString: function (value, exact) {
                    var result, valueLowerCase;
                    if (localize.dictionary && value) {
                        if (!exact) {
                            valueLowerCase = value.toLowerCase();
                        } else {
                            valueLowerCase = value;
                        }
                        if (localize.dictionary[valueLowerCase] === "") {
                            result = value;
                        } else {
                            result = localize.dictionary[valueLowerCase];
                        }
                    } else {
                        result = value;
                    }
                    return result;
                }
            };
            localize.initLocalizedResources();
            return localize;
        }
    ])

    /***********************************
     :: i18n Directive
     ***********************************/

    .directive("i18n", [
        "localize",
        function (localize) {
            var i18nDirective;
            i18nDirective = {
                restrict: "EA",
                updateText: function (ele, input, placeholder) {
                    var result;
                    result = void 0;
                    result = void 0;
                    if (input === "i18n-placeholder") {
                        result = localize.getLocalizedString(placeholder);
                        return ele.attr("placeholder", result);
                    } else if (input.length >= 1) {
                        result = localize.getLocalizedString(input);
                        return ele.text(result);
                    }
                },
                link: function (scope, ele, attrs) {
                    scope.$on("localizeResourcesUpdated", function () {
                        return i18nDirective.updateText(ele, attrs.i18n, attrs.placeholder);
                    });
                    return attrs.$observe("i18n", function (value) {
                        return i18nDirective.updateText(ele, value, attrs.placeholder);
                    });
                }
            };
            return i18nDirective;
        }
    ])

    /***********************************
     :: Lang Ctrl
     ***********************************/

    .controller("LangCtrl", [
        "$scope", "localize",
        function ($scope, localize) {
            $scope.lang = "中文";
            return $scope.setLang = function (lang) {
                switch (lang) {
                    case "English":
                        localize.setLanguage("EN-US");
                        break;
                    case "中文":
                        localize.setLanguage("ZH-CN");
                        break;
                }
                return $scope.lang = lang;
            };
        }
    ]);