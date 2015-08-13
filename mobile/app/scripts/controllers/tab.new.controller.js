'use strict';

angular.module('helix.controllers')
  .controller('NewCtrl', function ($scope, $ionicModal, $rootScope, $state, $localStorage, $ionicLoading,
                                   $timeout, $cordovaDialogs, utils, $moment) {

    $scope.storage = $localStorage;
    $scope.storage.travel = $scope.storage.travel || {};
    $scope.storage.pickup = $scope.storage.pickup || {
        location: {
          easypost: null
        },
        time: {
          earliest: 9,
          latest: 17
        },
        date: null
      };
    $scope.storage.dropoff = $scope.storage.dropoff || {
        location: {
          easypost: null
        },
        date: null
      };

    $scope.formatHour = utils.formatHour;

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.openPickupCityModal = function () {
      $scope.select = function (location) {
        $localStorage.pickup.location = location;
        $scope.modal.hide();
      };

      $scope.title = 'Pickup Address';

      $ionicModal.fromTemplateUrl('templates/modal-address-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: false
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.openDropoffCityModal = function () {
      $scope.select = function (location) {
        $localStorage.dropoff.location = location;
        $scope.modal.hide();
      };

      $scope.title = 'Going To';

      $ionicModal.fromTemplateUrl('templates/modal-address-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: false
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.openTravelDatesSelectModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-travel-dates-select.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.openDateSelectModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-date-select.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.openTimeSelectModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-time-select.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.openBagOptionsModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-bag-options.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.next = function () {
      if (!$scope.storage.pickup.location.easypost) {
        return $cordovaDialogs.alert('Please select pickup address.', 'Missing Information', 'OK');
      }

      if (!$scope.storage.dropoff.location.easypost) {
        return $cordovaDialogs.alert('Please select drop-off address.', 'Missing Information', 'OK');
      }

      if (!$scope.storage.pickup.date) {
        return $cordovaDialogs.alert('Please select a pickup date.', 'Missing Information', 'OK');
      }

      if (!$scope.storage.pickup.time) {
        return $cordovaDialogs.alert('Please select a pickup time.', 'Missing Information', 'OK');
      }

      if (!$scope.storage.bags) {
        return $cordovaDialogs.alert('Please include luggage information.', 'Missing Information', 'OK');
      }

      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Validating trip..."
      });

      $timeout(function () {
        $ionicLoading.hide();
        $state.go('tab.new-shipping');
      }, 1000);
    };

    $scope.differenceInDays = function (date1, date2) {
      var a = $moment(date1);
      var b = $moment(date2);
      var diff = a.diff(b, 'days') * -1;

      return diff;
    };
  });
