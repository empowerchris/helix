'use strict';

angular.module('helix.controllers')
  .controller('ModalTimeSelectCtrl', function ($scope, $rootScope, $cordovaDialogs, $localStorage) {
    $rootScope.$broadcast('defaultStatusBar');


    $scope.done = function () {


      if (($scope.pickup.latest - $scope.pickup.earliest) < 3) {
        return $cordovaDialogs.alert('Please allow 3 hours or more between earliest and latest pickup time.', 'Pickup Time', 'OK');
      }

      for (var i = 0; i < $scope.shippingMethods.length; i++) {
        if ($scope.shippingMethods[i].selected) {
          $localStorage.shippingMethod = $scope.shippingMethods[i];
        }
      }

      $scope.timeModal.hide();
    };
  });

