'use strict';

angular.module('helix.controllers')
  .controller('NewEstimateCtrl', function ($scope, $state, $localStorage, $ionicLoading, $timeout, Auth, $location,
                                           $http, Api, $cordovaDialogs) {
    $scope.title = 'Your Order';
    $scope.storage = $localStorage;

    $scope.loading = true;

    $scope.$on('$ionicView.enter', function () {
      $scope.loading = true;
      Auth.getCurrentUser().$promise.then(function (user) {
        $scope.cards = user.stripe.cards;
        $scope.loading = false;
        if ($scope.cards.length) {
          $scope.cardId = $scope.cards[0].stripe.id;
        }
      });
    });

    $scope.pay = function () {
      if (!$scope.cardId) {
        return $cordovaDialogs.alert('Please select a payment method.', 'Missing Information', 'OK');
      }

      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Processing payment..."
      });

      $http.post(Api.endpoint + '/api/trips/' + $scope.storage.trip._id + '/pay', {
        cardId: $scope.cardId
      }).then(function (response) {
        $ionicLoading.hide();
        $state.go('tab.new-done');
      }, function (err) {
        $ionicLoading.hide();
        console.error(err);
        $cordovaDialogs.alert(err.data.message || err.data || 'Please verify the information provided and try again.', 'Error', 'OK');
        $location.path('tab/new');
      });
    };

    $scope.next = function () {
      $state.go('tab.new-review');
    };

    $scope.remove = function (card) {
      console.log($scope.cards.indexOf(card));
    };

    $scope.goToAddNewCard = function () {
      $location.path('tab/account/payment');
    }
  });
