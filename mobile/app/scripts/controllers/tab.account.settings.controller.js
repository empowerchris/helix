'use strict';

angular.module('helix.controllers')
  .controller('AccountSettingsCtrl', function ($scope) {
    $scope.editing = false;

    $scope.user = {
      first: 'John',
      last: 'Appleseed',
      phone: '(555) 123 4567',
      email: 'email@domain.com'
    };

    $scope.edit = function() {
      $scope.editing = !$scope.editing;
    };
  });
