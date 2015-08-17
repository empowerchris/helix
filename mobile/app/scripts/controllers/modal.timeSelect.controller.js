'use strict';

angular.module('helix.controllers')
  .controller('ModalTimeSelectCtrl', function ($scope, utils, $cordovaDialogs, $localStorage) {
    $scope.storage = $localStorage;
    $scope.time = {};

    if ($scope.storage.pickup.time.earliest) {
      $scope.time.earliest = $scope.storage.pickup.time.earliest;
    }

    if ($scope.storage.pickup.time.latest) {
      $scope.time.latest = $scope.storage.pickup.time.latest;
    }

    $scope.formatHour = utils.formatHour;

    $scope.done = function () {
      if (($scope.latest - $scope.earliest) < 3) {
        return $cordovaDialogs.alert('Please allow 3 hours or more between earliest and latest pickup time.', 'Pickup Time', 'OK');
      }

      $scope.storage.pickup.time.earliest = $scope.time.earliest;
      $scope.storage.pickup.time.latest = $scope.time.latest;

      $scope.modal.hide();
    };
  });

