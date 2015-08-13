'use strict';

angular.module('helix.controllers')
  .controller('ModalTravelDatesSelectCtrl', function ($scope, $moment, $localStorage) {
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
      if ($scope.storage.mode === 'arrival') {
        $scope.storage.travel.arrival = new Date(date);
      } else if ($scope.storage.mode === 'departure') {
        $scope.storage.travel.departure = new Date(date);
      }
    };
  });

