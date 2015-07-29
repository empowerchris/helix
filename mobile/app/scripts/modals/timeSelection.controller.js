angular.module('helix.controllers')
  .controller('TimeSelectionCtrl', function ($scope, $cordovaDialogs) {
    $scope.pickupTime = angular.copy($scope.time);

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.save = function() {
      if ($scope.pickupTime.to <= $scope.pickupTime.from) {
        $cordovaDialogs.alert('Please make sure the latest pickup time is after the earliest one.', 'Invalid time', 'OK');
        return;
      }

      var differenceInHours = Math.abs($scope.pickupTime.to - $scope.pickupTime.from) / 36e5;

      if (differenceInHours < 2) {
        $cordovaDialogs.alert('Please allow more than 2 hours from the earliest and latest pickup times.', 'Not enough time', 'OK');
        return;
      }

      $scope.time.from = $scope.pickupTime.from;
      $scope.time.to = $scope.pickupTime.to;

      $scope.modal.hide();
    }
  });
