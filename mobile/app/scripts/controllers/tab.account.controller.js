'use strict';

angular.module('helix.controllers')
  .controller('AccountCtrl', function ($scope, Auth, $location) {
    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };
  });
