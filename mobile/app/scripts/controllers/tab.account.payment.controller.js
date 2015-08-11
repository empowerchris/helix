'use strict';

angular.module('helix.controllers')
  .controller('AccountPaymentCtrl', function ($scope, $ionicModal, $ionicLoading, $timeout) {
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

    $scope.edit = function() {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
    };

    $scope.remove = function(index) {
      $scope.cards.splice(index, 1);
    };

    $scope.addNewCard = function() {
      $ionicModal.fromTemplateUrl('templates/modal-payment-new.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: false
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.cancel = function() {
      $scope.modal.hide();
    };

    $scope.saveCard = function() {
      $ionicLoading.show({
        template: '<ion-spinner class=\'spinner-energized\'></ion-spinner><br>Validating card...'
      });
      $timeout(function() {
        $scope.modal.hide();
        $ionicLoading.hide();
        //$scope.concur.connected = true;
      }, 3000);
    };
  });
