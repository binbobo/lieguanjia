// app.localization Module
// ====================================================================
// This file should included in your project.
//
// - Squaredesigns.net -

"use strict";
angular.module("app.controllers", ['angular-loading-bar', 'ngTable'])

/***********************************
  :: cfp Loading Bar Provider
***********************************/

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
  }])

/***********************************
  :: Main App Ctrl
***********************************/

.controller("AppCtrl", [
  "$scope", "$rootScope", function($scope, $rootScope) {
    var $window;
    $window = $(window);
    $scope.main = {
      brand: "AdminPro",
      name: "P Square Design"
    };
    $scope.admin = {
      layout: false,
      menu: false,
      fixedHeader: true,
      fixedSidebar: true,
      themeID: "11",
      navbarHeaderColor: 'bg-white',
      logo: 'bg-dark',
      asideColor: 'bg-dark'
    };
    $scope.color = {
      primary: "#248AAF",
      success: "#3CBC8D",
      info: "#29B7D3",
      purple: "#7266ba",
      warning: "#FAC552",
      danger: "#E9422E"
    };
	$scope.initWaves = function(){
      Waves.displayEffect();
    };
  }
])

/***********************************
  :: Header Ctrl
***********************************/

.controller("HeaderCtrl", [
   "$scope", function($scope) {}
])

/***********************************
  :: Nav Container Ctrl
***********************************/

.controller("NavContainerCtrl", [
   "$scope", function($scope) {}
])

/***********************************
  :: Nav Ctrl
***********************************/

.controller("NavCtrl", [
  "$scope", "taskStorage", "filterFilter", function($scope, taskStorage, filterFilter) {
    var tasks;
    tasks = $scope.tasks = taskStorage.get();
    $scope.taskRemainingCount = filterFilter(tasks, {
      completed: false
    }).length;
    return $scope.$on("taskRemaining:changed", function(event, count) {
      return $scope.taskRemainingCount = count;
    });
  }
])