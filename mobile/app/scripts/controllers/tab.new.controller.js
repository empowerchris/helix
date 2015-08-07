'use strict';

angular.module('helix.controllers')
  .controller('NewCtrl', function ($scope, $ionicModal, $rootScope, $state, $localStorage, $ionicLoading, $timeout) {
    $rootScope.$broadcast('blueStatusBar');
    $scope.storage = $localStorage;
    $localStorage.pickup = $localStorage.pickup || {};
    $localStorage.dropoff = $localStorage.dropoff || {};
    $scope.data = {};

    $scope.cancel = function() {
      $scope.modal.hide();
    };

    $scope.openPickupCityModal = function () {
      $scope.selectCity = function (location) {
        $localStorage.pickup.city = location;
        $scope.modal.hide();
      };

      $scope.suggestions = [{
        title: 'Pick Up',
        items: [{
          icon: 'ion-ios-navigate-outline',
          description: 'Berlin',
          subtitle: 'Current city',
          place_id: 'ChIJVTPokywQkFQRmtVEaUZlJRA'
        }]
      }, {
        title: 'From your history',
        items: [{
          icon: 'ion-ios-clock-outline',
          description: 'Seattle',
          subtitle: '',
          place_id: 'ChIJVTPokywQkFQRmtVEaUZlJRA'
        }, {
          icon: 'ion-ios-clock-outline',
          description: 'San Francisco',
          subtitle: '',
          place_id: 'ChIJmQdYUK8L9ocRN63SN2-JktY'
        }]
      }];

      $ionicModal.fromTemplateUrl('templates/modal-city-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.openDropoffCityModal = function () {
      $scope.selectCity = function (location) {
        $localStorage.dropoff.city = location;
        $scope.modal.hide();
      };

      $scope.suggestions = [{
        title: 'Drop Off',
        items: [{
          icon: 'ion-ios-navigate-outline',
          description: 'New York',
          subtitle: 'Concur Booking',
          place_id: 'ChIJVTPokywQkFQRmtVEaUZlJRA'
        }]
      }, {
        title: 'From your history',
        items: [{
          icon: 'ion-ios-clock-outline',
          description: 'Seattle',
          subtitle: '',
          place_id: 'ChIJVTPokywQkFQRmtVEaUZlJRA'
        }, {
          icon: 'ion-ios-clock-outline',
          description: 'San Francisco',
          subtitle: '',
          place_id: 'ChIJmQdYUK8L9ocRN63SN2-JktY'
        }]
      }];

      $ionicModal.fromTemplateUrl('templates/modal-city-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
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
