"use strict";
angular.module('tiger.ctrl.search', ['tiger.api.search']).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('search', {
        url: '/search/{moduleId:int}?k&{page:int}&{quick:int}&pipeline&s&st&q',
        templateUrl: 'views/search/search.html',
        controller: 'searchCtrl',
        data: {
            title: '搜索'
        },
        resolve: {
            searchParamData: function ($state, $stateParams, searchService) {
                if ($state.current.name === 'search') {
                    // 依然在search列表
                    if ($state.params.moduleId !== $stateParams.moduleId) {
                        // 切换了列表
                        // 全文搜索
                        $stateParams.k = undefined;
                        // 翻页
                        $stateParams.page = undefined;
                        // 快速搜索
                        $stateParams.quick = undefined;
                        // 搜索条件
                        $stateParams.q = undefined;
                        // 排序
                        $stateParams.s = undefined;
                        $stateParams.st = undefined;
                        // Pipeline
                        $stateParams.pipeline = undefined;
                    }

                    if ($stateParams.q) {
                        return searchService.listSearchParamByCache($stateParams.moduleId);
                    }
                }

                return searchService.listSearchParam($stateParams.moduleId);
            }
        }
    });
}).controller('searchBaseCtrl', function ($scope, $rootScope, $document, $filter, ngToast, config, localStorageService,
                                          apiService, searchService, candidateService, projectService, companyService,
                                          folderService, folderModalService, uiModalService) {
    $scope.loadList = false;

    // 最终数据
    $scope.list = [];

    $scope.options = angular.extend({
        canEditFolder: true,
        canEditQuickSearch: true
    }, $scope.options);

    $scope.fieldList = [];
    $scope.folderList = [];

    $scope.defaultSearchParam = $scope.defaultSearchParam || null; // 根据请求预先生成的快速搜索
    $scope.selectedSearchParam = $scope.selectedSearchParam || null;
    $scope.searchParamList = [];
    $scope.searchParamPrimaryList = [];

    $scope.currentSearchParam = {};
    $scope.conditionList = $scope.conditionList || [];
    $scope.keyword = $scope.keyword || '';

    $scope.sortByField = $scope.sortByField || null;
    $scope.sortByType = $scope.sortByType || null;

    $scope.selectedFolder = $scope.selectedFolder || null;
    $scope.tmpSelectedNodes = {};
    $scope.expandedFolders = [];

    $scope.conditionEditShow = null;
    $scope.conditionOnRight = false;
    $scope.tmp = {};
    $scope.tmpSearchType = {};
    $scope.tmpFieldInfo = {};

    $scope.pipelineCurrentStatus = $scope.pipelineCurrentStatus || 'all';

    $scope.pageState = angular.extend({
        listLength: localStorageService.get("list_length:" + $scope.moduleId) || 25,
        offset: 0,
        page: 1
    }, $scope.pageState);
    $scope.pageState.total = $scope.pageState.page * $scope.pageState.listLength;
    $scope.pageState.totalAvailable = $scope.pageState.total;

    var getCreatorCondition = function () {
        return {
            name: "creator",
            i18n: {
                zh: "创建者",
                en: "creator"
            },
            condition_type: "terms",
            condition: [
                {
                    id: $rootScope.account.id,
                    value: $rootScope.account.id,
                    title: $rootScope.account.name,
                    i18n: {
                        zh: $rootScope.account.name,
                        en: $rootScope.account.nameEng
                    },
                    color: "#00FF00"
                }
            ]
        };
    };

    $scope.expandedFolder = function (node) {
        if (!node) {
            return;
        }

        $scope.expandedFolders.push(node);

        if (node.children) {
            angular.forEach(node.children, $scope.expandedFolder);
        }
    };

    $scope.chooseFolder = function (folder, selected) {
        if (!selected) {
            $scope.selectedFolder = null;
        } else {
            if ($scope.selectedSearchParam) {
                $scope.conditionList = [];
            }
            $scope.selectedSearchParam = null;
            $scope.selectedFolder = folder;
        }

        $scope.updateList(true);
    };

    $scope.calcConditionPosition = function ($index) {
        var $ele = $('.condition-edit-list-item-' + $index + ' .condition-edit-form');

        $scope.conditionOnRight = $(window).width() - $ele.offset().left < $ele.width() + 112;

        $(window).off('click.search_condition').on('click.search_condition', function (ev) {
            if (isTargetInContainer('.condition-edit-list')) {
                return;
            }
            if (isTargetInContainer('.tree-selector-wrap') || isTargetInContainer('.ui-select-container')) {
                // for $templateRequest
                return;
            }
            if (!isTargetInContainer('body')) {
                // ghost element
                return;
            }

            function isTargetInContainer(selector) {
                return $(ev.target).closest(selector).length;
            }

            $scope.conditionEditShow = null;
            $scope.$apply();
            $(window).off('click.search_condition');
        });
    };

    $scope.showConditionEdit = function (fieldItem) {
        if ($scope.conditionEditShow === fieldItem.moduleItem + '.' + fieldItem.name + '.' + $scope.conditionTimeStamp) {
            $scope.conditionEditShow = null;
            return;
        }
        $scope.conditionTimeStamp = Math.round(new Date().getTime() / 1000);
        $scope.conditionEditShow = fieldItem.moduleItem + '.' + fieldItem.name + '.' + $scope.conditionTimeStamp;
    };

    $scope.closeConditionEdit = function () {
        $scope.conditionEditShow = null;
    };

    $document.off('keyup.searchCondition').on('keyup.searchCondition', function (event) {
        if (event.which === 27) {
            if ($scope.conditionEditShow) {
                $scope.conditionEditShow = null;
                $scope.$apply();
                return true;
            }
        }
    });

    $scope.addSearchCondition = function (fieldItem) {
        if (!$scope.tmpSearchType[fieldItem.name] || !$scope.tmpSearchType[fieldItem.name].queryNull) {
            if (!$scope.tmp[fieldItem.name] || (
                    typeof $scope.tmp[fieldItem.name].length !== 'undefined' &&
                    $scope.tmp[fieldItem.name].length === 0
                )
            ) {
                ngToast.warning('请输入筛选条件');
                return;
            }
        } else {
            $scope.tmp[fieldItem.name] = null;
        }

        var conditionType = $filter('fieldItem2SearchType')(fieldItem);

        if (conditionType === 'daterange') {
            if (!$scope.tmp[fieldItem.name].Fstart_time && !$scope.tmp[fieldItem.name].Fend_time) {
                ngToast.warning('请输入筛选条件');
                return;
            }
        } else if (conditionType === 'number') {
            if ($scope.tmp[fieldItem.name].gte === undefined && $scope.tmp[fieldItem.name].lte === undefined) {
                ngToast.warning('请输入筛选条件');
                return;
            }
        }

        if (!!$scope.selectedSearchParam && $scope.selectedSearchParam.primary === 1) {
            $scope.selectedSearchParam = null;
        }

        var fieldName = fieldItem.name;
        if (fieldItem.moduleItem) {
            fieldName = fieldItem.moduleItem + '.' + fieldName;
        }

        // todo 部分属性可以从fieldItem中读取
        $scope.conditionList.push({
            name: fieldName,
            id: fieldItem.id, // field
            title: fieldItem.title, // field
            i18n: fieldItem.i18n, // field
            unit: fieldItem.unit, // field
            item_list: fieldItem.itemList, // field
            condition_type: conditionType, // field
            condition: $scope.tmp[fieldItem.name],
            advance: angular.copy($scope.tmpSearchType[fieldItem.name]) || {}
        });

        $scope.tmp[fieldItem.name] = null;
        $scope.conditionEditShow = null;
        $scope.updateList(true);
    };

    $scope.removeConditionItem = function ($index) {
        $scope.conditionList.splice($index, 1);
        $scope.updateList(true);
    };

    $scope.clearCondition = function () {
        $scope.selectedSearchParam = null;
        $scope.conditionList = [];
        $scope.tmpSearchType = {};
        $scope.updateList(true);
    };

    $scope.field4Search = function (fieldItem) {
        // 实际是 field for
        var tmp = angular.extend({}, fieldItem);
        if (fieldItem.name === 'Fcity' || fieldItem.name === 'Ffunction') {
            tmp.number = $scope.moduleId === 1 ? 3 : 1;
        } else if (fieldItem.name === 'Findustry') {
            tmp.number = $scope.moduleId === 1 ? 10 : 1;
        } else if (fieldItem.name === 'Fsex') {
            tmp.dataType = 'radio';
        } else if (fieldItem.name === 'Fcompany_id') {
            tmp.dataType = 'match_phrase';
        } else if (fieldItem.name === 'moduleType') {
            tmp.dataType = 'radio';
        } else if (fieldItem.name.indexOf('salary') > 0) {
            tmp.dataType = 'number';
            var unit = {
                title: "万",
                i18n: {
                    zh: "万"
                }
            };
            tmp.unit = unit;
            fieldItem.unit = unit
        } else if (fieldItem.name === 'Fwork_year') {
            tmp.dataType = 'number';
            //tmp.unit = '年';
        } else if (fieldItem.name === 'Ftag') {
            tmp.dataType = 'tag';
        } else if (fieldItem.name === 'Ftype') {
            tmp.dataType = 'select';
        }

        if (tmp.dataType === 'date') {
            tmp.dataType = 'daterange';
            tmp.noNotEnded = 1;
        } else if (tmp.dataType === "multiselect") {
            tmp.number = 0;
        }
        $scope.tmpFieldInfo[fieldItem.name] = tmp;
    };

    $scope.loadSearchParam = function (id) {
        searchService.listSearchParam($scope.moduleId).then($scope.handleSearchParamFactory(id));
    };

    $scope.updateSearchParam = function (paramItem) {
        var json = {
            queryStr: $scope.getESJson(),
            condition: $scope.conditionList,
            keyword: $scope.keyword
        };

        if (!paramItem) {
            paramItem = {};
        }

        if (paramItem.title && paramItem.primary !== 1) {
            return searchService.updateSearchParam(
                $scope.moduleId, paramItem.id, paramItem.title, json
            ).then(function () {
                $scope.loadSearchParam();
            });
        }

        uiModalService.simpleInput('请输入名称').then(function (data) {
            if (data) {
                if (paramItem.primary !== 1) {
                    paramItem.title = data;
                }
                return searchService.updateSearchParam($scope.moduleId, 0, data, json).then(function (data) {
                    $scope.loadSearchParam(data);
                });
            } else {
                return uiModalService.alert('请输入名称');
            }
        });
    };
    $scope.selectSearchParam = function (paramItem) {
        if (!paramItem) {
            return;
        }
        if ($scope.selectedSearchParam && $scope.selectedSearchParam.id === paramItem.id) {
            $scope.selectedSearchParam = null;
            $scope.conditionList = [];
            $scope.keyword = null;
            $scope.updateList(true);
            return;
        }

        $scope.selectedFolder = null;
        $scope.tmpSelectedNodes = {};

        $scope.selectedSearchParam = paramItem;
        var obj = typeof paramItem.json === 'object' ? paramItem.json : JSON.parse(paramItem.json);

        if (!obj || !obj.condition) {
            return;
        }

        if (obj.keyword) {
            $scope.keyword = obj.keyword;
        }
        $scope.conditionList = obj.condition;

        if (paramItem.primary && $scope.conditionList.length > 0) {
            if ($scope.moduleId !== 9) {
                $scope.conditionList.push(getCreatorCondition());
            }
        }

        if ($scope.initedList) {
            $scope.updateList(true);
        }
    };

    $scope.deleteSearchParam = function (paramItem, $event) {
        uiModalService.yesOrNo({
            title: '您确认要删除吗?',
            okBtnClass: 'btn btn-danger',
            okBtnText: '删除',
            cancelBtnText: '取消'
        }).then(function () {
            return searchService.deleteSearchParam(paramItem.id);
        }).then(function () {
            $scope.loadSearchParam();

            $scope.selectedSearchParam = null;
            $scope.conditionList = [];
            $scope.updateList(true);
        });

        $event.stopPropagation();
    };

    $scope.sortBy = function (fieldItem) {
        if (!$scope.sortByField || $scope.sortByField.name !== fieldItem.name) {
            $scope.sortByField = fieldItem;
            $scope.sortByType = -1;

        } else if ($scope.sortByType === -1) {
            $scope.sortByType = 1;

        } else {
            $scope.sortByField = null;
        }

        $scope.updateList();
    };

    $scope.hasFuzzyCondition = function () {
        var noFuzzyTypeList = [
            'terms', 'generalItem', 'generalItemRange',
            'number', 'range', 'daterange',
            'checkbox'
        ];
        var flag = false;
        angular.forEach($scope.conditionList, function (item) {
            if (noFuzzyTypeList.indexOf(item.condition_type) === -1) {
                flag = true;
            }
        });
        return flag;
    };


    $scope.commonHighlight = {};

    $scope.getESJson = function () {
        $scope.commonHighlight = {};

        var boolConditionList = {
            must: []
        };

        // 加入全文检索条件
        if ($scope.keyword) {
            var arr = $scope.keyword.split(/[ ,，;]+/);

            $scope.commonHighlight._all = arr;
            var searchStr = arr.join(' AND ');
            boolConditionList.must.push({
                query_string: {
                    query: searchStr
                }
            });
        }

        // 加入文件夹条件
        if ($scope.selectedFolder) {
            var folderId = $scope.selectedFolder.permissionType > 0 ? $scope.selectedFolder.id : -1;
            boolConditionList.must.push({
                term: {
                    'folder.value': folderId
                }
            });
        }

        // 拼如条件检索条件
        angular.forEach($scope.conditionList, function (item) {
            var tmp = {}, tmp2;
            if (!item.advance) {
                item.advance = {};
            }
            // tmp[item.condition_type] = {};

            if (item.advance.queryNull) {
                if (item.name === "attachmentTextList") {
                    tmp = {terms: {"stats.attachmentCount": [0]}};
                } else {
                    tmp = {bool: {should: []}};
                    tmp.bool.should.push({
                        missing: {
                            field: item.name,
                            existence: true,
                            null_value: true
                        }
                    });

                    if (item.condition_type === 'generalItem') {
                        tmp2 = {range: {}};
                        tmp2.range[item.name + '.id'] = {gt: 0};
                    } else {
                        tmp2 = {wildcard: {}};
                        tmp2.wildcard[item.name] = '*';
                    }

                    tmp.bool.should.push({
                        bool: {must_not: [tmp2]}
                    });
                }
            } else if (item.condition_type === 'generalItem' ||
                item.condition_type === 'generalItemRange' ||
                item.condition_type === 'terms'
            ) {
                var termsValueList;
                if (item.advance.above) {
                    // 以上
                    termsValueList = [];
                    angular.forEach(item.item_list, function (selectItem) {
                        if (selectItem.order >= item.condition.order) {
                            termsValueList.push(selectItem.value);
                        }
                    });
                } else if (typeof item.condition.value === 'undefined') {
                    // 多选
                    termsValueList = $.map(item.condition, function (item) {
                        return item.value;
                    });
                } else {
                    termsValueList = [item.condition.value];
                }

                tmp = {terms: {}};
                tmp.terms[item.name + '.value'] = termsValueList;

            } else if (item.condition_type === 'generalItemText') {
                tmp = {
                    multi_match: {
                        query: item.condition,
                        fields: [
                            item.name + '.title',
                            item.name + '.i18n.*'
                        ]
                    }
                };

            } else if (item.title === 'tag' || item.title === 'project_basic_tags') {
                tmp = {
                    match_phrase: {}
                };
                tmp.match_phrase[item.name + '.text'] = item.condition;

            } else if (item.condition_type === 'daterange') {
                tmp = {
                    range: {}
                };

                tmp.range[item.name] = {};

                if (item.condition.Fstart_time) {
                    tmp.range[item.name].gte = item.condition.Fstart_time;
                }

                if (item.condition.Fend_time) {
                    tmp.range[item.name].lt = item.condition.Fend_time + 86400;
                }
            } else if (item.condition_type === 'number' || item.condition_type === 'range') {
                if (item.title === 'basic_workYear') {
                    tmp = {
                        bool: {
                            should: []
                        }
                    };
                    var range1 = {
                        range: {}
                    };
                    var range2 = {
                        range: {}
                    };
                    range1.range[item.name] = {};
                    range2.range[item.name] = {};
                    if (item.condition.gte) {
                        range1.range[item.name].gte = item.condition.gte;
                        range1.range[item.name].lte = $rootScope.currentYear - item.condition.gte;
                        if (item.condition.lte) {
                            range2.range[item.name].lte = $rootScope.currentYear - item.condition.gte;
                        }
                    }
                    if (item.condition.lte) {
                        range1.range[item.name].lte = item.condition.lte;
                        range2.range[item.name].gte = $rootScope.currentYear - item.condition.lte;
                    }
                    tmp.bool.should.push(range1);
                    if (!angular.equals({}, range2.range[item.name])) {
                        tmp.bool.should.push(range2);
                    }
                } else {
                    tmp = {
                        range: {}
                    };
                    tmp.range[item.name] = {};

                    if (item.condition.gte) {
                        tmp.range[item.name].gte = item.name.indexOf('salary') > 0 ? item.condition.gte * 10000 : item.condition.gte;
                    }
                    if (item.condition.lte) {
                        tmp.range[item.name].lte = item.name.indexOf('salary') > 0 ? item.condition.lte * 10000 : item.condition.lte;
                    }
                }
            } else if (item.condition_type === 'checkbox') {
                tmp = {
                    term: {}
                };
                tmp.term[item.name] = item.condition;
            } else if (item.condition_type === 'listText' || item.condition_type === 'listGeneralItemText') {
                var isGeneralItem = false;
                var queryType;

                tmp = {
                    bool: {
                        must: []
                    }
                };

                if (item.condition_type === 'listGeneralItemText') {
                    isGeneralItem = true;
                }

                if (item.advance.latest > 0) {
                    // todo 名称结尾必须要list
                    var itemName4Scala = item.name.replace('List.', 'List.first()?.');
                    if (isGeneralItem) {
                        itemName4Scala += '?.title';
                    }

                    var tmpCondition = item.condition;
                    tmpCondition = tmpCondition.replace(/([\/\\])/g, '\\$1');

                    // if (item.advance.fuzzy > 0) {
                    tmp.bool.must.push({
                        script: {
                            script: '_source.' + itemName4Scala + ' ==~ /(?i).*' + tmpCondition + '.*/'
                        }
                    });
                    // } else {
                    //     tmp = {
                    //         script: {
                    //             script: '_source.' + itemName4Scala + ' ==~ /(?i)' + item.condition + '/'
                    //         }
                    //     };
                    // }

                }

                // if (item.advance.fuzzy > 0) {
                queryType = 'match_phrase';
                // } else {
                //     queryType = 'match_phrase';
                // }

                tmp2 = {};
                tmp2[queryType] = {};

                if (isGeneralItem) {
                    tmp2[queryType][item.name + '.title'] = item.condition;
                } else {
                    tmp2[queryType][item.name] = item.condition;
                }

                tmp.bool.must.push(tmp2);
            } else if (item.condition_type === 'wildcard') {
                tmp = {
                    bool: {
                        should: []
                    }
                };
                tmp2 = {wildcard: {}};
                tmp2.wildcard[item.name] = '*' + item.condition + '*';
                tmp.bool.should.push(tmp2);

                tmp2 = {match_phrase: {}};
                tmp2.match_phrase[item.name] = item.condition;
                tmp.bool.should.push(tmp2);

                $scope.commonHighlight[item.name] = '<highlight>' + item.condition + '</highlight>';
            } else {
                tmp = {};
                tmp[item.condition_type] = {};
                tmp[item.condition_type][item.name] = item.condition;
            }

            boolConditionList.must.push(tmp);
        });

        // 加入pipeline条件
        if ($scope.pipelineCurrentStatus !== 'all') {
            boolConditionList.must.push({
                'term': {
                    'lastStatus.value': config.pipelineStatus[$scope.pipelineCurrentStatus]
                }
            });
        }

        var result = {
            query: {
                bool: boolConditionList
            },
            from: $scope.pageState.offset,
            size: $scope.pageState.listLength
        };

        // 加入排序条件
        if ($scope.sortByField) {
            result.sort = {};
            var sortKey = $scope.sortByField.name;
            if ($scope.sortByField.moduleItem) {
                sortKey = $scope.sortByField.moduleItem + '.' + sortKey;
            }
            if ($scope.sortByField.dataType === 'select' || $scope.sortByField.dataType === 'treeselect' ||
                $scope.sortByField.dataType === 'radio') {
                result.sort[sortKey + '.value'] = {
                    order: $scope.sortByType > 0 ? 'asc' : 'desc',
                    ignore_unmapped: true
                }
            } else if ($scope.sortByField.dataType === 'multiemail') {
                result.sort[sortKey] = {
                    mode: 'max',
                    order: $scope.sortByType > 0 ? 'asc' : 'desc',
                    ignore_unmapped: true
                }
            } else {
                result.sort[sortKey] = {
                    order: $scope.sortByType > 0 ? 'asc' : 'desc',
                    ignore_unmapped: true
                }
            }
            // } else if (!$scope.conditionList.length && !$scope.keyword) {
        } else if (!$scope.hasFuzzyCondition()) {
            if ($scope.moduleId == config.moduleMap.document) {
                result.sort = {
                    time: {
                        order: 'desc',
                        ignore_unmapped: true
                    }
                };
            } else {
                result.sort = {
                    updateTime: {
                        order: 'desc',
                        ignore_unmapped: true
                    }
                };
            }
        }

        var highlightFields = {};
        angular.forEach($scope.conditionList, function (item) {
            highlightFields[item.name] = {};
        });

        result.highlight = {
            pre_tags: [
                "<highlight>"
            ],
            post_tags: [
                "</highlight>"
            ],
            _source: false,
            require_field_match: true,
            fields: highlightFields
        };

        if ($scope.indexName === 'document') {
            result._source = {
                "excludes": [
                    "attachmentTextList"
                ]
            };
        }

        return result;
    };

    $scope.initedList = false;
    /**
     * 更新列表
     * @param reset 是否回到第一页
     */
    $scope.updateList = function (reset) {
        $scope.loadList = true;

        if (reset) {
            $scope.pageState.page = 1;
        }

        if ($state.current.name === "search") {

            var stateParams = {
                moduleId: $scope.moduleId,
                q: JSON.stringify($scope.conditionList),
                page: $scope.pageState.page,
                k: $scope.keyword
            };

            if ($scope.moduleId === 10) {
                stateParams.pipeline = $scope.pipelineCurrentStatus;
            }

            // if ($scope.tmpSearchType && !angular.equals({}, $scope.tmpSearchType)) {
            //     stateParams.tst = JSON.stringify($scope.tmpSearchType);
            // }

            if ($scope.sortByField) {
                stateParams.s = JSON.stringify({
                    moduleItem: $scope.sortByField.moduleItem,
                    name: $scope.sortByField.name,
                    dataType: $scope.sortByField.dataType
                });
                stateParams.st = $scope.sortByType;
            } else {
                stateParams.s = null;
                stateParams.st = null;
            }

            if ($scope.selectedSearchParam) {
                stateParams.quick = $scope.selectedSearchParam.id
            } else {
                stateParams.quick = -1;
            }

            $state.go('search', stateParams, {
                notify: false,
                location: 'replace'
            });
        }

        $scope.currentSearchParam = $scope.getESJson();

        searchService.search($scope.indexName, $scope.currentSearchParam, "normal").then(function (data) {
            $(window).scrollTop(0);

            $scope.list = data.list;

            $scope.pageState.total = data.total;
            $scope.pageState.totalAvailable = data.total;

            $scope.initedList = true;

            if (data.total > config.search.maxLength) {
                $scope.pageState.totalAvailable =
                    config.search.maxLength - $scope.pageState.listLength + 1;
            }

            if (Object.keys($scope.commonHighlight).length) {
                angular.forEach($scope.list, function (item) {
                    item._highlight = angular.extend(item._highlight, $scope.commonHighlight);
                    // item._highlight._all = $scope.keyword.split(/[ ,，;]+/);
                });
            }
        }).finally(function () {
            $scope.loadList = false;
        });

        //pipeline需要根据搜索条件更新pipelineCount
        if ($scope.moduleId == 10) {
            projectService.getPipelineCount($scope.currentSearchParam).then(function (data) {
                $scope.pipelineCount = data;
            });
        }
    };

    $scope.quickEditFunc = false;


    if ($scope.moduleId === 1) {
        $scope.quickEditFunc = candidateService.updateField;
    } else if ($scope.moduleId === 2) {
        $scope.quickEditFunc = projectService.updateField;
    } else if ($scope.moduleId === 3) {
        $scope.quickEditFunc = companyService.updateField;
    } else if ($scope.moduleId === config.moduleMap.project_resume) {
        $scope.quickEditFunc = projectService.updatePipelineField;
    }

    $scope.handleSearchParamFactory = function (id) {
        return function (data) {
            $scope.searchParamList = data.custom;
            $scope.searchParamPrimaryList = data.primary;

            if (id !== -1) {
                angular.forEach($scope.searchParamList, function (item) {
                    if (item.id === id) {
                        $scope.selectSearchParam(item);
                    }
                });
            }

            if (id !== -1 && !$scope.selectedSearchParam) {
                angular.forEach($scope.searchParamPrimaryList, function (item) {
                    if (item.id === id) {
                        $scope.selectSearchParam(item);
                    }
                });
            }

            if (id !== -1 && !$scope.selectedSearchParam) {
                if ($scope.defaultSearchParam) {
                    $scope.selectSearchParam($scope.defaultSearchParam);
                } else {
                    $scope.selectSearchParam($scope.searchParamPrimaryList[0]);
                }
            }
        };
    };

    $scope.editFolder = function () {
        folderModalService.selectFolder(0, true, $scope.moduleId).then(function (data) {
            $scope.initFolderTree();
        });
    };

    $scope.updateStateParams = function () {

    };

    $scope.initFolderTree = function () {
        if ($scope.hideFolder) {
            return;
        }
        folderService.treeFull($scope.moduleId).then(function (data) {
            $scope.folderList = [];
            angular.forEach(data, function (folder) {
                if (!folder.nonePermissionNode) {
                    $scope.folderList.push(folder);
                }
            });
            angular.forEach(data.list, $scope.expandedFolder);
            // $scope.tmpSelectedNodes = $scope.folderList;
        });
    };

    // 加载 folder list
    $scope.initFolderTree();

    $scope.$watch('pageState', function (newValue, oldValue) {
        if ($scope.initedList
            && newValue.page === oldValue.page
            && newValue.listLength === oldValue.listLength) {
            return;
        }

        if (newValue.listLength !== oldValue.listLength) {
            $scope.pageState.page = 1;
        }

        localStorageService.set("list_length:" + $scope.moduleId, $scope.pageState.listLength);

        $scope.pageState.offset = (newValue.page - 1) * $scope.pageState.listLength;
        $scope.updateList();
    }, true);

    $scope.handleSearchParamFactory($scope.selectQuick)($scope.rawSearchParamList);

    // 加载字段列表
    apiService.getFieldListForTable($scope.moduleId).then(function (data) {
        $scope.fieldList = data;
    });
}).controller('searchCtrl', function ($scope, $rootScope, $state, $stateParams, $controller, ngToast,
                                      config, treecontrollConfig, projectService, searchParamData) {
    $scope.treeOpts = treecontrollConfig;

    $scope.moduleId = $stateParams.moduleId;

    $scope.pageState = {};

    //pipeline 暂不支持分组
    $scope.hideFolder = $scope.moduleId === 10 || $scope.moduleId === 9 || $scope.moduleId === 8;


    $scope.changePipelineCurrentStatus = function (newStatus) {
        $scope.pipelineCurrentStatus = newStatus;

        $scope.updateList();
    };

    $scope.indexName = config.moduleIdConfig[$scope.moduleId].name;
    $scope.fieldInTable = config.moduleIdConfig[$scope.moduleId].tableDefaultFieldList || [];

    // loadSearchParam($stateParams.quick);
    $scope.rawSearchParamList = searchParamData;
    $scope.selectQuick = $stateParams.quick;

    $scope.keyword = $stateParams.k;

    if ($stateParams.q) {
        $scope.conditionList = JSON.parse($stateParams.q);
    }

    if ($stateParams.pipeline) {
        $scope.pipelineCurrentStatus = $stateParams.pipeline;
    }

    if ($stateParams.page) {
        $scope.pageState.page = $stateParams.page;
    }

    if ($stateParams.s) {
        $scope.sortByField = JSON.parse($stateParams.s);
    }

    if ($stateParams.st) {
        $scope.sortByType = $stateParams.st;
    }

    switch ($scope.moduleId) {
        case 1:
            $state.current.data.title = '人选列表';
            $scope.moduleTitle = '人才';
            $scope.menuTitle = '人才·人才列表';
            break;
        case 2:
            $state.current.data.title = '项目列表';
            $scope.moduleTitle = '项目';
            $scope.menuTitle = '项目·项目列表';
            break;
        case 3:
            $state.current.data.title = '公司列表';
            $scope.menuTitle = '公司·公司列表';
            $scope.moduleTitle = '公司';
            break;
        case 8:
            $state.current.data.title = '合同列表';
            $scope.moduleTitle = '合同';
            $scope.menuTitle = '合同';
            break;
        case 9:
            $state.current.data.title = '发票列表';
            $scope.moduleTitle = '发票';
            $scope.menuTitle = '发票';
            break;
        case 10:
            $state.current.data.title = 'Pipeline 列表';
            $scope.moduleTitle = 'Pipeline';
            $scope.menuTitle = 'Pipeline';
            $scope.pipelineCount = {};
            projectService.getPipelineCount($scope.currentSearchParam).then(function (data) {
                $scope.pipelineCount = data;
            });
            break;
        case 12:
            $state.current.data.title = '文档列表';
            $scope.moduleTitle = '文档';
            $scope.menuTitle = '文档';

            break;
        default:
    }

    $controller('searchOperationCtrl', {$scope: $scope});
    $controller('searchBaseCtrl', {$scope: $scope});

    $scope.operation.reload = $scope.updateList;

}).controller('searchOperationCtrl', function ($scope, $rootScope, $timeout, $state, ngToast, uiModalService,
                                               candidateService, projectService, companyService, invoiceService,
                                               documentService, folderService, folderModalService, projectResumeModal,
                                               candidateOperationService, contractOperationService,
                                               pipelineOperationService, mailOperationService,
                                               documentOperationService, achievementOperationService,
                                               invoiceOperationService, taskOperationService, localStorageService) {

    $scope.operation = {
        batch: {},
        comment: {},
        folder: {},
        candidate: candidateOperationService,
        pipeline: pipelineOperationService,
        contract: contractOperationService,
        mail: mailOperationService,
        document: documentOperationService,
        achievement: achievementOperationService,
        invoice: invoiceOperationService,
        task: taskOperationService
    };

    $scope.operation.comment.goList = function (item) {
        if ($scope.moduleId === 1) {
            $state.go('candidate_view.commentList', {
                candidateId: item.id,
            });
        } else if ($scope.moduleId === 2) {
            $state.go('project_view.commentList', {
                projectId: item.id,
            });
        } else if ($scope.moduleId === 3) {
            $state.go('company_view.commentList', {
                companyId: item.id,
            });
        } else if ($scope.moduleId === 10) {
            $state.go('candidate_view.commentList', {
                candidateId: item.resumeId,
            });
        }
    };

    function moduleId2CommentModuleId(moduleId) {
        switch (parseInt(moduleId)) {
            case 1:
            case 10:
                return 4;
            case 2:
                return 5;
            case 3:
                return 6;
            case 12:
                return 13;
            default:
                return null;
        }
    }

    $scope.operation.comment.addComment = function (item) {
        var commentModuleId = moduleId2CommentModuleId($scope.moduleId);
        if (!commentModuleId) {
            return;
        }
        uiModalService.editComment(item.id, commentModuleId, 0).then(function () {
            $state.reload();
        });
    };

    $scope.operation.comment.previewList = function (item) {
        var itemId = item.id,
            moduleId = moduleId2CommentModuleId($scope.moduleId);

        if ($scope.moduleId === 10) {
            itemId = item.resumeId;
            moduleId = 4;
        }

        // 如果是简历列表页面 跳转到简历预览页面并且激活备注选项页
        if (moduleId === 4) {
            $rootScope.previewFile('resumeComment', itemId);
        } else {
            $rootScope.previewFile('comment', {
                itemId: itemId,
                moduleId: moduleId,
            });
        }
    };

    $scope.operation.folder.addFolder = function (item) {
        return folderModalService.selectFolder(item.id, false, $scope.moduleId).then(function () {
            $state.reload();
        });
    };

    $scope.operation.batch.deleteCandidate = function (list) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnText: '确定',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function () {
            $scope.loadList = true;

            return candidateService.batchDelete(list);
        }).then(function () {
            $scope.updateList();
            $scope.initFolderTree();
            $scope.loadSearchParam();
        }, function () {
            $scope.loadList = false;
        });
    };

    // 人才列表, 点击批量查看按钮, 处理程序
    $scope.operation.batch.batchViewing = function (list) {
        if(!list || !angular.isArray(list.ids)) return;

        var resumes, tmp;
        resumes = [], tmp = [];

        // 过滤所有当前选择的人才记录
        angular.forEach(list.ids, function (id) {
            var resume = $scope.list.find(function (item) {
                return item.id == id;
            });
            tmp.push(resume);
        });

        // 按照更新时间倒叙排列
        tmp.sort(function (r1, r2) {
            return r2.updateTime - r1.updateTime;
        });

        // 获取 id,projectId,name 等信息
        // projectId,name需要在后续操作中实时更新: projectId在加入新项目时更新, name在修改姓名时更新
        resumes = tmp.map(function (resume) {
            return {
                id: resume.id,
                projectId: undefined, // 初次不需要传 默认会选中最新加入的项目
                name: resume.basicInfo.Fname
            };
        });

        // 在localStorage中存储当前查看的简历列表
        localStorageService.set('batchViewing.resumeList', JSON.stringify(resumes));

        // 跳转批量查看简历页面 默认激活第一个
        $state.go('candidates.candidate_view.default', {
            candidateId: resumes[0].id,
            project_id: resumes[0].projectId
        });
    };

    $scope.operation.batch.deleteProject = function (list) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnText: '确定',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function () {
            $scope.loadList = true;
            return projectService.batchDelete(list);
        }).then(function () {
            $scope.updateList();
            $scope.initFolderTree();
            $scope.loadSearchParam();
        }, function () {
            $scope.loadList = false;
        });
    };

    $scope.operation.batch.deleteCompany = function (list) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnText: '确定',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function () {
            $scope.loadList = true;
            return companyService.batchDelete(list);
        }).then(function () {
            $scope.updateList();
            $scope.initFolderTree();
            $scope.loadSearchParam();
        }, function () {
            $scope.loadList = false;
        });
    };

    $scope.operation.batch.deleteInvoice = function (list) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnText: '确定',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function () {
            $scope.loadList = true;
            return invoiceService.batchDelete(list);
        }).then(function () {
            $scope.updateList();
        }, function () {
            $scope.loadList = false;
        });
    };

    $scope.operation.batch.deleteDocument = function (list) {
        uiModalService.yesOrNo({
            title: '是否删除？',
            okBtnText: '确定',
            okBtnClass: 'btn btn-danger',
            cancelBtnText: '取消'
        }).then(function () {
            $scope.loadList = true;
            return documentService.batchDelete(list);
        }).then(function () {
            $scope.updateList();
            $scope.initFolderTree();
            $scope.loadSearchParam();
        }, function () {
            $scope.loadList = false;
        });
    };

    $scope.operation.batch.joinProject = function (list) {
        projectResumeModal.selectProject(0).then(function (data) {
            $scope.loadList = true;
            return projectService.batchOperation(data.id, list, 1, null);
        }).then(function (data) {
            ngToast.success(data.result > 0 ? "操作成功" : "操作失败");
            $scope.updateList();
        }, function (data) {
            $scope.loadList = false;
        });
    };

    $scope.operation.batch.joinFolder = function (batchParam) {
        $scope.loadList = true;
        folderService.getJoinedFolderByList(batchParam, $scope.moduleId).then(function (data) {
            $scope.loadList = false;

            var total;
            if (batchParam.ids) {
                total = batchParam.ids.length;
            } else {
                total = $scope.pageState.total;
            }

            var selectedFolder = {};
            angular.forEach(data.list, function (item) {
                if (item.count === total) {
                    selectedFolder[item.folderId] = 1;
                } else {
                    selectedFolder[item.folderId] = 2;
                }
            });
            return folderModalService.selectFolderBySelectData(selectedFolder, false, $scope.moduleId);
        }).then(function (data) {
            $scope.loadList = true;
            return folderService.batchJoinFolder($scope.moduleId, data, batchParam);
        }).then(function () {
            $scope.loadList = false;
            // return $timeout(500);
        }, function () {
            $scope.loadList = false;
        }).then(function () {
            $scope.updateList(false);
            $scope.initFolderTree();
        });
    };
});
