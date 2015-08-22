'use strict';

angular.module('helix.controllers')
  .controller('ModalTravelDatesSelectCtrl', function ($scope, $moment, $localStorage, $cordovaDialogs) {
    $scope.storage = $localStorage;

    $scope.storage.mode = $scope.storage.mode || 'arrival';

    $scope.travel = {};

    if ($scope.storage.travel.arrival) {
      $scope.travel.arrival = $moment(new Date($scope.storage.travel.arrival)).format('MM-DD-YYYY');
    }

    if ($scope.storage.travel.departure) {
      $scope.travel.departure = $moment(new Date($scope.storage.travel.departure)).format('MM-DD-YYYY');
    }

    $scope.done = function () {
      $scope.modal.hide();
    };

    $scope.setMode = function (mode) {
      $scope.storage.mode = mode;
    };

    $scope.dateSelected = function (date) {
      if (!date) return;

      var a = $moment();
      var b = $moment(date);
      var diff = a.diff(b, 'days') * -1;

      if (diff < 0) {
        if ($scope.storage.mode === 'arrival') {
          $scope.travel.arrival = null;
        } else if ($scope.storage.mode === 'departure') {
          $scope.travel.departure = null;
        }
        return $cordovaDialogs.alert('Please select a date in the future', 'Invalid Date', 'OK');
      }

      if ($scope.storage.mode === 'arrival') {
        $scope.storage.travel.arrival = new Date(date);
      } else if ($scope.storage.mode === 'departure') {
        $scope.storage.travel.departure = new Date(date);
      }
    };
  });

