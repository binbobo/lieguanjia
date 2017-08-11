// app.nav
// ====================================================================
// This file should included in your project.
//
// - Squaredesigns.net -

"use strict";
angular.module("app.nav", [])

/******************************************
 :: Toggle Nav Collapsed Min Directive
 *******************************************/

    .directive("toggleNavCollapsedMin", function ($rootScope, userSessionStorageService) {
        return {
            restrict: "A",
            link: function (scope, ele, attrs) {
                var $app, $nav, $toggleMin;
                $app = $("#app");
                $nav = $("#nav");
                $toggleMin = $nav.find('a.toggle-min > i');

                return ele.on("click", function (e) {
                    if ($app.hasClass("nav-collapsed-min")) {
                        userSessionStorageService.put('collapsed', false);
                        $app.removeClass("nav-collapsed-min");
                        $toggleMin.removeClass('icon-deploy').addClass('icon-flod');
                    } else {
                        userSessionStorageService.put('collapsed', true);
                        $app.addClass("nav-collapsed-min");
                        $toggleMin.removeClass('icon-flod').addClass('icon-deploy');
                    }
                    $rootScope.$broadcast("nav:reset");

                    return e.preventDefault();
                });
            }
        };
    })

    /******************************************
     :: Second Menu Toggle Collapsed Directive
     *******************************************/

    .directive("secondMenuToggleCollapsed", function ($rootScope, userSessionStorageService) {
        return {
            restrict: "A",
            link: function (scope, ele, attrs) {
                var $app, $secMenu, $contentArea, menuHeight, delay, navWidth, menuWidth, toggleBtnHeight;

                $secMenu = ele.parent("div.second-menu");
                $contentArea = $secMenu.find('~ div');
                $app = $('#app');
                delay = 500;
                menuWidth = 180;
                toggleBtnHeight = 40;

                function updatePos() {
                    if ($app.hasClass('nav-collapsed-min')) {
                        navWidth = 50;
                    } else {
                        navWidth = menuWidth;
                    }

                    menuHeight = $(window).height() - 50;
                    $secMenu.css('height', menuHeight + 'px');
                    ele.css('top', ((menuHeight / 2) - (toggleBtnHeight / 2)) + 'px');
                }

                function expandedStyles() {
                    updatePos();
                    $secMenu.removeClass('collapsed');
                    ele.find('i').removeClass('icon-push').addClass('icon-pull');

                    $secMenu.animate({'left': navWidth + 'px'}, {duration: delay, queue: false});
                    $contentArea.animate({'margin-left': menuWidth + 'px'}, {duration: delay, queue: false});
                }

                function collapsedStyles() {
                    updatePos();
                    $secMenu.addClass('collapsed');
                    ele.find('i').removeClass('icon-pull').addClass('icon-push');

                    $secMenu.animate({'left': (navWidth - menuWidth) + 'px'}, {duration: delay, queue: false});
                    $contentArea.animate({'margin-left': '0px'}, {duration: delay, queue: false});
                }

                // init
                updatePos();

                $(window).on('resize', updatePos);

                return ele.on("click", function (e) {
                    if (!$secMenu.hasClass('collapsed')) {
                        collapsedStyles();
                    } else {
                        expandedStyles();
                    }
                });
            }
        };
    })

    /******************************************
     :: Collapse Nav Directive
     *******************************************/

    .directive("collapseNav", function ($rootScope, userSessionStorageService) {
        return {
            restrict: "A",
            link: function (scope, ele, attrs) {
                var $a, $aRest, $app, $lists, $listsRest, $nav, $window, $subMenuLinks,
                    $toggleMinIcon, $menuTitleSpan, delay;

                $window = $(window);
                $lists = ele.find('ul').parent('li');
                $a = $lists.children("a");
                $listsRest = ele.children("li").not($lists);
                $aRest = $listsRest.children("a");
                $app = $("#app");
                $nav = $("#nav-container");
                $toggleMinIcon = $aRest.filter('.toggle-min').find(' > i');
                $menuTitleSpan = $("#nav").find("> li > a > span");
                delay = 500;

                // 获取一级菜单下面的所有子菜单对应A链接
                $subMenuLinks = $a.find('+ ul li a');
                $subMenuLinks.on('click', function () {
                    navCollapsedMin();
                    expandSecondMenu();
                });

                // 收起一级菜单
                function navCollapsedMin() {
                    if (!userSessionStorageService.has('collapsed') && !$app.hasClass("nav-collapsed-min")) {
                        $app.addClass("nav-collapsed-min");
                        $rootScope.$broadcast("nav:reset");
                    }
                }

                $a.on("click", function (event) {
                    var $parent, $this, $i;
                    if ($app.hasClass("nav-collapsed-min") || ($nav.hasClass("nav-horizontal") && $window.width() >= 768)) {
                        return false;
                    }
                    $this = $(this);
                    $parent = $this.parent("li");
                    $i = $this.find('i').eq(1); // arrow icon
                    $lists.not($parent).removeClass("open").find("ul").slideUp();
                    $parent.toggleClass("open").find("ul").slideToggle();

                    resetArrowDown();
                    // toggle arrow icon
                    if ($parent.hasClass('open')) {
                        $i.removeClass('icon-arrow-down').addClass('icon-arrow-up');
                    } else {
                        $i.removeClass('icon-arrow-up').addClass('icon-arrow-down');
                    }

                    return event.preventDefault();
                });

                function expandSecondMenu() {
                    var $secMenu;
                    $secMenu = $app.find('.second-menu');

                    if ($secMenu.hasClass('collapsed')) {
                        $secMenu.find('> span').click();
                    }
                }

                $aRest.on("click", function (event) {
                    // 收起一级菜单
                    if ($(this).attr('href') && $(this).attr('ui-sref') !== 'home') {
                        // 过滤掉首页以及二级菜单toggle btn
                        navCollapsedMin();
                        expandSecondMenu();
                    }
                    resetArrowDown();
                    return $lists.removeClass("open").find("ul").slideUp();
                });

                function resetArrowDown() {
                    var $arrowIcons;
                    $arrowIcons = $('#nav').find('> li').has('ul').find('> a i:nth-child(2)');

                    $arrowIcons.removeClass('icon-arrow-up').addClass('icon-arrow-down');
                }

                function toggleCollapsedAnimate(ele, style, delayArg) {
                    return ele.stop().animate(style, delayArg || delay);
                }

                function fixEleInitPos(ele, cssPro, expectVal) {
                    if (parseInt(ele.css(cssPro)) !== expectVal) {
                        ele.css(cssPro, expectVal + 'px');
                    }
                }

                function updateSecondMenuLeft() {
                    var $content, $secMenu;
                    $content = $("#content");
                    $secMenu = $content.find('.second-menu');

                    if ($app.hasClass('nav-collapsed-min')) {
                        fixEleInitPos($content, 'margin-left', 180);
                        toggleCollapsedAnimate($content, {'margin-left': '50px'});

                        // check if secMenu exists
                        if ($secMenu.length) {
                            if ($secMenu.hasClass("collapsed")) {
                                fixEleInitPos($secMenu, 'left', 0);
                                toggleCollapsedAnimate($secMenu, {left: "-130px"});
                            } else {
                                fixEleInitPos($secMenu, 'left', 180);
                                toggleCollapsedAnimate($secMenu, {left: "50px"});
                            }
                        }

                        fixEleInitPos($nav, 'width', 180);
                        toggleCollapsedAnimate($nav, {width: "50px"});
                    } else {
                        fixEleInitPos($content, 'margin-left', 50);
                        toggleCollapsedAnimate($content, {'margin-left': '180px'});

                        if ($secMenu.length) {
                            if ($secMenu.hasClass("collapsed")) {
                                fixEleInitPos($secMenu, 'left', -130);
                                toggleCollapsedAnimate($secMenu, {left: "0px"});
                            } else {
                                fixEleInitPos($secMenu, 'left', 50);
                                toggleCollapsedAnimate($secMenu, {left: "180px"});
                            }
                        }

                        fixEleInitPos($nav, 'width', 50);
                        toggleCollapsedAnimate($nav, {width: "180px"});
                    }
                }

                function resetToggleMinIcon() {
                    if ($app.hasClass("nav-collapsed-min")) {
                        $toggleMinIcon.removeClass('icon-flod').addClass('icon-deploy');
                    } else {
                        $toggleMinIcon.removeClass('icon-deploy').addClass('icon-flod');
                    }
                }

                // uib-popover是否可用标志
                scope.popoverEnable = false;

                scope.$on("nav:reset", function (event) {
                    scope.popoverEnable = userSessionStorageService.get('collapsed') === true;
                    updateSecondMenuLeft();
                    resetArrowDown();
                    return $lists.removeClass("open").find("ul").slideUp();
                });

                if (userSessionStorageService.has('collapsed')) {
                    if (userSessionStorageService.get('collapsed')) {
                        $app.addClass("nav-collapsed-min");
                        scope.popoverEnable = true;
                    }
                }

                resetToggleMinIcon();
            }
        };
    })

    /******************************************
     :: Toggle Off Canvas Directive
     *******************************************/

    .directive("toggleOffCanvas", function () {
        return {
            restrict: "A",
            link: function (scope, ele, attrs) {
                return ele.on("click", function () {
                    return $("#app").toggleClass("on-canvas");
                });
            }
        };
    });
