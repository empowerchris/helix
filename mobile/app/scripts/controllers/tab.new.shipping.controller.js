'use strict';

angular.module('helix.controllers')
  .controller('NewShippingCtrl', function ($scope, $state, $localStorage, $moment, $cordovaDialogs, $ionicLoading,
                                           $timeout, $http, Api) {
    $scope.title = "Delivery Date";
    $scope.storage = $localStorage;

    $scope.loading = true;

    $scope.$on('$ionicView.enter', function () {
      $scope.loading = true;
      $http
        .get(Api.endpoint + '/api/trips/' + $scope.storage.trip._id + '/deliveryDates')
        .then(function (response) {
          $scope.loading = false;
          $scope.dates = response.data;
          if ($scope.dates.length) {
            $scope.dates[0].selected = true;
          }
        }, function (err) {
          console.error(err);
          $scope.loading = false;
          $cordovaDialogs.alert(err.data.message || err.data || 'Something went wrong. Please try again.', 'Error', 'OK');
          $location.path('tab/new');
        });
    });

    $scope.changedSelection = function (index, a) {
      for (var i = 0; i < $scope.dates.length; i++) {
        $scope.dates[i].selected = false;
      }

      $scope.dates[index].selected = true;
    };

    $scope.next = function () {
      var selectedDate;

      for (var i = 0; i < $scope.dates.length; i++) {
        if ($scope.dates[i].selected) {
          selectedDate = $scope.dates[i];
        }
      }

      if (!selectedDate) {
        return $cordovaDialogs.alert('Please select a date.', 'Missing Information', 'OK');
      }

      $ionicLoading.show({
        template: '<ion-spinner class=\'spinner-energized\'></ion-spinner><br>Calculating estimate...'
      });

      delete $scope.storage.estimate;
      $http.post(Api.endpoint + '/api/trips/' + $scope.storage.trip._id + '/selectDate', selectedDate)
        .then(function (response) {
          $scope.storage.estimate = response.data;
          $state.go('tab.new-estimate');
          $ionicLoading.hide();
        }, function (err) {
          $ionicLoading.hide();
          console.error(err);
          return $cordovaDialogs.alert(err.data.message || err.data || 'Please verify the information provided and try again.', 'Error', 'OK');
        });
    };

    $scope.addDays = function (date, days) {
      var a = $moment(date);
      var res = a.add(days, 'days');

      return res.utc().format();
    };

    $scope.differenceInDays = function (date1, date2) {
      var a = $moment(date1);
      var b = $moment(date2);
      var diff = a.diff(b, 'days') * -1;

      return diff;
    };
  });
