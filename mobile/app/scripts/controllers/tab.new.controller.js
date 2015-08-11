'use strict';

angular.module('helix.controllers')
  .controller('NewCtrl', function ($scope, $ionicModal, $rootScope, $state, $localStorage, $ionicLoading,
                                   $timeout, $cordovaDialogs) {

    $scope.storage = $localStorage;

    $localStorage.pickup = $localStorage.pickup || false;
    $localStorage.dropoff = $localStorage.dropoff || false;
    $scope.data = {};

    $scope.cancel = function() {
      $scope.modal.hide();
    };

    $scope.openPickupCityModal = function () {
      $scope.select = function (location) {
        $localStorage.pickup = location;
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
        $localStorage.dropoff = location;
        $scope.modal.hide();
      };

      $ionicModal.fromTemplateUrl('templates/modal-address-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: false
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.openBagOptionsModal = function() {
      $ionicModal.fromTemplateUrl('templates/modal-bag-options.html', {
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

    $scope.next = function() {
      if (!$localStorage.pickup.city) {
        return $cordovaDialogs.alert('Please select departure city.', 'Missing Information', 'OK');
      }

      if (!$localStorage.dropoff.city) {
        return $cordovaDialogs.alert('Please select arrival city.', 'Missing Information', 'OK');
      }

      if (!$localStorage.dropoffDate && !$localStorage.pickupDate) {
        return $cordovaDialogs.alert('Please select a delivery date.', 'Missing Information', 'OK');
      }

      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Loading..."
      });
      $timeout(function() {
        $ionicLoading.hide();
        $state.go('tab.new-shipping');
      }, 2000);
    }
  });
