'use strict';

angular.module('helix.controllers')
  .controller('NewOptionsCtrl', function ($scope, $state, $localStorage, $moment, $cordovaDialogs) {
    $scope.title = 'Pickup Options';
    $scope.earliest = 9;
    $scope.latest = 17;
    $scope.storage = $localStorage;

    var arrivalDate = $moment($localStorage.arrivalDate);

    $scope.shippingMethods = [{
      name: 'Ground',
      price: 23.50,
      days: 5
    }, {
      name: '2nd Day',
      price: 34,
      days: 3
    }, {
      name: 'Overnight',
      price: 45.0,
      days: 1
    }];

    for (var i = 0; i < $scope.shippingMethods.length; i++) {
      $scope.shippingMethods[i].pickupDate = $moment(arrivalDate).add($scope.shippingMethods.days, 'd').toDate();
    }

    $scope.changedShipping = function(selectedMethod) {
      $scope.shippingMethods[0].selected = true;
      for (var i = 0; i < $scope.shippingMethods.length; i++) {
        $scope.shippingMethods[i].difference = '';
        if ($scope.shippingMethods[i].name !== selectedMethod.name) {
          $scope.shippingMethods[i].selected = false;
          $scope.shippingMethods[i].difference = $scope.shippingMethods[i].price - selectedMethod.price;
        }
      }
    };
    $scope.changedShipping($scope.shippingMethods[0]);

    $scope.formatHour = function(n) {
      if (n < 12) {
        return n + ' AM';
      } if (n === 12) {
        return n + ' PM';
      } else {
        return n - 12 + ' PM';
      }
    };

    $scope.next = function() {
      for (var i = 0; i < $scope.shippingMethods.length; i++) {
        if ($scope.shippingMethods[i].selected) {
          $localStorage.shippingMethod = $scope.shippingMethods[i];
        }
      }

      $localStorage.earliest = $scope.earliest;
      $localStorage.latest = $scope.latest;

      $state.go('tab.new-review');
    };
  });
