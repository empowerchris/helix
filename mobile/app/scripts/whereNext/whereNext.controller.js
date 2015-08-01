angular.module('helix.controllers')
  .controller('WhereNextCtrl', function ($scope, $ionicModal, Velocity) {
    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 10
    };

    $scope.options = {
      scrollwheel: false,
      draggable: false,
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false
    };

    var container = angular.element(document.querySelector('#content'));
    var suggestions = angular.element(document.querySelector('#suggestions'));

    Velocity(suggestions, {opacity: 0, translateY: "400px"}, {duration: 0});
    Velocity(container, {opacity: 0}, {duration: 0});

    Velocity(container, {
      opacity: 1
    }, {
      delay: 300,
      duration: 300,
      complete: function () {
        Velocity(suggestions, {
          opacity: 1,
          translateY: 0,
          translateZ: 0
        }, {
          delay: 200,
          duration: 400,
          easing: "swing"
        });
      }
    });
  });
