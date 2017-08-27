"use strict";
angular.module('tiger.ui.custom_form', []).service('customFormHelper', function () {
    this.moneyValue2Unit = function (originValue) {
        if (originValue > 10000) {
            return 10000;
        } else if (originValue === 0) {
            return 10000;
        } else {
            return 1;
        }
    };

    this.unit2Name = {
        10000: '万',
        1000: '千',
        1: ''
    };
}).filter('textareaShow', function ($filter) {
    var nl2br = $filter('nl2br');
    var pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
    var patternInner = /(^|[\s\n]|<[A-Za-z]*\/?>)(\/#\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;

    return function (content) {
        if (!content) {
            return null;
        }
        if (typeof content !== "string") {
            if (content.toString) {
                content = content.toString();
            } else {
                return null;
            }
        }
        content = content.replace(pattern, '$1<a href="$2" target="_blank">$2</a>');
        content = content.replace(patternInner, '$1<a href="$2">$2</a>');
        return nl2br(content);
    };
}).filter('datetimeRangeShow', function ($filter) {
    var dateFilter = $filter('date');
    return function (datetimeRangeItem, onlyStartTime) {
        if (typeof datetimeRangeItem !== 'object') {
            return null;
        }
        if (datetimeRangeItem.wholeDay) {
            return '全天';
        }

        var startDatetime = new Date(datetimeRangeItem.Fstart_time * 1000);

        if (onlyStartTime) {
            return dateFilter(startDatetime, 'HH:mm');
        }

        var endDatetime = new Date(datetimeRangeItem.Fend_time * 1000);

        var startDate = new Date(startDatetime);
        var endDate = new Date(endDatetime);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        var days = (endDate - startDate) / 86400000;

        if (days === 0) {
            return dateFilter(startDatetime, 'HH:mm') + ' 到 ' + dateFilter(endDatetime, 'HH:mm');
        } else if (days === 1 && endDatetime - endDate === 0) {
            return dateFilter(startDate, 'HH:mm') + ' 到 24:00';
        } else if (endDatetime - endDate === 0) {
            return dateFilter(startDatetime, 'HH:mm') + ' 到 第' + days + '天 24:00';
        } else {
            return dateFilter(startDatetime, 'HH:mm') + ' 到 第' + (days + 1) + '天' + dateFilter(endDatetime, 'HH:mm');
        }
    };
}).directive('customForm', function () {
    return {
        restrict: "AE",
        templateUrl: "views/ui/custom_form.html",
        scope: {
            // field_info: '=',
            entity: '=',
            fieldList: '=',
            baseForm: '='
        },
        link: function ($scope, element, attr) {
            if (typeof $scope.entity === 'undefined') {
                $scope.entity = {};
            }
        }
    };
}).directive('customField', function ($filter, $timeout, apiService) {
    return {
        restrict: "AE",
        replace: true,
        templateUrl: "views/ui/custom_field.html",
        scope: {
            fieldInfo: '=',
            entity: '='
        },
        link: function (scope, element, attr) {
            angular.extend(scope, scope.fieldInfo);
            scope.attributeDataRaw = scope.attributeData;

            scope.attributeData = angular.extend({
                secondField: null, // generalItem 的特殊默认值（由 String 生成）
                dynamicList: null, // 是否为动态列表
                unionQuery: null, // 联合查询，以其中 searchField 对应列为参数
                searchField: null, //
                canDirectlyAdd: null, // 可以创建
                directlyAddHint: null // 创建提示
            }, scope.attributeDataRaw ? angular.fromJson(scope.attributeDataRaw) : null);

            if (attr.notNotEnded) {
                scope.notNotEnded = attr.notNotEnded;
            }

            if (typeof scope.entity === 'undefined') {
                scope.entity = {};
            }

            if (typeof scope.tmp === 'undefined') {
                scope.tmp = {};
            }

            if (typeof scope.entity[scope.name] === 'undefined' || scope.entity[scope.name] === null) {
                if (scope.dataType === 'select') {
                    // todo 移到tiger select
                    if (scope.attributeData.secondField) {
                        scope.entity[scope.name] = {
                            title: scope.entity[scope.attributeData.secondField]
                        };
                    }
                } else if (scope.defaultValue !== null) {
                    scope.entity[scope.name] = scope.defaultValue;
                }
            }

            if (scope.dataType === 'multiphone' || scope.dataType === 'multiemail') {
                scope.$watch('entity.' + scope.name, function (newValue) {
                    if (!scope.entity[scope.name] || !scope.entity[scope.name].length) {
                        scope.entity[scope.name] = [''];
                    }
                    if (typeof scope.entity[scope.name] !== 'object') {
                        scope.entity[scope.name] = [scope.entity[scope.name]];
                    }
                });
            }

            if (scope.dataType === 'datatime') {
                var flag = false;

                scope.$watch('entity.' + scope.name, function (newValue) {
                    if (!newValue) {
                        scope.tmp[scope.name] = null;
                        return;
                    }
                    if (flag && isSyncTime(newValue, scope.tmp[scope.name])) {
                        flag = false;
                        return;
                    }
                    scope.tmp[scope.name] = new Date(newValue * 1000);
                });

                scope.$watch('tmp.' + scope.name, function (newValue) {
                    if (!newValue) {
                        scope.entity[scope.name] = 0;
                        return;
                    }

                    var ts = newValue.getTime() / 1000;
                    ts = ts - (newValue.getTimezoneOffset() + 480) * 60;

                    scope.entity[scope.name] = Math.floor(ts);
                    flag = true;
                });

                var isSyncTime = function (entityTime, tmpTime) {
                    return entityTime === Math.floor(tmpTime.getTime() / 1000 - (tmpTime.getTimezoneOffset() + 480) * 60);
                };
            }

            if (scope.dataType === 'daterange') {
                scope.dateRangeTmp = {
                    Fstart_time: scope.entity.Fstart_time,
                    Fend_time: scope.entity.Fend_time,
                    Fnot_ended: scope.entity.Fnot_ended
                };

                scope.$watch('dateRangeTmp', function (value) {
                    scope.entity = angular.extend(scope.entity, scope.dateRangeTmp);
                }, true);
            }

            var syncRadioModel = function () {
                if (scope.entity[scope.name]) {
                    scope.tmp[scope.name] = scope.entity[scope.name].value;
                }
            };

            if (scope.dataType === 'radio') {
                syncRadioModel();
                scope.$watch('entity.' + scope.name, function () {
                    syncRadioModel();
                });

                if (scope.listType) {
                    apiService.getDataList(scope.listType).then(function (data) {
                        scope.itemList = data.list;
                    });
                }
            }

            scope.needAppendToBody = false;
            if (element.closest('.modal').length > 0) {
                scope.needAppendToBody = true;
            }


            scope.addItem = function () {
                if (!scope.entity[scope.name]) {
                    scope.entity[scope.name] = [];
                }
                scope.entity[scope.name].push("");

                $timeout(function () {
                    element.find('.multi-item input:last').focus();
                }, 100);
            };

            scope.removeItem = function (index) {
                scope.entity[scope.name].splice(index, 1);

                $timeout(function () {
                    element.find('.multi-item input:last').focus();
                }, 100);
            };

            scope.radioUpdate = function () {
                var result = $filter('filter')(scope.itemList, {
                    value: scope.tmp[scope.name]
                });
                if (result.length > 0) {
                    scope.entity[scope.name] = result[0];
                    return;
                }
                scope.entity[scope.name] = null;
            };

            // scope.uiSelectChange = function ($item, $model) {
            //     //todo
            //     if (scope.group_name) {
            //         scope.entity[scope.groupName] = $item.type;
            //     }
            // };

            // scope.uiSelectsChange = function () {
            //     // scope.entity[scope.name] = $.map(scope.tmp[scope.name], function(item) {
            //     //     return {id: item.id, title: item.title, i18n: item.i18n};
            //     // });
            // };

            // scope.uiGroupBy = function (item) {
            //     if (!scope.itemListGroups) {
            //         return '';
            //     }
            //     return scope.itemListGroups[item.type].title;
            // };

            scope.getUnionQueryKey = function () {
                if (!scope.listType) {
                    return null;
                }
                // if (!scope.attributeData.unionQuery) {
                //     return null;
                // }
                if (!scope.attributeData.searchField) {
                    return null;
                }
                if (!scope.entity[scope.attributeData.searchField]) {
                    return null;
                }

                return scope.entity[scope.attributeData.searchField].value;
            };


            // var initSelect = function () {
            //     // if (!scope.entity[scope.name]) {
            //     //     scope.entity[scope.name] = scope.itemList[0];
            //     // }
            //
            //     if (!scope.entity[scope.name] && scope.defaultValue !== null && scope.itemList) {
            //         angular.forEach(scope.itemList, function (item) {
            //             if (item.value === scope.defaultValue) {
            //                 scope.entity[scope.name] = item;
            //             }
            //         });
            //     }
            // };

            // if (scope.listType) {
            //     if (scope.attributeData.dynamicList) {
            //         scope.isContainItem = function (keyword, itemList) {
            //             return $.map(itemList, function (item) {
            //                     if ($filter("i18n")(item) === keyword) {
            //                         return true;
            //                     }
            //                 }).length > 0;
            //         };
            //         scope.selectRefresh = function (keyword) {
            //             return apiService.getDataListBySearch(scope.listType, keyword, 0, 100).then(function (data) {
            //                 scope.itemList = data.list;
            //                 if (scope.attributeData.canDirectlyAdd && keyword.length > 0 && !scope.isContainItem(keyword, scope.itemList)) {
            //                     scope.itemList.splice(0, 0, {
            //                         title: keyword,
            //                         hint: scope.attributeData.directlyAddHint
            //                     });
            //                 }
            //             });
            //         };
            //     } else if (scope.attributeData.unionQuery) {
            //         var unionQuery = function () {
            //             var searchKey =
            //                 !!scope.attributeData.searchField && scope.entity[scope.attributeData.searchField] ? scope.entity[scope.attributeData.searchField].id : "";
            //             apiService.getDataListBySearch(
            //                 scope.listType, searchKey, 0, 100,
            //                 angular.toJson(scope.attributeData)
            //             ).then(function (data) {
            //                 scope.itemList = data.list;
            //                 if (data.list.length < 1 && scope.attributeData.type === 2) {
            //                     scope.itemList.splice(0, 0, {
            //                         hint: "暂无联系人"
            //                     });
            //                 }
            //             });
            //         };
            //         unionQuery();
            //         scope.selectClick = function () {
            //             unionQuery();
            //         };
            //     } else {
            //         apiService.getDataList(scope.listType).then(function (data) {
            //             scope.itemList = data.list;
            //             if (data.group) {
            //                 scope.itemListGroups = data.group;
            //             }
            //             initSelect();
            //         });
            //     }
            // } else if (scope.dataType === 'select') {
            //     initSelect();
            // }

        }
    };
}).directive('tigerSelect', function ($filter, apiService) {
    return {
        templateUrl: "views/ui/select.html",
        require: 'ngModel',
        scope: {
            name: '@',
            // require: '@',
            selectedItem: '=ngModel',
            multi: '=?',
            placeholder: '@?',
            defaultValue: '=?',
            itemList: '=?',
            listType: '=?',
            attributeData: '=?',
            itemListGroups: '=?',
            unionQuery: '=?',
            appendToBody: '=?'
        },
        compile: function ($element, $scope) {
            if ($scope.multi) {
                $element.find('ui-select').attr('multiple', '');
                $element.find('ui-select').attr('close-on-select', 'false');
            }
            return this.link;
        },
        link: function ($scope, $element, $attr, ngModel) {
            $scope.loaded = false;
            $scope.attr = {
                canDel: !!$attr.canDel,
                limit: $attr.limit || 3
            };

            $scope.tmp = {
                value: $scope.multi ? [] : null
            };

            $scope.attributeData = $scope.attributeData || {};

            $scope.uiGroupBy = function (item) {
                if (!$scope.itemListGroups) {
                    return '';
                }
                return $scope.itemListGroups[item.type].title;
            };

            $scope.selectRefresh = function () {
            };

            $scope.initSelect = function () {
                $scope.loaded = true;
                $scope.initDefaultValue();
            };

            $scope.initDefaultValue = function () {
                if (ngModel.$viewValue || $scope.selectedItem) {
                    return;
                }

                if (typeof $scope.defaultValue !== 'number' &&
                    typeof $scope.defaultValue !== 'string') {
                    return;
                }

                if ($scope.defaultValue === '$first') {
                    $scope.tmp.value = $scope.itemList[0];
                    return;
                }

                for (var i in $scope.itemList) {
                    var item = $scope.itemList[i];
                    if (item.value !== $scope.defaultValue) {
                        continue;
                    }

                    if ($scope.multi) {
                        $scope.tmp.value = [item];
                    } else {
                        $scope.tmp.value = item;
                    }

                    ngModel.$setViewValue($scope.tmp.value);
                    break;
                }
            };

            $scope.uiSelectChange = function ($item, $model) {
                ngModel.$setTouched();
                // ngModel.$setViewValue($item);
                // if ($scope.group_name) {
                //     $scope.entity[$scope.groupName] = $item.type;
                // }
            };

            $scope.removeSelect = function () {
                ngModel.$setTouched();
                $scope.tmp.value = $scope.multi ? [] : null;
            };

            ngModel.$render = function () {
                if (typeof ngModel.$viewValue === 'undefined') {
                    if ($scope.loaded) {
                        $scope.initDefaultValue();
                    }
                } else {
                    $scope.tmp.value = ngModel.$viewValue;
                }
            };

            ngModel.$isEmpty = function () {
                if (!$scope.tmp.value) {
                    return true;
                }

                if ($scope.multi) {
                    return $scope.tmp.value.length === 0;
                }

                return false;
            };

            $scope.$watch('tmp.value', function () {
                ngModel.$setViewValue($scope.tmp.value);
            });

            if ($scope.listType) {
                if ($scope.attributeData.dynamicList) {
                    $scope.isContainItem = function (keyword, itemList) {
                        return _.map(itemList, function (item) {
                            if ($filter("i18n")(item) === keyword) {
                                return true;
                            }
                        }).length > 0;
                    };

                    $scope.selectRefresh = function (keyword) {
                        return apiService.getDataListBySearch($scope.listType, keyword, 0, 100).then(function (data) {
                            $scope.itemList = data.list;
                            if ($scope.attributeData.canDirectlyAdd &&
                                keyword.length > 0 && !$scope.isContainItem(keyword, $scope.itemList)) {

                                $scope.itemList.splice(0, 0, {
                                    title: keyword,
                                    hint: $scope.attributeData.directlyAddHint
                                });
                            }
                            $scope.initSelect();
                        });
                    };
                } else if ($scope.attributeData.unionQuery) {
                    $scope.getListByUnionQuery = function (keyword) {
                        var searchKey;
                        if (!keyword) {
                            if (typeof $scope.unionQuery === 'function') {
                                searchKey = $scope.unionQuery();
                            } else {
                                searchKey = $scope.unionQuery;
                            }
                        } else {
                            searchKey = keyword;
                        }
                        apiService.getDataListBySearch(
                            $scope.listType, searchKey, 0, 100,
                            angular.toJson($scope.attributeData)
                        ).then(function (data) {
                            $scope.itemList = data.list;

                            if (data.list.length < 1 && $scope.attributeData.type === '2') {
                                $scope.itemList.splice(0, 0, {
                                    hint: "暂无联系人"
                                });
                            }

                            $scope.initSelect();
                        });
                    };

                    $scope.getListByUnionQuery();
                    $scope.selectClick = function () {
                        $scope.getListByUnionQuery();
                    };

                    if ($scope.attributeData.type === '3') {
                        $scope.selectRefresh = $scope.getListByUnionQuery;
                    }
                } else {
                    apiService.getDataList($scope.listType).then(function (data) {
                        $scope.itemList = data.list;
                        if (data.group) {
                            $scope.itemListGroups = data.group;
                        }
                        $scope.initSelect();
                    });
                }
            } else {
                $scope.initSelect();
            }
        }
    };
}).directive('treeSelector', function ($window, $document, $filter, $templateCache, $compile, $timeout, apiService) {
    return {
        restrict: "AE",
        templateUrl: "views/ui/tree_selector.html",
        require: 'ngModel',
        scope: {
            selectLimit: '=',
            listType: '=',
            appendToBody: '='
        },
        link: function ($scope, $element, attr, ngModel) {

            var multi = !!attr.multi;
            var selectLimit = $scope.selectLimit || 1;

            if (!multi) {
                selectLimit = 1;
            }

            $scope.treeOptions = {
                multiSelection: true
            };
            $scope.treeControl = {
                treeFilter: ''
            };

            $scope.selectedNodes = [];
            $scope.expandedNodes = [];

            $scope.listType = $scope.listType || 0;
            $scope.dataForTheTree = [];

            $scope.$selectorMain = $compile($templateCache.get('tree_selector_main.html'))($scope);

            if ($scope.appendToBody) {
                $document.find('body').append($scope.$selectorMain);

                $scope.$on('$destroy', function () {
                    $scope.$selectorMain.remove();
                });
            } else {
                $element.after($scope.$selectorMain);
            }


            function resetPosition() {
                var offset = $element.offset();
                var elementHeight = $element.outerHeight();

                $scope.$selectorMain.css({
                    position: 'absolute',
                    top: offset.top + elementHeight,
                    left: offset.left
                });
            }

            var ts = 0;

            function openTree() {
                ts = new Date().getTime();

                $scope.editing = true;
                $element.addClass('opened-tree-selector');

                if ($scope.appendToBody) {
                    angular.element($window).on('resize.myTree' + ts, resetPosition);
                    $element.on('resize.myTree' + ts, resetPosition);
                    resetPosition();
                }

                $('body').on('click.myTree' + ts, function (event) {
                    if (!$(event.target).closest('.opened-tree-selector').is($element) &&
                        $(event.target).closest('.tree-selector-main').length === 0) {

                        $('body').off('click.myTree' + ts);
                        ngModel.$setTouched();

                        $scope.editing = false;
                        $scope.$apply();
                    }
                });
            }

            $scope.openTree = function ($event) {
                openTree();
            };

            $scope.toggleTree = function ($event) {
                if ($scope.editing) {
                    ngModel.$setTouched();

                    $scope.editing = false;
                    $('body').off('.myTree' + ts);
                    $event.stopPropagation();
                } else {
                    openTree();
                }
            };

            $scope.selectedMap = {};

            var updateFlag = false;
            $scope.updateSelected = function (node, selected) {
                if (selectLimit > 0 && $scope.selectedNodes.length >= selectLimit && selected) {
                    if (selectLimit === 1) {
                        $scope.selectedNodes = [node];
                    } else {
                        $scope.selectedNodes = $scope.selectedNodes.slice(0, selectLimit);
                    }
                    $scope.editing = false;
                }

                $scope.selectedMap = {};

                if (multi) {
                    ngModel.$setViewValue($.map($scope.selectedNodes, function (item) {
                        $scope.selectedMap[item.id] = true;
                        return {
                            id: item.id,
                            title: item.title,
                            i18n: item.i18n,
                            value: item.value,
                        };
                    }));
                } else if ($scope.selectedNodes.length > 0) {
                    var item = $scope.selectedNodes[0];

                    $scope.selectedMap[item.id] = true;
                    ngModel.$setViewValue({
                        id: item.id,
                        title: item.title,
                        i18n: item.i18n,
                        value: item.value
                    });
                } else {
                    ngModel.$setViewValue(null);
                }

                updateFlag = true;

                $timeout(function () {
                    $element.trigger('resize');
                }, 0);
            };

            $scope.removeNode = function ($event, $index) {
                $event.stopPropagation();
                $scope.selectedNodes.splice($index, 1);
                $scope.updateSelected();
            };

            var filterFilter = $filter('filter');
            $scope.expandNodesForFilter = function (tree, level) {
                if (!$scope.treeControl.treeFilter) {
                    return;
                }
                if (!level) {
                    level = 0;
                    $scope.expandedNodes = [];
                }
                angular.forEach(tree, function (item) {
                    if (item.children && item.children.length) {
                        if (filterFilter(item.children, $scope.treeControl.treeFilter).length) {
                            $scope.expandedNodes.push(item);
                            $scope.expandNodesForFilter(item.children, level + 1);
                        }
                    }
                });
            };

            $scope.$watch('treeControl.treeFilter', function (newValue) {
                $scope.expandNodesForFilter($scope.dataForTheTree);
            });

            ngModel.$isEmpty = function () {
                if (multi) {
                    return !ngModel.$viewValue || !ngModel.$viewValue.length;
                } else {
                    return !ngModel.$viewValue;
                }
            };


            var tmpSelect = {};
            ngModel.$render = function () {
                tmpSelect = {};
                $scope.selectedNodes = [];
                $scope.expandedNodes = [];

                if (multi) {
                    if (ngModel.$viewValue === null) {
                        ngModel.$viewValue = [];
                    }

                    angular.forEach(ngModel.$viewValue, function (item) {
                        if (item) {
                            tmpSelect[item.id] = true;
                        }
                    });
                } else {
                    if (ngModel.$viewValue) {
                        tmpSelect[ngModel.$viewValue.id] = true;
                    }
                }

                foreachTheTree($scope.dataForTheTree);
                $scope.selectedMap = tmpSelect;
            };

            var tmp = {};
            var trace = [];

            function foreachTheTree(tree, parent) {
                if (!tree) {
                    return;
                }
                var self = tree;
                angular.forEach(tree, function (item) {
                    if (tmpSelect[item.id]) {
                        $scope.selectedNodes.push(item);
                        angular.forEach(trace, function (item) {
                            if (!tmp[item.id]) {
                                tmp[item.id] = true;
                                $scope.expandedNodes.push(item);
                            }
                        });
                    }

                    if (item.children && item.children.length) {
                        trace.push(item);
                        foreachTheTree(item.children, item);
                        trace.pop();
                    }
                });
            }

            apiService.getDataList($scope.listType).then(function (data) {
                if (typeof data.list !== 'undefined') {
                    $scope.dataForTheTree = data.list;
                    foreachTheTree($scope.dataForTheTree);
                }
            });
        }
    };
}).directive('customDate', function () {
    return {
        template: '<input type="date" ng-model="tmp">',
        replace: true,
        scope: {
            model: '='
        },
        link: function ($scope, $element, attr) {
            $scope.tmp = null;

            var flag = false;
            $scope.$watch('model', function (newValue) {
                if (flag) {
                    flag = false;
                    return;
                }
                if (newValue) {
                    $scope.tmp = new Date(newValue * 1000);
                } else {
                    $scope.tmp = null;
                }
                flag = true;
            });

            $scope.$watch('tmp', function (newValue) {
                if (flag) {
                    flag = false;
                    return;
                }
                if (newValue) {
                    $scope.model = Math.floor(newValue.getTime() / 1000);
                } else {
                    $scope.model = 0;
                }
                flag = true;
            });
        }
    };
}).directive('tigerDate', function () {
    return {
        restrict: 'E',
        templateUrl: 'views/ui/date_input.html',
        require: 'ngModel',
        replace: true,
        scope: {
            uiDateRaw: '=ngModel',
            appendToBody: '=',
            noDay: '=?'
        },
        link: function ($scope, $element, $attrs, ngModel) {
            $scope.uiDate = null;
            $scope.uiName = $attrs.uiName;
            $scope.uiRequired = $attrs.uiRequired > 0;
            $scope.placeholder = $attrs.placeholder || '';

            $scope.format = 'yyyy-M-d';

            $scope.dateOptions = {
                minDate: new Date(1910, 0, 1),
                maxDate: new Date(2037, 11, 31),
                datepickerMode: 'year',
                minMode: 'day',
                altInputFormats: ['yyyy-M!-dd']
            };

            $scope.$watch('noDay', function () {
                if ($scope.noDay) {
                    $scope.dateOptions.minMode = 'month';
                    $scope.format = 'yyyy-M';
                } else {
                    $scope.dateOptions.minMode = 'day';
                    $scope.format = 'yyyy-M-d';
                }
            });

            $scope.datePickerPopup = {
                opened: false
            };

            $scope.openDatePicker = function () {
                $scope.datePickerPopup.opened = true;
            };

            ngModel.$isEmpty = function () {
                return $scope.uiDate === null;
            };

            ngModel.$render = function () {
                if (!ngModel.$viewValue) {
                    $scope.uiDate = null;
                    return;
                }
                $scope.uiDate = new Date(ngModel.$viewValue * 1000);
            };

            $scope.$watch('uiDate', function () {
                if (!$scope.uiDate) {
                    ngModel.$setViewValue(null);
                    return;
                }
                if ($scope.uiDate > $scope.dateOptions.maxDate) {
                    $scope.uiDate = $scope.dateOptions.maxDate;
                } else if ($scope.uiDate < $scope.dateOptions.minDate) {
                    $scope.uiDate = $scope.dateOptions.minDate;
                }
                ngModel.$setViewValue($scope.uiDate.getTime() / 1000);
            });
        }
    };
}).directive('tigerDatetime', function () {
    return {
        templateUrl: 'views/ui/datetime_input.html',
        require: 'ngModel',
        scope: {
            appendToBody: '='
        },
        link: function ($scope, $element, $attrs, ngModel) {
            $scope.uiDate = null;
            $scope.uiTime = null;
            $scope.uiName = $attrs.uiName;
            $scope.uiRequired = $attrs.uiRequired > 0;
            $scope.placeholder = $attrs.placeholder || '';
            $scope.noDay = typeof $attrs.noDay !== 'undefined';

            $scope.format = 'yyyy-M-d';
            $scope.timeformat = 'HH:mm';

            $scope.dateOptions = {
                minDate: new Date(1910, 0, 1),
                maxDate: new Date(2037, 11, 31),
                datepickerMode: 'year',
                minMode: 'day',
                altInputFormats: ['yyyy-M!-dd']
            };

            $scope.datePickerPopup = {
                opened: false
            };

            $scope.openDatePicker = function () {
                if ($scope.uiDate) {
                    $scope.dateOptions.datepickerMode = 'day';
                }
                $scope.datePickerPopup.opened = true;
            };

            ngModel.$isEmpty = function () {
                return $scope.uiDate === null;
            };

            ngModel.$render = function () {
                if (!ngModel.$viewValue) {
                    $scope.uiDate = null;
                    return;
                }
                $scope.uiDate = new Date(ngModel.$viewValue * 1000);
                $scope.uiTime = new Date(ngModel.$viewValue * 1000);
            };

            $scope.$watch('uiDate', function () {
                if (!$scope.uiDate || typeof $scope.uiDate === 'string') {
                    ngModel.$setViewValue(null);
                    return;
                }
                if ($scope.uiDate > $scope.dateOptions.maxDate) {
                    $scope.uiDate = $scope.dateOptions.maxDate;
                } else if ($scope.uiDate < $scope.dateOptions.minDate) {
                    $scope.uiDate = $scope.dateOptions.minDate;
                }
                if ($scope.uiTime === null) {
                    $scope.uiTime = new Date();
                    $scope.uiTime.setHours(9);
                    $scope.uiTime.setMinutes(0);
                }
                $scope.uiDate.setHours($scope.uiTime.getHours());
                $scope.uiDate.setMinutes($scope.uiTime.getMinutes());
                ngModel.$setViewValue($scope.uiDate.getTime() / 1000);
            });

            $scope.$watch('uiTime', function (newValue, oldValue) {
                if (!newValue || typeof newValue === 'string') {
                    return;
                }
                if ($scope.uiDate === null) {
                    $scope.uiDate = new Date();
                }
                $scope.uiDate.setHours(newValue.getHours());
                $scope.uiDate.setMinutes(newValue.getMinutes());
                $scope.uiDate.setSeconds(0);
                $scope.uiDate.setMilliseconds(0);
                ngModel.$setViewValue($scope.uiDate.getTime() / 1000);
            });
        }
    };
}).directive('customMoney', function ($filter, customFormHelper) {
    return {
        templateUrl: 'views/ui/money.html',
        require: 'ngModel',
        link: function ($scope, $element, attrs, ngModel) {

            $scope.tmpMoney = {
                value: ngModel.$viewValue,
                valueType: 10000
            };

            ngModel.$render = function () {
                if (!ngModel.$viewValue) {
                    return;
                }
                var valueType = customFormHelper.moneyValue2Unit(ngModel.$viewValue);

                $scope.tmpMoney.valueType = valueType;
                $scope.tmpMoney.value = ngModel.$viewValue / valueType;
            };

            $scope.$watch('tmpMoney.valueType', function (valueType) {
                if (!ngModel.$viewValue) {
                    return;
                }
                $scope.tmpMoney.value = ngModel.$viewValue / valueType;
            });

            $scope.$watch('tmpMoney.value', function () {
                if (isNaN($scope.tmpMoney.value)) {
                    ngModel.$setViewValue(null);
                    return;
                }
                $scope.tmpMoney.value =
                    Math.round($scope.tmpMoney.value * $scope.tmpMoney.valueType * 100) / 100 / $scope.tmpMoney.valueType;
                ngModel.$setViewValue($scope.tmpMoney.value * $scope.tmpMoney.valueType);
            });
        }
    };
}).directive('workExperience', function ($rootScope) {
    return {
        require: 'ngModel',
        link: function ($scope, $element, $attrs, ngModel) {
            ngModel.$parsers.push(function (value) {
                return value < 1000 ? $rootScope.currentYear - value : value;
            });
            ngModel.$formatters.push(function (value) {
                return value > 1000 ? $rootScope.currentYear - value : value;
            });

        }
    };
}).directive('daterange', function () {
    return {
        templateUrl: 'views/ui/daterange.html',
        replace: true,
        require: 'ngModel',
        scope: {
            dateRange: '=ngModel'
        },
        link: function ($scope, $element, $attrs, ngModel) {
            ngModel.$options.$$options.allowInvalid = true;

            ngModel.$isEmpty = function () {
                if (!$scope.dateRange.Fstart_time) {
                    return true;
                }
                return !$scope.dateRange.Fnot_ended && !$scope.dateRange.Fend_time;
            };

            $scope.$watch('dateRange', function () {
                ngModel.$validate();
            }, true);

            if (!$scope.dateRange) {
                $scope.dateRange = {
                    Fstart_time: null,
                    Fend_time: null,
                    Fnot_ended: 0
                };
            }

            if ($attrs.notNotEnded) {
                $scope.notNotEnded = $attrs.notNotEnded;
                $scope.dateRange.Fnot_ended = 0;
            } else {
                $scope.notNotEnded = 0;
            }

            $scope.notNoDay = $attrs.notNoDay || 0;
        }
    };
}).directive('datetimeRange', function () {
    return {
        templateUrl: 'views/ui/datetime_range.html',
        replace: true,
        require: 'ngModel',
        scope: {
            dateRange: '=ngModel',
            appendToBody: '='
        },
        link: function ($scope, $element, $attrs, ngModel) {
            ngModel.$options.$$options.allowInvalid = true;

            if (!$scope.dateRange) {
                $scope.dateRange = {
                    Fstart_time: null,
                    Fend_time: null,
                    wholeDay: 0
                };
            }

            ngModel.$isEmpty = function () {
                if (!$scope.dateRange) {
                    return true;
                }
                if (!$scope.dateRange.Fstart_time) {
                    return true;
                }
                if (!$scope.dateRange.Fend_time) {
                    return true;
                }
                return false;
            };

            $scope.$watch('dateRange', function (newValue, oldValue) {
                ngModel.$validate();

                if (newValue && newValue.Fstart_time && newValue.Fstart_time !== oldValue.Fstart_time) {
                    // if (newValue.wholeDay) {
                    //     var t = new Date();
                    //     t.setTime(newValue.Fstart_time * 1000);
                    //     t.setHours(0);
                    //     t.setMinutes(0);
                    //     t.setSeconds(0);
                    //
                    //     newValue.Fstart_time = Math.round(t.getTime() / 1000);
                    // }

                    if (newValue.Fstart_time > newValue.Fend_time) {
                        newValue.Fend_time = newValue.Fstart_time + 3600;
                    }
                }
            }, true);
        }
    };
}).directive('customFormShow', function () {
    return {
        restrict: "AE",
        templateUrl: "views/ui/custom_form_show.html",
        scope: {
            moduleItem: "@",
            entity: "=",
            fieldList: "=",
            saveEditFunc: "="
        },
        link: function (scope, element, attr) {
            if (typeof scope.entity === 'undefined') {
                scope.entity = {};
            }
        },
        controller: function ($scope) {
            $scope.canQuickEdit =
                $scope.moduleItem !== '' && typeof $scope.saveEditFunc === 'function';

            $scope.editing = null;
            $scope.entityTmp = {};
            $scope.quickEdit = function (field) {
                // $scope.entityTmp[field.name] = $scope.entity[field.name];
                $scope.editing = field.name;
            };

            $scope.cancelQuickEdit = function (field) {
                $scope.editing = null;
            };

            $scope.saveQuickEdit = function (field, value) {
                $scope.editing = null;
                $scope.entity[field.name] = value;
                return $scope.saveEditFunc($scope.moduleItem, field, $scope.entity.Fid, value);
            };
        }
    };
}).directive('customFieldShow', function (customFormHelper) {
    return {
        restrict: "AE",
        templateUrl: "views/ui/custom_field_show.html",
        scope: {
            entity: "=",
            fieldInfo: "="
        },
        link: function (scope, element, attr) {
            angular.extend(scope, scope.fieldInfo);
            scope.attributeData = !scope.attributeData ? {} : angular.fromJson(scope.attributeData);
            if (typeof scope.entity === 'undefined') {
                scope.entity = {};
            }

            if (scope.dataType === 'money') {
                var value = scope.entity[scope.name] || 0;
                var valueType = customFormHelper.moneyValue2Unit(value);

                scope.tmp = {};
                scope.tmp[scope.name] = {
                    value: value / valueType,
                    valueType: valueType
                };
            }

            scope.inPreview = !!element.closest('.preview-wrap').length;

            if (attr.placeholder || isNaN(attr.placeholder)) {
                scope.placeholder = attr.placeholder;
            }
        }
    };
}).directive('quickEdit', function (ngToast) {
    return {
        templateUrl: 'views/ui/quick_edit.html',
        replace: true,
        scope: {
            entity: '=',
            fieldInfo: '=',
            onCancel: '=',
            onSave: '='
        },
        controller: function ($scope, $element, $timeout) {
            $scope.loading = false;
            $scope.entityTmp = angular.copy($scope.entity);

            $scope.cancelQuickEdit = function (field) {
                $scope.onCancel(field);
            };

            $scope.saveQuickEdit = function (field) {
                if (Object.keys($scope.quickEdit.$error).length > 0) {
                    ngToast.warning('请检查填写内容');
                    return;
                }

                if ($scope.onSave(field, $scope.entityTmp[field.name])) {
                    $scope.loading = true;
                }
            };

            $timeout(function () {
                $element.find('input:visible').focus();
            }, 100);
        }
    };
}).filter('fieldItemKey', function () {
    return function (fieldItem) {
        return (fieldItem.moduleItem ? fieldItem.moduleItem : '') + '.' + fieldItem.name;
    };
}).filter('dataTypeFromSearch', function () {
    /** @deprecated */
    var dataTypeMap = {
        1: 'match_phrase',
        2: 'wildcard',
        3: 'listText',
        4: 'listGeneralItem',
        6: 'number',
        7: 'daterange',
        8: 'numberValue',
        9: 'generalItem',
        10: 'generalItemRange',
        11: 'checkbox'
    };
    return function (input) {
        if (dataTypeMap[input]) {
            return dataTypeMap[input];
        }
        return input;
    };
}).filter('fieldItem2SearchType', function () {
    var noSelectGeneralItemField = ['Fresume_id', 'Fproject_id', 'Fcompany_id'];
    var needWildcardField = ['Fqq', 'Ftelephone', 'Fwebsite', 'Femail', 'Ftracking_number', 'documentName'];

    return function (fieldItem) {

        if (fieldItem.name === 'Fdegree') {
            return 'generalItemRange';
        }

        if (fieldItem.isArray) {
            if (fieldItem.dataType === 'select') {
                if (noSelectGeneralItemField.indexOf(fieldItem.name) > -1) {
                    return 'listGeneralItemText';
                }
            } else if (fieldItem.dataType === 'text') {
                return 'listText';
            }
        }

        if (fieldItem.dataType === 'select') {
            if (noSelectGeneralItemField.indexOf(fieldItem.name) > -1) {
                return 'generalItemText';
            }
        }

        if (needWildcardField.indexOf(fieldItem.name) > -1) {
            return 'wildcard';
        }

        switch (fieldItem.dataType) {
            case 'checkbox':
                return 'checkbox';
            case 'date':
                return 'daterange';
            case 'number':
            case 'money':
            case 'workExperience':
                return 'number';
            case 'email':
            case 'multiphone':
                return 'wildcard';
            case 'radio':
            case 'select':
            case 'multiselect':
            case 'treeselect':
                return 'generalItem';

            default:
                return 'match_phrase';
        }
    };
}).filter('fieldCanQuickEdit', function () {
    // var whiteList = ['text', 'number', 'select', 'checkbox',];
    var blackList = ['daterange'];
    return function (fieldItem) {
        // if (typeof fieldItem.quickEdit != 'undefined') {
        //     return !!fieldItem.quickEdit;
        // }
        // return whiteList.indexOf(fieldItem.dataType) >= 0;
        return fieldItem.generateType > 0 && blackList.indexOf(fieldItem.dataType) === -1;
    };
}).filter('canShowValueByFieldItem', function () {
    var canDataType = [
        'text',
        'age',
        'money',
        'checkbox',
        'number',
        'select',
        'date',
        'treeselect',
        'percent',
        'fileSize',
        'radio',
        'multiselect',
        'multitext',
        // 'multiphone',
        'multiemail',
        'email',
        'textarea',
        'workExperience'
    ];
    return function (fieldInfo) {
        if (fieldInfo.tableDataType) {
            return false;
        }
        if (!fieldInfo.dataType) {
            return false;
        }
        return canDataType.indexOf(fieldInfo.dataType) > -1;
    };
}).filter('showValueByFieldItem', function ($filter, $rootScope, customFormHelper) {
    var numberFilter = $filter('number'),
        ageFilter = $filter('age'),
        i18nFilter = $filter('i18n'),
        tigerMoney = $filter('tigerMoney'),
        tigerDateFilter = $filter('tigerDate'),
        tigerDatetimeFilter = $filter('tigerDatetime'),
        dateFilter = $filter('date'),
        fileSizeFilter = $filter('fileSize'),
        nl2brFilter = $filter('nl2br')
        ;
    return function (entity, fieldItem) {
        if (entity === null || angular.isUndefined(fieldItem) || angular.isUndefined(entity)) {
            return null;
        }

        var fieldValue = entity[fieldItem.name];

        var tmpArr = [];

        switch (fieldItem.dataType) {
            case 'textarea':
                return nl2brFilter(fieldValue);
            case 'date':
                return tigerDateFilter(fieldValue);
            case 'datetime':
                return tigerDatetimeFilter(fieldValue);
            case 'workExperience':
                return fieldValue > 1000 ? $rootScope.currentYear - fieldValue : fieldValue;
            case 'datetimerange':
            // Todo: 暂时不考虑datetime
            case 'daterange':
                tmpArr.push(entity.Fstart_time ? dateFilter(entity.Fstart_time, 'yyyy-MM') : '(未知)');
                if (entity.Fnot_ended) {
                    tmpArr.push(' - ');
                    tmpArr.push('至今');
                } else {
                    tmpArr.push(' - ');
                    tmpArr.push(entity.Fend_time ? dateFilter(entity.Fend_time, 'yyyy-MM') : '');
                }
                return tmpArr.join('');

            case 'percent':
                if (!fieldValue) {
                    return null;
                }
                return fieldValue + '%';
            case 'fileSize':
                return fileSizeFilter(fieldValue);
            case 'age':
                return ageFilter(fieldValue) + '岁';
            case 'money':
                return tigerMoney(fieldValue);
            // var valueType = customFormHelper.moneyValue2Unit(fieldValue);
            // return numberFilter(fieldValue / valueType, 2) + ' ' + customFormHelper.unit2Name[valueType] + '元';

            case 'checkbox':
                if (typeof fieldValue === 'undefined') {
                    return null;
                }
                return fieldValue ? '是' : '否';

            case 'select':
            case 'radio':
            case 'multiselect':
            case 'treeselect':
                if (!fieldValue) {
                    if (fieldItem.dataType === 'select' &&
                        fieldItem.attributeData &&
                        fieldItem.attributeData.secondField &&
                        entity[fieldItem.attributeData.secondField]) {

                        return entity[fieldItem.attributeData.secondField];
                    }
                    return null;
                }
                if (!fieldValue.length) {
                    return i18nFilter(fieldValue);
                }
                angular.forEach(fieldValue, function (item) {
                    tmpArr.push(i18nFilter(item));
                });
                return tmpArr.join("\n");

            case 'multitext':
            case 'multiemail':
            case 'multiphone':
                angular.forEach(fieldValue, function (item) {
                    tmpArr.push(item);
                });
                return tmpArr.join("\n");
            case 'tag':
                angular.forEach(fieldValue, function (item) {
                    if (item.text) {
                        tmpArr.push(item.text);
                    } else {
                        tmpArr.push(item);
                    }
                });
                return tmpArr.join(", ");

            case 'typeList':
                angular.forEach(fieldValue, function (item) {
                    if (fieldValue.length > 1) {
                        tmpArr.push(i18nFilter(item.type) + ': ' + tigerMoney(item.fee));
                    } else {
                        tmpArr.push(i18nFilter(item.type));
                    }
                });
                return tmpArr.join("\n");
            case "revenueMemberList":
                angular.forEach(fieldValue, function (item) {
                    tmpArr.push(i18nFilter(item.projectMember.member) + ": " + item.revenue + ' 元');
                });
                return tmpArr.join("\n");

            default:
                if (fieldValue || !isNaN(fieldValue)) {
                    return fieldValue;
                } else {
                    return null;
                }
        }
    };
}).directive('phoneQr', function () {
    return {
        restrict: 'E',
        templateUrl: 'views/ui/phone_qr.html',
        link: function ($scope, $element, $attr) {
            $attr.$observe('phone', function (value) {
                if (!value) {
                    return;
                }
                $scope.phone = value;
                $element.find('.phone-qr').empty()
                    .qrcode({size: 100, text: 'http://wechat.dev.lieguanjia.com/api/phone?phone=' + value});
            });
        }
    };
});
