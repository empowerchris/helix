angular.module('helix.controllers')
  .controller('NewPickupCtrl', function ($scope, $ionicModal) {
    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 8
    };

    $scope.options = {
      scrollwheel: false,
      draggable: true,
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
    };

    $ionicModal.fromTemplateUrl('templates/modals/locationSearch.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    $scope.editPickupLocation = function () {
      $scope.modal.show();
    }
  });
