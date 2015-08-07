'use strict';

angular.module('helix.controllers')
  .controller('ModalDateSelectCtrl', function ($scope, $rootScope, $cordovaDialogs, $moment, $localStorage) {
    $rootScope.$broadcast('defaultStatusBar');

    $scope.storage = $localStorage;
    $localStorage.mode = $localStorage.mode || 'pickup';

    $scope.toDropoffMode = function() {
      $localStorage.mode = 'dropoff';
    };

    $scope.toPickupMode = function() {
      $localStorage.mode = 'pickup';
    };

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.dateSelected = function (date) {
      if (!date) return;

      var a = $moment();
      var b = $moment(date);
      var diff = a.diff(b, 'days') * - 1;

      if (diff < 0) {
        return $cordovaDialogs.alert('Please select a date in the future', 'Invalid Date', 'OK');
      }

      if (diff < 1) {
        return $cordovaDialogs.alert('Pickups need to be scheduled at least 1 day in advance.', 'Sorry', 'OK');
      }

      if (diff > 7) {
        return $cordovaDialogs.alert('Please select a date less than 7 days in advance.', 'Sorry', 'OK');
      }

      if ($localStorage.mode === 'dropoff') {
        $localStorage.pickupDate = false;
        $localStorage.dropoffDate = new Date(date);
      } else if ($localStorage.mode === 'pickup') {
        $localStorage.dropoffDate = false;
        $localStorage.pickupDate = new Date(date);
      }

      $scope.modal.hide();
    };
  });

