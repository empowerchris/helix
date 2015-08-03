'use strict';

angular.module('helix.controllers', [])

  .controller('TabsCtrl', function ($scope, $rootScope) {

    /*$scope.tabs = [{
      title: 'New Trip',
      iconOff: 'ion-ios-plus-outline',
      iconOn: 'ion-ios-plus',
      href: '#/tab/new',
      navView: 'tab-new'
    }, {
      title: 'Trips',
      iconOff: 'ion-ios-briefcase-outline',
      iconOn: 'ion-ios-briefcase',
      href: '#/tab/trips',
      navView: 'tab-trips'
    }, {
      title: 'Notifications',
      iconOff: 'ion-ios-bell-outline',
      iconOn: 'ion-ios-bell',
      href: '#/tab/notifications',
      navView: 'tab-notifications',
      hidden: true
    }, {
      title: 'Account',
      iconOff: 'ion-ios-person-outline',
      iconOn: 'ion-ios-person',
      href: '#/tab/account',
      navView: 'tab-account'
    }];

    for (var i = 0; i < $scope.tabs.length; i++) {
      $scope.tabs[i].badge = '0';
    }*/

    $scope.badges = [0,0,0,0];

    $rootScope.$on('incrementBadge', function (event, tabIndex) {
      $scope.badges[tabIndex] = $scope.badges[tabIndex] + 1
    });

    $rootScope.$on('setBadge', function (tabIndex, badge) {
      $scope.badges[tabIndex] = badge;
    });
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  });
