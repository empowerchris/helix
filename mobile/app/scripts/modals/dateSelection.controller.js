angular.module('helix.controllers')
  .controller('DateSelectionCtrl', function ($scope, $cordovaDialogs) {
    $scope.pickupDate = angular.copy($scope.date);

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.save = function () {
      var differenceInDays = Math.floor($scope.pickupDate - new Date()) / 86400000;
      console.log(differenceInDays);

      if (differenceInDays < 0) {
        $cordovaDialogs.alert('Please make sure the pickup date in sometime in the future.', 'Invalid date', 'OK');
        return;
      }

      if (differenceInDays > 30) {
        $cordovaDialogs.alert('Pickups can only be scheduled less than a month in advance.', 'Not enough time', 'OK');
        return;
      }

      console.log($scope.date, $scope.pickupDate);
      $scope.date = new Date($scope.pickupDate);

      $scope.modal.hide();
    };
  });
