'use strict';

angular.module('helix.controllers')
  .controller('NewSizeCtrl', function ($scope, $state, $localStorage) {
    $scope.title = 'Luggage details';

    $scope.weight = 50;

    $scope.sizes = [{
      name: 'Small',
      dimensions: '21.5 x 14 x 7.5'
    }, {
      name: 'Medium',
      dimensions: '25 x 17.5 x 7.5'
    }, {
      name: 'Large',
      dimensions: '29.5 x 19.5 x 8.5'
    }, {
      name: 'Extra Large',
      dimensions: '30 x 20 x 11'
    }];

    $scope.changedSize = function(selectedSize) {
      $scope.sizes[0].selected = true;
      for (var i = 0; i < $scope.sizes.length; i++) {
        if ($scope.sizes[i].name !== selectedSize.name) {
          $scope.sizes[i].selected = false;
        }
      }
    };

    $scope.changedSize($scope.sizes[0]);

    $scope.next = function() {
      for (var i = 0; i < $scope.sizes.length; i++) {
        if ($scope.sizes[i].selected) {
          $localStorage.size = $scope.sizes[i];
        }
      }

      $localStorage.weight = $scope.weight;

      $state.go('tab.new-options');
    };
  });
