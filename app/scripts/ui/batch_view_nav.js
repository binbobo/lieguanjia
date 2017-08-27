/**
 * Created by wangbin on 2017/8/15.
 */
"use strict";
angular.module('tiger.ui.batch_view_nav', []).directive('batchViewNav', ['$timeout', function ($timeout) {
    return {
        templateUrl: "views/ui/batch_view_nav.html",
        replace: true,
        scope: {
            data: '=',
            itemClick: '=',
            itemClose: '=',
            activeItemId: '=',
            emptyName: '@'
        },
        controller: function ($scope) {
        },
        link: function ($scope, ele, attr) {
            var frontIndex, tailIndex, listSize;
            var $navWrapper, $itemsWrapper;

            // 游标, 用于指定当前显示页面的首尾项
            frontIndex = tailIndex = -1;
            // 导航栏数据项列表长度
            listSize = $scope.data.length;

            $navWrapper = ele.find('.nav-wrapper');
            $itemsWrapper = $navWrapper.find('ul');

            $timeout(init);

            // 是否为最后一页
            $scope.isLastPage = function () {
                return tailIndex == (listSize - 1);
            }

            // 是否为第一页
            $scope.isFirstPage = function () {
                return frontIndex == 0;
            }

            // 点击导航栏中的某项
            $scope.navItemClick = function (item, evt) {
                if (evt.target.tagName.toLowerCase() === 'i') {
                    // 点击关闭按钮
                    $scope.itemClose(item);
                } else {
                    $scope.itemClick(item);
                }
            }

            // 点击下一页按钮
            $scope.nextBtnClick = function () {
                if (!$scope.isLastPage()) {
                    next();
                    translateNav(true);
                    selectFirst();
                }
            }

            // 点击上一页按钮
            $scope.preBtnClick = function () {
                if (!$scope.isFirstPage()) {
                    previous();
                    translateNav(true);
                    selectFirst();
                }
            }

            // 翻页之后，自动选中当前页面中的第一个
            function selectFirst() {
                $scope.itemClick($scope.data[frontIndex]);
            }

            // resize时, 重新渲染组件
            $(window).on('resize', function () {
                _.debounce(function () {
                    // 外部事件需要手动触发 $digest
                    $scope.$apply(init);
                }, 350)();
            });

            // 组件销毁时， 解绑resize事件 (required! avoding memory leak)
            ele.on('$destroy', function () {
                $(window).off('resize');
            });

            // 初始化
            function init() {
                frontIndex = tailIndex = -1;

                var activeItemIndex = findIndexById();
                if (activeItemIndex == -1) return;

                // 让当前激活的项显示出来
                while (activeItemIndex > tailIndex) {
                    next();
                }

                translateNav(false);
            }

            function findIndexById() {
                for (var i = 0; i < listSize; i++) {
                    if ($scope.data[i].id == $scope.activeItemId) {
                        return i;
                    }
                }
                return -1;
            }


            // 向左偏移导航栏, 实现翻页效果
            function translateNav(isAnimate) {
                if (isAnimate) {
                    $itemsWrapper.css('transition', 'transform 0.7s');
                } else {
                    $itemsWrapper.css('transition', 'none');
                }
                $itemsWrapper.css({
                    'transform': 'translateX(-' + getRegionWidth(0, frontIndex) + 'px)',
                    'visibility': 'visible'
                });
            }

            // 获取一段范围内的li宽度总和, 用于设置导航栏偏移量, 实现翻页效果
            function getRegionWidth(start, end) {
                if (end <= start) {
                    return 0;
                }
                var $list = getRegionList(start, end);
                var totalWidth = 0;
                $list.each(function () {
                    totalWidth += $(this).width();
                });
                return totalWidth;
            }

            // 获取一段范围内的li列表
            function getRegionList(start, end) {
                return $itemsWrapper.find('li').slice(start, end); // 左闭右开, 不包含end
            }

            // 获取导航栏Wrapper的宽度： 当前元素宽度减去三个翻页按钮的宽度
            function getNavWrapperWidth() {
                return ele.width() - 50 * 3;
            }

            // 向前翻页 移动front, tail两个指针位置
            function previous() {
                var $list, totalWidth, i, navWrapperWidth;
                $list = getRegionList(0, listSize);
                navWrapperWidth = getNavWrapperWidth();

                tailIndex = frontIndex - 1;
                i = tailIndex;

                // 判断某一项的宽度是否超出整个navWrapper的宽度(浏览器窗口很小，项宽很大, 很特殊的情况)
                if ($list.eq(tailIndex).width() >= navWrapperWidth) {
                    frontIndex = tailIndex;
                } else {
                    // 累加列表项宽度和, 看看当前导航组件能够容纳下几个项
                    totalWidth = 0;
                    for (; i >= 0; i--) {
                        totalWidth += $list.eq(i).width();
                        if (totalWidth > navWrapperWidth) {
                            frontIndex = i + 1;
                            return;
                        }
                    }
                    // first page
                    frontIndex = 0;
                }
            }

            // 向后翻页 移动front, tail两个指针位置
            function next() {
                var $list, totalWidth, i, navWrapperWidth;
                $list = getRegionList(0, listSize);
                navWrapperWidth = getNavWrapperWidth();

                frontIndex = tailIndex + 1;
                i = frontIndex;

                if ($list.eq(frontIndex).width() >= navWrapperWidth) {
                    tailIndex = frontIndex;
                } else {
                    totalWidth = 0;
                    for (; i < listSize; i++) {
                        totalWidth += $list.eq(i).width();
                        if (totalWidth > navWrapperWidth) {
                            // 保证每个导航菜单显示完整
                            tailIndex = i - 1;

                            // console.log(totalWidth, navWrapperWidth, frontIndex, tailIndex)
                            return;
                        }
                    }
                    // last page
                    tailIndex = listSize - 1;
                }
            }

            // 单个点击下一项
            $scope.nextItem = function () {
                if ($scope.isLastItem()) return;

                var activeIndex = findIndexById();
                $scope.itemClick($scope.data[++activeIndex]);
                if (activeIndex > tailIndex) {
                    $scope.nextBtnClick();
                }
            }

            // 当前激活的是否为最后一个项
            $scope.isLastItem = function () {
                return findIndexById() == (listSize - 1);
            }
        }
    };
}]).directive('batchViewNavFixed', ['$timeout', function ($timeout) {
    // 用于校正导航组件(fixed)宽度

    return {
        restrict: 'A',
        link: function (scope, ele) {
            var $app = $("#app");

            $timeout(function () {
                setBatchViewNavWidth(false);
            }, 150);

            // 设置导航组件的宽度与内容区域保持一致
            function setBatchViewNavWidth(isAnimate) {
                var delay = isAnimate ? 500 : 0;

                if (isNavCollapsedMin()) {
                    // 触发resize， 让导航组件重新渲染一下
                    ele.stop().animate({'padding-left': '50px'}, delay, $(window).resize.bind($(window)));
                } else {
                    ele.stop().animate({'padding-left': '180px'}, delay, $(window).resize.bind($(window)));
                }
            }

            // 判断一级菜单是否collapsed
            function isNavCollapsedMin() {
                return $app.hasClass("nav-collapsed-min");
            }

            scope.$on('batchView.navToggleCollapsed', function () {
                setBatchViewNavWidth(true);
            });
        }
    };
}]);
