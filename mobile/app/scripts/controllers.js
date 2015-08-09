'use strict';

angular.module('helix.controllers', [])
  .controller('TabsCtrl', function ($scope, $rootScope) {
    $scope.badges = [0,0,0,0];

    $rootScope.$on('incrementBadge', function (event, tabIndex) {
      $scope.badges[tabIndex] = $scope.badges[tabIndex] + 1;
    });

    $rootScope.$on('setBadge', function (tabIndex, badge) {
      $scope.badges[tabIndex] = badge;
    });
  });
