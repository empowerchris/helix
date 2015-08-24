'use strict';

angular.module('helix.controllers')
  .controller('ModalTimeSelectCtrl', function ($scope, utils, $cordovaDialogs, $localStorage, $moment) {
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
      if (($scope.time.latest) > 16) {
        return $cordovaDialogs.alert('Latest pickup time must be before 4 pm.', 'Pickup Time', 'OK');
      }

      if (($scope.time.latest - $scope.time.earliest) < 3) {
        return $cordovaDialogs.alert('Please allow 3 hours or more between earliest and latest pickup time.', 'Pickup Time', 'OK');
      }

      $scope.storage.pickup.time.earliest = $scope.time.earliest;
      $scope.storage.pickup.time.latest = $scope.time.latest;

      $scope.modal.hide();
    };

    $scope.substractDays = function (date, days) {
      //var a = $moment(date);
      return utils.subtractDeliveryDays(date, days)._d;
      //return a.businessSubtract(days)._d;
    };
  });

