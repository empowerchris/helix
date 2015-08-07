'use strict';

angular.module('helix.controllers')
  .controller('NewCtrl', function ($scope, $ionicModal, $rootScope, $state, $localStorage, $location) {
    $rootScope.$broadcast('blueStatusBar');
    $scope.storage = $localStorage;
    $localStorage.pickup = $localStorage.pickup || {};
    $localStorage.dropoff = $localStorage.dropoff || {};
    $scope.data = {};

    $ionicModal.fromTemplateUrl('templates/modal-city-search.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }).then(function (modal) {
      $scope.pickupCityModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/modal-city-search.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }).then(function (modal) {
      $scope.dropoffCityModal = modal;
    });

    $scope.openPickupCityModal = function () {
      $scope.selectCity = function (location) {
        console.log(location);
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
      $scope.modal = $scope.pickupCityModal;
      $scope.modal.show();
    };

    $scope.openDropoffCityModal = function () {
      $scope.selectCity = function (location) {
        console.log(location);
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
      $scope.modal = $scope.dropoffCityModal;
      $scope.modal.show();
    };

    $scope.cancel = function() {
      $scope.modal.hide();
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

    $scope.sizes = $localStorage.bags || [{
      name: 'Small',
      dimensions: '21.5 x 14 x 7.5',
      weight: 'up to 20 lbs.',
      amount: 0
    }, {
      name: 'Medium',
      dimensions: '25 x 17.5 x 7.5',
      weight: 'up to 30 lbs.',
      amount: 0
    }, {
      name: 'Large',
      dimensions: '29.5 x 19.5 x 8.5',
      weight: 'up to 40 lbs.',
      amount: 0
    }, {
      name: 'Extra Large',
      dimensions: '30 x 20 x 11',
      weight: 'up to 50 lbs.',
      amount: 0
    }];

    $scope.openPickupDate = function (location) {
      $localStorage.bags = $scope.sizes;
      $scope.modal.hide();
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
  });
