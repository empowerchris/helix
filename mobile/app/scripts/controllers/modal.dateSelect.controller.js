'use strict';

angular.module('helix.controllers')
  .controller('ModalDateSelectCtrl', function ($scope, $cordovaDialogs, $moment, $localStorage) {
    $scope.storage = $localStorage;

    if ($scope.storage.pickup.date) {
      $scope.date = $moment($scope.storage.pickup.date).format('MM-DD-YYYY');
    }

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.dateSelected = function (date) {
      if (!date) return;

      var a = $moment();
      var b = $moment(date);
      var diff = a.diff(b, 'days') * -1;

      if (diff < 0) {
        return $cordovaDialogs.alert('Please select a date in the future', 'Invalid Date', 'OK');
      }

      if (diff < 1) {
        return $cordovaDialogs.alert('Pickups need to be scheduled at least 1 day in advance.', 'Sorry', 'OK');
      }

      if (diff > 7) {
        return $cordovaDialogs.alert('Please select a date less than 7 days in advance.', 'Sorry', 'OK');
      }

      $scope.storage.pickup.date= new Date(date);

      $scope.modal.hide();
    };
  });

