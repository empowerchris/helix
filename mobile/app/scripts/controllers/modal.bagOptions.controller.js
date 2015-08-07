'use strict';

angular.module('helix.controllers')
  .controller('ModalBagOptionsCtrl', function ($scope, $rootScope, $cordovaDialogs, $localStorage) {
    console.log('ModalBagOptionsCtrl');

    $scope.bags = $localStorage.bags || [{
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

    $scope.saveBagOptions = function () {
      var numberOfBags = 0;

      for (var i = 0; i < $scope.bags.length; i++) {
        numberOfBags = numberOfBags + $scope.bags[i].amount;
      }

      console.log(numberOfBags);

      if (numberOfBags < 1) {
        return $cordovaDialogs.alert('You must select at least one bag size.', 'No bags', 'OK');
      }

      $localStorage.bags = $scope.bags;

      $scope.modal.hide();
    };
  });

