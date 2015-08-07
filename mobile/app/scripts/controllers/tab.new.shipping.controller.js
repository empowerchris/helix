'use strict';

angular.module('helix.controllers')
  .controller('NewShippingCtrl', function ($scope, $state, $localStorage, $moment, $cordovaDialogs, $ionicLoading, $timeout, $ionicModal) {
    if ($localStorage.dropoffDate) {
      $scope.title = 'Pickup Date';
    } else if ($localStorage.pickupDate) {
      $scope.title = 'Delivery Date';
    }

    $scope.pickupTime = $localStorage.pickupTime || {
      earliest: 9,
      latest: 17
    };

    $scope.storage = $localStorage;

    $scope.shippingMethods = [{
      name: 'Ground',
      price: 23.50,
      days: 4
    }, {
      name: '2nd Day',
      price: 34,
      days: 2,
      selected: true
    }, {
      name: 'Overnight',
      price: 45.0,
      days: 1
    }];

    for (var i = 0; i < $scope.shippingMethods.length; i++) {
      if ($localStorage.dropoffDate) {
        /*var dat = new Date($localStorage.dropoffDate);
        dat.setDate(dat.getDate() - $scope.shippingMethods[i].days);*/

        var dropoffDate = $moment($localStorage.dropoffDate);
        var pickupDate = dropoffDate.subtract($scope.shippingMethods[i].days, 'days');

        $scope.shippingMethods[i].pickupDate = pickupDate.toDate();
      } else if ($localStorage.pickupDate) {
        //var dat2 = new Date($localStorage.pickupDate);
        //dat2.setDate(dat2.getDate() + $scope.shippingMethods[i].days);
        var pickupDate = $moment($localStorage.pickupDate);
        var dropoffDate = pickupDate.add($scope.shippingMethods[i].days, 'days');

        $scope.shippingMethods[i].dropoffDate = dropoffDate.toDate();
      }
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
      $localStorage.pickupTime = $scope.pickupTime;

      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Calculating estimate..."
      });
      $timeout(function() {
        $ionicLoading.hide();
        $state.go('tab.new-estimate');
      }, 2000);
    };
  });
