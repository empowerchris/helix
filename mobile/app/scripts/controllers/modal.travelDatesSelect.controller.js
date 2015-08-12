'use strict';

angular.module('helix.controllers')
  .controller('ModalTravelDatesSelectCtrl', function ($scope, $cordovaDialogs, $moment, $localStorage) {
    $scope.storage = $localStorage;
    $scope.storage.travel = $scope.storage.travel || {};

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

