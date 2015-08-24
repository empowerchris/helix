'use strict';

angular.module('helix.controllers')
  .controller('AccountPaymentCtrl', function ($scope, $ionicModal, $ionicLoading, $localStorage, Auth, $cordovaDialogs, stripe, $http, Api) {
    $scope.shouldShowDelete = false;

    $scope.loading = true;
    $scope.storage = $localStorage;

    Auth.updateCurrentUser().$promise.then(function (user) {
      $scope.cards = user.stripe.cards;
      $scope.loading = false;
    });

    $scope.edit = function () {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
    };

    $scope.remove = function (card, index) {
      $http.post(Api.endpoint + '/api/users/cards/delete', {
        cardId: card.stripe.id
      }).then(function () {
        $scope.cards.splice(index, 1);
      }, function (error) {
        return $cordovaDialogs.alert(error.message || 'Please try again.', 'There was a problem removing your card', 'OK');
      });
    };

    $scope.addNewCard = function () {
      $ionicModal.fromTemplateUrl('templates/modal-payment-new.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: false
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.card = {};

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.backToPickup = function () {
      $localStorage.comesFromTrip = false;
      $location.path('tab/new/estimate');
    };

    $scope.saveCard = function () {
      if (!$scope.card.name) {
        return $cordovaDialogs.alert('Please enter a card alias.', 'Missing Alias', 'OK');
      }

      $ionicLoading.show({
        template: '<ion-spinner class=\'spinner-energized\'></ion-spinner><br>Validating card...'
      });

      stripe.card.createToken($scope.card)
        .then(function (token) {
          $ionicLoading.show({
            template: '<ion-spinner class=\'spinner-energized\'></ion-spinner><br>Saving card...'
          });

          $http.post(Api.endpoint + '/api/users/cards', {
            tokenId: token.id,
            last4: $scope.card.number.substr($scope.card.number.length - 4),
            name: $scope.card.name,
          }).then(function (response) {
            $scope.card = {};

            $scope.loading = true;

            Auth.updateCurrentUser().$promise.then(function (user) {
              $scope.cards = user.stripe.cards;
              $scope.loading = false;
            });

            $scope.modal.hide();
            $ionicLoading.hide();
          }, function (error) {
            $ionicLoading.hide();
            console.error(error);
            return $cordovaDialogs.alert(error.message || 'Please try again or use another card.', 'There was a problem saving card', 'OK');
          });
        })
        .catch(function (error) {
          $ionicLoading.hide();
          console.error(error);
          return $cordovaDialogs.alert(error.message || 'Please try again or use another card.', 'There was a problem with your card', 'OK');
        });
    };
  });
