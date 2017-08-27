"use strict";
angular.module('tiger.ui.custom_table', []).directive('customTable', function () {
    return {
        replace: true,
        templateUrl: "views/ui/custom_table.html",
        scope: {
            fieldList: '=',
            data: '=',
            onTheadClick: '=',
            sortByField: '=',
            sortByType: '=',
            operationFunc: '=',
            kpiScore: '=',
            listKey: '@',
            selectList: '=',
            kpiHeader: '@',
            quickEditFunc: '=',
            moduleId: '@'
        },
        controller: function ($scope, $rootScope, $document, $filter, ngToast, config, candidateService) {
            if (!$scope.listKey) {
                ngToast.danger("listKey is missed");
            }
            $scope.tableFieldList = [];
            $scope.config = config;

            // $scope.previewFile = function (type, id) {
            //     $rootScope.previewFile(type, id);
            // };

            $scope.uiSortableOptions = {
                helper: 'clone',
                placeholder: 'sortable-placeholder'
            };

            // var filterFilter = $filter('filter');
            $scope.showAttachmentList = function (data) {
                data.showAttachment = true;
            };

            $scope.hideAttachmentList = function (data) {
                data.showAttachment = false;
            };

            $scope.calcAttachmentPanel = function (rowItem, $index) {

                $(window).off('click.attachment_panel').on('click.attachment_panel', function (ev) {
                    if ($(ev.target).closest('.attachment-count').length) {
                        return;
                    }
                    if (!$(ev.target).closest('body').length) {
                        // ghost element
                        return;
                    }

                    rowItem.showAttachment = null;
                    $scope.$apply();
                    $(window).off('click.attachment_panel');
                });
            };

            var filterFilter = $filter('filter');
            $scope.$watchCollection('fieldList | filter : {showTable : 1}', function (value) {

                var displayedKeys = [];
                if (!value) {
                    return;
                }

                var displayItemList = [];
                var notDisplayItemList = [];
                angular.forEach($scope.fieldList, function (item) {
                    if (!item.canTable) {
                        return;
                    }
                    var key = (item.moduleItem ? item.moduleItem : '') + '.' + item.name;
                    if (item.showTable) {
                        displayedKeys.push(key);
                        displayItemList.push(item);
                    } else {
                        notDisplayItemList.push(item);
                    }
                });

                $scope.fieldList = displayItemList.concat(notDisplayItemList);

                localStorageService.set($scope.listKey, displayedKeys);

                var tmpFieldList = [];
                angular.forEach($scope.fieldList, function (item) {
                    if (!$scope.operationFunc || $scope.operationFunc.noSingleOperation) {
                        // 不显示操作
                        if (['resumeOperation'].indexOf(item.tableDataType) > -1) {
                            return;
                        }
                    }

                    if (item.showTable) {
                        tmpFieldList.push(item);
                    }
                });
                $scope.tableFieldList = tmpFieldList;
            });

            $scope.refresh = {};

            $document.off('keyup.customTable').on('keyup.customTable', function (event) {
                if (event.which === 27) {
                    if ($scope.quickEdit.closeAll()) {
                        $scope.$apply();
                        return true;
                    }
                    if ($scope.attachmentEdit.closeAll()) {
                        $scope.$apply();
                        return true;
                    }
                }
            });

            var entityByFieldItemFilter = $filter('entityByFieldItem');
            $scope.quickEdit = {
                enabled: false,
                opened: {},
                closeAll: function () {
                    if (!this.opened.id || !this.opened.name) {
                        return false;
                    }
                    this.opened = {};
                    return true;
                },
                toggle: function (row, name) {
                    if (this.opened.id === row.id && this.opened.name === name) {
                        this.opened = {};
                        return;
                    }
                    this.opened.id = row.id;
                    this.opened.name = name;
                    this.opened.row = row;
                },
                cancelQuickEdit: function (field) {
                    $scope.quickEdit.opened = {};
                },
                saveQuickEdit: function (field, value) {
                    $scope.refresh[$scope.quickEdit.opened.id] = true;

                    var quickEntity = entityByFieldItemFilter($scope.quickEdit.opened.row, field);

                    // todo 下面的函数之后需要拿出去
                    return $scope.quickEditFunc(
                        field.moduleItem, field.name, quickEntity.Fid, value, $scope.quickEdit.opened.id
                    ).then(function (data) {
                        quickEntity[field.name] = value;
                        for (var i = 0; i < $scope.data.length; i++) {
                            if ($scope.data[i].id !== $scope.quickEdit.opened.id) {
                                continue;
                            }
                            $scope.data[i] = angular.copy($scope.quickEdit.opened.row);
                            break;
                        }
                    }).finally(function () {
                        $scope.refresh[$scope.quickEdit.opened.id] = false;
                        $scope.quickEdit.opened = {};
                    });
                }
            };

            $scope.attachmentEdit = {
                enabled: false,
                opened: {},
                closeAll: function () {
                    if (!this.opened.id) {
                        return false;
                    }
                    this.opened.id = null;
                    return true;
                },
                toggle: function (row) {
                    if (this.opened.id === row.id) {
                        this.opened = {};
                        return;
                    }
                    this.opened.id = row.id;
                    this.opened.row = row;
                },
                closeAttachmentEdit: function () {
                    $scope.attachmentEdit.opened = {};
                }
            };

            if ($scope.quickEditFunc) {
                $scope.quickEdit.enabled = true;
            }

            $scope.$watchCollection('data', function () {
                $scope.quickEdit.opened = {};
                $scope.attachmentEdit.opened = {};
            });
        }
    };
}).directive('customList', function () {
    return {
        templateUrl: "views/ui/custom_list.html",
        replace: true,
        scope: {
            listTitle: '@',
            displayFieldKeyList: '=',
            fieldList: '=',
            data: '=',
            kpiHeader: '=',
            kpiScore: '=',
            onTheadClick: '=',
            sortByField: '=',
            sortByType: '=',
            pageState: '=',
            loading: '=',
            listKey: '@',
            operationFunc: '=',
            searchParam: '=',
            pageSizeEditable: '=',
            quickEditFunc: '=',
            moduleId: '@'
        },
        controller: function ($scope, $rootScope, $attrs, $filter, ngToast) {
            if (!$scope.listKey) {
                ngToast.danger("listKey is missed");
            }

            $scope.hasHighlight = $attrs.hasHighlight || false;

            $scope.fieldSearchText = null;
            $scope.selectCount = 0;
            $scope.selectList = {};
            $scope.selectAll = false;
            $scope.selectWhole = false;

            $scope.initSelectWhole = function () {
                $scope.selectWhole = false;
            };

            $scope.selectWholeItem = function () {
                $scope.selectWhole = true;
            };

            $scope.clearSelect = function () {
                $scope.selectWhole = false;
                $scope.selectList = {};
            };

            $scope.getSelectList = function () {
                if ($scope.selectCount == $scope.data.length && $scope.selectWhole) {
                    return {
                        searchParam: $scope.searchParam
                    };
                }

                var tmp = [];
                angular.forEach($scope.selectList, function (item, key) {
                    if (item) tmp.push(key);
                });
                return {
                    ids: tmp
                };
            };

            $scope.resetFieldDisplay = function () {

            };

            if ($scope.operationFunc) {
                $scope.operationFunc.batchGetSelectList = function () {
                    return $scope.getSelectList();
                };
            }

            $scope.$watch('data', function () {
                $scope.selectList = {};
                $scope.selectWhole = false;
            });

            $scope.$watch('selectList', function (newValue) {
                $scope.selectCount = 0;
                angular.forEach(newValue, function (value) {
                    if (value) $scope.selectCount++;
                });

                $scope.selectAll = $scope.selectCount && $scope.selectCount == $scope.data.length;
            }, true);

            $scope.$watch('selectAll', function (newValue, oldValue) {
                if (newValue) {
                    if ($scope.selectCount !== $scope.data.length) {
                        angular.forEach($scope.data, function (item) {
                            $scope.selectList[item.id] = true;
                        });
                    }
                } else {
                    if (!$scope.data) {
                        return;
                    }
                    if ($scope.selectCount >= $scope.data.length) {
                        angular.forEach($scope.data, function (item) {
                            $scope.selectList[item.id] = false;
                        });
                    }
                }
            });

            var i18nFilter = $filter('i18n'),
                entityByFieldItemFilter = $filter('entityByFieldItem'),
                showValueByFieldItemFilter = $filter('showValueByFieldItem');
            $scope.canExport = $rootScope.account.role && $rootScope.account.role.id == 1;
            $scope.exportTable = function () {
                if (!$scope.canExport) {
                    return;
                }

                var excludeField = [
                    'resumeOperation', 'projectOperation', 'companyOperation',
                    'pipelineOperation', 'contractOperation', 'invoiceOperation',
                    'documentOperation'
                ];

                var tableFieldList = $filter('filter')($scope.myFieldList, {
                    showTable: 1
                });

                var outputData = [],
                    tmp = [],
                    tmpStr;

                angular.forEach(tableFieldList, function (field) {
                    if (excludeField.indexOf(field.tableDataType) >= 0) {
                        return;
                    }
                    tmpStr = i18nFilter(field);
                    if (typeof tmpStr == 'string') {
                        tmpStr = tmpStr.replace('"', '""');
                    }
                    tmp.push(tmpStr);
                });

                outputData.push('"' + tmp.join('","') + '"\r\n');

                angular.forEach($scope.data, function (item) {
                    if ($scope.selectCount > 0) {
                        if (!$scope.selectList[item.id]) {
                            return;
                        }
                    }

                    tmp = [];
                    angular.forEach(tableFieldList, function (field) {
                        if (excludeField.indexOf(field.tableDataType) >= 0) {
                            return;
                        }

                        tmpStr = showValueByFieldItemFilter(entityByFieldItemFilter(item, field), field);
                        if (typeof tmpStr == 'string') {
                            tmpStr = tmpStr.replace('"', '""');
                        }
                        tmp.push(tmpStr);
                    });

                    outputData.push('"' + tmp.join('","') + '"\r\n');
                });

                // todo: 导出表格命名
                var csvFile = new File(outputData, 'output.csv', {type: 'text/csv;charset=utf-8'});
                saveAs(csvFile);
            };

            $scope.cleanFieldSearch = function () {
                $scope.fieldSearchText = null;
            };

            $scope.resetFieldList = function () {
                $scope.initFieldList();
                $scope.fieldSearchText = null;
            };
        },
        link: function ($scope, ele, attr) {
            // $scope.page = $scope.$parent.$eval(attr.page);
            $scope.initFieldList = function (displayFieldStore) {
                var fieldList = $scope.fieldList;
                var displayFieldKeyList = $scope.displayFieldKeyList || [];

                var displayed = [];
                var notDisplayed = [];
                var displayedKeys = [];
                var tmp = {};
                angular.forEach(fieldList, function (item) {
                    if (!item.canTable) {
                        return;
                    }
                    var key = (item.moduleItem ? item.moduleItem : '') + '.' + item.name;
                    tmp[key] = item;
                    if (displayFieldStore == null || displayFieldStore.length == 0) {
                        if (displayFieldKeyList.length > 0) {
                            if (displayFieldKeyList.indexOf(key) < 0) {
                                item.showTable = 0;
                                notDisplayed.push(item);
                            }
                        } else {
                            notDisplayed.push(item);
                        }
                    } else {
                        if (displayFieldStore.indexOf(key) < 0) {
                            notDisplayed.push(item);
                        }
                    }
                });

                if (displayFieldStore == null || displayFieldStore.length == 0) {
                    angular.forEach(displayFieldKeyList, function (key) {
                        var item = tmp[key];
                        if (item) {
                            item.showTable = 1;
                            displayed.push(item);
                            displayedKeys.push(key);
                        }
                    });
                    localStorageService.set($scope.listKey, displayedKeys);
                } else {
                    angular.forEach(displayFieldStore, function (key) {
                        var item = tmp[key];
                        if (item) {
                            item.showTable = 1;
                            displayed.push(item);
                            displayedKeys.push(key);
                        }
                    });
                }
                // myFieldList: show or hidden fieldList
                $scope.myFieldList = displayed.concat(notDisplayed);
            };

            var displayFieldStore;
            if ($scope.kpiHeader) {
                displayFieldStore = null;
            } else {
                displayFieldStore = localStorageService.get($scope.listKey);
            }
            $scope.initFieldList(displayFieldStore);
        }
    };
}).filter('generalItemSearch', function () {
    return function (list, search) {
        if (!search) {
            return list;
        }

        var result = [];

        angular.forEach(list, function (item) {
            if (item.title && item.title.indexOf(search) > -1) {
                result.push(item);
                return;
            }
            if (!item.i18n) {
                return;
            }
            if (item.i18n.zh && item.i18n.zh.indexOf(search) > -1) {
                result.push(item);
                return;
            }
            if (item.i18n.en && item.i18n.en.indexOf(search) > -1) {
                result.push(item);
                return;
            }
        });
        return result;
    }
}).filter('entityByFieldItem', function () {
    return function (data, fieldItem) {
        var tmp = null;
        if (fieldItem.moduleItem) {
            try {
                tmp = eval('data.' + fieldItem.moduleItem);
            } catch (e) {
                tmp = null;
            }
            // tmp = tmp[fieldItem.moduleItem];
        } else {
            tmp = data;
        }
        if (!tmp) {
            return null;
        }

        if (fieldItem.isArray) {
            if (!tmp.length) {
                return null;
            }
            return tmp[0];
        }

        return tmp;
    };
}).filter('entityValueByFieldItem', function ($filter) {
    var entityByFieldItem = $filter('entityByFieldItem');
    var i18nFilter = $filter('i18n');
    return function (value, fieldItem) {
        var tmp = entityByFieldItem(value, fieldItem);
        if (!tmp) {
            return null;
        }

        if (tmp[fieldItem.name] == null && fieldItem.dataType == 'select') {
            // 推测为 null 的 generalItem
            return null;
        }

        if (typeof tmp[fieldItem.name] == 'object') {
            // 这个字段可能是generalItem
            return i18nFilter(tmp[fieldItem.name]);
        } else {
            return tmp[fieldItem.name];
        }
    };
}).filter('entityIdByFieldItem', function ($filter) {
    var entityByFieldItem = $filter('entityByFieldItem');
    return function (value, fieldItem) {
        var tmp = entityByFieldItem(value, fieldItem);
        if (!tmp) {
            return null;
        }

        if (tmp[fieldItem.name] == null && fieldItem.dataType == 'select') {
            // 推测为 null 的 generalItem
            return null;
        }

        if (typeof tmp[fieldItem.name] == 'object') {
            // 这个字段可能是generalItem
            return tmp[fieldItem.name].value;
        }

        if (tmp.id) {
            return tmp.id;
        } else {
            return tmp.Fid;
        }
    };
}).filter('highlight4table', function ($filter) {
    var fieldItemKeyFilter = $filter('fieldItemKey');
    return function (value, fieldItem, highlightArr) {
        if (!value) {
            return value;
        }
        if (typeof value != 'string') {
            return value;
        }
        if (!highlightArr) {
            return value;
        }

        if ((!fieldItem.moduleItem && highlightArr[fieldItem.name])
            || highlightArr[fieldItemKeyFilter(fieldItem)]
            || highlightArr[fieldItemKeyFilter(fieldItem) + '.title']) {
            var highlight;
            if (highlightArr[fieldItemKeyFilter(fieldItem)]) {
                highlight = highlightArr[fieldItemKeyFilter(fieldItem)];
            } else if (highlightArr[fieldItemKeyFilter(fieldItem) + '.title']) {
                highlight = highlightArr[fieldItemKeyFilter(fieldItem) + '.title'];
            } else {
                highlight = highlightArr[fieldItem.name];
            }

            var highlightPartArr = {};

            // 高亮关键词去重
            angular.forEach(highlight.match(/<highlight>(.*?)<\/highlight>/g), function (highlightPart) {
                highlightPart = highlightPart.replace(/<\/?highlight>/g, '');
                highlightPartArr[highlightPart] = highlightPart;
            });

            angular.forEach(highlightPartArr, function (highlightPart) {
                value = value.replace(new RegExp(highlightPart, 'g'), '<mark>' + highlightPart + '</mark>');
            });
        } else if (highlightArr._all) {
            angular.forEach(highlightArr._all, function (keyword) {
                value = value.replace(keyword, '<mark>' + keyword + '</mark>');
            });
        }
        // 合并高亮
        value = value.replace(/<\/mark><mark>/g, '');

        return value;
    }
});
