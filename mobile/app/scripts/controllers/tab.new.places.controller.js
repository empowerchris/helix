'use strict';

angular.module('helix.controllers')
  .controller('NewPlacesCtrl', function ($scope, $ionicModal, $stateParams, $localStorage,
                                         $state, $cordovaDialogs, $location, $rootScope) {
    $scope.cityName = $localStorage.city.terms[0].value;
    $scope.title = 'Trip to ' + $scope.cityName;

    var placesService;
    var hasLoaded = false;
    var map;

    $scope.map = {
      center: {
        latitude: 37.1,
        longitude: -95.7
      },
      zoom: 2,
      events: {
        tilesloaded: function (_map) {
          if (!hasLoaded) {
            $scope.$apply(function () {
              map = _map;
              placesService = new google.maps.places.PlacesService(map);
              //centerOnCity();
            });
            hasLoaded = true;
          }
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

              $scope.placeMarkers();
            });
          }
        }
      );
    }

    $scope.placeMarkers = function () {
      $scope.markers = [];
      $scope.coords = [];
      $scope.polylines = [];

      if ($localStorage.stayingAt) {
        placeMarkerForPlaceId($localStorage.stayingAt.place_id);
      }

      if ($localStorage.departingFrom) {
        placeMarkerForPlaceId($localStorage.departingFrom.place_id);
      }
    };

    $scope.placeLines = function () {
      //console.log('Placing lines', $scope.coords);

      $scope.polylines = [];

      $scope.polylines.push({
        path: $scope.coords,
        stroke: {
          weight: 2,
          color: '#F58B1F',
          opacity: 1
        }
      });
    };

    function placeMarkerForPlaceId(placeId) {
      //console.log('Placing marker', placeId);

      placesService.getDetails({
          'placeId': placeId
        }, function detailsresult(detailsResult, placesServiceStatus) {
          if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
            $scope.$apply(function () {
              var coords = {
                latitude: detailsResult.geometry.location.G,
                longitude: detailsResult.geometry.location.K
              };

              var marker = {
                id: Math.floor(Math.random() * 10000),
                coords: coords,
                icon: ''
              };

              //$scope.markers.push(marker);
              $scope.coords.push(coords);

              // TODO: bound map to markers
              /*var bounds = new google.maps.LatLngBounds();
              for (var i = 0; i < $scope.coords.length; i++) {
                bounds.extend({
                  lat: $scope.coords[i].latitude,
                  long: $scope.coords[i].longitude
                })
              }
              map.fitBounds(bounds);*/

              if ($scope.coords.length === 2) {
                $scope.placeLines();
              }
            });
          }
        }
      );
    }

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

      if (!$localStorage.stayingAt) {
        return $cordovaDialogs.alert('Please select a location.', 'Missing Staying At', 'OK');
      }

      if (!$localStorage.departingFrom) {
        return $cordovaDialogs.alert('Please select a location.', 'Missing Departing From', 'OK');
      }

      $state.go('tab.new-options');
    };

    $scope.openStayingAtModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-location-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.locationModal = modal;
        $scope.locationToSave = 'stayingAt';
        $scope.locationModalTitle = 'Where are you staying?';
        $scope.locationModal.show();
      });
    };

    $scope.openDepartingFromModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-location-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.locationModal = modal;
        $scope.locationToSave = 'departingFrom';
        $scope.locationModalTitle = 'Departing from...';
        $scope.locationModal.show();
      });
    };
  });
