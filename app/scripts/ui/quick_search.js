angular.module('tiger.ui.quick_search', []).directive('quickSearch', function () {
    return {
        replace: true,
        templateUrl: "views/ui/quick_search.html",
        controller: 'quickSearchCtrl'
    }
}).controller('quickSearchCtrl', function ($scope, $element, $rootElement, $state, searchService) {
    $scope.expanded = false;
    $scope.isPopup = false;
    $scope.searchQuery = null;
    $scope.result = {};
    $scope.resultIdArr = [];

    $scope.selectedIndex = 0;
    $scope.selected = null;

    $scope.openQuickSearch = function () {
        $scope.expanded = true;
        $element.find('input').select();
    };

    $scope.reset = function () {
        $scope.searchQuery = null;
        $scope.result = {};
        $scope.expanded = false;
    };

    $scope.toItem = function (moduleName, id) {
        if (moduleName === 'resume') {
            $state.go('candidate_view.default', {
                candidateId: id
            });
        } else if (moduleName === 'company') {
            $state.go('company_view', {
                companyId: id
            });
        } else if (moduleName === 'project') {
            $state.go('project_view', {
                projectId: id
            });
        }

        $scope.reset();
    };

    $scope.inputKeydown = function ($event) {
        if ($event.key === 'ArrowDown') {
            if ($scope.selectedIndex >= $scope.resultIdArr.length) {
                return;
            }
            $scope.selectedIndex++;
            $event.preventDefault();
        } else if ($event.key === 'ArrowUp') {
            if ($scope.selectedIndex <= 0) {
                return;
            }
            $scope.selectedIndex--;
            $event.preventDefault();
        } else if ($event.key === 'Enter') {
            $scope.toItem($scope.selected.type, $scope.selected.id);
        } else if ($event.key === 'Escape') {
            $scope.expanded = false;
        }
    };

    $scope.hoverThis = function (item) {
        $scope.selectedIndex = item.selectedIndex;
    };

    $scope.$watch('searchQuery', function () {
        if (!$scope.searchQuery) {
            $scope.isPopup = false;
            return;
        }
        searchService.quickSearch($scope.searchQuery).then(function (data) {
            $scope.result = data;
            $scope.isPopup = true;
            $scope.resultIdArr = [];

            angular.forEach(['resume', 'company', 'project'], function (subType) {
                angular.forEach(data[subType].list, function (item) {
                    item.selectedIndex = $scope.resultIdArr.length;
                    item.selectedType = subType;
                    $scope.resultIdArr.push({
                        type: subType,
                        id: item.id
                    });
                })
            });

            $scope.selectedIndex = 0;
            $scope.selected = $scope.resultIdArr[0];
        });
    });

    $scope.$watch('selectedIndex', function (newIndex) {
        if (newIndex < 0 || newIndex >= $scope.resultIdArr.length) {
            return;
        }
        $scope.selected = $scope.resultIdArr[newIndex];
    });

    $rootElement.on('click.quick_search', function (event) {
        if ($(event.target).closest('.quick-search').length === 0) {
            $scope.expanded = false;
            $scope.$apply();
        }
    });
});
