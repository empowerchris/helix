'use strict';

angular.module('helix.controllers')
  .controller('ModalBagOptionsCtrl', function ($scope, $rootScope, $cordovaDialogs, $localStorage) {
    $scope.bags = $localStorage.bags || [{
        name: 'Small',
        dimensions: {
          length: 21.5,
          width: 14,
          height: 7.5,
          weight: 20
        },
        amount: 0
      }, {
        name: 'Medium',
        dimensions: {
          length: 25,
          width: 17.5,
          height: 7.5,
          weight: 30
        },
        amount: 0
      }, {
        name: 'Large',
        dimensions: {
          length: 29.5,
          width: 19.5,
          height: 8.5,
          weight: 40
        },
        amount: 0
      }, {
        name: 'Extra Large',
        dimensions: {
          length: 30,
          width: 20,
          height: 11,
          weight: 50
        },
        amount: 0
      }];

    $scope.saveBagOptions = function () {
      var numberOfBags = 0;

      for (var i = 0; i < $scope.bags.length; i++) {
        numberOfBags = numberOfBags + $scope.bags[i].amount;
      }

      if (numberOfBags < 1) {
        return $cordovaDialogs.alert('You must select at least one bag size.', 'No bags', 'OK');
      }

      $localStorage.bags = $scope.bags;

      $scope.modal.hide();
    };
  });

