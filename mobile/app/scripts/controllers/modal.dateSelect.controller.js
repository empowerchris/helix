'use strict';

angular.module('helix.controllers')
  .controller('ModalDateSelectCtrl', function ($scope, $rootScope, $cordovaDialogs, $moment, $localStorage) {
    $rootScope.$broadcast('defaultStatusBar');

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

      if (diff > 7) {
        return $cordovaDialogs.alert('Pickups can only be selected a maximum of 7 days in advance.', 'Sorry', 'OK');
      }

      $localStorage.arrivalDate = date;
      $scope.modal.hide();
    };
  });

