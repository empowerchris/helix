'use strict';

angular.module('helix.controllers')
  .controller('NewPlacesCtrl', function ($scope, $ionicModal, $stateParams, $localStorage, $cordovaDialogs) {
    console.log($localStorage.city);

    $scope.cityName = $localStorage.city.terms[0].value;
    $scope.title = 'Trip to ' + $scope.cityName;

    var placesService;

    $scope.map = {
      center: {
        latitude: 37.1,
        longitude: -95.7
      },
      zoom: 2,
      events: {
        tilesloaded: function (map) {
          $scope.$apply(function () {
            placesService = new google.maps.places.PlacesService(map);
            centerOnCity();
          });
        }
      }
    };

    function centerOnCity() {
      placesService.getDetails({
          'placeId': $localStorage.city.place_id
        }, function detailsresult(detailsResult, placesServiceStatus) {
          if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
            $scope.$apply(function () {
              $scope.latitude = detailsResult.geometry.location.G;
              $scope.longitude = detailsResult.geometry.location.K;

              $scope.map.center = {
                latitude: $scope.latitude,
                longitude: $scope.longitude
              };

              $scope.map.zoom = 10;
            });
          }
        }
      );
    }

    $scope.markers = [];

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

    $scope.options = {
      scrollwheel: false,
      draggable: true,
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false
    };

    $scope.openDateSelectModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-date-select.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.storage = $localStorage;

    $scope.next = function () {
      if (!$localStorage.city) {
        return $cordovaDialogs.alert('Please go back and choose a destination.', 'Missing City', 'OK');
      }

      if (!$localStorage.arrivalDate) {
        return $cordovaDialogs.alert('Please select a date.', 'Missing Arrival Date', 'OK');
      }

      if (!$localStorage.to) {
        return $cordovaDialogs.alert('Please select a location.', 'Missing Staying At', 'OK');
      }

      if (!$localStorage.from) {
        return $cordovaDialogs.alert('Please select a location.', 'Missing Departing From', 'OK');
      }
    };

    $ionicModal.fromTemplateUrl('templates/modal-location-search.html', {
      scope: $scope,
      animation: 'slide-in-up',
      focusFirstInput: true
    }).then(function (modal) {
      $scope.locationModal = modal;
    });

    $scope.openStayingAtModal = function () {
      $scope.locationToSave = 'stayingAt';
      $scope.locationModalTitle = 'Where are you staying?';
      $scope.locationModal.show();
    };

    $scope.openDepartingFromModal = function () {
      $scope.locationToSave = 'departingFrom';
      $scope.locationModalTitle = 'Where are you departing from?';
      $scope.locationModal.show();
    };
  });
