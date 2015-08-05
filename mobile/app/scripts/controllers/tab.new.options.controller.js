'use strict';

angular.module('helix.controllers')
  .controller('NewOptionsCtrl', function ($scope, $state, $localStorage, $moment, $cordovaDialogs, $ionicLoading, $timeout, $ionicModal) {
    $scope.title = 'Pickup Details';
    $scope.pickup = {
      earliest: 9,
      latest: 17
    };
    $scope.storage = $localStorage;

    var arrivalDate = $moment($localStorage.arrivalDate);

    $scope.shippingMethods = [{
      name: 'Ground',
      price: 23.50,
      days: 5
    }, {
      name: '2nd Day',
      price: 34,
      days: 3,
      selected: true,
    }, {
      name: 'Overnight',
      price: 45.0,
      days: 1
    }];

    for (var i = 0; i < $scope.shippingMethods.length; i++) {
      $scope.shippingMethods[i].pickupDate = $moment(arrivalDate).add($scope.shippingMethods.days, 'd').toDate();
    }

    $scope.changedShipping = function (selectedMethod) {
      $scope.shippingMethods[0].selected = true;
      for (var i = 0; i < $scope.shippingMethods.length; i++) {
        $scope.shippingMethods[i].difference = '';
        if ($scope.shippingMethods[i].name !== selectedMethod.name) {
          $scope.shippingMethods[i].selected = false;
          $scope.shippingMethods[i].difference = $scope.shippingMethods[i].price - selectedMethod.price;
        }
      }
    };

    $scope.formatHour = function (n) {
      if (n < 12) {
        return n + ' AM';
      }
      if (n == 12) {
        return '12 PM';
      }
      if (n == 24) {
        return '12 AM';
      } else {
        return n - 12 + ' PM';
      }
    };

    $scope.sizes = [{
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

    $scope.changedSize = function (selectedSize) {
      $scope.sizes[0].selected = true;
      for (var i = 0; i < $scope.sizes.length; i++) {
        if ($scope.sizes[i].name !== selectedSize.name) {
          $scope.sizes[i].selected = false;
        }
      }
    };

    $scope.changedSize($scope.sizes[0]);

    $scope.openTimeSelectModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-time-select.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.timeModal = modal;
        $scope.timeModal.show();
      });
    };

    $scope.next = function () {
      var numberOfBags = 0;
      for (var i = 0; i < $scope.sizes.length; i++) {
        numberOfBags = numberOfBags + $scope.sizes[i].amount;
      }

      if (numberOfBags < 1) {
        return $cordovaDialogs.alert('You must select at least one bag size.', 'No bags', 'OK');
      }

      $localStorage.bags = $scope.sizes;

      $localStorage.pickup = $scope.pickup;

      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Calculating estimate..."
      });
      $timeout(function() {
        $ionicLoading.hide();
        $state.go('tab.new-estimate');
      }, 2000);
    };
  });
