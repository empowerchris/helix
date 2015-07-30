angular.module('helix.controllers')
  .controller('NewPickupCtrl', function ($scope, $ionicModal, Velocity) {
    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 10
    };

    $scope.marker = {
      id: 0,
      coords: {
        latitude: 45,
        longitude: -73
      },
      options: {
        draggable: false
      },
      labelContent: "lat",
      labelClass: "marker-labels",
      icon: 'images/ionic.png'
    };

    $scope.time = {};
    $scope.time.from = new Date(1970, 0, 1, 9, 0, 0);
    $scope.time.to = new Date(1970, 0, 1, 17, 0, 0);

    $scope.date = new Date();

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
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.editDate = function () {
      $ionicModal.fromTemplateUrl('templates/modals/dateSelection.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.editTime = function () {
      $ionicModal.fromTemplateUrl('templates/modals/timeSelection.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    var container = angular.element(document.querySelector('#pickupCards'));

    $scope.continueToDropOff = function () {
      Velocity(container, {
        scale: 1.1
      }, {
        duration: 100,
        easing: "swing",
        complete: function () {
          Velocity(container, {
            scale: 0.1
          }, {
            duration: 200,
            easing: "swing",
            complete: function () {

            }
          });
        }
      });
    }
  });
