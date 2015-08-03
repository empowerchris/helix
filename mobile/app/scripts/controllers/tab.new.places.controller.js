'use strict';

angular.module('helix.controllers')
  .controller('NewPlacesCtrl', function($scope, $ionicModal, $stateParams, $localStorage) {
    console.log($stateParams);

    $scope.cityName = $localStorage.city.terms[0].value;
    $scope.title = $scope.cityName;

    $scope.map = {
      center: {
        latitude: 37.1,
        longitude: -95.7
      },
      zoom: 2
    };

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

    /*var placesService = new google.maps.places.PlacesService(element[0]);
    placesService.getDetails({
        'reference':
        list[0].reference
      }, function detailsresult(detailsResult, placesServiceStatus) {
        if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
          console.log(detailsResult);
        }
      }
    );*/
  });
