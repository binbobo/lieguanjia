/**
 * Created by William on 2016/12/13.
 */
"use strict";
angular.module('tiger.ui.t', []).service('uiUtil', function () {
    this.checkForm = function (element) {
        return;
        console.log('self check form');
        var form = element.closest('form');
        $.formChecker.checkForm(form);
    };

    this.checkerRequire = function (checkers) {
        return checkers && checkers.indexOf('require') >= 0;
    };

    this.getNeedSingleSelectMsg = function (checkers, value, $element) {
        var require = this.checkerRequire(checkers);
        if (require) {
            var $val = value;
            if (!$val) {
                return '请选择';
            } else {
                this.checkForm($element);
                return '';
            }
        }
    };

    this.getNeedMultiSelectMsg = function (checkers, value, $element) {
        var require = this.checkerRequire(checkers);
        if (require) {
            var $val = value;
            if ($val) {
                var selected = 0;
                _.mapValues($val, function (v) {
                    selected += v;
                });
            }
            if (!$val || selected == 0) {
                return '请选择';
            } else {
                this.checkForm($element);
                return '';
            }
        }
    }

}).directive('tRow', function () {
    return {
        scope: {
            label: '@',
            checkers: '@'
        },
        templateUrl: 'views/ui/row.html',
        transclude: true,
        replace: true,
        controller: function ($scope, $element, uiUtil) {
            var checkRequireClass = function () {
                if (uiUtil.checkerRequire($scope.checkers))
                    return 'require';
                else
                    return '';
            };
            $scope.requireClass = checkRequireClass();
        }
    };
}).directive('tInput', function () {
    return {
        scope: {
            label: '@',
            checkers: '@',
            help: '@',
            placeholder: '@',
            type: '@',
            value: '=ngModel',
            disableRow: '='
        },
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: 'views/ui/input.html',
        controller: function ($scope, $element) {
        }
    };
}).directive('tText', function () {
    return {
        scope: {
            label: '@',
            checkers: '@',
            help: '@',
            value: '=ngModel',
            rows: '@'
        },
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: 'views/ui/text.html',
        controller: function ($scope, $element) {
            $scope.ctrl.rows = $scope.ctrl.rows || 4;
        }
    };
}).directive('tFile', function () {
    return {
        scope: {
            label: '@'
        },
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: 'views/ui/file_upload.html',
        controller: function ($scope, $element) {
        }
    };
}).directive('tCheckbox', function () {
    return {
        scope: {
            label: '@',
            checkers: '@',
            value: '=ngModel',
            options: '=',
            vertical: '=',
            help: '@'
        },
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: 'views/ui/checkbox.html',
        controller: function ($scope, $element, uiUtil) {
            $scope.ctrl.customChecker = function () {
                return uiUtil.getNeedMultiSelectMsg($scope.ctrl.checkers, $scope.ctrl.value, $element);
            }
        }
    };
}).directive('tRadio', function () {
    return {
        scope: {
            label: '@',
            checkers: '@',
            value: '=ngModel',
            options: '=',
            help: '@'
        },
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: 'views/ui/radio.html',
        controller: function ($scope, $element, uiUtil) {
            $scope.ctrl.customChecker = function () {
                return uiUtil.getNeedSingleSelectMsg($scope.ctrl.checkers, $scope.ctrl.value, $element);
            }
        }
    };
}).directive('tDate', function () {
    return {
        scope: {
            label: '@',
            checkers: '@',
            value: '=ngModel',
            placeholder: '@'
        },
        controllerAs: "ctrl",
        bindToController: true,
        templateUrl: 'views/ui/date_picker.html',
        controller: function ($scope, $element, uiUtil) {
            $scope.ctrl.placeholder = $scope.ctrl.placeholder || 'YYYY-MM-DD';
            $scope.dateOptions = {
                minDate: new Date(1910, 0, 1),
                maxDate: new Date(2037, 11, 31)
            };
            $scope.datePickerPopup = {
                opened: false
            };

            $scope.openDatePicker = function () {
                $scope.datePickerPopup.opened = true;
            };

            $scope.ctrl.valueDate = new Date($scope.ctrl.value * 1000);

            $scope.$watch('ctrl.valueDate', function (val) {
                if (!val) {
                    $scope.ctrl.value = null;
                    return;
                }

                if (val > $scope.dateOptions.maxDate) {
                    $scope.ctrl.valueDate = $scope.dateOptions.maxDate;
                } else if (val < $scope.dateOptions.minDate) {
                    $scope.ctrl.valueDate = $scope.dateOptions.minDate;
                }
                $scope.ctrl.value = $scope.ctrl.valueDate.getTime() / 1000;
            });
        }
    };
}).directive('tSingleSelect', function () {
    return {
        scope: {
            label: '@',
            checkers: '@',
            value: '=ngModel',
            placeholder: '@',
            options: '=' //need array like [{text:'',value:''},{text:'',value:''}]
        },
        templateUrl: 'views/ui/single_select.html',
        controllerAs: "ctrl",
        bindToController: true,
        controller: function ($scope, $element, uiUtil) {
            $scope.ctrl.placeholder = $scope.placeholder || '请选择或搜索相关条目';
            $scope.ctrl.customChecker = function () {
                return uiUtil.getNeedSingleSelectMsg($scope.ctrl.checkers, $scope.ctrl.value, $element);
            }
        }
    };
}).directive('tMultiSelect', function () {
    return {
        scope: {
            label: '@',
            checkers: '@',
            value: '=ngModel',
            placeholder: '@',
            options: '=' //need array like [{text:'',value:''},{text:'',value:''}]
        },
        templateUrl: 'views/ui/multi_select.html',
        controllerAs: "ctrl",
        bindToController: true,
        controller: function ($scope, $element, uiUtil) {
            $scope.ctrl.placeholder = $scope.placeholder || '请选择或搜索相关条目';
            $scope.ctrl.customChecker = function () {
                return uiUtil.getNeedMultiSelectMsg($scope.ctrl.checkers, $scope.ctrl.value, $element);
            }
        }
    }
}).directive('tSwitch', function () {
    return {
        scope: {
            value: '=ngModel',
            ngClass: '@'
        },
        templateUrl: 'views/ui/switch.html',
        controller: function ($scope, $element) {
        }
    }
}).directive('tPanel', function () {
    return {
        scope: {
            label: '@',
            footer: '=',
            fullscreen: '='
        },
        templateUrl: 'views/ui/panel.html',
        transclude: {
            'header': '?tPanelHeader',
            'body': 'tPanelBody',
            'footer': '?tPanelFooter'
        },
        controller: function ($scope, $element) {
        }
    }
}).directive('tigerFullscreen', function () {
    return {
        scope: {},
        template: '<span class="fullscreen-btn" title="全屏"><i class="fa fa-expand cursor-pointer" fullscreen-widget></i></span>',
        replace: true,
        transclude: true
    }
}).directive('tTab', function () {
    return {
        scope: {
            tabs: '=',
            activeIndex: '=',
            justified: '='
        },
        templateUrl: 'views/ui/tab.html',
        transclude: true,
        controller: function ($scope, $element) {

            $scope.activeIndex = $scope.activeIndex || 0;

            $scope.select = function (index) {
                $scope.activeIndex = index;
            }
        }
    }
}).directive('tSearchBar', function () {
    return {
        scope: {
            ngModel: '=',
            searchFunc: '='
        },
        templateUrl: 'views/ui/search_bar.html',
        controller: function ($scope) {
        }
    };
}).directive('tTreeEditor', function (uiModalService) {
    return {
        scope: {
            maxHeight: '@?',
            list: '=',
            canEditNode: '=?',
            editNodeFunc: '=?',
            saveNodeFunc: '=?',
            collapsedNode: '=?'
        },
        templateUrl: 'views/ui/tree_editor.html',
        controller: function ($scope) {
            $scope.list = $scope.list || [];
            $scope.collapsedNode = !!$scope.collapsedNode;

            $scope.canEditNodeFunc = function (item) {
                if (typeof $scope.canEditNode == 'undefined') {
                    return true;
                } else if (typeof $scope.canEditNode != 'function') {
                    return $scope.canEditNode;
                } else {
                    return $scope.canEditNode(item);
                }
            };

            // for (var i = 0; i < 20; i++) {
            //     $scope.list.push({
            //         id: 1,
            //         title: "Item " + i,
            //         items: []
            //     });
            // }
            $scope.selectedItem = {};
            $scope.options = {};

            $scope.treeStyle = {};
            if ($scope.maxHeight) {
                $scope.treeStyle = {
                    'maxHeight': $scope.maxHeight + 'px',
                    'overflowY': 'scroll'
                };
            }

            var scrollToNextElement = function (element) {
                var tree = $('.angular-ui-tree');
                var top = getElementTop(element);
                top += tree.scrollTop() + element.height() * 2.5;
                setTimeout(function () {
                    tree.scrollTop(top);
                }, 0);
            };

            var editItem = function (item) {
                if (!$scope.canEditNodeFunc(item)) {
                    return;
                }
                if ($scope.editNodeFunc) {
                    $scope.editNodeFunc(item);
                } else {
                    item.editing = true;
                    item.changed = item.title;
                }
            };

            $scope.deleteItem = function (item, scope) {
                if (!$scope.canEditNodeFunc(item)) {
                    return;
                }

                if (item.title) {
                    uiModalService.yesOrNo({
                        title: '确认删除 ' + item.title,
                        okBtnText: '删除',
                        okBtnClass: 'btn btn-danger'
                    }).then(function () {
                        scope.remove();
                        $scope.saveNodeFunc();
                    });
                } else {
                    scope.remove();
                }
            };

            $scope.cancelEditItem = function (item) {
                item.editing = false;
                item.changed = null;
            };

            $scope.editItem = function (item) {
                editItem(item);
            };

            $scope.saveItem = function (item) {
                if (item.changed.length > 0) {
                    item.error = null;
                    item.title = item.changed;
                    item.i18n = item.i18n || {};
                    item.i18n.zh = item.changed;
                    $scope.cancelEditItem(item);
                } else {
                    item.error = '请输入内容';
                }
            };

            $scope.newSubItem = function (scope) {
                if (scope.collapsed) {
                    scope.toggle();
                }
                if (!$scope.canEditNodeFunc(scope.$modelValue)) {
                    return;
                }

                if ($scope.editNodeFunc) {
                    $scope.editNodeFunc(null, scope);

                } else {
                    var nodeData;
                    nodeData = scope.$modelValue;
                    var item = {
                        id: 0,
                        title: '',
                        children: []
                    };
                    //在子节点的最顶端插入
                    if (!nodeData.children) {
                        nodeData.children = [];
                    }
                    nodeData.children.splice(0, 0, item);

                    editItem(item);
                    localSearch(nodeData.title);
                }
            };

            var localSearch = function (key) {
                var top = didSearch($scope.list, key).height;
                var tree = $('.angular-ui-tree');
                top = top - tree.height() / 2 - 21;
                tree.scrollTop(top);
            };

            $scope.search = function () {
                localSearch($scope.key);
            };

            var didSearch = function (items, key) {
                if (!key) {
                    return {found: false, height: 0};
                }
                var found = false;
                var height = 0;
                _.each(items, function (v) {
                    height += 42 + 5;
                    if (_.lowerCase(v.title).indexOf(_.lowerCase(key)) >= 0) {
                        found = true;
                        return false;
                    } else if (v.children.length > 0) {
                        var result = didSearch(v.children, key);
                        height += result.height;
                        if (result.found) {
                            found = result.found;
                            return false;
                        }
                    }
                });
                return {found: found, height: height};
            };
        }
    }
}).directive('tTreeSelect', function () {
    return {
        scope: {
            maxHeight: '=',
            list: '=ngModel',
            selectedItem: '=',
            maxSelectCount: '=',//最大选择个数,此参数和link互斥
            link: '=' //是否联动子元素
        },
        templateUrl: 'views/ui/tree_select.html',
        controller: function ($scope) {
            $scope.key = '';
            $scope.maxSelectCount = $scope.maxSelectCount || 0;
            $scope.selectedItem = $scope.selectedItem || [];
            $scope.maxHeight = $scope.maxHeight || 300;
            if (!$scope.list) {
                $scope.list = [];
                var createItems = function (items, suffix) {
                    var list = [];
                    for (var i = suffix; i < suffix + 1; i++) {
                        list.push({
                            id: i,
                            title: "Item " + suffix + i,
                            items: items
                        });
                    }
                    return list;
                };

                var list1 = createItems([], 1);
                var list2 = createItems([], 2);
                var list3 = createItems([], 3);
                list1 = createItems(list1.concat(list3), 4);
                list2 = createItems(list2, 5);
                $scope.list = list1.concat(list2);
            }


            var selectParentItem = function (scope) {
                var parent = scope.$parentNodeScope;
                if (parent != undefined) {
                    var item = parent.$modelValue;
                    var selectedCount = 0;
                    _.each(item.items, function (v) {
                        if (v.selected) {
                            selectedCount++;
                        }
                    });
                    //子节点全选,再下层不管
                    item.selected = selectedCount == item.items.length;
                    changeSelectedItem(item);
                    //子节点有被选中的(这个不区分全选还是只选了一个,所以html应该优先判断item.selected)
                    item.hasSelectedChildren = selectedCount > 0;
                    selectParentItem(parent);
                }
            };

            var selectChildItem = function (item) {
                if (item != undefined) {
                    console.log('selectChildItem: ' + item.id);
                    var selected = item.selected;
                    changeSelectedItem(item);
                    if (item.items.length > 0) {
                        item.hasSelectedChildren = selected;
                        _.each(item.items, function (v) {
                            v.selected = selected;
                            selectChildItem(v);
                        })
                    }
                }
            };

            var changeSelectedItem = function (item) {
                if (item.selected) {
                    if ($scope.isMaxSelected()) {
                        item.selected = false;
                        return;
                    }
                    $scope.selectedItem.push(item);
                } else {
                    _.each($scope.selectedItem, function (v, k) {
                        if (item.id == v.id) {
                            $scope.selectedItem.splice(k, 1);
                            return false;
                        }
                    })
                }
            };

            $scope.isMaxSelected = function () {
                //maxSelectCount为0时,不限制选择
                if ($scope.maxSelectCount > 0 && !$scope.link) {
                    return $scope.selectedItem.length >= $scope.maxSelectCount;
                } else {
                    return false;
                }
            };

            $scope.selectItem = function (scope) {
                var item = scope.$modelValue;
                if ($scope.link) {
                    selectParentItem(scope);
                    selectChildItem(item);
                } else {
                    changeSelectedItem(item);
                }
            };

            $scope.$watch('key', function (val) {
                console.log(val);
                filter($scope.list, val);
            });

            var filter = function (items, key) {
                var hasOneFound = false;
                _.each(items, function (v) {
                    var found = false;
                    if (!key) {
                        found = true;
                    } else {

                        found = _.lowerCase(v.title).indexOf(_.lowerCase(key)) >= 0;
                    }

                    if (v.items.length > 0) {
                        found = filter(v.items, key) || found;
                    }
                    v.hidden = !found;
                    hasOneFound = found || hasOneFound;
                });
                return hasOneFound;
            }
        }
    }
});
