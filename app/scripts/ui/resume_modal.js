angular.module('tiger.ui.resume_modal', []).service('resumeModal', function ($uibModal) {
    this.duplicateAlert = function () {
        return $uibModal.open({
            animation: false,
            templateUrl: 'views/candidate/modal/duplicate_alert.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.ok = function (isDrop) {
                    $uibModalInstance.close(isDrop);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }
        }).result;
    };

    this.duplicateAlertWithResumeAbstract = function (resumeAbstract) {
        return $uibModal.open({
            animation: false,
            templateUrl: 'views/candidate/modal/duplicate_alert.html',
            controller: function ($scope, $uibModalInstance) {
                $scope.resumeAbstract = resumeAbstract;

                $scope.ok = function (isDrop) {
                    $uibModalInstance.close(isDrop);
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }
        }).result;
    };

    this.selectResumeForProject = function (project) {
        return $uibModal.open({
            animation: false,
            // templateUrl: 'views/search/search.html',
            templateUrl: 'views/candidate/modal/select_candidate.html',
            size: 'lg',
            resolve: {
                searchParamData: function (searchService) {
                    return searchService.listSearchParamByCache(1);
                },
                company: function (companyService) {
                    var company;
                    if (project.basicInfo.Fcompany_id) {
                        company = companyService.getCompanyWithoutPermission(project.basicInfo.Fcompany_id.value);
                    }
                    return company;
                }
            },
            controller: function ($scope, $rootScope, $controller, $uibModalInstance, config, treecontrollConfig, searchParamData, company) {
                $scope.moduleId = 1;
                $scope.indexName = 'resume';
                $scope.rawSearchParamList = searchParamData;

                $scope.options = {
                    canEditFolder: false,
                    canEditQuickSearch: false
                };

                $scope.treeOpts = treecontrollConfig;

                $scope.operation = {
                    noSingleOperation: true,
                    batchWithoutListKey: [
                        {
                            title: '加入当前项目',
                            i18n: {
                                zh: '加入当前项目',
                                en: 'Join Project'
                            },
                            func: function (list) {
                                $uibModalInstance.close(list);
                            }
                        }
                    ],
                    comment: {
                        previewList: function (item) {
                            $rootScope.previewFile('comment', {
                                itemId: item.id,
                                moduleId: config.moduleIdConfig[config.moduleMap.candidate].commentModuleId
                            });
                        }
                    }
                };

                var defaultSearchParamCondition = [];
                // defaultSearchParamCondition.push({
                //     "name": "moduleType",
                //     "title": null,
                //     "i18n": {
                //         "zh": "人才类型",
                //         "en": "resume_type"
                //     },
                //     "condition_type": "terms",
                //     "condition": [
                //         {
                //             "id": 11,
                //             "value": 11,
                //             "type": 303,
                //             "title": "候选人",
                //             "i18n": {
                //                 "zh": "候选人",
                //                 "en": "Candidate"
                //             },
                //             "color": "#00FF00",
                //             "time": 0,
                //             "children": []
                //         }
                //     ],
                //     "advance": {}
                // });

                if (project.basicInfo.Fcity && project.basicInfo.Fcity.length > 0) {
                    defaultSearchParamCondition.push({
                        "name": "basicInfo.Fcity",
                        "title": "basic_city",
                        "i18n": {
                            "zh": "所在城市",
                            "en": "city"
                        },
                        "condition_type": "generalItem",
                        "condition": project.basicInfo.Fcity,
                        "advance": {}
                    });
                }

                if (project.basicInfo.Ffunction && project.basicInfo.Ffunction.length > 0) {
                    defaultSearchParamCondition.push({
                        "name": "basicInfo.Ffunction",
                        "title": "basic_function",
                        "i18n": {
                            "zh": "职能",
                            "en": "function"
                        },
                        "condition_type": "generalItem",
                        "condition": project.basicInfo.Ffunction,
                        "advance": {}
                    });
                }

                if (company) {
                    if (company.basicInfo.Findustry_ids && company.basicInfo.Findustry_ids.length > 0) {
                        defaultSearchParamCondition.push({
                            "name": "basicInfo.Findustry",
                            "title": "basic_industry",
                            "i18n": {
                                "zh": "行业",
                                "en": "industry"
                            },
                            "condition_type": "generalItem",
                            "condition": company.basicInfo.Findustry_ids,
                            "advance": {}
                        });
                    }
                }

                if (defaultSearchParamCondition.length > 0) {
                    $scope.defaultSearchParam = {
                        id: -2,
                        title: '符合 ' + project.basicInfo.Fproject_name,
                        json: {
                            condition: defaultSearchParamCondition
                        }
                    };
                }

                $scope.fieldInTable = config.moduleIdConfig[$scope.moduleId].tableDefaultFieldList || [];
                $controller('searchBaseCtrl', {$scope: $scope});

                $scope.confirm = function () {
                    var param = $scope.operation.batchGetSelectList();

                    if (!param.searchParam && (!param.ids || param.ids.length === 0)) {
                        $uibModalInstance.dismiss();
                        return;
                    }
                    $uibModalInstance.close($scope.operation.batchGetSelectList());
                };

                $scope.cancel = function () {
                    $uibModalInstance.dismiss();
                };
            }

        }).result;
    };
});
