'use strict';

angular.module('helix.controllers')
  .controller('AccountCtrl', function ($scope, Auth, $location) {
    console.log('AccountCtrl');

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };
  });
