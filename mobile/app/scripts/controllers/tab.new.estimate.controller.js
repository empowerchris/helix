'use strict';

angular.module('helix.controllers')
  .controller('NewEstimateCtrl', function ($scope, $state, $localStorage, $ionicLoading, $timeout, Auth, $location,
                                           $http, Api, $cordovaDialogs, $ionicModal) {
    $scope.title = 'Your Order';
    $scope.storage = $localStorage;

    $scope.loading = true;

    $scope.$on('$ionicView.enter', function () {
      $scope.loading = true;
      $scope.storage.comesFromTrip = false;
      Auth.getCurrentUser().$promise.then(function (user) {
        $scope.user = user;
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
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Processing..."
      });

      var options = {
        cardId: $scope.cardId
      };

      if ($scope.report) {
        options.report = $scope.report;
      }

      $http.post(Api.endpoint + '/api/trips/' + $scope.storage.trip._id + '/pay', options)
        .then(function (response) {
          $ionicLoading.hide();
          $scope.storage.trip = response.data;
          console.log(response.data);
          $state.go('tab.new-done');
        }, function (err) {
          $ionicLoading.hide();
          console.error(err);
          $cordovaDialogs.alert(err.data.message || err.data || 'Please verify the information provided and try again.', 'Error', 'OK');
          $location.path('tab/new');
        });
    };


    $scope.goToAddNewCard = function () {
      console.log('ssdfsdf');
      //$localStorage.comesFromTrip = true;
      //console.log($localStorage.comesFromTrip, 'hey');
      //$location.path('tab/account/payment');
    };

    $scope.goToConnectedAccounts = function () {
      $localStorage.comesFromTrip = true;
      console.log($localStorage.comesFromTrip);
      //$location.path('tab/account/connected');
    };

    $scope.openExpenseReportModal = function () {
      $scope.expenseLoading = true;
      $scope.report = $scope.report || {
          type: -1,
          id: ''
        };

      $http.get(Api.endpoint + '/api/users/concur/reports')
        .then(function (response) {
          $scope.expenseLoading = false;
          $scope.reports = response.data;
        }, function (err) {
          console.error(err);
          $scope.modal.hide();
          $cordovaDialogs.alert(err.data.message || err.data || 'Please verify the information provided and try again.', 'Error', 'OK');
        });

      /*$http.get(Api.endpoint + '/api/users/concur/expenseGroups')
       .then(function (response) {
       $scope.groupsLoading = false;
       $scope.groups = response.data.Items;
       console.log(response);
       }, function (err) {
       console.error(err);
       $scope.modal.hide();
       $cordovaDialogs.alert(err.data.message || err.data || 'Please verify the information provided and try again.', 'Error', 'OK');
       });*/

      $ionicModal.fromTemplateUrl('templates/modal-expense-report.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.saveExpense = function () {
      $scope.expensing = true;
      $scope.modal.hide();
      console.log($scope.report);
    }
  });
