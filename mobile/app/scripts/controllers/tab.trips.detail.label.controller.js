'use strict';

angular.module('helix.controllers')
  .controller('TripsDetailLabelCtrl', function ($scope, $localStorage) {
    $scope.labelUrl = $localStorage.labelUrl;
  });
