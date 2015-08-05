'use strict';

angular.module('helix.controllers')
  .controller('NewEstimateCtrl', function ($scope, $state, $localStorage, $moment, $cordovaDialogs) {
    $scope.title = 'Estimate';
    $scope.storage = $localStorage;

    $scope.next = function() {
      $state.go('tab.new-review');
    };
  });
