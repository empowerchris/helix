angular.module('helix.controllers')
  .controller('NewPickupCtrl', function ($scope) {
    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
  });
