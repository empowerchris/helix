'use strict';

angular.module('helix.controllers')
  .controller('AccountPaymentCtrl', function ($scope, $ionicModal, $ionicLoading, $cordovaDialogs, stripe, $http, Api) {
    $scope.shouldShowDelete = false;

    $scope.cards = [{
      id: 1,
      type: 'visa',
      last4: '3325',
      name: 'Personal'
    }, {
      id: 2,
      type: 'mastercard',
      last4: '4457',
      name: 'Work'
    }];

    $scope.edit = function () {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
    };

    $scope.remove = function (index) {
      $scope.cards.splice(index, 1);
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

    $scope.saveCard = function () {
      $ionicLoading.show({
        template: '<ion-spinner class=\'spinner-energized\'></ion-spinner><br>Validating card...'
      });
      /*$timeout(function() {
       $scope.modal.hide();
       $ionicLoading.hide();
       //$scope.concur.connected = true;
       }, 3000);*/

      stripe.card.createToken($scope.card)
        .then(function (token) {
          $ionicLoading.show({
            template: '<ion-spinner class=\'spinner-energized\'></ion-spinner><br>Saving card...'
          });

          $http.post(Api.endpoint + '/api/users/cards', {
            tokenId: token.id,
            last4: $scope.card.number.substr($scope.card.number.length - 4),
            name: $scope.card.name
          }).then(function (response) {
            console.log(response);
            $scope.card = {};
            $scope.modal.hide();
            $ionicLoading.hide();
          }, function (error) {
            $ionicLoading.hide();

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
