'use strict';

angular.module('helix.controllers')
  .controller('NewCtrl', function ($scope, $ionicModal, $rootScope, $state, $localStorage, $location) {
    $rootScope.$broadcast('blueStatusBar');
    $scope.storage = $localStorage;
    $localStorage.pickup = $localStorage.pickup || {};
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
      $scope.data.suggestions = [{
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
      $scope.data.suggestions = [{
        title: 'Drop Off',
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
      $scope.modal = $scope.dropoffCityModal;
      $scope.modal.show();
    };

    $scope.openSearchCityModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-city-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: false
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.selectCity = function (location) {
      $localStorage.pickup.city = location;
    };
  });
