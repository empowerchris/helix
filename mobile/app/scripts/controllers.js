'use strict';

angular.module('helix.controllers', [])
  .controller('TabsCtrl', function ($scope, $rootScope, Auth) {
    $scope.badges = [0, 0, 0, 0];

    Auth.getCurrentUser();

    $rootScope.$on('incrementBadge', function (event, tabIndex) {
      $scope.badges[tabIndex] = $scope.badges[tabIndex] + 1;
    });

    $rootScope.$on('setBadge', function (tabIndex, badge) {
      $scope.badges[tabIndex] = badge;
    });
  });
