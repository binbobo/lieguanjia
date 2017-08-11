"use strict";
angular.module('tiger.ctrl.demo', []).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('demo', {
        url: '/demo',
        templateUrl: 'views/pages/demo.html'
    });

    $stateProvider.state('ui', {
        url: '/ui',
        templateUrl: 'views/pages/ui.html'
    });

}).controller('uiController', function ($scope, $element) {

    $scope.testCheckBox = 0;
    $scope.testModal = {name: '11111', obj: {name: '2222'}};
    $scope.checkBoxOptions = [{text: 'check1', value: 1}, {text: 'check2', value: 2}];
    $scope.tabs = ['tab1', 'tab2', 'tab3'];
    $scope.activeIndex = 1;

    $scope.submit = function () {
        var form = $element.find('form');
        if (!$.formChecker.checkForm(form)) {
            return;
        }

        alert(1);
    }

    $scope.test = function () {
        console.log($scope.testValue);
    }

}).controller('demoController', function ($scope, FileUploader, resumeModal) {

    // resumeModal.selectResumeForProject();

    $scope.fileUploader = new FileUploader({url: '/api/files/upload'});

    $scope.myUpload = function (item) {
        item.formData = [
            {
                type: 37,
                subtype: 0
            }
        ];
        item.onSuccess = function (response, status, headers) {
            console.log(response.result.id);
        };
        item.upload();
    };

    $scope.treeOptions = {
        multiSelection: true
    };

    var selectLimit = 2;

    $scope.selectedNodes = [];
    $scope.showSelected = function (node, selected) {
        if ($scope.selectedNodes.length > selectLimit && selected) {
            $scope.selectedNodes = $scope.selectedNodes.slice(0, selectLimit);
        }
    };

    $scope.demoFL = [
        {
            "id": 1,
            "ordinal": 1,
            "title": "邮箱",
            "name": "email",
            required: true,
            "i18n": {
                "zh": "邮箱",
                "en": "email"
            },
            "dataType": "multiemail",
            number: 5,
            "maxLength": 50,
            "defaultValue": "abc@jl.com",
            "itemList": null
        }, {
            "id": 1,
            "ordinal": 1,
            "name": "email2",
            required: false,
            "title": "邮箱",
            "i18n": {
                "zh": "邮箱",
                "en": "email"
            },
            "dataType": "text",
            "maxLength": 50,
            "defaultValue": "",
            "itemList": null
        }, {
            "id": 2,
            "ordinal": 2,
            "title": "性别",
            "name": "sex",
            groupName: "sexType",
            "i18n": {
                "zh": "性别",
                "en": "sex"
            },
            "display": true,
            "required": false,
            "dataType": "select",
            "maxLength": 0,
            "defaultValue": "0",
            number: 1,
            itemListSource: '400',
            "itemList": [
                {
                    "id": 1,
                    "title": "男",
                    "i18n": {
                        "zh": "男",
                        "en": "man"
                    }
                }, {
                    "id": 2,
                    "title": "女",
                    "i18n": {
                        "zh": "男",
                        "en": "man"
                    }
                }
            ]
        }, {
            id: 3,
            title: "test",
            name: "test",
            dataType: "textarea"
        }
    ];

    $scope.dataForTheTree = [
        {
            "label": "北京",
            "children": [
                {
                    id: 1,
                    parent: "北京",
                    label: "海淀",
                    children: []
                }, {
                    label: "其它地区",
                    children: []
                }
            ]
        }, {
            "label": "上海",
            "children": [
                {
                    label: "黄浦区"
                }
            ]
        }, {
            "label": "黑龙江",
            "children": [
                {
                    label: "牡丹江"
                }
            ]
        }
    ];
});