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

    $scope.$on('$destroy', function () {
      $scope.modal.remove();
    });

    $scope.editPickupLocation = function () {
      $ionicModal.fromTemplateUrl('templates/modals/locationSearch.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    $scope.editDate = function () {
      $ionicModal.fromTemplateUrl('templates/modals/dateSelection.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    $scope.editTime = function () {
      $ionicModal.fromTemplateUrl('templates/modals/timeSelection.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }
  });
